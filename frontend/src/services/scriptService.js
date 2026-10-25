import api from "./api";

// BACKEND INTEGRATION POINT — AI script generation & persistence

// POST /scripts/generate  -> triggers AI script generation from project brief
export const generateScript = async (projectPayload) => {
  const { data } = await api.post("/scripts/generate", projectPayload);
  return data;
};

// POST /scripts  -> save a script (AI-generated or user-written)
export const saveScript = async (payload) => {
  const { data } = await api.post("/scripts", payload);
  return data;
};

// PUT /scripts/:id  -> update/edit an existing script
export const updateScript = async (id, payload) => {
  const { data } = await api.put(`/scripts/${id}`, payload);
  return data;
};
