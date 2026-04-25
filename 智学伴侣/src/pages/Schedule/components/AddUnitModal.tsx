import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import '../Schedule.css'; // Reuse existing styles

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  initialName: string;
  title?: string;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialName,
  title = "ADD NEW UNIT"
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md transform scale-100 transition-all">
        <div className="luxury-card p-6 bg-[#1a1a1a] border border-[#d4af37]/30 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          {/* Decorative Corners */}
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-[#d4af37]/20 pb-4">
            <h3 className="text-xl font-bold gold-text font-serif tracking-wider">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-[#d4af37]/80 font-serif tracking-wide uppercase">
                Unit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-[#e8e8e8] placeholder-[#555] focus:outline-none focus:border-[#d4af37] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all font-serif text-lg"
                placeholder="Enter unit name..."
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-[#d4af37]/30 text-[#d4af37]/70 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-all font-serif uppercase text-sm tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="luxury-button flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUnitModal;
