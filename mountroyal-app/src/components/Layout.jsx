import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Receipt, Settings, Search, Bell, HelpCircle } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-appBg font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-cardWhite border-r border-slate-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brandNavy text-white p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brandNavy leading-tight">Mountroyal</h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wide">PROPTECH SOLUTIONS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-brandNavy bg-slate-100 rounded-lg font-semibold">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/properties" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brandNavy hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Building2 size={20} />
            Properties
          </Link>
          <Link to="/tenants" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brandNavy hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Users size={20} />
            Tenants
          </Link>
          <Link to="/ledger" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brandNavy hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Receipt size={20} />
            Ledger
          </Link>
          <Link to="/automation" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brandNavy hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Settings size={20} />
            Automation
          </Link>
        </nav>
        
        {/* Bottom Settings Link */}
        <div className="p-4 mb-2">
           <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brandNavy hover:bg-slate-50 rounded-lg transition-colors font-medium">
            <Settings size={20} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-appBg flex items-center justify-between px-8">
          {/* Search Bar */}
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search properties, tenants, or tasks..." 
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brandNavy/20 shadow-sm"
            />
          </div>

          {/* Right Icons & Avatar */}
          <div className="flex items-center gap-5 text-slate-500">
            <button className="hover:text-brandNavy transition-colors"><Bell size={20} /></button>
            <button className="hover:text-brandNavy transition-colors"><HelpCircle size={20} /></button>
            <div className="h-9 w-9 rounded-full bg-slate-300 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <Outlet /> 
        </div>
      </main>

    </div>
  );
}