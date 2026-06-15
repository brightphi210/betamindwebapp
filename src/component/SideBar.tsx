import { useState } from 'react';
import {
    FiCalendar,
    FiCompass,
    FiHome,
    FiUser,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import betamindLogo1 from '../assets/beta.png';
import betamindLogo from '../assets/betamindlogo.png';

const NAV_ITEMS = [
    { id: 'home', name: 'Home', icon: <FiHome className="lg:w-4 lg:h-4 w-5 h-5" />, path: '/dashboard/overview' },
    { id: 'events', name: 'Events', icon: <FiCalendar className="lg:w-4 lg:h-4 w-5 h-5" />, path: '/dashboard/events' },
    { id: 'explore', name: 'Explore', icon: <FiCompass className="lg:w-4 lg:h-4 w-5 h-5" />, path: '/dashboard/explore' },
    { id: 'profile', name: 'Profile', icon: <FiUser className="lg:w-4 lg:h-4 w-5 h-5" />, path: '/dashboard/profile' },
];

const SideBar = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const activeStyle = {
        color: '#a6ff00',
        fontWeight: 600,
        borderBottom: '2px solid #a6ff00',
        paddingBottom: '8px',
        width: '50%',
    };

    const inactiveStyle = {
        color: 'rgba(255,255,255,.6)',
        fontWeight: 400,
        borderBottom: '2px solid transparent',
        paddingBottom: '8px',
    };

    /* shared nav list for sidebar */
    const NavList = ({ collapsed = false }: { collapsed?: boolean }) => (
        <nav className="flex-1 z-50">
            <ul className="space-y-6">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.id}>
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 transition-all duration-200 ${collapsed ? 'justify-center' : ''
                                    }`}
                                style={isActive ? activeStyle : inactiveStyle}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.6)';
                                    }
                                }}
                                title={collapsed ? item.name : ''}
                            >
                                <span className="text-xl shrink-0" style={{ color: isActive ? '#a6ff00' : 'rgba(255,255,255,.6)' }}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="text-xs">{item.name}</span>}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );

    return (
        <>
            <style>{`
        .bottom-nav-item { 
          transition: color .2s, border-color .2s;
        }
        .bottom-nav-item.active {
          color: #a6ff00 !important;
          border-bottom: 2px solid #a6ff00;
        }
      `}</style>

            {/* ════════════ DESKTOP SIDEBAR ════════════ */}
            <div
                className={`
          hidden md:flex flex-col
          h-screen pt-16 px-6 fixed left-0 top-0 overflow-y-auto
          transition-all duration-300 ease-in-out z-40 bg-[#000904]
          ${isCollapsed ? 'w-24' : 'w-44'}
        `}
                style={{
                    borderRight: '1px solid rgba(205,220,57,.1)',
                }}
            >
                {/* Logo */}
                <div className="mb-12 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        {!isCollapsed && (
                            <>
                                <div
                                    className="w-24 rounded flex items-center justify-center text-lg font-black"
                                >
                                    <img src={betamindLogo} alt="Betamind Logo" />
                                </div>
                            </>
                        )}
                        {isCollapsed && (
                            <div
                                className="w-8 h-8 rounded flex items-center justify-center text-lg font-black"
                            >
                                <img src={betamindLogo1} alt="Betamind Logo" className="w-5 h-5" />
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden p-1 rounded text-sm"
                        style={{ color: '#a6ff00' }}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                <NavList collapsed={isCollapsed} />

                <div className="grow" />
            </div>

            {/* ════════════ MOBILE BOTTOM NAV BAR ═════════════ */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 bg-[#000904]"
                style={{
                    borderTop: '1px solid rgba(205,220,57,.1)',
                    height: 70,
                }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="bottom-nav-item flex flex-col items-center gap-1 py-0 px-3 flex-1 pt-2"
                            style={{
                                color: isActive ? '#a6ff00' : 'rgba(255,255,255,.5)',
                            }}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default SideBar;