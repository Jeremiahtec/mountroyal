import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Receipt, Settings, LogOut } from 'lucide-react';

// Import all your fully-built Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import AccountSettings from './pages/AccountSettings';
import Tenants from './pages/Tenants';
import Ledger from './pages/Ledger';
import PropertyDetails from './pages/PropertyDetails';

// --- 1. THE RESTORED LIGHT MODE ADMIN LAYOUT ---
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


// --- 2. MAIN APP ROUTER ---
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mountroyal_admin_auth') === 'true';
  });

  const handleAuthChange = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('mountroyal_admin_auth', 'true');
    } else {
      localStorage.removeItem('mountroyal_admin_auth');
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace /> 
            ) : (
              <Login onLogin={() => handleAuthChange(true)} />
            )
          } 
        />

        <Route 
          element={
            <ProtectedRoute>
              <AdminLayout onLogout={() => handleAuthChange(false)} />
            </ProtectedRoute>
          }
        >
          {/* All your connected routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} /> {/* <-- Add this line */}
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/ledger" element={<Ledger />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}