import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../component/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center max-w-md relative z-10">
        <h1 className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-[rgba(255,255,255,0.1)]">
          404
        </h1>
        <h2 className="text-white text-2xl font-bold mt-4 mb-3">Page not found</h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard/overview')} variant="primary">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
