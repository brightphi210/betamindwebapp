import React from 'react';
import { FiMapPin, FiTag, FiUserCheck, FiUsers } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { useGetEvent } from '../../hooks/queries/allQueriess';
import { type ApiEvent } from './Overview';

const pageBg =
    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)';

const formatTicketPrice = (price?: string) => {
    const numeric = parseFloat(price || '0');
    if (!numeric || numeric <= 0) return 'Free';
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

const formatTime = (iso: string) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
        return '';
    }
};

// Simple initials avatar since the event payload only carries a host name, not an image
const HostInitials: React.FC<{ name?: string }> = ({ name }) => {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('');

    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'rgba(166,255,0,0.12)', border: '1px solid rgba(205,220,57,.2)', color: '#a6ff00' }}
        >
            {initials}
        </div>
    );
};

const PublicEventSkeleton: React.FC = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
            <div>
                <div
                    className="w-full aspect-square rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div className="mt-6 space-y-3">
                    <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-px w-full" style={{ background: 'rgba(205,220,57,.1)' }} />
                    <div className="h-9 w-40 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="h-9 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-14 w-56 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-14 w-64 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-56 w-full rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
        </div>
    </div>
);

const NotFoundState: React.FC = () => (
    <div className="flex items-center justify-center py-32">
        <div className="text-center">
            <p className="text-white text-base font-bold mb-2">Event not found</p>
            <Link to="/dashboard/overview" className="text-sm" style={{ color: '#a6ff00' }}>
                ← Back to Events
            </Link>
        </div>
    </div>
);

// ─── Public Event Page ─────────────────────────────────────────────────────
// Routed at e.g. /events/:id
const EventPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { eventDetail, isLoading, isError, isFetched } = useGetEvent(id);

    const event: ApiEvent | undefined = eventDetail?.data;

    if (isLoading) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <PublicEventSkeleton />
            </div>
        );
    }

    if (isError || (isFetched && !event)) {
        return (
            <div className="w-full min-h-screen" style={{ background: pageBg }}>
                <NotFoundState />
            </div>
        );
    }

    if (!event) return null;

    const dateObj = new Date(event.start_date);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const time = formatTime(event.start_date);
    const ticketLabel = formatTicketPrice(event.ticket_price);

    return (
        <div className="w-full min-h-screen" style={{ background: pageBg }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Left column */}
                    <div>
                        <img
                            src={event.image}
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
                                <HostInitials name={event.user_name} />
                                <span className="text-white font-bold text-sm">{event.user_name}</span>
                            </div>
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
                                <p className="text-white/50 text-xs">{time}</p>
                            </div>
                        </div>

                        {/* Location row */}
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                                style={{ border: '1px solid rgba(205,220,57,.15)' }}
                            >
                                <FiMapPin className="text-white/60" size={18} />
                            </div>
                            <p className="text-white font-bold text-sm">
                                {event.location || 'Register to See Address'}
                            </p>
                        </div>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-8">
                            <span
                                className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                style={{
                                    background: ticketLabel === 'Free' ? 'rgba(255,255,255,0.06)' : 'rgba(166,255,0,0.1)',
                                    color: ticketLabel === 'Free' ? 'rgba(255,255,255,0.6)' : '#a6ff00',
                                }}
                            >
                                <FiTag size={13} />
                                {ticketLabel}
                            </span>
                            {event.require_approval && (
                                <span
                                    className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                                >
                                    <FiUserCheck size={13} />
                                    Approval Required
                                </span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 rounded-md font-semibold text-xs px-2.5 py-1.5"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <FiUsers size={13} />
                                {event.capacity === null || event.capacity === undefined ? 'Unlimited' : `Cap ${event.capacity}`}
                            </span>
                        </div>

                        {event.description && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">About</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{event.description}</p>
                            </div>
                        )}

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

                                <div className="flex items-center gap-2.5 mb-5">
                                    <HostInitials name={event.user_name} />
                                    <span className="text-white text-sm font-bold">{event.user_name}</span>
                                </div>

                                <Button variant="white" className="w-full py-3.5 text-xs">
                                    {ticketLabel === 'Free' ? 'One-Click RSVP' : `RSVP · ${ticketLabel}`}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventPublicPage;