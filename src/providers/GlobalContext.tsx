import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "../types/user";

// Define the shape of our Toast
export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

// Define the global state shape
interface GlobalState {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
