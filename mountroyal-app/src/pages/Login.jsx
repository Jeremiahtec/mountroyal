import { useState } from 'react';
import { Building, Lock, Mail } from 'lucide-react';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Hardcoded Admin Check (We will connect this to your Supabase/Render backend later)
    setTimeout(() => {
      if (credentials.email === 'mountroyalng@gmail.com' && credentials.password === 'admin123') {
        onLogin(true);
      } else {
        setError('Invalid admin credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shadow-sm text-brandNavy mb-4">
            <Building size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-brandNavy">Mountroyal Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to the operations control center</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Office Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                required
                placeholder="mountroyalng@gmail.com"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className="w-full border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30 transition-all"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#0B1A28] text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
      </div>
    </div>
  );
}