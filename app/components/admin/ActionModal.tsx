"use client";

export default function ActionModal({
  isOpen,
  type,
  message,
  onClose,
}: {
  isOpen: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-sm animate-in fade-in zoom-in duration-200">
        <div
          className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${type === "success" ? "bg-green-100" : "bg-red-100"}`}
        >
          {type === "success" ? (
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold text-center text-black mb-2">
          {type === "success" ? "Success!" : "Error"}
        </h3>

        <p className="text-gray-600 text-center mb-6">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-[#0071c2] hover:bg-[#005999] text-white rounded transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
