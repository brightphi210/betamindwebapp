import { useEffect, useMemo, useRef } from "react";
import {
    playNotificationSound,
    unlockNotificationSound,
} from "../utils/notificationsound";
import { useGetNotifications } from "./queries/allQueriess";

const toArray = (raw: any): any[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    return [];
};

export const useNotificationAlert = () => {
    const { notificationsData, isLoading } = useGetNotifications();
    const seenIds = useRef<Set<string> | null>(null);

    const list = useMemo(
        () => toArray(notificationsData?.data ?? notificationsData),
        [notificationsData]
    );

    const unreadCount = useMemo(
        () => list.filter((n) => !n.is_read).length,
        [list]
    );

    // Unlock audio on the first user interaction
    useEffect(() => {
        const unlock = () => {
            unlockNotificationSound();
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
        window.addEventListener("pointerdown", unlock);
        window.addEventListener("keydown", unlock);
        return () => {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, []);

    // Play a sound when a new unread notification shows up
    useEffect(() => {
        if (isLoading || !notificationsData) return;

        const ids = new Set(list.map((n) => String(n.id)));

        if (seenIds.current === null) {
            seenIds.current = ids; // first load: just remember, no sound
            return;
        }

        const hasNew = list.some(
            (n) => !n.is_read && !seenIds.current!.has(String(n.id))
        );
        if (hasNew) playNotificationSound();

        seenIds.current = ids;
    }, [list, isLoading, notificationsData]);

    return { unreadCount, hasUnread: unreadCount > 0 };
};