export function HeartbeatLogo({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Medical Cross Circle */}
      <circle cx="20" cy="20" r="18" fill="url(#gradient)" />
      <path
        d="M20 8 L20 32 M8 20 L32 20"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}