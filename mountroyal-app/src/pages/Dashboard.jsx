import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, Wallet, AlertCircle, ArrowUpRight, Loader2, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    properties: [],
    tenants: [],
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [propRes, tenantRes, txnRes] = await Promise.all([
          fetch('http://localhost:5000/api/properties'),
          fetch('http://localhost:5000/api/tenants'),
          fetch('http://localhost:5000/api/transactions')
        ]);
        
        setData({
          properties: await propRes.json(),
          tenants: await tenantRes.json(),
          transactions: await txnRes.json()
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-brandNavy h-full">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold text-lg">Compiling your portfolio data...</p>
      </div>
    );
  }

  // --- DYNAMIC CALCULATIONS ---
  const totalRooms = data.properties.reduce((sum, p) => sum + p.total_rooms, 0);
  const totalOccupied = data.tenants.length;
  const occupancyRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;
  
  const totalRevenue = data.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const pendingTenants = data.tenants.filter(t => t.status !== 'Paid');
  const totalPending = pendingTenants.reduce((sum, t) => sum + Number(t.rent_amount), 0);

  // Get the 4 most recent transactions for the activity feed
  const recentTransactions = data.transactions.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-brandNavy tracking-tight">Portfolio Overview</h2>
        <p className="text-slate-500 mt-2 text-base">Here is what is happening across your properties today.</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Revenue Card */}
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-brandGreen rounded-xl"><Wallet size={24} /></div>
            <span className="inline-flex items-center text-xs font-bold text-brandGreen bg-green-50 px-2 py-1 rounded-md">
              <ArrowUpRight size={14} className="mr-1" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-brandNavy">₦ {totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Occupancy Card */}
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building size={24} /></div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Occupancy Rate</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-extrabold text-brandNavy">{occupancyRate}%</h3>
              <p className="text-sm font-semibold text-slate-500 mb-0.5">{totalOccupied} / {totalRooms} rooms</p>
            </div>
          </div>
        </div>

        {/* Total Tenants */}
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Tenants</p>
            <h3 className="text-2xl font-extrabold text-brandNavy">{data.tenants.length}</h3>
          </div>
        </div>

        {/* Pending Rent */}
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={24} /></div>
            {pendingTenants.length > 0 && (
              <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                {pendingTenants.length} Overdue
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Rent</p>
            <h3 className="text-2xl font-extrabold text-brandNavy">₦ {totalPending.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Two-Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-brandNavy">Recent Transactions</h3>
            <Link to="/ledger" className="text-sm font-bold text-brandNavy hover:text-slate-600 flex items-center transition-colors">
              View Ledger <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-50 text-sm">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-bold text-brandNavy">{txn.tenant_name || 'Deleted Tenant'}</td>
                      <td className="p-5 text-slate-500 font-medium">{txn.property_name || 'N/A'}</td>
                      <td className="p-5 font-bold text-brandGreen">₦ {Number(txn.amount).toLocaleString()}</td>
                      <td className="p-5 text-right text-slate-400 font-medium">{new Date(txn.payment_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">No recent transactions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Action Required (Takes up 1 column) */}
        <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-brandNavy flex items-center gap-2">
              Action Required <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
            </h3>
          </div>
          <div className="p-6 flex-1 bg-slate-50/50">
            {pendingTenants.length > 0 ? (
              <div className="space-y-4">
                {pendingTenants.slice(0, 4).map(tenant => (
                  <div key={tenant.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brandNavy text-sm">{tenant.full_name}</p>
                      <p className="text-xs font-medium text-slate-400">{tenant.property_name || 'Unassigned'}</p>
                    </div>
                    <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded-md">
                      ₦ {Number(tenant.rent_amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p className="font-medium text-sm">All rents are up to date!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}