import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building, Users, Wallet, Loader2, Edit2 } from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams(); // Grabs the '3' from /properties/3
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [buildingTenants, setBuildingTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch ALL properties and ALL tenants (safest method while Render updates)
        const [propRes, tenantRes] = await Promise.all([
          fetch('https://mountroyal-api2.onrender.com/api/properties'),
          fetch('https://mountroyal-api2.onrender.com/api/tenants')
        ]);

        if (!propRes.ok) throw new Error("Failed to fetch property data");

        const allProperties = await propRes.json();
        const allTenants = await tenantRes.json();

        // 1. Find the exact property by matching the ID
        // Note: We use Number(id) because URL params are strings, but DB ids are numbers
        const foundProperty = allProperties.find(p => p.id === Number(id));
        
        if (!foundProperty) {
          throw new Error("Property not found in database.");
        }

        // 2. Filter tenants who live in this specific building
        const residents = allTenants.filter(t => t.property_id === Number(id));

        setProperty(foundProperty);
        setBuildingTenants(residents);
        setIsLoading(false);

      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-brandNavy h-full">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold text-lg">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 mb-6">
          <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
          <p className="text-sm font-medium">{error || "This property may have been deleted or doesn't exist."}</p>
        </div>
        <button onClick={() => navigate('/properties')} className="text-brandNavy font-bold hover:underline flex items-center justify-center w-full gap-2">
          <ArrowLeft size={16} /> Back to Portfolio
        </button>
      </div>
    );
  }

  // Calculate building financials & occupancy
  const occupancyRate = property.total_rooms > 0 ? Math.round((buildingTenants.length / property.total_rooms) * 100) : 0;
  const buildingRevenue = buildingTenants.reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Navigation */}
      <div className="mb-6">
        <Link to="/properties" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brandNavy transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Properties
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden mb-8">
        <div className="h-64 w-full bg-slate-200 relative">
          <img 
            src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3"} 
            alt={property.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-8 text-white">
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 ${property.status === 'Operational' ? 'bg-green-500' : 'bg-amber-500'}`}>
              {property.status}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{property.name}</h1>
            <p className="flex items-center text-white/80 font-medium">
              <MapPin size={18} className="mr-2" /> {property.location}
            </p>
          </div>
        </div>
      </div>

      {/* Building Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</p>
              <h3 className="text-2xl font-extrabold text-brandNavy">{occupancyRate}%</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">{buildingTenants.length} of {property.total_rooms} rooms occupied</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tenants</p>
              <h3 className="text-2xl font-extrabold text-brandNavy">{buildingTenants.length}</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">Currently residing in building</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-50 text-brandGreen rounded-xl"><Wallet size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Revenue</p>
              <h3 className="text-2xl font-extrabold text-brandNavy">₦ {buildingRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">Total payments collected here</p>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-brandNavy">Current Residents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100 bg-slate-50/50">
                <th className="p-5">Tenant Name</th>
                <th className="p-5">Room</th>
                <th className="p-5">Rent Amount</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {buildingTenants.length > 0 ? (
                buildingTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-brandNavy">{tenant.full_name}</td>
                    <td className="p-5 text-slate-500 font-medium">{tenant.room_assigned || 'N/A'}</td>
                    <td className="p-5 font-bold text-brandNavy">₦ {Number(tenant.rent_amount).toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${tenant.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No tenants currently assigned to this property.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}