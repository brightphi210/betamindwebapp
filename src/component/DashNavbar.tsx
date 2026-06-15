import { FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import avatar from '../assets/Avatar.png';
import betamindLogo from '../assets/betamindlogo.png';

const DashNavbar = () => {
    const profileData = {
        username: 'alexander_chen',
        image: null,
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 h-16`}
            style={{
                background: 'linear-gradient(180deg, rgba(1, 12, 6, 0.7) 0%, rgba(20, 30, 15, 0.4) 100%), radial-gradient(ellipse 400px 300px at 51% 100%, rgba(205, 220, 57, 0.1), transparent)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <div className="w-full h-full px-4 sm:px-6 lg:px-8  max-w-7xl mx-auto items-center">
                <div className="flex items-center lg:justify-end justify-between gap-4 h-full">
                    <div
                        className="w-28 lg:hidden"
                    >
                        <img src={betamindLogo} alt="Betamind Logo" className='w-full' />
                    </div>

                    <div className='flex items-center gap-3 '>

                        <button
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                            title="Notifications"
                        >
                            <FiBell className="w-5 h-5" />
                        </button>

                        <Link
                            to="/dashboard/profile"
                            className="flex items-center gap-2 sm:gap-3 no-underline cursor-pointer flex-shrink-0"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {profileData?.image ? (
                                    <img
                                        src={profileData.image}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img src={avatar} alt="avatar" className="w-full object-cover" />
                                )}
                            </div>
                        </Link>
                    </div>

                </div>
            </div>

            <style>{`
        /* Smooth focus transition for search input */
        input::placeholder {
          transition: color 0.3s ease;
        }

        input:focus::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Hide scrollbar on search input */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
        </nav>
    );
};

export default DashNavbar;