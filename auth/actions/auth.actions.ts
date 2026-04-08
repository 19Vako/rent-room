"use server";

import clientPromise from "../../lib/mongodb";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

 
export async function sendPasswordResetEmail(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

 
    const user = await db.collection("users").findOne({ email });
    
    if (!user) {
      return { success: true }; 
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // + 1 hour

 
    await db.collection("users").updateOne(
      { email },
      { $set: { resetToken, resetTokenExpiry } }
    );

 
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ORGANIZATION_EMAIL,
        pass: process.env.ORGANIZATION_EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.ORGANIZATION_EMAIL,
      to: email,
      subject: "Password Reset Request - Booking.com Clone",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#006ce4; color:white; text-decoration:none; border-radius:4px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    console.error("Error sending reset email:", error);
    return { success: false, error: "Failed to send reset email." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);


    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return { success: false, error: "Invalid or expired reset token." };
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

 
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" } 
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Something went wrong." };
  }
}