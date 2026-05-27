import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MoreVertical, Filter, LayoutGrid, List, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import Drawer from '../components/Drawer'; 
import { Link } from 'react-router-dom';

export default function Properties() {
  const navigate = useNavigate(); // For navigating to the details page

  // --- STATE MANAGEMENT ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  
  // Database State
  const [propertiesData, setPropertiesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // CRUD State
  const [editingId, setEditingId] = useState(null); 
  const [activeMenu, setActiveMenu] = useState(null); 
  const menuRef = useRef(null); 

  // Form State
  const emptyForm = { name: '', location: '', total_rooms: '', status: 'Operational', image_url: '' };
  const [formData, setFormData] = useState(emptyForm);

  // --- FETCH LIVE DATA ---
  useEffect(() => {
    fetchProperties();
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

  const fetchProperties = async () => {
    try {
      const response = await fetch('https://mountroyal-api2.onrender.com/api/properties');
      const data = await response.json();
      setPropertiesData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setIsLoading(false);
    }
  };

  // --- CRUD OPERATIONS ---

  // 1. SAVE (Handles both POST and PUT)
  const handleSaveProperty = async () => {
    try {
      const url = editingId 
        ? `https://mountroyal-api2.onrender.com/api/properties/${editingId}` 
        : 'https://mountroyal-api2.onrender.com/api/properties';
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchProperties(); // Refresh the grid
        closeDrawer();
      }
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  // 2. DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This will also remove all associated tenants!")) return;
    
    try {
      await fetch(`https://mountroyal-api2.onrender.com/api/properties/${id}`, { method: 'DELETE' });
      fetchProperties();
      setActiveMenu(null);
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  // 3. EDIT (Populate Drawer)
  const handleEditClick = (property) => {
    setFormData({
      name: property.name,
      location: property.location,
      total_rooms: property.total_rooms,
      status: property.status,
      image_url: property.image_url || ''
    });
    setEditingId(property.id);
    setIsDrawerOpen(true);
    setActiveMenu(null);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // --- FILTER LOGIC ---
  const filteredProperties = propertiesData.filter(property => {
    const matchesStatus = statusFilter === "All" || property.status === statusFilter;
    const matchesLocation = locationFilter === "All" || property.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesStatus && matchesLocation;
  });

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-brandNavy tracking-tight">Properties & Rooms</h2>
          <p className="text-slate-500 mt-2 text-base">Manage your portfolio, track vacancies, and oversee building performance.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 bg-brandGreen text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-soft"
        >
          <Plus size={18} /> Add Property
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-cardWhite p-3 rounded-xl shadow-soft border border-slate-100 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 ml-2">
          <Filter size={18} />
          <span className="text-slate-400 uppercase text-xs font-bold tracking-wider mr-2">Filter By:</span>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brandNavy font-medium text-brandNavy cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brandNavy font-medium text-brandNavy cursor-pointer">
            <option value="All">All Locations</option>
            <option value="Downtown">Downtown</option>
            <option value="Westside">Westside</option>
            <option value="Suburban">Suburban</option>
          </select>
        </div>
        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
          <button className="p-1.5 bg-white shadow-sm rounded-md text-brandNavy"><LayoutGrid size={18} /></button>
          <button className="p-1.5 text-slate-400 hover:text-brandNavy"><List size={18} /></button>
        </div>
      </div>

      {/* Property Cards Grid OR Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brandNavy">
           <Loader2 className="animate-spin mb-4" size={32} />
           <p className="font-bold">Fetching portfolio from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => {
              const occupied = property.occupied_rooms || 0; 
              const occupancyRate = property.total_rooms > 0 ? Math.round((occupied / property.total_rooms) * 100) : 0;
              
              return (
                // THE CARD IS NOW CLICKABLE
                <div 
                  key={property.id} 
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-visible group hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
                >
                  <div className="h-48 w-full relative overflow-hidden bg-slate-200 shrink-0 rounded-t-2xl">
                    <img 
                      src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3"} 
                      alt={property.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      {property.status === "Operational" ? (
                        <span className="bg-white/90 backdrop-blur-sm text-green-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Operational
                        </span>
                      ) : (
                        <span className="bg-white/90 backdrop-blur-sm text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Maintenance
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-brandNavy pr-6 leading-tight">{property.name}</h3>
                      
                      {/* 3-DOT MENU BUTTON */}
                      <div className="absolute right-6 top-6">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents the card from being clicked
                            setActiveMenu(activeMenu === property.id ? null : property.id);
                          }}
                          className="text-slate-400 hover:text-brandNavy transition-colors bg-white rounded-md p-1 shadow-sm border border-slate-100 hover:bg-slate-50"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {/* DROPDOWN MENU */}
                        {activeMenu === property.id && (
                          <div ref={menuRef} className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEditClick(property); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-brandNavy flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={14} /> Edit Details
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="flex items-center text-sm font-medium text-slate-500 mb-6">
                      <MapPin size={16} className="mr-1.5 text-slate-400" />
                      {property.location}
                    </p>

                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Occupancy Rate</span>
                        <span className="text-lg font-extrabold text-brandNavy">{occupancyRate}%</span>
                      </div>
                      
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-brandNavy rounded-full" style={{ width: `${occupancyRate}%` }}></div>
                      </div>
                      
                      <p className="text-xs font-semibold text-slate-500 text-center">
                        <span className="text-brandNavy">{occupied}</span> / {property.total_rooms} Rooms Occupied
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
              No properties found. Add a new building to your portfolio!
            </div>
          )}
        </div>
      )}

      {/* Dynamic Drawer (Handles both Add and Edit) */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title={editingId ? "Edit Property Details" : "Add New Property"}>
        <div className="space-y-5 pb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="e.g. Ogbomoso Student Villa" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Location Address</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="Downtown, Under G area..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Total Rooms</label>
              <input type="number" value={formData.total_rooms} onChange={(e) => setFormData({...formData, total_rooms: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="e.g. 24" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20 bg-white text-slate-600">
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Image URL</label>
            <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brandNavy/20" placeholder="https://..." />
          </div>
          
          <button onClick={handleSaveProperty} className="w-full mt-8 bg-brandNavy text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-soft">
            {editingId ? "Update Property" : "Save Property to Database"}
          </button>
        </div>
      </Drawer>

    </div>
  );
}