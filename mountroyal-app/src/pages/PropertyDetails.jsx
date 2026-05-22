import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Building, Users, DoorOpen, Percent, Loader2 } from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams(); // Grabs the property ID from the URL
  
  const [property, setProperty] = useState(null);
  const [buildingTenants, setBuildingTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      // Fetch the single property AND all tenants simultaneously
      const [propertyRes, tenantsRes] = await Promise.all([
        fetch(`https://mountroyal-api2.onrender.com/api/properties/${id}`),
        fetch('https://mountroyal-api2.onrender.com/api/tenants')
      ]);

      if (!propertyRes.ok) throw new Error("Property not found");
      
      const propertyData = await propertyRes.json();
      const allTenantsData = await tenantsRes.json();
      
      // Filter the tenants to ONLY show the ones assigned to this specific building
      const filteredTenants = allTenantsData.filter(t => t.property_id === parseInt(id));

      setProperty(propertyData);
      setBuildingTenants(filteredTenants);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading property details:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-brandNavy">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-bold text-lg">Loading Property Profile...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-brandNavy mb-4">Property Not Found</h2>
        <Link to="/properties" className="text-brandNavy underline font-semibold">Return to Properties</Link>
      </div>
    );
  }

  // Calculate live stats based on the database
  const occupiedRooms = buildingTenants.length;
  const vacantRooms = property.total_rooms - occupiedRooms;
  const occupancyRate = property.total_rooms > 0 ? Math.round((occupiedRooms / property.total_rooms) * 100) : 0;
  const totalExpectedRent = buildingTenants.reduce((sum, tenant) => sum + Number(tenant.rent_amount), 0);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Back Button */}
      <Link to="/properties" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brandNavy mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Portfolio
      </Link>

      {/* Hero Banner Section */}
      <div className="bg-cardWhite rounded-3xl shadow-soft border border-slate-100 overflow-hidden mb-8 relative">
        <div className="h-64 w-full bg-slate-800 relative">
          <img 
            src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3"} 
            alt={property.name} 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900/90 to-transparent p-8">
            <div className="flex justify-between items-end">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${property.status === 'Operational' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {property.status}
                </span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{property.name}</h1>
                <p className="flex items-center text-slate-300 font-medium mt-2">
                  <MapPin size={18} className="mr-2 text-slate-400" />
                  {property.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Building size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rooms</p>
            <p className="text-2xl font-extrabold text-brandNavy">{property.total_rooms}</p>
          </div>
        </div>
        
        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</p>
            <p className="text-2xl font-extrabold text-brandNavy">{occupiedRooms}</p>
          </div>
        </div>

        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><DoorOpen size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vacant</p>
            <p className="text-2xl font-extrabold text-brandNavy">{Math.max(0, vacantRooms)}</p>
          </div>
        </div>

        <div className="bg-cardWhite p-6 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Percent size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</p>
            <p className="text-2xl font-extrabold text-brandNavy">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* Building Roster Table */}
      <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-brandNavy">Building Roster</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Total expected rent: <span className="font-bold text-brandNavy">₦ {totalExpectedRent.toLocaleString()}</span></p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
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
                    <td className="p-5 font-medium text-slate-600">{tenant.room_assigned || 'N/A'}</td>
                    <td className="p-5 font-bold text-brandNavy">₦ {Number(tenant.rent_amount).toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${tenant.status === 'Paid' ? 'bg-green-50 text-green-700' : tenant.status === 'Due Soon' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No tenants are currently assigned to this building.
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