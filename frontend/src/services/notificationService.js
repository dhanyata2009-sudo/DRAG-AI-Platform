import api from "./api";

// GET /notifications
export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

// PUT /notifications/:id/read
export const markNotificationRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

// DELETE /notifications/:id
export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};
