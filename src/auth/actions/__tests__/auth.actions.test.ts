/**
 * @jest-environment node
 */
import {
  sendPasswordResetEmail,
  resetPassword,
} from "@/src/auth/actions/auth.actions";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

jest.mock("nodemailer");
const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: mockSendMail,
});

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();

jest.mock("@/src/lib/mongodb", () => {
  return Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: (...args: []) => mockFindOne(...args),
        updateOne: (...args: []) => mockUpdateOne(...args),
      }),
    }),
  });
});

describe("Auth Actions: Password Reset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const email = "test@example.com";

  describe("sendPasswordResetEmail", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return success even if user does not exist (security reasons)", async () => {
      mockFindOne.mockResolvedValueOnce(null);

      const result = await sendPasswordResetEmail(email);

      expect(result.success).toBe(true);
      expect(mockUpdateOne).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should generate token, save it to DB and send an email if user exists", async () => {
      mockFindOne.mockResolvedValueOnce({ _id: new ObjectId(), email });
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await sendPasswordResetEmail(email);

      expect(result.success).toBe(true);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { email },
        expect.objectContaining({
          $set: expect.objectContaining({
            resetToken: expect.any(String),
            resetTokenExpiry: expect.any(Number),
          }),
        }),
      );

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: email }),
      );
    });

    it("should return error if email sending fails", async () => {
      mockFindOne.mockResolvedValueOnce({ _id: new ObjectId(), email });
      mockSendMail.mockRejectedValueOnce(new Error("SMTP Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await sendPasswordResetEmail(email);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send reset email.");
      consoleSpy.mockRestore();
    });
  });
  describe("resetPassword", () => {
    const token = "valid-token";
    const newPassword = "new-secure-password";

    it("should successfully reset password with valid token", async () => {
      const mockUser = { _id: new ObjectId(), email: "test@example.com" };
      mockFindOne.mockResolvedValueOnce(mockUser);
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await resetPassword(token, newPassword);

      expect(result.success).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: mockUser._id },
        expect.objectContaining({
          $set: { password: "hashed_password" },
          $unset: { resetToken: "", resetTokenExpiry: "" },
        }),
      );
    });

    it("should return error if token is invalid or expired", async () => {
      mockFindOne.mockResolvedValueOnce(null);

      const result = await resetPassword(token, newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid or expired reset token.");
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });

    it("should return error if database update fails", async () => {
      mockFindOne.mockResolvedValueOnce({ _id: new ObjectId() });
      mockUpdateOne.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await resetPassword(token, newPassword);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong.");
      consoleSpy.mockRestore();
    });
  });
});
