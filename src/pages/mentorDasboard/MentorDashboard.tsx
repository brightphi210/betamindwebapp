const MentorDashboard = () => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(219,255,0,0.05)] border border-[rgba(219,255,0,0.15)] flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Mentor Dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Coming soon. Your mentor tools and community management will live here.
        </p>
      </div>
    </div>
  );
};

export default MentorDashboard;
