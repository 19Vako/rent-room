import Link from "next/link";
import { auth } from "@/src/auth/auth";
import LogoutButton from "../ui/LogoutButton";
import ProfileButton from "../ui/ProfileButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex max-[420px]:flex-col justify-between w-full items-centermax-[420px]  max-[420px]:h-20 h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#0071c2]">
              RentRoom
            </Link>
          </div>

            <div className="flex items-center justify-between">
              
              <div className="flex mr-2">
              <LogoutButton />
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold text-white border border-blue-white rounded hover:bg-[#0071c2 bg-[#003580] transition-all text-center whitespace-nowrap"
                >
                  Admin Panel
                </Link>
              )}
              </div>
              <ProfileButton
                userName={session?.user.name || session?.user.email || "User"}
              />
            </div>
          </div>
        
      </div>
    </header>
  );
}
