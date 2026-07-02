import { useState } from 'react';
import {
    FiBell,
    FiCalendar,
    FiCompass,
    FiHome,
    FiPlus,
    FiUser,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import avatar from '../assets/Avatar.png';
import betamindLogo from '../assets/betamindlogo.png';

const NAV_ITEMS = [
    { id: 'home', name: 'Home', icon: <FiHome className="w-4 h-4" />, path: '/dashboard/overview' },
    { id: 'events', name: 'Events', icon: <FiCalendar className="w-4 h-4" />, path: '/dashboard/events' },
    { id: 'explore', name: 'Explore', icon: <FiCompass className="w-4 h-4" />, path: '/dashboard/explore' },
    { id: 'profile', name: 'Profile', icon: <FiUser className="w-4 h-4" />, path: '/dashboard/profile' },
];

const DashNavbar = () => {
    const location = useLocation();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const profileData = {
        username: 'alexander_chen',
        image: null,
    };

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-30 transition-all duration-300 h-16"
                style={{
                    background: 'rgba(6, 10, 4, 0.85) ',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}

            >
                {/* subtle top glass highlight */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(166,255,0,0.25), transparent)' }}
                />

                <div className="w-full h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto items-center">
                    <div className="flex items-center justify-between gap-4 h-full">
                        {/* Logo */}
                        <div className="w-28 flex-shrink-0">
                            <img src={betamindLogo} alt="Betamind Logo" className="w-full" />
                        </div>

                        {/* Desktop nav links */}
                        <div className="hidden lg:flex items-center gap-8">
                            {NAV_ITEMS.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className="flex items-center gap-2 text-sm transition-colors duration-200"
                                        style={{
                                            color: isActive ? '#a6ff00' : 'rgba(255,255,255,.6)',
                                            fontWeight: isActive ? 600 : 400,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.6)';
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right side: create event + bell + avatar */}
                        <div className="flex items-center gap-3">
                            {/* Create Event — full button on desktop, icon-only on mobile */}
                            <Link
                                to="/dashboard/events/create"
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                style={{ background: '#a6ff00' }}
                            >
                                <FiPlus size={14} />
                                Create Event
                            </Link>
                            <Link
                                to="/dashboard/events/create"
                                aria-label="Create event"
                                className="sm:hidden p-2 rounded-lg flex items-center justify-center transition-transform hover:scale-[1.02]"
                                style={{ background: '#a6ff00' }}
                            >
                                <FiPlus size={16} className="text-black" />
                            </Link>

                            <button
                                className="p-2 rounded-lg transition-colors text-white/60 hover:text-white"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                                title="Notifications"
                            >
                                <FiBell className="w-5 h-5" />
                            </button>

                            <Link
                                to="/dashboard/profile"
                                className="flex items-center gap-2 sm:gap-3 no-underline cursor-pointer flex-shrink-0"
                            >
                                <div
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }}
                                >
                                    {profileData?.image ? (
                                        <img src={profileData.image} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={avatar} alt="avatar" className="w-full object-cover" />
                                    )}
                                </div>
                            </Link>

                            {/* Mobile menu toggle */}
                            <button
                                className="lg:hidden p-2 rounded-lg transition-colors text-white/60 hover:text-white"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                                onClick={() => setShowMobileMenu((prev) => !prev)}
                                title="Menu"
                                aria-expanded={showMobileMenu}
                            >
                                <span
                                    className="text-xl inline-block transition-transform duration-300"
                                    style={{ transform: showMobileMenu ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                >
                                    ☰
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown nav — always mounted so it can animate open/close
                via max-height + opacity instead of popping in/out instantly. */}
            <div
                className={`lg:hidden fixed top-16 left-0 right-0 z-20 overflow-hidden transition-all duration-300 ease-in-out ${showMobileMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                style={{
                    background: 'rgba(6, 10, 4, 0.95)',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    borderBottom: showMobileMenu ? '1px solid rgba(205,220,57,.15)' : '1px solid transparent',
                    boxShadow: showMobileMenu ? '0 12px 32px rgba(0,0,0,0.5)' : 'none',
                }}
            >
                <div
                    className="px-4 py-4 transition-all duration-300 ease-in-out"
                    style={{
                        transform: showMobileMenu ? 'translateY(0)' : 'translateY(-8px)',
                        opacity: showMobileMenu ? 1 : 0,
                    }}
                >
                    <ul className="flex flex-col gap-4 mb-4">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 text-sm"
                                        style={{
                                            color: isActive ? '#a6ff00' : 'rgba(255,255,255,.6)',
                                            fontWeight: isActive ? 600 : 400,
                                        }}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <Link
                        to="/dashboard/events/create"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-black"
                        style={{ background: '#a6ff00' }}
                    >
                        <FiPlus size={16} />
                        Create Event
                    </Link>
                </div>
            </div>

            <style>{`
        input::placeholder {
          transition: color 0.3s ease;
        }

        input:focus::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
        </>
    );
};

export default DashNavbar;