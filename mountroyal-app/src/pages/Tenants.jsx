import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, MoreHorizontal, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import Drawer from '../components/Drawer';

export default function Tenants() {
  // --- STATE MANAGEMENT ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // Database State
  const [tenantsData, setTenantsData] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // CRUD State
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing an existing tenant
  const [activeMenu, setActiveMenu] = useState(null); // Tracks which 3-dot menu is open
  const menuRef = useRef(null); // For clicking outside to close menus

  // Form State
  const emptyForm = { full_name: '', email: '', phone: '', property_id: '', room_assigned: '', rent_amount: '', next_due_date: '', status: 'Paid' };
  const [formData, setFormData] = useState(emptyForm);

  // --- FETCH LIVE DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [tenantsRes, propertiesRes] = await Promise.all([
        fetch('https://mountroyal-api2.onrender.com/api/tenants'),
        fetch('https://mountroyal-api2.onrender.com/api/properties')
      ]);
      const tenants = await tenantsRes.json();
      const properties = await propertiesRes.json();
      setTenantsData(tenants);
      setPropertiesList(properties);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  // --- CRUD OPERATIONS ---
  
  // 1. SAVE (Handles both POST and PUT)
  const handleSaveTenant = async () => {
    try {
      const url = editingId 
        ? `https://mountroyal-api2.onrender.com/api/tenants/${editingId}` 
        : 'https://mountroyal-api2.onrender.com/api/tenants';
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchData(); // Refresh table
        closeDrawer();
      }
    } catch (error) {
      console.error("Error saving tenant:", error);
    }
  };

  // 2. DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this tenant? This action cannot be undone.")) return;
    
    try {
      await fetch(`https://mountroyal-api2.onrender.com/api/tenants/${id}`, { method: 'DELETE' });
      fetchData(); // Refresh table
      setActiveMenu(null);
    } catch (error) {
      console.error("Error deleting tenant:", error);
    }
  };

  // 3. EDIT (Populate Drawer)
  const handleEditClick = (tenant) => {
    // Format date for the HTML date input (YYYY-MM-DD)
    const formattedDate = new Date(tenant.next_due_date).toISOString().split('T')[0];
    
    setFormData({
      ...tenant,
      next_due_date: formattedDate
    });
    setEditingId(tenant.id);
    setIsDrawerOpen(true);
    setActiveMenu(null);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };


  // --- UTILS & LOGIC ---
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const getStatusStyle = (status) => {
    if (status === 'Paid') return 'bg-statusPaid text-statusPaidText';
    if (status === 'Due Soon') return 'bg-statusDue text-statusDueText';
    return 'bg-red-50 text-red-600'; 
  };

  const filteredTenants = tenantsData.filter(tenant => 
    tenant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (tenant.room_assigned && tenant.room_assigned.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-brandNavy tracking-tight">Tenant Directory</h2>
          <p className="text-slate-500 mt-2 text-base">Manage and view all active tenants across your properties.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 bg-brandNavy text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-soft">
            <Plus size={18} /> New Tenant
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-visible">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tenants by name or room..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brandNavy/20 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brandNavy bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-visible min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-brandNavy">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-bold">Loading tenant roster...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                  <th className="p-5">Tenant</th>
                  <th className="p-5">Property & Room</th>
                  <th className="p-5">Rent Amount</th>
                  <th className="p-5">Next Due Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm relative">
                {paginatedTenants.length > 0 ? (
                  paginatedTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-700">
                            {getInitials(tenant.full_name)}
                          </div>
                          <div>
                            <p className="font-bold text-brandNavy">{tenant.full_name}</p>
                            <p className="text-xs text-slate-400 font-medium">{tenant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                           <span className="font-bold text-brandNavy">{tenant.property_name || 'Unassigned'}</span>
                           <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              Room: {tenant.room_assigned || 'N/A'}
                           </span>
                        </div>
                      </td>
                      <td className="p-5 font-bold text-brandNavy">₦ {Number(tenant.rent_amount).toLocaleString()}</td>
                      <td className="p-5 text-slate-500 font-medium">{new Date(tenant.next_due_date).toLocaleDateString()}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${getStatusStyle(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="p-5 text-right relative">
                        {/* 3-DOT MENU BUTTON */}
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setActiveMenu(activeMenu === tenant.id ? null : tenant.id);
                          }}
                          className="text-slate-400 hover:text-brandNavy transition-colors p-2 rounded-md hover:bg-slate-100"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {/* DROPDOWN MENU */}
                        {activeMenu === tenant.id && (
                          <div ref={menuRef} className="absolute right-8 mt-2 w-36 bg-white border border-slate-100 rounded-lg shadow-lg z-50 overflow-hidden py-1">
                            <button 
                              onClick={() => handleEditClick(tenant)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-brandNavy flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Details
                            </button>
                            <button 
                              onClick={() => handleDelete(tenant.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        )}

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No tenants found. Add your first renter!
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
            <p>Showing {filteredTenants.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants</p>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 border border-slate-200 rounded-md transition-colors ${currentPage === 1 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}`}>Prev</button>
              <button className="px-3 py-1 bg-brandNavy text-white rounded-md">{currentPage}</button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 border border-slate-200 rounded-md transition-colors ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Drawer (Handles both Add and Edit) */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingId ? "Edit Tenant Details" : "Add New Tenant"}>
        <div className="space-y-5 pb-8">
          <div><label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="e.g. John Doe" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="john@email.com" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="+234..." /></div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Assign Property</label>
            <select value={formData.property_id || ''} onChange={(e) => setFormData({...formData, property_id: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 bg-white">
              <option value="">Select a building...</option>
              {propertiesList.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Room / Unit</label><input type="text" value={formData.room_assigned} onChange={(e) => setFormData({...formData, room_assigned: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="e.g. 4B" /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Rent Amount (₦)</label><input type="number" value={formData.rent_amount} onChange={(e) => setFormData({...formData, rent_amount: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="450000" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-bold text-slate-700 mb-1">Next Due Date</label><input type="date" value={formData.next_due_date} onChange={(e) => setFormData({...formData, next_due_date: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 text-slate-600" /></div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Payment Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 bg-white">
                  <option value="Paid">Paid</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Overdue">Overdue</option>
                </select>
             </div>
          </div>
          
          <button onClick={handleSaveTenant} className="w-full mt-8 bg-brandNavy text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-soft">
            {editingId ? "Update Tenant" : "Save Tenant to Database"}
          </button>
        </div>
      </Drawer>

    </div>
  );
}