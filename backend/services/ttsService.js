const axios = require("axios");

const TTS_URL = process.env.TTS_URL || "http://127.0.0.1:8002";

const generateVoiceAudio = async ({ text, language, voice, sceneNumber }) => {
  const response = await axios.post(
    `${TTS_URL}/generate`,
    {
      text,
      language,
      voiceId: voice?.voice_id,
      instruct: voice?.instruct || voice?.tone || "Natural conversational UGC delivery",
      sceneNumber,
    },
    { timeout: 300000 }
  );

  return response.data;
};

module.exports = { generateVoiceAudio };
