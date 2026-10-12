import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';
import { useGlobalContext, type ToastMessage, type ToastType } from '../../providers/GlobalContext';

const LEAVE_MS = 220;

const variants: Record<ToastType, { icon: React.ReactNode; accent: string; iconBg: string; bar: string }> = {
  success: {
    icon: <FiCheckCircle className="h-[18px] w-[18px]" />,
    accent: 'text-green-600',
    iconBg: 'bg-green-50',
    bar: 'bg-green-600',
  },
  error: {
    icon: <FiXCircle className="h-[18px] w-[18px]" />,
    accent: 'text-red-600',
    iconBg: 'bg-red-50',
    bar: 'bg-red-500',
  },
  warning: {
    icon: <FiAlertTriangle className="h-[18px] w-[18px]" />,
    accent: 'text-amber-600',
    iconBg: 'bg-amber-50',
    bar: 'bg-amber-500',
  },
  info: {
    icon: <FiInfo className="h-[18px] w-[18px]" />,
    accent: 'text-blue-600',
    iconBg: 'bg-blue-50',
    bar: 'bg-blue-500',
  },
};

const animationCss = `
@keyframes tc-in { from { opacity: 0; transform: translateX(24px) scale(.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes tc-out { from { opacity: 1; transform: translateX(0) scale(1); } to { opacity: 0; transform: translateX(24px) scale(.96); } }
@keyframes tc-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }
.tc-in { animation: tc-in 300ms cubic-bezier(.16,1,.3,1) forwards; }
.tc-out { animation: tc-out ${LEAVE_MS}ms ease-in forwards; }
.tc-progress { transform-origin: left; animation-name: tc-progress; animation-timing-function: linear; animation-fill-mode: forwards; }
@media (prefers-reduced-motion: reduce) { .tc-in, .tc-out { animation-duration: 1ms; } }
`;

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const v = variants[toast.type] ?? variants.info;

  // Plays the exit animation, then removes the toast
  const dismiss = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    leaveTimer.current = setTimeout(() => onRemove(toast.id), LEAVE_MS);
  }, [onRemove, toast.id]);

  // Auto-dismiss (same duration drives the progress bar)
  useEffect(() => {
    if (toast.duration <= 0) return;
    const t = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration, dismiss]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 ${leaving ? 'tc-out' : 'tc-in'
        }`}
    >
      <div className="flex items-center gap-3 p-3 pr-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${v.iconBg} ${v.accent}`}>
          {v.icon}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {toast.title ? (
            <>
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              <p className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-500">{toast.message}</p>
            </>
          ) : (
            <p className="whitespace-pre-line break-words text-sm font-medium text-slate-900">{toast.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="h-1 w-full bg-slate-100">
          <div
            className={`tc-progress h-full w-full ${v.bar}`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalContext();

  return (
    <>
      <style>{animationCss}</style>
      <div className="pointer-events-none fixed inset-x-0 bottom-16 lg:top-14 top-5 z-[100] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:bottom-6 sm:right-0 sm:w-[26rem] sm:items-stretch">
        {/* <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-0 sm:w-[26rem] sm:items-stretch"> */}
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;