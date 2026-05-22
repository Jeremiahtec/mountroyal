import { useState } from 'react';
import { Bell, Zap, Clock, Mail, MessageSquare, AlertTriangle, Save, CheckCircle2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Automation() {
  // --- STATE MANAGEMENT (Workflow Settings) ---
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // This state holds the configuration for all your automated rules
  const [settings, setSettings] = useState({
    // Rent Collection
    emailReminders: true,
    reminderDays: 3,
    smsReminders: false,
    autoLateFees: true,
    lateFeeAmount: 5000,
    lateFeeGracePeriod: 2,
    
    // Communication
    welcomeEmails: true,
    maintenanceAlerts: true,
    
    // System
    autoGenerateReports: true,
    reportFrequency: 'Monthly'
  });

  // Toggle helper for boolean settings
  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Input helper for numeric/text settings
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Simulate saving to the database
  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate a network request
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  // Custom Toggle Component to keep the UI clean
  const Switch = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brandNavy/20 ${checked ? 'bg-brandGreen' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-brandNavy tracking-tight flex items-center gap-3">
            <Zap className="text-amber-500" size={36} /> Automations
          </h2>
          <p className="text-slate-500 mt-2 text-base">Configure autopilot rules for rent collection, notifications, and reporting.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 bg-brandNavy text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-soft disabled:bg-slate-400"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Configuration
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-green-500" />
          <p className="font-bold text-sm">Automation workflows have been successfully updated and are now active.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Settings Column (Takes up 2/3 of the screen) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Rent & Financial Automations */}
          <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Clock size={20} /></div>
              <h3 className="text-lg font-bold text-brandNavy">Rent Collection Workflows</h3>
            </div>
            
            <div className="p-6 space-y-8 divide-y divide-slate-50">
              
              {/* Rule: Email Reminders */}
              <div className="flex justify-between items-start pt-2">
                <div className="max-w-md">
                  <h4 className="text-base font-bold text-brandNavy mb-1">Pre-Due Date Email Reminders</h4>
                  <p className="text-sm text-slate-500 mb-3">Automatically send a courteous email reminder to tenants before their rent is due.</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-slate-600">Send reminder</span>
                    <input 
                      type="number" 
                      value={settings.reminderDays} 
                      onChange={(e) => handleChange('reminderDays', e.target.value)}
                      disabled={!settings.emailReminders}
                      className="w-16 border border-slate-200 rounded-md p-1.5 text-center focus:ring-2 focus:ring-brandNavy/20 disabled:bg-slate-50 disabled:text-slate-400" 
                    />
                    <span className="font-semibold text-slate-600">days before due date.</span>
                  </div>
                </div>
                <Switch checked={settings.emailReminders} onChange={() => handleToggle('emailReminders')} />
              </div>

              {/* Rule: Late Fees */}
              <div className="flex justify-between items-start pt-8">
                <div className="max-w-md">
                  <h4 className="text-base font-bold text-brandNavy mb-1 flex items-center gap-2">
                    Auto-Apply Late Fees <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Crucial</span>
                  </h4>
                  <p className="text-sm text-slate-500 mb-3">Automatically add a penalty fee to the tenant's ledger if they miss their due date and grace period.</p>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="font-semibold text-slate-600">Charge ₦</span>
                    <input 
                      type="number" 
                      value={settings.lateFeeAmount} 
                      onChange={(e) => handleChange('lateFeeAmount', e.target.value)}
                      disabled={!settings.autoLateFees}
                      className="w-24 border border-slate-200 rounded-md p-1.5 focus:ring-2 focus:ring-brandNavy/20 disabled:bg-slate-50 disabled:text-slate-400" 
                    />
                    <span className="font-semibold text-slate-600">after a</span>
                    <input 
                      type="number" 
                      value={settings.lateFeeGracePeriod} 
                      onChange={(e) => handleChange('lateFeeGracePeriod', e.target.value)}
                      disabled={!settings.autoLateFees}
                      className="w-16 border border-slate-200 rounded-md p-1.5 text-center focus:ring-2 focus:ring-brandNavy/20 disabled:bg-slate-50 disabled:text-slate-400" 
                    />
                    <span className="font-semibold text-slate-600">day grace period.</span>
                  </div>
                </div>
                <Switch checked={settings.autoLateFees} onChange={() => handleToggle('autoLateFees')} />
              </div>
            </div>
          </div>

          {/* Section 2: Communication Rules */}
          <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><MessageSquare size={20} /></div>
              <h3 className="text-lg font-bold text-brandNavy">Tenant Communications</h3>
            </div>
            
            <div className="p-6 space-y-6 divide-y divide-slate-50">
              <div className="flex justify-between items-center pt-2">
                <div>
                  <h4 className="text-base font-bold text-brandNavy mb-1">Welcome Onboarding Email</h4>
                  <p className="text-sm text-slate-500">Send property guidelines and payment instructions when a new tenant is added.</p>
                </div>
                <Switch checked={settings.welcomeEmails} onChange={() => handleToggle('welcomeEmails')} />
              </div>

              <div className="flex justify-between items-center pt-6">
                <div>
                  <h4 className="text-base font-bold text-brandNavy mb-1">WhatsApp / SMS Alerts</h4>
                  <p className="text-sm text-slate-500">Duplicate critical email alerts via SMS using the Twilio API.</p>
                </div>
                <Switch checked={settings.smsReminders} onChange={() => handleToggle('smsReminders')} />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Info Column (Takes up 1/3 of the screen) */}
        <div className="space-y-6">
          
          {/* Section 3: System Reporting */}
          <div className="bg-cardWhite rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-brandNavy flex items-center gap-2">
                <FileText size={18} className="text-slate-400" /> Auto-Reporting
              </h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-600">Compile Ledger Reports</span>
                <Switch checked={settings.autoGenerateReports} onChange={() => handleToggle('autoGenerateReports')} />
              </div>
              <select 
                value={settings.reportFrequency} 
                onChange={(e) => handleChange('reportFrequency', e.target.value)}
                disabled={!settings.autoGenerateReports}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brandNavy/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="Weekly">Every Friday (Weekly)</option>
                <option value="Monthly">End of Month (Monthly)</option>
                <option value="Quarterly">End of Quarter</option>
              </select>
            </div>
          </div>

          {/* Integration Status Card */}
          <div className="bg-slate-900 rounded-2xl shadow-soft overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Zap size={120} />
            </div>
            <div className="p-6 relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                API Integrations
              </h3>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">SendGrid (Emails)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded-md">Connected</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">Twilio (SMS)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-400 px-2 py-1 rounded-md border border-slate-600">Setup Required</span>
                </li>
                <li className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">Cron Jobs (Engine)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-1 rounded-md">Active</span>
                </li>
              </ul>
              
              <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg text-sm font-bold transition-colors">
                Manage API Keys
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}