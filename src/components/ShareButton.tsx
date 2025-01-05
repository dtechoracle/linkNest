import React from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  className = "",
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url);
      // You might want to add a toast notification here
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`text-gray-600 hover:text-blue-600 transition-colors ${className}`}
      aria-label="Share"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
    </button>
  );
};
