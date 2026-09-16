import { useEffect, useRef, useState } from 'react';
import { BsEyeFill } from 'react-icons/bs';
import {
    FiBell,
    FiBookOpen,
    FiCalendar,
    FiCompass,
    FiCreditCard,
    FiHome,
    FiLogOut,
    FiMoreHorizontal,
    FiPlus,
    FiUser,
    FiX
} from 'react-icons/fi';
import { MdSettings } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import avatar from '../assets/Avatar.png';
import betamindLogo from '../assets/betamindlogo.png';
import { useGetMyUserProfile } from '../hooks/queries/allQueriess';
import LoadingOverlay from './LoadingOverlay';

const NAV_ITEMS = [
    { id: 'home', name: 'Home', icon: <FiHome className="" />, path: '/dashboard/overview' },
    { id: 'events', name: 'Events', icon: <FiCalendar className="" />, path: '/dashboard/events' },
    { id: 'explore', name: 'Explore', icon: <FiCompass className="" />, path: '/dashboard/explore' },
    { id: 'wallet', name: 'Wallet', icon: <FiCreditCard className="" />, path: '/dashboard/wallet' },
    { id: 'bookings', name: 'Bookings', icon: <FiBookOpen className="" />, path: '/dashboard/bookings' },
];

const MY_PRODUCTS_PATH = '/dashboard/mentor/products';

// Mobile bottom tab bar: keep it focused on core actions and let the More menu hold
// secondary destinations like Bookings / Mentor Profile.
const MOBILE_PRIMARY_IDS = ['home', 'events'];
const MOBILE_SECONDARY_IDS = ['wallet'];

const DashNavbar = () => {
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const userProfile = myProfile?.data;
    console.log("userProfile", userProfile);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setShowMoreMenu(false);
        };

        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, []);

    useEffect(() => {
        setShowProfileMenu(false);
        setShowMoreMenu(false);
    }, [location.pathname]);


    const navigate = useNavigate()

    const mobilePrimaryItems = NAV_ITEMS.filter((item) => MOBILE_PRIMARY_IDS.includes(item.id));
    const mobileSecondaryItems = NAV_ITEMS.filter((item) => MOBILE_SECONDARY_IDS.includes(item.id));
    const desktopNavItems = userProfile?.is_mentor
        ? [...NAV_ITEMS, { id: 'my-products', name: 'My Products', icon: <FiBookOpen className="" />, path: MY_PRODUCTS_PATH }]
        : NAV_ITEMS;

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
                            {desktopNavItems.map((item) => {
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
                                            <BsEyeFill className="" />
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
                                            <FiLogOut className="" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile bottom tab bar — replaces the old side drawer */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch py-2.5"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                    boxShadow: '0 -8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                {/* subtle top glass highlight */}
                <div
                    className="absolute top-0 left-0 right-0 h-px p-0.5"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(166,255,0,0.25), transparent)' }}
                />

                {mobilePrimaryItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors duration-200"
                            style={{
                                color: isActive ? '#a6ff00' : 'rgba(255,255,255,.55)',
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Direct link to the create-event page; the More menu handles secondary actions */}
                <Link
                    to="/dashboard/events/create"
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]"
                    style={{ color: '#a6ff00', fontWeight: 600 }}
                >
                    <span
                        className="w-10 h-10 -mt-1 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105"
                        style={{ background: '#a6ff00', boxShadow: '0 0 12px rgba(166,255,0,0.4)' }}
                    >
                        <FiPlus className="text-black" size={20} />
                    </span>
                    Create
                </Link>

                {mobileSecondaryItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors duration-200"
                            style={{
                                color: isActive ? '#a6ff00' : 'rgba(255,255,255,.55)',
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Dots — opens a bottom-sheet menu with smooth transitions */}
                <div className="relative flex-1" ref={moreMenuRef}>
                    <button
                        onClick={() => setShowMoreMenu((prev) => !prev)}
                        aria-haspopup="true"
                        aria-expanded={showMoreMenu}
                        className="w-full h-full flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors duration-200"
                        style={{
                            color: showMoreMenu ? '#a6ff00' : 'rgba(255,255,255,.55)',
                            fontWeight: showMoreMenu ? 600 : 400,
                        }}
                    >
                        <span className="text-2xl">
                            <FiMoreHorizontal />
                        </span>
                        More
                    </button>
                </div>
            </nav>

            <div
                className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-out ${showMoreMenu ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
                style={{
                    background: 'rgba(2, 5, 3, 0.5)',
                    backdropFilter: 'blur(5px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(5px) saturate(140%)',
                }}
                onClick={() => setShowMoreMenu(false)}
            >
                <div
                    className={`absolute bottom-0 bg-neutral-950 left-0 right-0 mx-auto w-full max-w-md rounded-t-[28px] border-t border-white/10 px-5 pb-8 pt-4 shadow-2xl transition-all duration-300 ease-out ${showMoreMenu ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backdropFilter: 'blur(24px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                        boxShadow: '0 -12px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">More</p>
                        <button
                            onClick={() => setShowMoreMenu(false)}
                            aria-label="Close menu"
                            className="w-7 h-7 flex items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white"
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    <div className="space-y-2.5 py-1">
                        <Link
                            to="/dashboard/explore"
                            onClick={() => setShowMoreMenu(false)}
                            className="flex items-center bg-neutral-900 justify-center gap-2 rounded-md px-5 py-3 text-sm text-white transition-colors"
                        >
                            <FiCompass />
                            Explore
                        </Link>

                        <Link
                            to="/dashboard/bookings"
                            onClick={() => setShowMoreMenu(false)}
                            className="flex justify-center items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black"
                        >
                            <FiBookOpen />
                            Bookings
                        </Link>

                        {userProfile?.is_mentor && (
                            <Link
                                to={MY_PRODUCTS_PATH}
                                onClick={() => setShowMoreMenu(false)}
                                className="flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                <FiBookOpen />
                                My Products
                            </Link>
                        )}
                    </div>

                    <div className="my-4 h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                    <div className="pb-1">
                        {userProfile?.is_mentor ? (
                            <Link
                                to="/dashboard/mentor"
                                onClick={() => setShowMoreMenu(false)}
                                className="flex justify-center items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-black"
                            >
                                <FiUser />
                                Mentor Profile
                            </Link>
                        ) : (
                            <Link
                                to="/mentor-onboarding"
                                onClick={() => setShowMoreMenu(false)}
                                className="flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                <FiUser />
                                Become a Mentor
                            </Link>
                        )}
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