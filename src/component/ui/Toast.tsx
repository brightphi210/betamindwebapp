import React from 'react';
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';
import { useGlobalContext } from '../../providers/GlobalContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md min-w-[300px] transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-[#002e15]/80 border-[#00a34b]/30 text-white' 
              : toast.type === 'error'
              ? 'bg-[#3d0000]/80 border-[#ff3d3d]/30 text-white'
              : 'bg-[var(--color-surface)]/90 border-[rgba(255,255,255,0.1)] text-white'
          }`}
        >
          {toast.type === 'success' && <FiCheckCircle className="w-5 h-5 text-[#00a34b]" />}
          {toast.type === 'error' && <FiXCircle className="w-5 h-5 text-[#ff3d3d]" />}
          {toast.type === 'info' && <FiInfo className="w-5 h-5 text-[var(--color-primary)]" />}
          
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
