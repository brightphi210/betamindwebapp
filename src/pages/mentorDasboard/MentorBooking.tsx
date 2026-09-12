import { useState } from "react";
import {
    FiAlertCircle,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiDollarSign,
    FiInfo,
    FiLoader,
    FiRepeat,
    FiUser,
    FiVideo,
    FiX,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import { useAcceptBooking, useRejectBooking } from "../../hooks/mutations/allMutation";
import { useGetMentorSession } from "../../hooks/queries/allQueriess";
import type { ApiBooking, ApiBookingsResponse } from "../../types/bookingShare";
import {
    flattenErrorMessages,
    formatDayLabel,
    formatRecurringSummary,
    formatSessionDateLabel,
    formatTime,
    getRecurringSessionDates,
    menteeDisplayName,
    normalizeStatus,
} from "../../types/bookingShare";

const TABS = [
    { key: "pending", label: "Incoming" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "declined", label: "Declined" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLE: Record<TabKey, { color: string; bg: string; icon: React.ReactNode }> = {
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: <FiClock size={12} /> },
    upcoming: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", icon: <FiVideo size={12} /> },
    completed: { color: "#7dd3fc", bg: "rgba(125,211,252,0.1)", icon: <FiCheckCircle size={12} /> },
    declined: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: <FiX size={12} /> },
};

const BookingRow: React.FC<{ booking: ApiBooking; onClick: () => void }> = ({ booking, onClick }) => {
    const tabKey = normalizeStatus(booking.status);
    const statusStyle = STATUS_STYLE[tabKey];
    const mentee = booking.mentee;

    return (
        <div className="overflow-hidden rounded-xl transition-colors hover:bg-white/[0.02]" style={{ background: cardBg, border: cardBorder }}>
            {/* Status is always flagged at the top of the card */}
            <div
                className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold sm:px-5"
                style={{ background: statusStyle.bg, color: statusStyle.color, borderBottom: `1px solid ${statusStyle.color}22` }}
            >
                {statusStyle.icon}
                {booking.status_display}
                {tabKey === "pending" && <span className="ml-auto text-[11px] font-medium text-[#a6ff00]">Needs response</span>}
            </div>

            <div className="flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
                    {mentee?.avatar ? (
                        <img src={mentee.avatar} alt={menteeDisplayName(mentee)} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <FiUser size={20} className="text-white/15" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white sm:text-base">{menteeDisplayName(mentee)}</h3>
                    <p className="truncate text-xs text-white/60 sm:text-sm">{booking.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                        <span className="flex items-center gap-1.5">
                            <FiCalendar size={12} />
                            {formatDayLabel(booking.scheduled_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <FiClock size={12} />
                            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClick}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-white/80 transition-colors hover:bg-[#a6ff00] hover:text-black"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                >
                    View
                    <FiChevronRight size={13} />
                </button>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center" style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.1)" }}>
        <p className="text-sm text-white/40">{label}</p>
    </div>
);

const RowSkeleton: React.FC = () => (
    <div className="flex animate-pulse items-center gap-4 rounded-xl p-3 sm:gap-5 sm:p-4" style={{ background: cardBg, border: cardBorder }}>
        <div className="h-16 w-16 shrink-0 rounded-lg bg-white/5 sm:h-20 sm:w-20" />
        <div className="flex-1 space-y-2.5">
            <div className="h-3 w-24 rounded bg-white/5" />
            <div className="h-4 w-1/2 rounded bg-white/5" />
            <div className="h-3 w-1/3 rounded bg-white/5" />
        </div>
    </div>
);

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">{label}</p>
            <div className="text-sm text-white/85 break-words">{value}</div>
        </div>
    </div>
);

const ScheduleCard: React.FC<{ booking: ApiBooking }> = ({ booking }) => {
    const recurs = booking.duration && booking.duration > 1;
    return (
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/35">
                <FiCalendar size={12} />
                Schedule
            </p>
            <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-white/40">Proposed Start Date</span>
                    <span className="text-right font-medium text-white/85">{formatDayLabel(booking.scheduled_date)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-white/40">Start Time</span>
                    <span className="font-medium text-white/85">{formatTime(booking.start_time)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-white/40">End Time</span>
                    <span className="font-medium text-white/85">{formatTime(booking.end_time)}</span>
                </div>
            </div>

            {recurs && (
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#a6ff00]">
                        <FiRepeat size={12} />
                        {formatRecurringSummary(booking.scheduled_date, booking.duration)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {getRecurringSessionDates(booking.scheduled_date, booking.duration).map((d, i) => (
                            <span key={i} className="rounded-md px-2 py-1 text-[11px] text-white/60" style={{ background: "rgba(255,255,255,0.05)" }}>
                                {formatSessionDateLabel(d)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/** Confirm Accept modal — shown after mentor clicks Accept */
const ConfirmAcceptModal: React.FC<{
    booking: ApiBooking;
    onClose: () => void;
    onConfirm: (notes?: string) => void;
    isAccepting: boolean;
}> = ({ booking, onClose, onConfirm, isAccepting }) => {
    const [notes, setNotes] = useState("");
    const mentee = booking.mentee;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={isAccepting ? undefined : onClose}>
            <div
                className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.9)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-white">Confirm accept</h3>
                        <p className="mt-1 text-sm text-white/50">
                            Accept session with {menteeDisplayName(mentee)}?
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isAccepting}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="mb-4 rounded-xl p-3 text-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <p className="font-medium text-white/90">{booking.title}</p>
                    <p className="mt-1 text-white/50">
                        {formatDayLabel(booking.scheduled_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                    </p>
                </div>

                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                    <FiInfo size={13} />
                    Notes for mentee (optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a short note for the mentee…"
                    rows={3}
                    disabled={isAccepting}
                    className="mb-5 w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25 disabled:opacity-60"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isAccepting}
                        className="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(notes.trim() || undefined)}
                        disabled={isAccepting}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-black transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ background: "#a6ff00" }}
                    >
                        {isAccepting ? <FiLoader size={14} className="animate-spin" /> : <FiCheck size={14} />}
                        {isAccepting ? "Accepting…" : "Confirm accept"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookingDetailModal: React.FC<{
    booking: ApiBooking;
    onClose: () => void;
    onAcceptClick: () => void;
    onReject: (reason?: string) => void;
    isAccepting: boolean;
    isRejecting: boolean;
}> = ({ booking, onClose, onAcceptClick, onReject, isAccepting, isRejecting }) => {
    const [showRejectReason, setShowRejectReason] = useState(false);
    const [reason, setReason] = useState("");

    const mentee = booking.mentee;
    const tabKey = normalizeStatus(booking.status);
    const statusStyle = STATUS_STYLE[tabKey];
    const isBusy = isAccepting || isRejecting;
    const canDecide = booking.status?.toLowerCase() === "pending";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm" onClick={isBusy ? undefined : onClose}>
            <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            {mentee?.avatar ? (
                                <img src={mentee.avatar} alt={menteeDisplayName(mentee)} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                                    <FiUser size={18} className="text-white/25" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold leading-tight text-white">{menteeDisplayName(mentee)}</h3>
                            <p className="truncate text-xs text-white/40">{mentee?.email}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Status is always flagged at the top of the modal */}
                <span
                    className="mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {statusStyle.icon}
                    {booking.status_display}
                </span>

                <h4 className="mb-1 text-base font-bold text-white">{booking.title}</h4>
                {booking.subject && <p className="mb-5 text-sm text-white/50">{booking.subject}</p>}

                <div className="mb-5 space-y-4">
                    <ScheduleCard booking={booking} />
                    <DetailRow icon={<FiVideo size={14} className="text-white/60" />} label="Session type" value={booking.session_type_display} />
                    {booking.total_amount && (
                        <DetailRow icon={<FiDollarSign size={14} className="text-white/60" />} label="Total" value={`$${booking.total_amount}`} />
                    )}
                </div>

                {/* Notes only — no description, no left border, overflow fixed */}
                {booking.notes && (
                    <div className="mb-6 overflow-hidden rounded-xl bg-white/5 p-4">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                            <FiInfo size={12} />
                            Notes
                        </p>
                        <p className="break-words text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                            {booking.notes}
                        </p>
                    </div>
                )}

                {tabKey === "upcoming" && booking.session_link && (
                    <a
                        href={booking.session_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
                        style={{ background: "#a6ff00" }}
                    >
                        <FiVideo size={14} />
                        Join session
                    </a>
                )}

                {canDecide && (
                    <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        {!showRejectReason ? (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectReason(true)}
                                    disabled={isBusy}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
                                >
                                    <FiX size={14} />
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={onAcceptClick}
                                    disabled={isBusy}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-black transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                                    style={{ background: "#fff" }}
                                >
                                    <FiCheck size={14} />
                                    Accept
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-white/70">
                                    <FiAlertCircle size={13} />
                                    Reason (optional)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Let the mentee know why, if you'd like..."
                                    rows={2}
                                    disabled={isBusy}
                                    className="mb-3 w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white/90 outline-none placeholder:text-white/25 disabled:opacity-60"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                />
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectReason(false)}
                                        disabled={isBusy}
                                        className="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors disabled:opacity-40"
                                        style={{ background: "rgba(255,255,255,0.06)" }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onReject(reason.trim() || undefined)}
                                        disabled={isBusy}
                                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                        style={{ background: "#f87171" }}
                                    >
                                        {isRejecting ? <FiLoader size={14} className="animate-spin" /> : <FiX size={14} />}
                                        {isRejecting ? "Rejecting..." : "Confirm reject"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const MentorBookings = () => {
    const [tab, setTab] = useState<TabKey>("pending");
    const [selectedBooking, setSelectedBooking] = useState<ApiBooking | null>(null);
    const [showConfirmAccept, setShowConfirmAccept] = useState(false);

    const { mentorSession, isLoading, isError, refetch } = useGetMentorSession();
    const payload: ApiBookingsResponse | undefined = mentorSession?.data;
    const bookings: ApiBooking[] = payload?.results ?? [];

    const filtered = bookings.filter((b) => normalizeStatus(b.status) === tab);

    const { mutate: acceptBooking, isPending: isAccepting } = useAcceptBooking();
    const { mutate: rejectBooking, isPending: isRejecting } = useRejectBooking();

    const handleAcceptConfirm = (notes?: string) => {
        if (!selectedBooking) return;
        // If your accept mutation supports a notes/payload field, pass it here.
        // Current signature is acceptBooking(id, options) — extend the mutation if the API accepts notes.
        acceptBooking(selectedBooking.id, {
            onSuccess: () => {
                toast("Booking accepted.", { type: "success" });
                setShowConfirmAccept(false);
                setSelectedBooking(null);
                refetch();
            },
            onError: (error: any) => {
                toast(flattenErrorMessages(error?.response?.data), { type: "error" });
            },
        });
        // notes is available if you later wire it into the mutation payload
        void notes;
    };

    const handleReject = (reason?: string) => {
        if (!selectedBooking) return;
        rejectBooking(
            { bookingId: selectedBooking.id, reason },
            {
                onSuccess: () => {
                    toast("Booking rejected.", { type: "success" });
                    setSelectedBooking(null);
                    refetch();
                },
                onError: (error: any) => {
                    toast(flattenErrorMessages(error?.response?.data), { type: "error" });
                },
            }
        );
    };

    return (
        <div>
            <ToastContainer theme="dark" />
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Bookings</h2>
            <p className="mb-6 text-sm text-white/40">Manage your incoming, upcoming, and past sessions.</p>

            <div className="mb-6 flex flex-wrap gap-2">
                {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-[#a6ff00] text-black" : "text-white/60 hover:text-white"
                                }`}
                            style={active ? undefined : { background: cardBg, border: cardBorder }}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center" style={{ background: cardBg, border: cardBorder }}>
                        <p className="mb-3 text-sm text-white/40">Couldn't load your bookings.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                            Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState label={`No ${tab} sessions right now.`} />
                ) : (
                    filtered.map((booking) => (
                        <BookingRow key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
                    ))
                )}
            </div>

            {selectedBooking && !showConfirmAccept && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onAcceptClick={() => setShowConfirmAccept(true)}
                    onReject={handleReject}
                    isAccepting={isAccepting}
                    isRejecting={isRejecting}
                />
            )}

            {selectedBooking && showConfirmAccept && (
                <ConfirmAcceptModal
                    booking={selectedBooking}
                    onClose={() => setShowConfirmAccept(false)}
                    onConfirm={handleAcceptConfirm}
                    isAccepting={isAccepting}
                />
            )}
        </div>
    );
};

export default MentorBookings;