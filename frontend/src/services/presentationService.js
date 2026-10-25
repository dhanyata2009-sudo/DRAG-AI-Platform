import api from "./api";

// POST /presentations -> create a draft record
export const createPresentation = async (payload) => {
  const { data } = await api.post("/presentations", payload);
  return data;
};

// GET /presentations -> list the authenticated user's presentations
export const getPresentations = async () => {
  const { data } = await api.get("/presentations");
  return data;
};

// GET /presentations/:id
export const getPresentationById = async (id) => {
  const { data } = await api.get(`/presentations/${id}`);
  return data;
};

// POST /presentations/generate -> generates the actual pptx file
export const generatePresentation = async (payload) => {
  const { data } = await api.post("/presentations/generate", payload);
  return data;
};
