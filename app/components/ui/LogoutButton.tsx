import { logout } from "@/lib/actions/user.actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex h-15 px-1 py-3 items-center text-sm font-bold text-[#0071c2] border border-[#0071c2] rounded hover:bg-[#0071c2] hover:text-white transition-colors"
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
