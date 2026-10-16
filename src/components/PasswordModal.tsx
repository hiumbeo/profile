import { useState } from 'react';

interface PasswordModalProps {
  onUnlock: () => void;
}

export function PasswordModal({ onUnlock }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'phu123') { // Simple password
      onUnlock();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="p-6 bg-[#111214] border border-cyan-500/30 rounded-2xl shadow-xl w-80 text-center">
        <h2 className="text-lg font-bold text-cyan-300 mb-4">Nhập mật khẩu truy cập</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-black border border-white/10 rounded-lg text-white mb-4 focus:outline-none focus:border-cyan-400"
          placeholder="Mật khẩu..."
        />
        <button type="submit" className="w-full py-2 bg-cyan-600 rounded-lg text-white font-bold hover:bg-cyan-500">
          Truy cập
        </button>
        {error && <p className="text-rose-400 text-xs mt-2">Sai mật khẩu!</p>}
      </form>
    </div>
  );
}
