"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");  
        router.refresh(); 
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
 
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-hotel.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl text-white">
        
        <h2 className="text-3xl font-light text-center mb-8">Sign In</h2>

        <div className="flex flex-col gap-3 mb-6">
          <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex items-center justify-center w-full py-2.5 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

 
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-white/30"></div>
          <span className="px-3 text-white/70 text-sm">or Email</span>
          <div className="flex-grow border-t border-white/30"></div>
        </div>

 
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 text-white/90">E-mail</label>
            <input 
              type="email" 
              placeholder="ex: some@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-black outline-none rounded"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-white/90">Password</label>
            <input 
              type="password" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-black outline-none rounded"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-white font-semibold rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "SIGN IN"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/80">
          No account?{" "}
          <Link href="/register" className="text-[#eab308] hover:underline font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}