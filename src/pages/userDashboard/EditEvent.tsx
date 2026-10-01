import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiImage } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import { useEditEvents } from '../../hooks/mutations/allMutation';
import { useGetEventById } from '../../hooks/queries/allQueriess';
import { useGlobalContext } from '../../providers/GlobalContext';
import type { ApiEvent } from './Overview';

// ISO -> value for <input type="datetime-local"> (local time, no timezone)
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
        ticket_price: '0',
        capacity: '',
        require_approval: false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

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
            ticket_price: e.ticket_price ?? '0',
            capacity: e.capacity === null || e.capacity === undefined ? '' : String(e.capacity),
            require_approval: !!e.require_approval,
        });
        setImagePreview(e.image ?? '');
    }, [eventRes]);

    // Revoke object URLs we create for previews
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) return addToast('Title is required', 'error');
        if (!form.start_date || !form.end_date) return addToast('Start and end dates are required', 'error');
        if (new Date(form.end_date) <= new Date(form.start_date))
            return addToast('End date must be after the start date', 'error');

        const body = new FormData();
        body.append('title', form.title.trim());
        body.append('description', form.description);
        body.append('location', form.location);
        body.append('meeting_link', form.meeting_link);
        body.append('start_date', new Date(form.start_date).toISOString());
        body.append('end_date', new Date(form.end_date).toISOString());
        body.append('ticket_price', form.ticket_price || '0');
        body.append('capacity', form.capacity); // '' => unlimited (null)
        body.append('require_approval', String(form.require_approval));
        if (imageFile) body.append('image', imageFile); // only send if changed

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field label="Ticket price ($)" hint="0 means free.">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClass}
                                value={form.ticket_price}
                                onChange={(e) => set('ticket_price', e.target.value)}
                            />
                        </Field>
                        <Field label="Capacity" hint="Leave empty for unlimited.">
                            <input
                                type="number"
                                min="1"
                                className={inputClass}
                                value={form.capacity}
                                onChange={(e) => set('capacity', e.target.value)}
                                placeholder="Unlimited"
                            />
                        </Field>
                    </div>

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
                            disabled={isPending || isLoading}
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