const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node.js to prefer IPv4 over IPv6 - fixes "Failed to resolve IPv6 addresses"
// on networks where IPv6 connectivity to Gmail's SMTP servers is broken.
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"DRAG.ai" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
module.exports = sendEmail;
