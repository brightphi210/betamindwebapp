import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Shows a small toast when a new version of the app has been deployed.
 * Mount once, globally (see SETUP.md).
 */
const PWAUpdatePrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(_swUrl, registration) {
            // Check for a new version every hour while the app stays open
            if (registration) {
                setInterval(() => {
                    void registration.update();
                }, 60 * 60 * 1000);
            }
        },
    });

    if (!needRefresh && !offlineReady) return null;

    const close = () => {
        setNeedRefresh(false);
        setOfflineReady(false);
    };

    return (
        <div
            role="status"
            className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl"
            style={{
                background: 'rgba(10,13,9,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >
            <span className="text-white/80">
                {needRefresh ? 'A new version is available.' : 'Ready to work offline.'}
            </span>
            <div className="flex shrink-0 items-center gap-3">
                {needRefresh && (
                    <button
                        type="button"
                        onClick={() => void updateServiceWorker(true)}
                        className="cursor-pointer font-semibold"
                        style={{ color: '#a6ff00' }}
                    >
                        Update
                    </button>
                )}
                <button
                    type="button"
                    onClick={close}
                    className="cursor-pointer text-white/40 hover:text-white/70"
                >
                    {needRefresh ? 'Later' : 'Close'}
                </button>
            </div>
        </div>
    );
};

export default PWAUpdatePrompt;