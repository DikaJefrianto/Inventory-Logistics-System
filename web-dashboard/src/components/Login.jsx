import React, { useState } from 'react';
import api from '../api';
import { Shield, Lock, User, ArrowRight, Warehouse } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(false);
    try {
      // Mengirim request login ke backend auth
      const response = await api.post('/auth/login', { username, password });
      const { token, role, fullName } = response.data;
      
      // Simpan credentials ke memori browser
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('fullName', fullName);

      onLoginSuccess(token, role, fullName);
    } catch (err) {
      setError(err.response?.data?.message || 'Kredensial salah, silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100">
      
      {/* Sisi Kiri: Panel Informasi & Branding Aksen Gelap */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="flex items-center space-x-3 text-indigo-400 z-10">
          <Warehouse className="h-6 w-6" />
          <span className="text-sm font-black tracking-widest text-white uppercase">SIM-BUAH</span>
        </div>
        
        <div className="z-10 max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Sistem Informasi Manajemen Logistik Gudang Cerdas
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Implementasi basis data hibrida performa tinggi dengan perpaduan MongoDB untuk manajemen inventaris utama, Redis Caching untuk optimalisasi RAM, dan Elasticsearch untuk audit log transaksi instan.
          </p>
        </div>
        
        <div className="text-[10px] text-slate-500 z-10 uppercase tracking-wider">
          © 2026 Dika Jefrianto | All Rights Reserved
        </div>
        
        {/* Dekorasi Aksen Glow Lembut */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-500/5  rounded-full blur-[100px]"></div>
      </div>

      {/* Sisi Kanan: Formulir Login yang Rapi */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Otentikasi Pengguna</h2>
            <p className="text-slate-400 text-xs mt-1">Gunakan akun terdaftar Anda untuk masuk ke sistem.</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Masukkan username" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk Dashboard'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Panel Demo Info */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2 text-center">Simulator Akun SKPL</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                <p className="text-indigo-400 font-bold">Role Manager</p>
                <p className="text-slate-400 font-mono mt-0.5">manajer123</p>
                <p className="text-slate-500 font-mono">manajer123</p>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                <p className="text-emerald-400 font-bold">Role Petugas</p>
                <p className="text-slate-400 font-mono mt-0.5">petugas1</p>
                <p className="text-slate-500 font-mono">petugas1</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;