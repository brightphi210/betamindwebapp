import type { FocusEvent } from "react";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_COLOR = "#f87171";
const DEFAULT_BORDER = "rgba(255,255,255,0.15)";

export const OrDivider = () => (
    <div className="my-4 flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
        <span className="text-xs uppercase tracking-widest text-gray-500">or</span>
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
    </div>
);

export const inputBaseClass =
    "w-full rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors";

export const inputStyle = (hasError: boolean) => ({
    border: `1px solid ${hasError ? ERROR_COLOR : DEFAULT_BORDER}`,
});

export const handleFocusBorder = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#a6ff00";
};

export const handleBlurBorder = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = e.currentTarget.dataset.invalid
        ? ERROR_COLOR
        : DEFAULT_BORDER;
};

export const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-xs text-red-400">{message}</p> : null;