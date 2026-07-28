import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Receipt, Settings, LogOut } from 'lucide-react';
import { supabase } from './supabaseCLient'; 

// Import all your fully-built Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AccountSettings from './pages/AccountSettings';
import Tenants from './pages/Tenants';
import Ledger from './pages/Ledger';
import PropertyDetails from './pages/PropertyDetails';

// --- 1. THE RESTORED LIGHT MODE ADMIN LAYOUT (Unchanged) ---
const AdminLayout = ({ onLogout }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Tenants', path: '/tenants', icon: Users },
    { name: 'Ledger', path: '/ledger', icon: Receipt },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- THE CRISP LIGHT SIDEBAR --- */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        
        {/* Brand Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brandNavy text-white flex items-center justify-center font-bold shadow-sm">
            M
          </div>
          <span className="font-extrabold text-xl tracking-tight text-brandNavy">Mountroyal</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-slate-200/50 text-brandNavy font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-medium'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Area */}
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area (Un-squished with proper padding) */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};


// --- 2. MAIN APP ROUTER (Upgraded to Supabase) ---
export default function App() {
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // --- NEW SUPABASE AUTH LISTENER ---
  useEffect(() => {
    // Check for active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    // Listen for login/logout events dynamically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Secure route wrapper checks actual Supabase session now
  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Prevent UI flashing while Supabase checks the token
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brandNavy mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Verifying Security...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        
        {/* LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={
            session ? (
              <Navigate to="/" replace /> 
            ) : (
              <Login />
            )
          } 
        />

        {/* PROTECTED ROUTES */}
        <Route 
          element={
            <ProtectedRoute>
              {/* Passing actual Supabase signOut function to your sidebar */}
              <AdminLayout onLogout={() => supabase.auth.signOut()} />
            </ProtectedRoute>
          }
        >
          {/* All your connected routes remain perfectly intact */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/ledger" element={<Ledger />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}