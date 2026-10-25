const path = require("path");

const catalogue = [
  ["drag-avatar-01", "Aarav", "avatar-01.jpeg"],
  ["drag-avatar-02", "Anaya", "avatar-02.jpeg"],
  ["drag-avatar-03", "Kabir", "avatar-03.jpeg"],
  ["drag-avatar-04", "Mira", "avatar-04.jpeg"],
  ["drag-avatar-05", "Vihaan", "avatar-05.jpeg"],
  ["drag-avatar-06", "Sana", "avatar-06.jpeg"],
  ["drag-avatar-07", "Kiara", "avatar-07.jpeg"],
  ["drag-avatar-08", "Ishaan", "avatar-08.jpeg"],
  ["drag-avatar-09", "Tara", "avatar-09.jpeg"],
  ["drag-avatar-10", "Reyansh", "avatar-10.jpeg"],
];

exports.getAvatars = (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const avatars = catalogue.map(([id, name, filename], index) => ({
    id,
    name,
    category: "DRAG.ai Creator",
    image_url: `${base}/uploads/avatars/${filename}`,
    avatar_number: index + 1,
    provider: "drag-ai-local-reference",
  }));
  return res.status(200).json({ success: true, avatars });
};
