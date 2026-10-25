const axios = require("axios");

/**
 * Fetches real-time factual context for a topic using Wikipedia's free,
 * keyless public API. This requires no API key and no billing, and is
 * used purely to ground the AI's slide content in real, current facts
 * instead of letting it hallucinate.
 *
 * This function NEVER throws — if Wikipedia is unreachable, the topic
 * isn't found, or anything else goes wrong, it silently resolves to
 * `null` so PPT generation can continue without research context.
 */

const WIKI_SEARCH_URL = "https://en.wikipedia.org/w/api.php";
const WIKI_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const REQUEST_TIMEOUT_MS = 6000;

// Find the closest matching Wikipedia page title for a free-text topic.
const resolvePageTitle = async (topic) => {
  const { data } = await axios.get(WIKI_SEARCH_URL, {
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      action: "query",
      list: "search",
      srsearch: topic,
      format: "json",
      srlimit: 1,
      origin: "*",
    },
  });

  const hit = data?.query?.search?.[0];
  return hit?.title || null;
};

const fetchSummaryForTitle = async (title) => {
  const { data } = await axios.get(
    `${WIKI_SUMMARY_URL}/${encodeURIComponent(title)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );

  if (!data || data.type === "disambiguation") {
    return null;
  }

  const extract = (data.extract || "").trim();
  if (!extract) return null;

  return {
    title: data.title,
    summary: extract,
    url: data.content_urls?.desktop?.page || null,
  };
};

const fetchTopicResearch = async (topic) => {
  const cleanTopic = String(topic || "").trim();
  if (!cleanTopic) return null;

  try {
    // Try a direct summary lookup first (works when the topic is already
    // a real Wikipedia page title, e.g. "Artificial intelligence").
    let result = await fetchSummaryForTitle(cleanTopic).catch(() => null);

    // Otherwise resolve the best matching page via search, then fetch it.
    if (!result) {
      const resolvedTitle = await resolvePageTitle(cleanTopic).catch(() => null);
      if (resolvedTitle) {
        result = await fetchSummaryForTitle(resolvedTitle).catch(() => null);
      }
    }

    return result;
  } catch (error) {
    // Network issue, offline environment, rate limit, etc. — never fail
    // PPT generation because of this best-effort enrichment step.
    return null;
  }
};

module.exports = {
  fetchTopicResearch,
};
