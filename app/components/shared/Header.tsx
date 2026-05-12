import Link from "next/link";
import { auth } from "@/auth/auth";
import LogoutButton from "../ui/LogoutButton";
import ProfileButton from "../ui/ProfileButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#0071c2]">
              RentRoom
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LogoutButton />
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex h-15 px-1 py-3 items-center text-sm font-bold text-[#0071c2] border border-[#0071c2] rounded hover:bg-[#0071c2] hover:text-white transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <ProfileButton
                userName={session?.user.name || session?.user.email || "User"}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
