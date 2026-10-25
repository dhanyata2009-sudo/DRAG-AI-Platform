import api from "./api";

// GET /history
export const getHistory = async () => {
  const { data } = await api.get("/history");
  return data;
};

// GET /history/:id
export const getHistoryById = async (id) => {
  const { data } = await api.get(`/history/${id}`);
  return data;
};

// DELETE /history/:id
export const deleteHistoryItem = async (id) => {
  const { data } = await api.delete(`/history/${id}`);
  return data;
};
