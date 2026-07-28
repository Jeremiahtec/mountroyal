import { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Handle Registration
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Success! Check your email for the confirmation link.");
      } else {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // The session is automatically saved to local storage by Supabase!
        window.location.href = "/"; // Redirect to dashboard
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 text-slate-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Mountroyal
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            {isSignUp ? "Create your administrator account" : "Sign in to manage your properties"}
          </p>
        </div>

        {/* Error Message Display */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brandNavy focus:ring-1 focus:ring-brandNavy transition-all"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brandNavy focus:ring-1 focus:ring-brandNavy transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brandNavy text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center text-sm text-slate-500">
          {isSignUp ? "Already have an account? " : "Need an admin account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-white font-bold hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}