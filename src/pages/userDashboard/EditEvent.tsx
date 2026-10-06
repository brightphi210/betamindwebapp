import React, { useEffect, useState } from 'react';
import {
    FiArrowLeft,
    FiCamera,
    FiImage,
    FiPlus,
    FiTag,
    FiTrash2
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import { useEditEvents } from '../../hooks/mutations/allMutation';
import { useGetEventById } from '../../hooks/queries/allQueriess';
import { useGlobalContext } from '../../providers/GlobalContext';
import type { ApiEvent } from './Overview'; // or EventShared

// ── same helpers as create ────────────────────────────────────────────────
type TicketDraft = {
    id: string;
    name: string;
    price: string;
    description: string;
    imageFile: File | null;
    imagePreview: string | null;
    existingImage?: string | null; // keep existing URL when not replaced
};

const makeTicketId = () => Math.random().toString(36).slice(2, 10);

const emptyTicket = (): TicketDraft => ({
    id: makeTicketId(),
    name: '',
    price: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    existingImage: null,
});

const fieldStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
};

// Copy TicketsEditor from CreateEvent almost as-is; only difference:
// prefer imagePreview || existingImage for display
const TicketsEditor: React.FC<{
    tickets: TicketDraft[];
    onChange: (tickets: TicketDraft[]) => void;
}> = ({ tickets, onChange }) => {
    const updateTicket = (id: string, patch: Partial<TicketDraft>) =>
        onChange(tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    const removeTicket = (id: string) =>
        onChange(tickets.filter((t) => t.id !== id));

    const handleImage = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        updateTicket(id, {
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
        });
    };

    return (
        <div className="px-4 pb-4 flex flex-col gap-4">
            {tickets.map((t, i) => {
                const preview = t.imagePreview || t.existingImage;
                return (
                    <div
                        key={t.id}
                        className="rounded-xl overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-2.5"
                            style={{
                                background: 'rgba(255,255,255,0.01)',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                                    style={{ background: 'rgba(166,255,0,0.15)', color: '#a6ff00' }}
                                >
                                    {i + 1}
                                </span>
                                <p className="text-white/60 text-xs font-semibold">
                                    {t.name.trim() || `Ticket ${i + 1}`}
                                </p>
                            </div>
                            {tickets.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTicket(t.id)}
                                    className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
                                    title="Remove ticket"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <label
                                    className="relative w-[72px] h-[72px] shrink-0 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center group"
                                    style={{
                                        ...fieldStyle,
                                        border: '1px dashed rgba(255,255,255,0.18)',
                                    }}
                                    title="Add ticket image"
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <FiCamera size={16} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="flex flex-col items-center gap-1 text-white/30">
                                            <FiImage size={18} />
                                            <span className="text-[10px]">Image</span>
                                        </span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImage(t.id, e)}
                                    />
                                </label>

                                <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                                    <input
                                        value={t.name}
                                        onChange={(e) => updateTicket(t.id, { name: e.target.value })}
                                        placeholder="Ticket name (e.g. Early Bird)"
                                        className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#a6ff00]/40 transition-colors"
                                        style={fieldStyle}
                                    />
                                    <div className="flex items-center gap-1.5 rounded-lg px-3 py-2.5" style={fieldStyle}>
                                        <span className="text-white/40 text-sm font-medium">₦</span>
                                        <input
                                            value={t.price}
                                            inputMode="decimal"
                                            onChange={(e) =>
                                                updateTicket(t.id, {
                                                    price: e.target.value.replace(/[^0-9.]/g, ''),
                                                })
                                            }
                                            placeholder="0.00"
                                            className="bg-transparent outline-none text-white text-sm placeholder-white/25 flex-1 min-w-0"
                                        />
                                        <span className="text-white/25 text-xs">
                                            {t.price === '0' || t.price === '' ? 'Free' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <textarea
                                value={t.description}
                                onChange={(e) => updateTicket(t.id, { description: e.target.value })}
                                placeholder="What's included with this ticket?"
                                rows={2}
                                className="w-full rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 outline-none resize-none focus:border-[#a6ff00]/40 transition-colors"
                                style={fieldStyle}
                            />
                        </div>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={() => onChange([...tickets, emptyTicket()])}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                }}
            >
                <FiPlus size={15} />
                Add another ticket
            </button>
        </div>
    );
};

// Same Toggle as CreateEvent
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6ff00]/40"
        style={{
            background: checked ? '#a6ff00' : 'rgba(255,255,255,0.12)',
            border: checked
                ? '1px solid rgba(166,255,0,0.6)'
                : '1px solid rgba(255,255,255,0.1)',
        }}
    >
        <span
            className="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ease-in-out"
            style={{
                background: checked ? '#0a0a0a' : '#ffffff',
                transform: checked ? 'translateX(20px)' : 'translateX(0)',
            }}
        />
    </button>
);

const toLocalInput = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputClass =
    'w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#a6ff00]/60 transition-colors';

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({
    label,
    children,
    hint,
}) => (
    <div>
        <label className="block text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
            {label}
        </label>
        {children}
        {hint && <p className="text-white/30 text-xs mt-1.5">{hint}</p>}
    </div>
);

// Match create mode so tickets + images upload correctly
type TicketMode = 'bracket' | 'json-string' | 'json-body';
const TICKET_MODE = { mode: 'bracket' as TicketMode };

const EditEvent: React.FC = () => {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();

    const { event: eventRes, isLoading } = useGetEventById(id);
    const { mutate: updateEvent, isPending } = useEditEvents(id);

    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        meeting_link: '',
        start_date: '',
        end_date: '',
        capacity: '',
        require_approval: false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const [hasTickets, setHasTickets] = useState(false);
    const [tickets, setTickets] = useState<TicketDraft[]>([]);

    // Prefill once the event loads
    useEffect(() => {
        const e: ApiEvent | undefined = eventRes?.data;
        if (!e) return;

        setForm({
            title: e.title ?? '',
            description: e.description ?? '',
            location: e.location ?? '',
            meeting_link: e.meeting_link ?? '',
            start_date: toLocalInput(e.start_date),
            end_date: toLocalInput(e.end_date),
            capacity: e.capacity === null || e.capacity === undefined ? '' : String(e.capacity),
            require_approval: !!e.require_approval,
        });
        setImagePreview(e.image ?? '');

        const apiTickets = e.tickets ?? [];
        if (apiTickets.length > 0) {
            setHasTickets(true);
            setTickets(
                apiTickets.map((t: any) => ({
                    id: t.id ?? makeTicketId(),
                    name: t.name ?? '',
                    price: String(t.amount ?? '0'),
                    description: t.description ?? '',
                    imageFile: null,
                    imagePreview: null,
                    existingImage: t.image ?? null,
                }))
            );
        } else if (e.ticket_price && Number(e.ticket_price) > 0) {
            // legacy single price → one ticket
            setHasTickets(true);
            setTickets([
                {
                    id: makeTicketId(),
                    name: 'General Admission',
                    price: String(e.ticket_price),
                    description: '',
                    imageFile: null,
                    imagePreview: null,
                    existingImage: null,
                },
            ]);
        } else {
            setHasTickets(false);
            setTickets([]);
        }
    }, [eventRes]);

    useEffect(() => {
        return () => {
            if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const set = (key: keyof typeof form, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleToggleTickets = () => {
        const next = !hasTickets;
        setHasTickets(next);
        if (next && tickets.length === 0) setTickets([emptyTicket()]);
    };

    const ticketsValid =
        !hasTickets ||
        (tickets.length > 0 &&
            tickets.every((t) => t.name.trim() && t.price !== '' && Number(t.price) >= 0));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) return addToast('Title is required', 'error');
        if (!form.start_date || !form.end_date)
            return addToast('Start and end dates are required', 'error');
        if (new Date(form.end_date) <= new Date(form.start_date))
            return addToast('End date must be after the start date', 'error');
        if (!ticketsValid)
            return addToast('Every ticket needs a name and a valid price (0 for free).', 'error');

        const cleanTickets = hasTickets
            ? tickets
                .filter((t) => t.name.trim())
                .map((t) => ({
                    name: t.name.trim(),
                    amount: String(Number(t.price || 0)),
                    description: t.description.trim(),
                    imageFile: t.imageFile,
                    // if your API needs existing ticket id on update:
                    // id: t.id,
                }))
            : [];

        const lowestPrice = cleanTickets.length
            ? Math.min(...cleanTickets.map((t) => Number(t.amount)))
            : 0;

        if (TICKET_MODE.mode === 'json-body') {
            const body = {
                title: form.title.trim(),
                description: form.description,
                location: form.location,
                meeting_link: form.meeting_link,
                start_date: new Date(form.start_date).toISOString(),
                end_date: new Date(form.end_date).toISOString(),
                require_approval: form.require_approval,
                ticket_price: String(lowestPrice),
                capacity: form.capacity === '' ? null : Number(form.capacity),
                tickets: cleanTickets.map(({ imageFile, ...rest }) => ({
                    ...rest,
                    image: '',
                })),
            };
            updateEvent(body as any, {
                onSuccess: () => {
                    addToast('Event updated', 'success');
                    navigate('/dashboard/events');
                },
                onError: (error: any) => {
                    const data = error?.response?.data;
                    const message =
                        data?.message ||
                        data?.detail ||
                        (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : '') ||
                        'Could not update event. Please try again.';
                    addToast(message, 'error');
                },
            });
            return;
        }

        const body = new FormData();
        body.append('title', form.title.trim());
        body.append('description', form.description);
        body.append('location', form.location);
        body.append('meeting_link', form.meeting_link);
        body.append('start_date', new Date(form.start_date).toISOString());
        body.append('end_date', new Date(form.end_date).toISOString());
        body.append('ticket_price', String(lowestPrice));
        body.append('capacity', form.capacity); // '' => unlimited
        body.append('require_approval', String(form.require_approval));
        if (imageFile) body.append('image', imageFile);

        if (cleanTickets.length > 0) {
            if (TICKET_MODE.mode === 'bracket') {
                const keyStyles: Array<(i: number, f: string) => string> = [
                    (i, f) => `tickets[${i}]${f}`,
                    (i, f) => `tickets[${i}].${f}`,
                    (i, f) => `tickets[${i}][${f}]`,
                ];
                cleanTickets.forEach((t, i) => {
                    keyStyles.forEach((k) => {
                        body.append(k(i, 'name'), t.name);
                        body.append(k(i, 'amount'), t.amount);
                        body.append(k(i, 'description'), t.description);
                        if (t.imageFile) body.append(k(i, 'image'), t.imageFile);
                    });
                });
            } else {
                body.append(
                    'tickets',
                    JSON.stringify(
                        cleanTickets.map(({ imageFile, ...rest }) => ({
                            ...rest,
                            image: '',
                        }))
                    )
                );
            }
        }

        updateEvent(body, {
            onSuccess: () => {
                addToast('Event updated', 'success');
                navigate('/dashboard/events');
            },
            onError: (error: any) => {
                const data = error?.response?.data;
                const message =
                    data?.message ||
                    data?.detail ||
                    (data && typeof data === 'object' ? Object.values(data).flat().join(' ') : '') ||
                    'Could not update event. Please try again.';
                addToast(message, 'error');
            },
        });
    };

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <LoadingOverlay visible={isLoading} />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors cursor-pointer"
                >
                    <FiArrowLeft size={16} />
                    Back
                </button>

                <h1 className="text-2xl sm:text-3xl font-black text-white mb-8">Edit Event</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Cover image – same as before */}
                    <Field label="Cover image" hint="Leave as is to keep the current image.">
                        <label className="relative block w-full aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Event cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/30">
                                    <FiImage size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold">
                                Change image
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        </label>
                    </Field>

                    <Field label="Title">
                        <input
                            className={inputClass}
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Event title"
                        />
                    </Field>

                    <Field label="Description">
                        <textarea
                            className={`${inputClass} min-h-28 resize-y`}
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            placeholder="What is this event about?"
                        />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field label="Starts">
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={form.start_date}
                                onChange={(e) => set('start_date', e.target.value)}
                            />
                        </Field>
                        <Field label="Ends">
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={form.end_date}
                                onChange={(e) => set('end_date', e.target.value)}
                            />
                        </Field>
                    </div>

                    <Field label="Location">
                        <input
                            className={inputClass}
                            value={form.location}
                            onChange={(e) => set('location', e.target.value)}
                            placeholder="Venue or address"
                        />
                    </Field>

                    <Field label="Meeting link" hint="Optional. For online events.">
                        <input
                            type="url"
                            className={inputClass}
                            value={form.meeting_link}
                            onChange={(e) => set('meeting_link', e.target.value)}
                            placeholder="https://..."
                        />
                    </Field>

                    {/* Tickets – replace single ticket_price field */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                            <div className="flex items-center gap-3 text-white/80 text-sm">
                                <FiTag size={16} className="text-white/40" />
                                <div>
                                    <p className="font-medium">Tickets</p>
                                    <p className="text-white/30 text-xs mt-0.5">
                                        {hasTickets
                                            ? `${tickets.length} ticket type${tickets.length !== 1 ? 's' : ''}`
                                            : 'Off — guests attend for free'}
                                    </p>
                                </div>
                            </div>
                            <Toggle checked={hasTickets} onChange={handleToggleTickets} />
                        </div>
                        {hasTickets && (
                            <TicketsEditor tickets={tickets} onChange={setTickets} />
                        )}
                    </div>

                    <Field label="Capacity" hint="Leave empty for unlimited.">
                        <input
                            type="number"
                            min="1"
                            className={inputClass}
                            value={form.capacity}
                            onChange={(e) => set('capacity', e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Unlimited"
                        />
                    </Field>

                    <label className="flex items-center justify-between gap-4 rounded-lg bg-white/5 border border-white/10 px-4 py-3 cursor-pointer">
                        <div>
                            <p className="text-white text-sm font-semibold">Require approval</p>
                            <p className="text-white/40 text-xs">Review each registration before confirming.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#a6ff00]"
                            checked={form.require_approval}
                            onChange={(e) => set('require_approval', e.target.checked)}
                        />
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isPending}
                            className="px-6 py-3 rounded-md text-sm font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isLoading || !ticketsValid}
                            className="flex-1 px-6 py-3 rounded-md text-sm font-semibold text-black transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
                            style={{ background: '#a6ff00' }}
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEvent;