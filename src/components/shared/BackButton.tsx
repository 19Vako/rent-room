"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  className?: string;
}
export default function BackButton({
  label = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-black hover:text-[#0071c2] transition-colors font-semibold w-fit ${className}`}
    >
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        ></path>
      </svg>
      {label}
    </button>
  );
}
