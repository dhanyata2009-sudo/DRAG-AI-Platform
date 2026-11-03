const { generatePPTContent } = require("./pptContentService");
const { createPPTFile } = require("./pptFileService");

const generatePresentation = async (data) => {
  const presentation = await generatePPTContent(data);

  const file = await createPPTFile(presentation);

  return {
    title: presentation.title,
    slides: presentation.slides,
    fileName: file.fileName
  };
};

module.exports = {
  generatePresentation
};