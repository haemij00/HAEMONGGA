
import React, { useState } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1106') {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-white/10 p-10 max-w-sm w-full mx-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter Admin Password"
            className={`w-full bg-[#0E0E0E] border ${error ? 'border-red-500' : 'border-white/10'} p-3 rounded mb-4 text-white focus:outline-none focus:border-purple-500 transition-colors`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mb-4">Access Denied.</p>}
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 py-3 text-sm tracking-widest transition-colors"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 text-sm tracking-widest font-bold transition-colors"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
