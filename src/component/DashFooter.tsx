import { FaXTwitter } from 'react-icons/fa6';
import { FiInstagram, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import betamindLogo from '../assets/betamindlogo.png';

// TODO: point these at your real routes / profiles
const FOOTER_LINKS = [
    { name: 'Discover', to: '/dashboard/explore' },
    { name: 'Pricing', to: '/pricing' },
    { name: 'Help', to: '/help' },
];

const SOCIAL_LINKS = [
    { label: 'Instagram', href: 'https://instagram.com/betamindhq', icon: <FiInstagram size={20} /> },
    { label: 'X', href: 'https://x.com/betamindhq', icon: <FaXTwitter size={19} /> },
    { label: 'Email', href: 'https://mail.google.com/mail/u/0/?fs=1&to=betamind123@gmail.com&tf=cm', icon: <FiMail size={20} /> },
];


const DashFooter = () => (
    <footer className="mt-auto w-full pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* pb-28 on mobile keeps the footer clear of the fixed bottom tab bar */}
            <div className="flex flex-col gap-5 border-t border-white/10 pt-6 pb-28 sm:flex-row sm:items-center sm:justify-between lg:pb-8">
                {/* Left: logo + links */}
                <div className="flex items-center gap-6">
                    <img src={betamindLogo} alt="Betamind" className="w-20 shrink-0" loading="lazy" decoding="async" />
                    <nav className="flex items-center gap-5">
                        {FOOTER_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                to={link.to}
                                className="text-sm font-medium text-white/50 transition-colors hover:text-white"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: socials + app button */}
                <div className="flex items-center gap-4">
                    {SOCIAL_LINKS.map((social) => (
                        <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="text-white/50 transition-colors hover:text-white"
                        >
                            {social.icon}
                        </a>
                    ))}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:border-white/60 hover:text-white"
                    >
                        Get the App <span className="text-xs italic text-white/40">(Coming Soon)</span>
                    </a>
                </div>
            </div>
        </div>
    </footer>
);

export default DashFooter;