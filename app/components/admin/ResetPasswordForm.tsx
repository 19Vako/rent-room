"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/auth/actions/auth.actions"; 



export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return <div className="text-red-500">Invalid or missing reset token.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
   
      const result = await resetPassword(token, newPassword);

      if (result.success) {
        setSuccess(true);
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
        <p>Your password has been reset. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h2 className="text-2xl text-black font-bold mb-4">Set New Password</h2>
      
      {error && <div className="bg-red-100 text-red-600 p-2 rounded">{error}</div>}

      <div>
        <label className="block text-black text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full text-black border p-2 rounded"
          placeholder="Enter new password"
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Reset Password"}
      </button>
    </form>
  );
}