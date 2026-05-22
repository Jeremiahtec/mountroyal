import { useState, useEffect } from 'react';
import { Download, Calendar, ArrowUpRight, Clock, CreditCard, Landmark, Banknote, Search, Filter, Plus, Loader2 } from 'lucide-react';
import Drawer from '../components/Drawer';

export default function Ledger() {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Database Data
  const [transactions, setTransactions] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const emptyForm = { tenant_id: '', property_id: '', amount: '', payment_method: 'Transfer', next_due_date: '' };
  const [formData, setFormData] = useState(emptyForm);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txnsRes, tenantsRes] = await Promise.all([
        fetch('https://mountroyal-api2.onrender.com/api/transactions'),
        fetch('https://mountroyal-api2.onrender.com/api/tenants') // We need tenants for the dropdown and stats
      ]);
      
      setTransactions(await txnsRes.json());
      setTenantsList(await tenantsRes.json());
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setIsLoading(false);
    }
  };

  // --- LOG PAYMENT ---
  const handleLogPayment = async () => {
    try {
      const response = await fetch('https://mountroyal-api2.onrender.com/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchData(); // Refresh the table and stats
        setIsDrawerOpen(false);
        setFormData(emptyForm);
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  // UX Magic: Auto-fill property and amount when a tenant is selected
  const handleTenantSelect = (e) => {
    const selectedId = e.target.value;
    const selectedTenant = tenantsList.find(t => t.id === parseInt(selectedId));
    
    if (selectedTenant) {
      setFormData({
        ...formData,
        tenant_id: selectedTenant.id,
        property_id: selectedTenant.property_id || null,
        amount: selectedTenant.rent_amount
      });
    } else {
      setFormData({ ...formData, tenant_id: '', property_id: '', amount: '' });
    }
  };

  // --- DYNAMIC CALCULATIONS ---
  // Calculate real total collected from the transactions array
  const totalCollected = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  
  // Calculate real pending rent by finding all tenants who are NOT "Paid"
  const pendingTenants = tenantsList.filter(t => t.status !== 'Paid');
  const totalPending = pendingTenants.reduce((sum, t) => sum + Number(t.rent_amount), 0);

  // --- LOGIC ---
  const filteredTransactions = transactions.filter(txn => 
    (txn.tenant_name && txn.tenant_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (txn.property_name && txn.property_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    txn.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getMethodIcon = (method) => {
    if (method === 'Transfer') return <Landmark size={14} className="mr-1.5" />;
    if (method === 'Cash') return <Banknote size={14} className="mr-1.5" />;
    if (method === 'Card') return <CreditCard size={14} className="mr-1.5" />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-brandNavy tracking-tight">Rent Ledger</h2>
          <p className="text-slate-500 mt-2 text-base">Track rent collections, pending payments, and payment history.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-brandGreen text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-soft">
            <Plus size={18} /> Log Payment
          </button>
        </div>
      </div>

      {/* Dynamic Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-cardWhite p-8 rounded-2xl shadow-soft border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Collected (All Time)</p>
            <h3 className="text-4xl font-extrabold text-brandGreen">₦ {totalCollected.toLocaleString()}</h3>
          </div>
          <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center text-brandGreen"><Landmark size={32} /></div>
        </div>

        <div className="bg-cardWhite p-8 rounded-2xl shadow-soft border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pending Rent</p>
            <h3 className="text-4xl font-extrabold text-brandNavy">₦ {totalPending.toLocaleString()}</h3>
            <span className="inline-flex items-center text-sm font-bold text-amber-600 mt-3 bg-amber-50 px-2.5 py-1 rounded-md">
              <Clock size={16} className="mr-1" /> {pendingTenants.length} tenants overdue
            </span>
          </div>
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"><Banknote size={32} /></div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by tenant, property, or ID..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brandNavy/20 shadow-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full py-20 text-brandNavy">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="font-bold">Syncing ledger...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold bg-slate-50/50">
                  <th className="p-5 border-b border-slate-100">Date & ID</th>
                  <th className="p-5 border-b border-slate-100">Tenant Name</th>
                  <th className="p-5 border-b border-slate-100">Property</th>
                  <th className="p-5 border-b border-slate-100">Amount</th>
                  <th className="p-5 border-b border-slate-100">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((txn, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 font-medium text-slate-500">
                        <div className="flex flex-col">
                          <span className="text-brandNavy font-bold">{new Date(txn.payment_date).toLocaleDateString()}</span>
                          <span className="text-xs text-slate-400">{txn.id}</span>
                        </div>
                      </td>
                      <td className="p-5 font-bold text-brandNavy">{txn.tenant_name || 'Deleted Tenant'}</td>
                      <td className="p-5 text-slate-500 font-medium">{txn.property_name || 'N/A'}</td>
                      <td className="p-5 font-bold text-brandGreen">₦ {Number(txn.amount).toLocaleString()}</td>
                      <td className="p-5">
                        <span className="inline-flex items-center bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md text-xs font-bold border border-slate-200">
                          {getMethodIcon(txn.payment_method)} {txn.payment_method}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div className="p-5 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500 bg-slate-50/50">
            <p>Showing {filteredTransactions.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 border border-slate-200 rounded-md transition-colors ${currentPage === 1 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}`}>Prev</button>
              <button className="px-3 py-1 bg-brandNavy text-white rounded-md">{currentPage}</button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 border border-slate-200 rounded-md transition-colors ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Log Payment Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Log Rent Payment">
        <div className="space-y-5 pb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Tenant</label>
            <select value={formData.tenant_id} onChange={handleTenantSelect} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 bg-white">
              <option value="">Choose a tenant...</option>
              {tenantsList.map(t => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.property_name || 'No Property'})</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Amount Paid (₦)</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Payment Method</label>
              <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 bg-white">
                <option value="Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Set New Due Date</label>
             <input type="date" value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 text-slate-600" />
             <p className="text-xs text-slate-400 mt-1">This will automatically push the tenant's next billing cycle forward.</p>
          </div>
          
          <button onClick={handleLogPayment} disabled={!formData.tenant_id || !formData.next_due_date} className="w-full mt-8 bg-brandGreen text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-soft disabled:bg-slate-300 disabled:cursor-not-allowed">
            Confirm & Log Payment
          </button>
        </div>
      </Drawer>

    </div>
  );
}