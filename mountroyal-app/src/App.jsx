import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails'; // <-- Make sure this file exists in src/pages!
import Tenants from './pages/Tenants';
import Ledger from './pages/Ledger';
import Automation from './pages/Automation';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Layout acts as the master wrapper (Sidebar + Topbar) */}
        <Route path="/" element={<Layout />}>
          
          {/* Default page is Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* The Properties Grid */}
          <Route path="properties" element={<Properties />} />
          
          {/* THE FIX: The dynamic route for individual properties */}
          <Route path="properties/:id" element={<PropertyDetails />} />
          
          <Route path="tenants" element={<Tenants />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="automation" element={<Automation />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}