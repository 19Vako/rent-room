import { logout } from "@/src/lib/actions/user.actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
         className="w-full flex flex-row sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold text-white border border-blue-white rounded hover:bg-[#0071c2 bg-[#003580] transition-all text-center whitespace-nowrap"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>log out</span>
      </button>
    </form>
  );
}
