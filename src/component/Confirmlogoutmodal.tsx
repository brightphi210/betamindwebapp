import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';

interface ConfirmLogoutModalProps {
    onConfirm: () => void;
    onCancel: () => void;
}

// Keep in sync with the duration-300 classes below
const ANIMATION_MS = 300;

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ onConfirm, onCancel }) => {
    const [visible, setVisible] = useState(false);
    const closingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Trigger the enter animation on the next frame after mount
    useEffect(() => {
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => {
            cancelAnimationFrame(frame);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Play the exit animation, then run the parent's callback (which unmounts us)
    const closeThen = useCallback((action: () => void) => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        timeoutRef.current = setTimeout(action, ANIMATION_MS);
    }, []);

    const handleCancel = useCallback(() => closeThen(onCancel), [closeThen, onCancel]);
    const handleConfirm = useCallback(() => closeThen(onConfirm), [closeThen, onConfirm]);

    useEffect(() => {
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCancel();
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [handleCancel]);

    return (
        <div
            className={`fixed inset-0 z-[90] flex items-center justify-center px-4 backdrop-blur-sm transition-all duration-300 ease-out ${visible ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'
                }`}
            onClick={handleCancel}
        >
            <div
                className={`w-full max-w-md rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out ${visible
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-4'
                    }`}
                style={{
                    background: 'rgba(10,12,9,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 sm:p-7">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'rgba(239,68,68,0.12)' }}
                    >
                        <FiLogOut size={22} className="text-red-400" />
                    </div>

                    <h3 className="text-white text-xl sm:text-2xl font-black mb-2">Log out?</h3>
                    <p className="text-white/45 text-sm leading-relaxed mb-6">
                        Are you sure you want to log out of your account? You'll need to sign in
                        again to access your dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white cursor-pointer transition-colors hover:brightness-110"
                            style={{ background: '#ef4444' }}
                        >
                            <FiLogOut size={14} />
                            Log Out
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmLogoutModal;