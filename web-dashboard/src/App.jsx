import React, { useState, useEffect } from 'react';
import api from './api';
import Login from './components/Login';
import { Package, ArrowDownLeft, ArrowUpRight, Search, Printer, Database, Shield, LogOut, User, Activity, Layers } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');

  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]); // State untuk menampung stok barang tersedia
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loadingCache, setLoadingCache] = useState(false);

  const [formInput, setFormInput] = useState({ name: '', sku: '', quantity: '', location: '', supplier: '' });
  const [formOutput, setFormOutput] = useState({ sku: '', quantity: '' });

  const handleLoginSuccess = (newToken, newRole, newName) => {
    setToken(newToken);
    setRole(newRole);
    setFullName(newName);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setRole('');
    setFullName('');
    setLogs([]);
    setItems([]);
  };

  // 1. Fetch Daftar Stok Barang Tersedia (MongoDB)
  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/items');
      setItems(response.data);
    } catch (error) {
      console.error("Gagal menarik daftar stok barang", error);
    }
  };

  // 2. Fetch Elasticsearch Logs
  const fetchLogs = async (keyword = '') => {
    if (role !== 'MANAGER') return;
    try {
      const response = await api.get(`/inventory/logs/search?keyword=${keyword}`);
      setLogs(response.data);
    } catch (error) {
      console.error("Gagal menarik Elasticsearch logs", error);
    }
  };

  // Load data awal saat login berhasil
  useEffect(() => {
    if (token) {
      fetchItems();
      if (role === 'MANAGER') {
        fetchLogs();
      }
    }
  }, [token, role]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/items', {
        ...formInput,
        quantity: parseInt(formInput.quantity)
      });
      alert("Barang sukses disimpan di MongoDB!");
      setFormInput({ name: '', sku: '', quantity: '', location: '', supplier: '' });
      fetchItems(); // Segarkan daftar stok
      fetchLogs();  // Segarkan logs
    } catch (error) {
      alert("Gagal menambahkan data.");
    }
  };

  const handleRecordOutput = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/inventory/items/output?sku=${formOutput.sku}&qty=${formOutput.quantity}`);
      alert("Barang keluar tervalidasi!");
      setFormOutput({ sku: '', quantity: '' });
      fetchItems(); // Segarkan daftar stok
      fetchLogs();  // Segarkan logs
    } catch (error) {
      alert(error.response?.data?.message || "Stok tidak mencukupi.");
    }
  };

  const testRedisCache = async (sku) => {
    if (!sku) return alert("Ketik SKU terlebih dahulu");
    setLoadingCache(true);
    const startTime = performance.now();
    try {
      const response = await api.get(`/inventory/items/${sku}`);
      const endTime = performance.now();
      alert(`[REDIS CACHE HIT]\nDurasi: ${(endTime - startTime).toFixed(2)} ms\nNama: ${response.data.name}\nStok: ${response.data.quantity}`);
    } catch (error) {
      alert("SKU tidak terdaftar di database.");
    } finally {
      setLoadingCache(false);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 font-sans antialiased pb-12">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-wider text-slate-200">
            SIM-BUAH PANEL KONTROL
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-left text-xs">
              <p className="text-slate-200 font-bold leading-none">{fullName}</p>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5 block">{role} LEVEL</span>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-slate-955 border border-slate-800 hover:bg-rose-950/30 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-bold transition">
            Keluar
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Row 1: Engine Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Utama</p>
              <h3 className="text-base font-extrabold text-slate-200 mt-1">MongoDB Store</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold rounded border border-emerald-500/20">ACTIVE</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Akselerasi Data RAM</p>
              <h3 className="text-base font-extrabold text-slate-200 mt-1">Redis Caching</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-mono font-bold rounded border border-cyan-500/20">CONNECTED</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Indeks Pencarian</p>
              <h3 className="text-base font-extrabold text-slate-200 mt-1">Elasticsearch</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold rounded border border-amber-500/20">INDEXED</span>
          </div>
        </div>

        {/* Row 2: Grid Utama Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Kolom Kiri: Formulir Inventaris */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Card Form Masuk */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
              <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
                <ArrowDownLeft className="h-4 w-4 text-emerald-400" /> Catat Barang Masuk (MongoDB)
              </h4>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Nama Deskripsi Barang</label>
                  <input type="text" placeholder="Nama barang" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" value={formInput.name} onChange={e => setFormInput({...formInput, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">SKU Unik</label>
                    <input type="text" placeholder="E.g. BUAH-01" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" value={formInput.sku} onChange={e => setFormInput({...formInput, sku: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Kuantitas</label>
                    <input type="number" placeholder="0" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" value={formInput.quantity} onChange={e => setFormInput({...formInput, quantity: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Lokasi Rak</label>
                    <input type="text" placeholder="RAK-A1" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" value={formInput.location} onChange={e => setFormInput({...formInput, location: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Supplier</label>
                    <input type="text" placeholder="PT. Tani" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500" value={formInput.supplier} onChange={e => setFormInput({...formInput, supplier: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg transition mt-2 shadow-sm">
                  Simpan Transaksi Masuk
                </button>
              </form>
            </div>

            {/* Card Form Keluar */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-md">
              <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
                <ArrowUpRight className="h-4 w-4 text-rose-400" /> Catat Barang Keluar (Redis Evict)
              </h4>
              <form onSubmit={handleRecordOutput} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Target SKU</label>
                    <input type="text" placeholder="BUAH-01" className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500" value={formOutput.sku} onChange={e => setFormOutput({...formOutput, sku: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Jumlah Rilis</label>
                    <input type="number" placeholder="0" className="w-full p-2.5 text-xs rounded-lg bg-slate-955 border border-slate-800 text-white focus:outline-none focus:border-rose-500" value={formOutput.quantity} onChange={e => setFormOutput({...formOutput, quantity: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-rose-650 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-lg transition mt-2 shadow-sm">
                  Keluarkan Dari Gudang
                </button>
              </form>
            </div>

            {/* RAM Cache Benchmark Card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Database className="h-3.5 w-3.5" /> Speed Benchmark Redis
              </h4>
              <div className="flex gap-2">
                <input id="redis-bench-sku" type="text" placeholder="Ketik SKU..." className="flex-1 p-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none" />
                <button onClick={() => testRedisCache(document.getElementById('redis-bench-sku').value)} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-4 py-2 text-xs font-bold rounded-lg transition">
                  {loadingCache ? '...' : 'Test'}
                </button>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Monitoring Log & Tabel Daftar Stok Aktif */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TABEL BARU: Monitor Stok Tersedia (Semua Role dapat melihat ini) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
              <div className="p-5 border-b border-slate-800 bg-slate-950/15 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-indigo-400" /> Daftar Informasi Stok Tersedia (MongoDB)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Jumlah persediaan fisik aktual di gudang.</p>
                </div>
                <button onClick={fetchItems} className="text-[10px] bg-slate-950 border border-slate-800 hover:bg-slate-800 text-indigo-400 px-3 py-1 rounded-lg font-bold transition">
                  Refresh Stok
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">SKU Barang</th>
                      <th className="p-4">Nama Barang</th>
                      <th className="p-4">Lokasi Rak</th>
                      <th className="p-4">Supplier</th>
                      <th className="p-4 text-right">Stok Tersedia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-600 bg-slate-950/5">
                          Belum ada data barang terdaftar di gudang.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.sku} className="hover:bg-slate-950/20 transition-colors">
                          <td className="p-4 font-mono font-bold text-indigo-300">{item.sku}</td>
                          <td className="p-4 text-slate-200 font-medium">{item.name}</td>
                          <td className="p-4"><span className="bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-850 font-mono text-[10px]">{item.location}</span></td>
                          <td className="p-4 text-slate-450">{item.supplier || '-'}</td>
                          <td className="p-4 text-right font-bold">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] ${item.quantity <= 5 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {item.quantity} Unit
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL LOG: Elasticsearch Audit Logs */}
            {role === 'MANAGER' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
                
                {/* Panel Header Tabel */}
                <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/15">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                      <Activity className="h-4 w-4 text-amber-500" /> Repositori Log Audit Transaksi
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pengindeksan teks penuh menggunakan Elasticsearch.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input 
                      type="text" 
                      placeholder="Cari transaksi..." 
                      className="bg-slate-955 border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-amber-500 w-full"
                      value={searchKeyword}
                      onChange={(e) => { setSearchKeyword(e.target.value); fetchLogs(e.target.value); }}
                    />
                    <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>

                {/* Struktur Tabel Log */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Jenis Aksi</th>
                        <th className="p-4">Kode SKU</th>
                        <th className="p-4">Kuantitas</th>
                        <th className="p-4">Operator</th>
                        <th className="p-4 text-right">Manifes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-650 bg-slate-950/5">
                            Belum ada berkas transaksi log audit terdeteksi.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-950/20 transition-colors">
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide ${log.action === 'BARANG_MASUK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-350">{log.sku}</td>
                            <td className="p-4 font-bold">
                              <span className={log.action === 'BARANG_MASUK' ? 'text-emerald-400' : 'text-rose-400'}>
                                {log.action === 'BARANG_MASUK' ? `+ ${log.quantityChanged}` : `- ${log.quantityChanged}`}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{log.operator || 'System Engine'}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => window.print()} className="p-1 text-slate-500 hover:text-white bg-slate-950 rounded border border-slate-800 hover:border-slate-700 transition" title="Cetak Berkas">
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              /* Panel Proteksi Hak Akses Terbatas (RBAC) */
              <div className="bg-slate-900 border border-dashed border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <Shield className="h-10 w-10 text-rose-500 mb-3 bg-rose-500/10 p-2 rounded-lg" />
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Proteksi Keamanan Berlaku</h3>
                <p className="text-slate-500 text-xs max-w-xs mt-2 leading-relaxed">
                  Hak akses Anda terotentikasi sebagai <span className="text-slate-300 font-bold">Petugas Gudang</span>.Audit Log diproteksi penuh dan hanya dapat dilihat untuk akun level <strong>Manager</strong>.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;