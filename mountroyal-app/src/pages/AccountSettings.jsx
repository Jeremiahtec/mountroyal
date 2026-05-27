import { useState, useEffect } from 'react';
import { Bell, HelpCircle, Building, Key, MapPin, Globe, ShieldCheck } from 'lucide-react';

export default function AccountSettings() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('office_profile');
  
 const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Operations Manager',
    company_name: '',    // <-- Add this
    company_address: ''  // <-- Add this
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- API CALLS ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://mountroyal-api2.onrender.com/api/settings/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage('');
    try {
      const response = await fetch('https://mountroyal-api2.onrender.com/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          company_name: profileData.company_name,       // <-- Add this
          company_address: profileData.company_address  // <-- Add this
        }),
      });

      if (response.ok) {
        setStatusMessage('Settings updated successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage('Failed to update.');
      }
    } catch (error) {
      setStatusMessage('Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- TAB RENDERERS ---
  const renderOfficeProfile = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-brandNavy">Administration Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Official contact information for the Mountroyal management team.</p>
      </div>

      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shadow-sm text-brandNavy">
          <Building size={28} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 capitalize">{profileData.full_name}</h3>
          <p className="text-sm font-medium text-brandGreen capitalize">{profileData.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Admin Name / Title</label>
          <input 
            type="text" 
            value={profileData.full_name}
            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Official Email</label>
          <input 
            type="email" 
            value={profileData.email}
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone Number</label>
          <input 
            type="text" 
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30"
          />
        </div>
      </div>
    </div>
  );

const renderCompanyDetails = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-brandNavy">Company Details</h2>
        <p className="text-slate-500 text-sm mt-1">Legal and operational information for Mountroyal.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Registered Business Name</label>
          <input 
            type="text" 
            value={profileData.company_name || ''} 
            onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
             Primary Office Address
          </label>
          <input 
            type="text" 
            value={profileData.company_address || ''} 
            onChange={(e) => setProfileData({...profileData, company_address: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30" 
          />
        </div>
      </div>
    </div>
  );

  const renderSystemPreferences = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-brandNavy">System Preferences</h2>
        <p className="text-slate-500 text-sm mt-1">Configure global platform settings.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2"><Globe size={14}/> Default Currency</label>
          <select className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30 bg-white">
            <option value="NGN">Nigerian Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Timezone</label>
          <select className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandNavy/30 bg-white">
            <option value="WAT">West Africa Time (WAT)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-brandNavy">Security & Integrations</h2>
        <p className="text-slate-500 text-sm mt-1">Manage API keys and authentication.</p>
      </div>
      <div className="space-y-6 mb-8">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2"><Key size={14} className="text-brandNavy"/> SendGrid API Key</label>
          <input type="password" placeholder="SG.xxxxxxxxxxxxxx" className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brandNavy/30" />
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14} className="text-brandGreen"/> Twilio Account SID</label>
          <input type="text" placeholder="ACxxxxxxxxxxxxxx" className="w-full border border-slate-200 rounded-lg p-3 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brandNavy/30" />
        </div>
      </div>
    </div>
  );

  // --- HELPER TO RENDER SIDEBAR BUTTONS ---
  const SidebarButton = ({ id, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex justify-between items-center ${
          isActive 
            ? 'bg-slate-100 text-brandNavy font-semibold' 
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        {label}
        {isActive && <span className="text-slate-400">&rsaquo;</span>}
      </button>
    );
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brandNavy mb-2">Office Settings</h1>
          <p className="text-slate-500">Manage Mountroyal administration and system configurations.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* --- SIDEBAR NAVIGATION --- */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <SidebarButton id="office_profile" label="Office Profile" />
            <SidebarButton id="company_details" label="Company Details" />
            <SidebarButton id="system_prefs" label="System Preferences" />
            <SidebarButton id="security" label="Security & Integrations" />
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[500px]">
            
            {/* Conditional Rendering based on state */}
            {activeTab === 'office_profile' && renderOfficeProfile()}
            {activeTab === 'company_details' && renderCompanyDetails()}
            {activeTab === 'system_prefs' && renderSystemPreferences()}
            {activeTab === 'security' && renderSecurity()}

            {/* Action Footer (Visible on all tabs) */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-4">
              {statusMessage && <span className="text-sm font-medium text-brandGreen">{statusMessage}</span>}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#0B1A28] text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving to Database...' : 'Save Settings'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}