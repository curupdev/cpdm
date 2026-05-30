'use client';

import { useState, useEffect } from 'react';
import { Server, Shield, Globe, Activity, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hosts');
      const data = await res.json();
      if(Array.isArray(data)) setHosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleDeploy = async (hostId: number) => {
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId })
      });
      const data = await res.json();
      if(data.success) {
          alert('Successfully deployed to HA Proxy nodes!');
      } else {
          alert(`Deploy failed: ${data.details || data.error}`);
      }
    } catch (err) {
      alert('Network error during deployment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-gray-200 font-sans flex flex-col">
      <nav className="h-16 border-b border-[#2D3035] bg-[#0A0B0D]">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white tracking-tighter">C</div>
            <span className="text-white font-medium text-lg tracking-tight">Centralized Proxy & DNS Manager</span>
          </div>
          <div className="flex space-x-4">
             <div className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-mono border border-green-500/30 rounded uppercase flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 VIP: 10.90.135.10
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
         <div className="grid grid-cols-1 md:grid-cols-4 bg-[#14161A] border border-[#2D3035] rounded-xl mb-8 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#2D3035]">
            <div className="p-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><Globe className="w-3 h-3 text-blue-500"/> Proxy Hosts</p>
                <p className="text-3xl font-mono text-white">{hosts.length}</p>
                <p className="text-[10px] text-green-500 mt-1 uppercase">Active Configurations</p>
            </div>
            <div className="p-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-2"><Shield className="w-3 h-3 text-emerald-500"/> Active Certs</p>
                <p className="text-3xl font-mono text-white">0</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase italic">Let's Encrypt ECDSA</p>
            </div>
            {/* Status Nodes */}
            <div className="p-6 md:col-span-2 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2"><Server className="w-3 h-3 text-gray-400"/> Cluster Status (HA)</p>
                <div className="flex flex-wrap gap-4">
                    <div className="px-3 py-1 bg-[#1A1C21] text-gray-300 text-xs font-mono border border-[#2D3035] rounded flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Node 01: Master
                    </div>
                    <div className="px-3 py-1 bg-[#1A1C21] text-gray-300 text-xs font-mono border border-[#2D3035] rounded flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Node 02: Backup
                    </div>
                </div>
            </div>
         </div>

         <div className="bg-[#14161A] border border-[#2D3035] rounded-xl flex flex-col overflow-hidden">
             <div className="px-6 py-4 border-b border-[#2D3035] flex justify-between items-center bg-[#1A1C21]">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Proxy Hosts</h3>
                 <button onClick={fetchHosts} className="px-3 py-1.5 bg-[#0A0B0D] border border-[#2D3035] text-gray-400 text-xs rounded hover:text-white hover:border-gray-500 transition-colors flex items-center gap-2"><RefreshCw className="w-3 h-3"/> Refresh</button>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-[#2D3035] bg-[#14161A]">
                         <tr>
                             <th className="px-6 py-3">Domain</th>
                             <th className="px-6 py-3">Destination</th>
                             <th className="px-6 py-3">SSL</th>
                             <th className="px-6 py-3">Auto DNS</th>
                             <th className="px-6 py-3">Created</th>
                             <th className="px-6 py-3 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="text-xs font-mono divide-y divide-[#2D3035]">
                         {loading ? (
                             <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading configurations...</td></tr>
                         ) : hosts.length === 0 ? (
                             <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No proxy hosts configured yet.</td></tr>
                         ) : (
                             hosts.map((host: any) => (
                                 <tr key={host.id} className="hover:bg-[#1A1C21] group transition-colors">
                                     <td className="px-6 py-4 text-blue-400">{host.domain_names}</td>
                                     <td className="px-6 py-4 text-gray-300">{host.forward_scheme}://{host.forward_host}:{host.forward_port}</td>
                                     <td className="px-6 py-4">
                                         <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${host.ssl_provider === 'none' ? 'text-gray-500 border-gray-500/20' : 'text-green-500 border-green-500/20'}`}>
                                            {host.ssl_provider}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         {host.auto_dns ? <span className="text-green-400 text-[10px] flex items-center gap-1"><div className="w-1 h-1 bg-green-400 rounded-full"></div> Record: A (VIP)</span> : <span className="text-gray-500 text-[10px]">Disabled</span>}
                                     </td>
                                     <td className="px-6 py-4 text-gray-500 text-[10px] tracking-widest">{format(new Date(host.created_at), 'yyyy-MM-dd HH:mm')}</td>
                                     <td className="px-6 py-4 text-right">
                                         <button onClick={() => handleDeploy(host.id)} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] rounded font-bold hover:bg-blue-500 transition-colors uppercase tracking-wider shadow-lg shadow-blue-900/20">
                                             Deploy Host
                                         </button>
                                     </td>
                                 </tr>
                             ))
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
      </main>
    </div>
  );
}
