import api from "./api";

export const generateVideo = async (payload) => {
  const { data } = await api.post("/videos/generate", payload);
  return data;
};

export const getVideoStatus = async (videoId) => {
  const { data } = await api.get(`/videos/status/${videoId}`);
  return data;
};

export const getVideoHistory = async () => {
  const { data } = await api.get("/videos/history");
  return data;
};

export const deleteVideo = async (id) => {
  const { data } = await api.delete(`/videos/${id}`);
  return data;
};
