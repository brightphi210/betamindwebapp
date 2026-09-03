import { useEffect, useRef, useState } from 'react';
import { BsEyeFill } from 'react-icons/bs';
import {
    FiBell,
    FiCalendar,
    FiCompass,
    FiCreditCard,
    FiHome,
    FiLogOut,
    FiPlus,
    FiUser
} from 'react-icons/fi';
import { HiMenuAlt3 } from 'react-icons/hi';
import { MdClose, MdSettings } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import avatar from '../assets/Avatar.png';
import betamindLogo from '../assets/betamindlogo.png';
import { useGetMyUserProfile } from '../hooks/queries/allQueriess';
import LoadingOverlay from './LoadingOverlay';

const NAV_ITEMS = [
    { id: 'home', name: 'Home', icon: <FiHome className="w-4 h-4" />, path: '/dashboard/overview' },
    { id: 'events', name: 'Events', icon: <FiCalendar className="w-4 h-4" />, path: '/dashboard/events' },
    { id: 'explore', name: 'Explore', icon: <FiCompass className="w-4 h-4" />, path: '/dashboard/explore' },
    { id: 'wallet', name: 'Wallet', icon: <FiCreditCard className="w-4 h-4" />, path: '/dashboard/wallet' },
];

const DashNavbar = () => {
    const location = useLocation();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const userProfile = myProfile?.data;


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setShowMobileMenu(false);
        setShowProfileMenu(false);
    }, [location.pathname]);

    // Lock body scroll while the drawer is open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMobileMenu]);


    const navigate = useNavigate()

    return (
        <>
            <LoadingOverlay visible={userLoading} />
            <nav
                className="fixed top-0 left-0 right-0 z-30 transition-all duration-300 h-16"
                style={{
                    background: 'rgba(6, 10, 4, 0.85)',
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
                        <div className="w-24 shrink-0">
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
                        <div className="flex items-center gap-4">

                            {userProfile?.is_mentor ?
                                <Link
                                    to="/dashboard/mentor"
                                    className="hidden sm:flex items-center bg-white gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                >
                                    <FiUser />
                                    Mentor Profile
                                </Link> :
                                <Link
                                    to="/mentor-onboarding"
                                    className="hidden sm:flex items-center bg-white gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                >
                                    Become a Mentor
                                </Link>
                            }
                            <Link
                                to="/dashboard/events/create"
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                                style={{ background: '#a6ff00' }}
                            >
                                <FiPlus size={14} />
                                Create Event
                            </Link>


                            <Link to={'/dashboard/notifications'}>
                                <button
                                    className="p-2 rounded-lg transition-colors text-white/60 hover:text-white relative"
                                    style={{ background: 'transparent' }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    }}
                                    title="Notifications"
                                >
                                    <FiBell className="w-7 h-7" />
                                    <span
                                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                        style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.7)' }}
                                    />
                                </button>
                            </Link>

                            {/* Avatar + dropdown */}
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu((prev) => !prev)}
                                    aria-haspopup="true"
                                    aria-expanded={showProfileMenu}
                                    className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 rounded-full"
                                    style={{
                                        outline: showProfileMenu ? '2px solid rgba(166,255,0,0.4)' : 'none',
                                        outlineOffset: '2px',
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                                        style={{
                                            background: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                        }}
                                    >
                                        {userProfile?.avatar ? (
                                            <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={avatar} alt="avatar" className="w-full object-cover" />
                                        )}
                                    </div>
                                </button>

                                {/* Dropdown panel */}
                                <div
                                    className={`absolute bg-neutral-900 right-0 top-full mt-3 w-64 rounded-2xl overflow-hidden origin-top-right transition-all duration-200 ease-out ${showProfileMenu
                                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                                        : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                                        }`}
                                    style={{
                                        backdropFilter: 'blur(24px) saturate(150%)',
                                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                                    }}
                                >
                                    <div
                                        className="h-px w-full"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(166,255,0,0.3), transparent)' }}
                                    />

                                    {/* Identity block */}
                                    <Link
                                        to="/dashboard/setting"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-3 px-5 py-4 no-underline transition-colors"
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                        }}
                                    >
                                        <div
                                            className="w-10 h-10 p-1 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                                            style={{
                                                background: 'rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            {userProfile?.avatar ? (
                                                <img src={userProfile.avatar} alt="avatar" className="w-full rounded-full h-full object-cover" />
                                            ) : (
                                                <img src={avatar} alt="avatar" className="w-full rounded-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-base font-semibold leading-tight truncate">
                                                {userProfile?.first_name} {userProfile?.last_name}
                                            </p>
                                            <p className="text-xs leading-tight font-semibold truncate mt-0.5 text-neutral-500">
                                                {userProfile?.email}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                                    {/* Menu items */}
                                    <div className="py-1">
                                        <a
                                            href="/profile-public"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-5 py-3 text-xs no-underline transition-colors"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                                            }}
                                        >
                                            <BsEyeFill className="w-4 h-4" />
                                            Public Profile
                                        </a>

                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/dashboard/setting"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-3 px-5 py-3 text-xs no-underline transition-colors"
                                            style={{ color: 'rgba(255,255,255,0.75)' }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                                                (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)';
                                            }}
                                        >
                                            <MdSettings className="w-5 h-5" />
                                            Settings
                                        </Link>
                                    </div>

                                    <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('betamindToken')
                                                navigate('/login')
                                            }}
                                            className="w-full flex items-center gap-3 px-5 py-3 text-white text-xs text-left transition-colors"
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                            }}
                                        >
                                            <FiLogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="lg:hidden rounded-lg transition-colors text-white/60 hover:text-white"
                                onClick={() => setShowMobileMenu((prev) => !prev)}
                                title={showMobileMenu ? "Close menu" : "Menu"}
                                aria-expanded={showMobileMenu}
                            >
                                <span className="text-3xl inline-block transition-all duration-300">
                                    {showMobileMenu ? <MdClose /> : <HiMenuAlt3 />}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Blurred backdrop overlay, sits below the navbar so the logo/bell/avatar stay visible and clickable */}
            <div
                onClick={() => setShowMobileMenu(false)}
                aria-hidden="true"
                className={`lg:hidden fixed top-16 left-0 right-0 bottom-0 z-40 transition-opacity duration-300 ease-in-out ${showMobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            />

            {/* Left-sliding drawer, starts below the fixed navbar so the top bar is never covered */}
            <div
                role="dialog"
                aria-modal="true"
                className={`lg:hidden fixed top-16 left-0 bottom-0 z-40 w-72 sm:w-80 max-w-[85vw] transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{
                    background: 'rgba(6, 10, 4, 0.97)',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: showMobileMenu ? '12px 0 32px rgba(0,0,0,0.5)' : 'none',
                }}
            >
                {/* subtle side glass highlight */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-px"
                    style={{ background: 'linear-gradient(180deg, transparent, rgba(166,255,0,0.25), transparent)' }}
                />

                <div className="h-full flex flex-col p-6 pt-8 overflow-y-auto">
                    <ul className="flex flex-col gap-6 mb-8">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 text-base text-center"
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

                    <div className="flex flex-col gap-3 mt-auto">

                        {userProfile?.is_mentor ?
                            <Link
                                to="/dashboard/mentor"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex w-full justify-center items-center bg-white gap-1.5 px-3 py-3 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                            >
                                <FiUser />
                                Mentor Profile
                            </Link> :
                            <Link
                                to="/mentor-onboarding"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex w-full justify-center items-center bg-white gap-1.5 px-3 py-3 rounded-md text-xs font-semibold text-black transition-transform hover:scale-[1.02]"
                            >
                                <FiPlus size={16} />
                                Become a Mentor
                            </Link>
                        }

                        <Link
                            to="/dashboard/events/create"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center justify-center gap-1.5 w-full px-4 py-3 rounded-md text-xs font-semibold text-black"
                            style={{ background: '#a6ff00' }}
                        >
                            <FiPlus size={16} />
                            Create Event
                        </Link>
                    </div>

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