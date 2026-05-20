"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/src/lib/actions/user.actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await registerUser(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        const session = await getSession();
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]">
      <header className="bg-[#003b95] py-4 px-6 md:px-8">
        <Link href="/" className="text-white text-2xl font-bold tracking-tight">
          RentRoom
        </Link>
      </header>

      <main className="max-w-[400px] mx-auto mt-12 md:mt-20 px-4 pb-12">
        <h2 className="text-[24px] font-bold mb-2">Sign in or create an account</h2>
        <p className="text-[15px] text-gray-600 mb-8">
          Enter your email and password. If the account does not exist, it will be created automatically.
        </p>

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
              className="w-full px-3 py-2.5 bg-white border border-gray-400 text-black outline-none rounded-sm focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors"
            />
          </div>

          <div>
            {/* ДОБАВЛЕНО: Flex-контейнер для лейбла и ссылки */}
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[14px] font-bold">Password</label>
              <Link
                href="/forgot-password"
                className="text-[14px] text-[#006ce4] hover:underline font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-400 text-black outline-none rounded-sm focus:border-[#006ce4] focus:ring-1 focus:ring-[#006ce4] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#d41111] text-[14px] font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#006ce4] hover:bg-[#0055b3] text-white font-bold text-[15px] rounded-sm transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-8 border-t border-gray-200"></div>

        <p className="text-[14px] text-gray-600 mb-6 text-center">
          Or sign in using a social account
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-3 bg-white border border-[#006ce4] text-[#006ce4] font-bold text-[15px] rounded-sm hover:bg-[#f0f6ff] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </main>
    </div>
  );
}
