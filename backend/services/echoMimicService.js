const axios = require("axios");

const ECHO_URL = process.env.ECHO_URL || "http://127.0.0.1:8003";

const generateCreatorScene = async ({ imageUrl, audioPath, prompt, sceneNumber }) => {
  const response = await axios.post(
    `${ECHO_URL}/generate`,
    {
      imageUrl,
      audioPath,
      prompt,
      sceneNumber,
    },
    { timeout: 900000 }
  );

  return response.data;
};

module.exports = { generateCreatorScene };
