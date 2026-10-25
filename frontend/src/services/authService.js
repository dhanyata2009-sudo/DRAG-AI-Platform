import api from "./api";

/**
 * Authentication API services
 */

// POST /auth/register
export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

// POST /auth/login
export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

// POST /auth/forgot-password
export const requestPasswordReset = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

// POST /auth/reset-password/:token
export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await api.post(
    `/auth/reset-password/${token}`,
    { newPassword }
  );
  return data;
};

// POST /auth/logout
export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

// PUT /auth/change-password
export const changePassword = async (payload) => {
  // payload: { currentPassword, newPassword }
  const { data } = await api.put("/auth/change-password", payload);
  return data;
};
