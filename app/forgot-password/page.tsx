"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "../../auth/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const res = await sendPasswordResetEmail(email);

    if (res.success) {
      setMessage("If an account with that email exists, we sent a reset link.");
    } else {
      setError(res.error || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      <header className="bg-[#003b95] py-4 px-6 md:px-8">
        <Link href="/" className="text-white text-2xl font-bold tracking-tight">
          Booking.com
        </Link>
      </header>

      <main className="max-w-[400px] mx-auto mt-12 md:mt-20 px-4 pb-12">
        <h2 className="text-[24px] font-bold mb-2">Reset your password</h2>
        <p className="text-[15px] text-gray-600 mb-8">
          Enter your email address and we will send you a link to reset your
          password.
        </p>

        {message && (
          <div className="bg-[#e8f6e8] text-[#008009] p-3 rounded-sm mb-4 text-[14px] border border-[#008009]">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-[#ffebe8] text-[#cc0000] p-3 rounded-sm mb-4 text-[14px] border border-[#cc0000]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[14px] font-bold mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-400 text-black outline-none rounded-sm focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#006ce4] hover:bg-[#0055b3] text-white font-bold text-[15px] rounded-sm transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-[#006ce4] text-[14px] font-bold hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
