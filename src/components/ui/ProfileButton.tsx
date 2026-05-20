import Link from "next/link";

export default function ProfileButton({ userName }: { userName: string }) {
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <Link
      href="/guest/guestProfile"
      className="relative min-w-10 h-10 bg-[#3b5998] text-white flex items-center justify-center rounded-full text-xl font-bold border-2 border-white shadow-md hover:bg-[#0071c2] transition-colors duration-200 group"
      title={`Go to ${userName}'s Profile`}
    >
      {firstLetter}
    </Link>
  );
}
