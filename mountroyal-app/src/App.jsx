import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Receipt, Settings, LogOut, Menu, X } from 'lucide-react';
import { supabase } from './supabaseClient'; 

// Import all your fully-built Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AccountSettings from './pages/AccountSettings';
import Tenants from './pages/Tenants';
import Ledger from './pages/Ledger';
import PropertyDetails from './pages/PropertyDetails';

// --- 1. THE RESPONSIVE ADMIN LAYOUT (With Mobile Menu) ---
const AdminLayout = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'Tenants', path: '/tenants', icon: Users },
    { name: 'Ledger', path: '/ledger', icon: Receipt },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- MOBILE TOP NAVIGATION BAR --- */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brandNavy text-white flex items-center justify-center font-bold shadow-sm">
            M
          </div>
          <span className="font-extrabold text-xl tracking-tight text-brandNavy">Mountroyal</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-600 hover:text-brandNavy p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE SLIDE-OUT MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/50 backdrop-blur-sm flex">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-brandNavy text-white flex items-center justify-center font-bold">
                  M
                </div>
                <span className="font-extrabold text-xl tracking-tight text-brandNavy">Mountroyal</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive 
                        ? 'bg-slate-100 text-brandNavy' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-semibold"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brandNavy text-white flex items-center justify-center font-bold shadow-sm">
            M
          </div>
          <span className="font-extrabold text-xl tracking-tight text-brandNavy">Mountroyal</span>
        </div>
        
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

      {/* Main Content Area */}
      <main className="flex-1 md:h-screen overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};


// --- 2. MAIN APP ROUTER ---
export default function App() {
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

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

        <Route 
          element={
            <ProtectedRoute>
              <AdminLayout onLogout={() => supabase.auth.signOut()} />
            </ProtectedRoute>
          }
        >
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