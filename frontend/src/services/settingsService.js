import api from "./api";

// GET /settings
export const getSettings = async () => {
  const { data } = await api.get("/settings");
  return data;
};

// PUT /settings
export const updateSettings = async (payload) => {
  const { data } = await api.put("/settings", payload);
  return data;
};
