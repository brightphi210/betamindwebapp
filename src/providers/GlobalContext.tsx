import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/user";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  /** ms before auto-dismiss. Use 0 for a toast that stays until closed. */
  duration: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface GlobalState {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_DURATION = 3000;

const GlobalContext = createContext<GlobalState | undefined>(undefined);

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss is handled by <ToastContainer /> so the exit animation plays.
  const addToast = useCallback(
    (message: string, type: ToastType = "info", options: ToastOptions = {}) => {
      setToasts((prev) => [
        ...prev,
        {
          id: makeId(),
          message,
          type,
          title: options.title,
          duration: options.duration ?? DEFAULT_DURATION,
        },
      ]);
    },
    []
  );

  const value = useMemo<GlobalState>(
    () => ({ user, setUser, theme, setTheme, toasts, addToast, removeToast }),
    [user, theme, toasts, addToast, removeToast]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};