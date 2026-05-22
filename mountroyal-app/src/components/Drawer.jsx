import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      
      {/* The Frosted Glass Backdrop */}
      <div 
        className="absolute inset-0 bg-brandNavy/30 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      ></div>
      
      {/* The Drawer Panel */}
      <div className="relative w-full max-w-md bg-cardWhite h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-brandNavy">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-brandNavy hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Drawer Content (This now holds the form AND its specific button) */}
        <div className="p-6 flex-1 overflow-y-auto bg-appBg">
          {children}
        </div>

        {/* Note: The generic footer has been completely removed! */}

      </div>
    </div>
  );
}