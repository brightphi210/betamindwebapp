import React from 'react';
import { Link } from 'react-router-dom';

// Floating badge for public-facing pages. Place alongside PublicNavbar.tsx
// (e.g. src/component/PoweredByBadge.tsx).
const PoweredByBadge: React.FC = () => {
    return (
        <Link
            to={'https://betaminds.online/'}
            className="fixed bottom-5 right-5 lg:bottom-10 lg:right-10 z-40 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 lg:text-lg text-sm shadow-lg"
        >
            <span className="italic text-black/60">Powered by</span>
            <span className="font-bold text-black">Betamind</span>
        </Link>
    );
};

export default PoweredByBadge;