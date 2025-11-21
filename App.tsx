import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateSKP } from './components/CreateSKP';
import { SKPData } from './types';
import { FileText, Bell, Search, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [skpList, setSkpList] = useState<SKPData[]>([]);

  // Load data from localStorage on startup
  useEffect(() => {
    const savedData = localStorage.getItem('skp_data');
    if (savedData) {
      try {
        setSkpList(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  const handleSaveSKP = (data: SKPData) => {
    const updatedList = [data, ...skpList];
    setSkpList(updatedList);
    localStorage.setItem('skp_data', JSON.stringify(updatedList));
    setCurrentView('list');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard skpList={skpList} />;
      case 'create':
        return <CreateSKP onSave={handleSaveSKP} onCancel={() => setCurrentView('dashboard')} totalDocuments={skpList.length} />;
      case 'list':
        return (
          <div className="space-y-6 animate-fade-in print:hidden">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Daftar Surat Kerjasama Promosi</h2>
                <p className="text-gray-500">Arsip dokumen kerjasama yang telah dibuat.</p>
              </div>
              <button 
                onClick={() => setCurrentView('create')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Buat SKP Baru
              </button>
            </div>

            {skpList.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Belum ada dokumen</h3>
                <p className="text-gray-500 mb-6">Buat Surat Kerjasama Promosi pertama Anda.</p>
                <button 
                  onClick={() => setCurrentView('create')}
                  className="text-orange-600 font-medium hover:underline"
                >
                  Buat Sekarang &rarr;
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {skpList.map((skp) => (
                   <div key={skp.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {skp.noSurat || 'Draft'}
                            </span>
                            <span className="text-xs text-gray-500">{skp.createdAt.split('T')[0]}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                             {skp.principal.nama || 'Tanpa Nama Principal'} - {skp.distributor.nama || 'Tanpa Nama Distributor'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {skp.products.length} Produk • Periode: {skp.periodStart} s.d {skp.periodEnd}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button 
                            onClick={() => {
                                // Ideally, you would set 'edit' mode here with the specific ID
                                alert("Fitur edit arsip akan segera tersedia.");
                            }}
                            className="text-sm text-orange-600 font-medium hover:underline"
                            >
                            Detail
                            </button>
                            <div className="flex gap-1">
                                {skp.signatureAlpro && <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700">TTD Alpro</span>}
                                {skp.signaturePrincipal && <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700">TTD Principal</span>}
                            </div>
                        </div>
                      </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <Dashboard skpList={skpList} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      {/* Added print:overflow-visible to ensure content isn't clipped during print */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 print:hidden">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
            <Search size={18} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Cari no surat, principal..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin Alpro</p>
                <p className="text-xs text-gray-500">Merchandising</p>
              </div>
              <div className="w-9 h-9 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area - Adjusted for print */}
        <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto">
          <div className="max-w-6xl mx-auto print:max-w-none print:w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;