const path = require('path');
const { generateGeminiContent } = require('./geminiResilientService');

const MAX_SOURCE_CHARS = 120000;
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.md', '.csv', '.html', '.htm']);

const cleanText = (value) => String(value || '')
  .replace(/\u0000/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, MAX_SOURCE_CHARS);

const chunkText = (text, chunkSize = 1100, overlap = 180) => {
  const normalized = cleanText(text);
  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(normalized.length, start + chunkSize);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf(' ', end);
      if (boundary > start + chunkSize * 0.65) end = boundary;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 40) chunks.push({ id: chunks.length, text: chunk });
    if (end >= normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
};

// BM25 retrieval: term-frequency saturation + inverse-document-frequency + length normalization.
const tokenize = (text) => String(text || '').toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .split(/\s+/)
  .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
const STOP_WORDS = new Set(('the and for are but not you with from that this have has was were into about than then them they their your our can will should could would what when where which who why how also use using used based through between within each per all any').split(' '));

const retrieveBM25 = (chunks, query, limit = 8) => {
  if (!chunks.length) return [];
  const qTerms = [...new Set(tokenize(query))];
  const docs = chunks.map((chunk) => ({ ...chunk, terms: tokenize(chunk.text) }));
  const avgLength = docs.reduce((sum, doc) => sum + doc.terms.length, 0) / docs.length || 1;
  const df = new Map();
  qTerms.forEach((term) => df.set(term, docs.reduce((count, doc) => count + (doc.terms.includes(term) ? 1 : 0), 0)));
  const scored = docs.map((doc) => {
    const frequencies = new Map();
    doc.terms.forEach((term) => frequencies.set(term, (frequencies.get(term) || 0) + 1));
    let score = 0;
    qTerms.forEach((term) => {
      const tf = frequencies.get(term) || 0;
      if (!tf) return;
      const idf = Math.log(1 + (docs.length - (df.get(term) || 0) + 0.5) / ((df.get(term) || 0) + 0.5));
      score += idf * ((tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * doc.terms.length / avgLength)));
    });
    // Small phrase/term coverage boost helps concise, directly relevant passages.
    const coverage = qTerms.length ? qTerms.filter((term) => doc.terms.includes(term)).length / qTerms.length : 0;
    return { id: doc.id, text: doc.text, score: score + coverage * 0.35 };
  });
  const relevant = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return relevant.length ? relevant : chunks.slice(0, Math.min(4, limit)).map((c) => ({ ...c, score: 0 }));
};

const extractWithGeminiVision = async (file) => {
  const prompt = `Extract the meaningful content from this uploaded ${file.mimetype === 'application/pdf' ? 'PDF document' : 'image'} for use as a factual source for a presentation. Preserve headings, section hierarchy, definitions, named entities, dates, numeric values, captions, and important details. For charts/tables, describe labels and values clearly. Do not invent missing content. Return plain structured text, not commentary.`;
  const { result } = await generateGeminiContent([
    { text: prompt },
    { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
  ], { temperature: 0.1, maxOutputTokens: 8000 });
  return cleanText(result.response.text());
};

const extractSourceText = async (file) => {
  if (!file) return null;
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error('Unsupported source file. Upload a PDF, image (PNG/JPG/WEBP), TXT, Markdown, CSV, or HTML article.');
  }
  let text = '';
  if (extension === '.txt' || extension === '.md' || extension === '.csv' || extension === '.html' || extension === '.htm') {
    text = file.buffer.toString('utf8');
    if (extension === '.html' || extension === '.htm') {
      text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&');
    }
  } else {
    // Gemini's document/vision endpoint handles text PDFs, scanned PDFs, and photos
    // without requiring a local OCR engine or a locally hosted model.
    text = await extractWithGeminiVision(file);
  }
  text = cleanText(text);
  if (text.length < 40) throw new Error('Could not extract enough readable content from this file. Try a clearer image or a text-based PDF/article.');
  return { text, fileName: path.basename(file.originalname || 'uploaded-source'), mimeType: file.mimetype, characters: text.length };
};

const retrieveSourceContext = async ({ file, topic, title, audience }) => {
  const source = await extractSourceText(file);
  if (!source) return null;
  const chunks = chunkText(source.text);
  const query = `${title || ''} ${topic || ''} ${audience || ''} key concepts facts definitions examples evidence methods implications conclusion`.trim();
  const retrieved = retrieveBM25(chunks, query, 10);
  const context = retrieved.map((item, index) => `[Retrieved passage ${index + 1}; relevance ${item.score.toFixed(3)}]\n${item.text}`).join('\n\n');
  return {
    title: source.fileName,
    url: null,
    text: context.slice(0, 14000),
    sourceText: source.text,
    sourceFileName: source.fileName,
    sourceCharacters: source.characters,
    retrievedChunks: retrieved.length,
    retrievalMethod: 'BM25 lexical retrieval with overlap chunking',
  };
};

module.exports = { retrieveSourceContext, extractSourceText, chunkText, retrieveBM25 };