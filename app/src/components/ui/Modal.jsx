import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 if (isOpen) {
 setIsVisible(true);
 document.body.style.overflow = 'hidden';
 } else {
 const timer = setTimeout(() => setIsVisible(false), 200);
 document.body.style.overflow = 'unset';
 return () => clearTimeout(timer);
 }
 }, [isOpen]);

 useEffect(() => {
 const handleEsc = (e) => {
 if (e.key === 'Escape') onClose();
 };
 window.addEventListener('keydown', handleEsc);
 return () => window.removeEventListener('keydown', handleEsc);
 }, [onClose]);

 if (!isVisible && !isOpen) return null;

 return createPortal(
 <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
 {/* Backdrop */}
 <div
 className="absolute inset-0 bg-black/40 backdrop-blur-sm"
 onClick={onClose}
 />

 {/* Content */}
 <div
 className={`
 relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl 
 border border-slate-200
 flex flex-col max-h-[90vh]
 transform transition-all duration-200
 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
 `}
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
 <h3 className="text-lg font-bold text-slate-800">{title}</h3>
 <button
 onClick={onClose}
 className="p-2 -mr-2 text-slate-400 hover:text-slate-600:text-slate-200 hover:bg-slate-100:bg-zinc-800 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 overflow-y-auto">
 {children}
 </div>
 </div>
 </div>,
 document.body
 );
};

export default Modal;
