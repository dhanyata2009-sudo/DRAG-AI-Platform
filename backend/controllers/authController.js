const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// ===============================
// REGISTER
// ===============================

exports.register = async (req, res) => {
  try {
    console.log("REGISTER REQUEST RECEIVED");
    console.log(req.body);

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = user.getJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};


// ===============================
// LOGIN
// ===============================

exports.login = async (req, res) => {
  try {
    console.log("LOGIN REQUEST RECEIVED");
    console.log("Email received:", req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    console.log("User found:", !!user);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    console.log("Stored email:", user.email);

    const isMatch = await user.comparePassword(password);

    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = user.getJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};


// ===============================
// FORGOT PASSWORD
// ===============================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link has been sent."
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
      validateBeforeSave: false
    });

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - DRAG.ai",
        html
      });

      res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link has been sent."
      });

    } catch (emailError) {

      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save({
        validateBeforeSave: false
      });

      return res.status(500).json({
        success: false,
        error: "Email could not be sent. Please try again later."
      });
    }

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


// ===============================
// RESET PASSWORD
// ===============================

exports.resetPassword = async (req, res) => {
  try {

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token"
      });
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    const token = user.getJwtToken();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};


// ===============================
// CHANGE PASSWORD (logged-in user)
// ===============================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
