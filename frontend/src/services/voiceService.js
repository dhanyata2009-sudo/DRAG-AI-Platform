import api from "./api";

const voiceService = {
    getVoices: async () => {
        const response = await api.get("/voices");

        return response.data;
    },
};

export default voiceService;