import { useState } from 'react';
import { Save, Key, Mail, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

export default function AccountSettings() {
  const [isSaving, setIsSaving] = useState(false);

  // You would eventually fetch these from your 'system_settings' table
  const [credentials, setCredentials] = useState({
    sendgridKey: '',
    twilioSid: '',
    twilioToken: ''
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call to update system_settings table
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h2 className="text-3xl font-extrabold text-brandNavy mb-8">System Integration Keys</h2>

      <div className="bg-white p-8 rounded-2xl shadow-soft border border-slate-100">
        <div className="space-y-8">
          
          {/* SendGrid Section */}
          <div className="flex gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit"><Mail size={24} /></div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">SendGrid API Key</label>
              <p className="text-xs text-slate-500 mb-3">Required for automated email reminders and monthly report delivery.</p>
              <input 
                type="password" 
                placeholder="SG.xxxxxxxxx..." 
                className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm"
                value={credentials.sendgridKey}
                onChange={(e) => setCredentials({...credentials, sendgridKey: e.target.value})}
              />
            </div>
          </div>

          {/* Twilio Section */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl h-fit"><MessageSquare size={24} /></div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Twilio Account SID</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm" value={credentials.twilioSid} onChange={(e) => setCredentials({...credentials, twilioSid: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Twilio Auth Token</label>
                <input type="password" className="w-full border border-slate-200 rounded-lg p-3 font-mono text-sm" value={credentials.twilioToken} onChange={(e) => setCredentials({...credentials, twilioToken: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-brandNavy text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save API Configuration
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}