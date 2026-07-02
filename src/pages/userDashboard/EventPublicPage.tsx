import React from 'react';
import {
    FiMapPin
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { EVENTS } from './Overview';

// ─── Public Event Page ─────────────────────────────────────────────────────
// Route this at e.g. /events/:id in your router config.
const EventPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const event = EVENTS.find((e) => e.id === id);

    const pageBg =
        'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)'
    if (!event) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <p className="text-white text-base font-bold mb-2">Event not found</p>
                        <Link to="/dashboard/overview" className="text-sm" style={{ color: '#a6ff00' }}>
                            ← Back to Events
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const dateObj = new Date(event.date);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="w-full min-h-screen" style={{ background: pageBg }}>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left column */}
                    <div>
                        <img
                            src={event.thumbnail}
                            alt={event.title}
                            className="w-full aspect-square object-cover rounded-2xl"
                            style={{ border: '1px solid rgba(205,220,57,.1)' }}
                        />

                        {/* Hosted By */}
                        <div className="mt-6">
                            <h3 className="text-white font-bold text-sm mb-3">Hosted By</h3>
                            <div
                                className="h-px w-full mb-4"
                                style={{ background: 'rgba(205,220,57,.1)' }}
                            />
                            <div className="flex items-center gap-3">
                                {event.hostAvatar && (
                                    <img
                                        src={event.hostAvatar}
                                        alt={event.host}
                                        className="w-9 h-9 rounded-full object-cover"
                                        style={{ border: '1px solid rgba(205,220,57,.2)' }}
                                    />
                                )}
                                <span className="text-white font-bold text-sm">{event.host}</span>
                            </div>

                            {event.hostEmail && (
                                <a
                                    href={`mailto:${event.hostEmail}`}
                                    className="inline-block mt-4 text-sm text-white/40 hover:text-white/70 transition-colors"
                                >
                                    Contact the Host
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-2">
                        <h1 className="text-white text-2xl sm:text-3xl font-black mb-6 break-words">
                            {event.title}
                        </h1>

                        {/* Date row */}
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-12 rounded-lg overflow-hidden text-center shrink-0"
                                style={{ border: '1px solid rgba(205,220,57,.15)' }}
                            >
                                <div
                                    className="text-[10px] font-bold py-0.5"
                                    style={{ background: 'rgba(166,255,0,0.12)', color: '#a6ff00' }}
                                >
                                    {month}
                                </div>
                                <div className="text-white font-bold text-base py-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {day}
                                </div>
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{weekday}</p>
                                <p className="text-white/50 text-xs">{event.time}</p>
                            </div>
                        </div>

                        {/* Location row */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                style={{ border: '1px solid rgba(205,220,57,.15)' }}
                            >
                                <FiMapPin className="text-white/60" size={18} />
                            </div>
                            <p className="text-white font-bold text-sm">
                                {event.location ?? 'Register to See Address'}
                            </p>
                        </div>

                        {/* Registration card */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(205,220,57,.1)' }}
                        >
                            <div
                                className="px-6 py-3.5 text-sm font-bold text-white/70"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                                Registration
                            </div>
                            <div className="p-6">
                                <p className="text-white text-sm mb-5">
                                    To join this event, please register below.
                                </p>

                                {event.host && (
                                    <div className="flex items-center gap-2.5 mb-5">
                                        {event.hostAvatar && (
                                            <img
                                                src={event.hostAvatar}
                                                alt={event.host}
                                                className="w-7 h-7 rounded-full object-cover"
                                            />
                                        )}
                                        <span className="text-white text-sm font-bold">{event.host}</span>
                                        {event.hostEmail && (
                                            <span className="text-white/40 text-sm">{event.hostEmail}</span>
                                        )}
                                    </div>
                                )}

                                <button
                                    className="w-full py-3.5 rounded-lg font-semibold text-xs bg-white text-black transition-transform hover:scale-[1.01]"
                                >
                                    One-Click RSVP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPublicPage;