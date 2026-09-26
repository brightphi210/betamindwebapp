import React from 'react';
import betamindLogo from '../assets/betamindlogo.png';
const PublicNavbar: React.FC = () => {
    return (
        <nav
            className="fixed top-0 left-0 right-0 z-30 h-16"
            style={{
                background: 'rgba(6, 10, 4, 0.85)',
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
        >

            <div className="w-full h-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center">
                <div className="w-30 shrink-0">
                    <img src={betamindLogo} alt="Betamind Logo" className="w-full" />
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;