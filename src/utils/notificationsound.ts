let ctx: AudioContext | null = null;

const getCtx = () => {
    if (!ctx) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
    }
    return ctx;
};

/** Browsers block audio until the user interacts with the page. */
export const unlockNotificationSound = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume();
};

export const playNotificationSound = () => {
    const c = getCtx();
    if (!c || c.state !== "running") return;

    const now = c.currentTime;
    [880, 1320].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
        osc.connect(gain).connect(c.destination);
        osc.start(start);
        osc.stop(start + 0.32);
    });
};