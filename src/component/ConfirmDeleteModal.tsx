import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface Props {
    title: string;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    itemLabel?: string;
}

const ConfirmDeleteModal: React.FC<Props> = ({
    title,
    isDeleting,
    onConfirm,
    onCancel,
    itemLabel = 'event',
}) => (
    <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm modal-overlay"
        onClick={() => !isDeleting && onCancel()}
    >
        <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl modal-panel"
            style={{
                background: 'rgba(10,13,9,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(248,113,113,0.12)' }}
            >
                <FiTrash2 className="text-red-400" size={20} />
            </div>

            <h3 className="text-white text-xl font-black mb-2">Delete {itemLabel}?</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
                <span className="text-white/80 font-semibold">"{title}"</span> will be permanently removed.
                This can't be undone.
            </p>

            <div className="flex gap-2.5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-40"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>

        <style>{`
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .modal-overlay {
                animation: modalFadeIn 0.2s ease-out;
            }

            .modal-panel {
                animation: modalSlideIn 0.22s ease-out;
            }
        `}</style>
    </div>
);

export default ConfirmDeleteModal;