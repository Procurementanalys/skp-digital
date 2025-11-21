import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { FileCheck, ShoppingBag, PenTool, AlertCircle } from 'lucide-react';
import { SKPData } from '../types';

interface DashboardProps {
  skpList: SKPData[];
}

const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ skpList }) => {
  
  const stats = useMemo(() => {
    const totalSKP = skpList.length;
    
    // Count total products across all SKPs
    const totalProducts = skpList.reduce((acc, curr) => acc + curr.products.length, 0);
    
    // Count SKPs missing signatures
    const waitingApproval = skpList.filter(skp => !skp.signatureAlpro || !skp.signaturePrincipal).length;
    
    // Count ending soon (within 7 days or already expired) - Simple logic for demo
    const now = new Date();
    const expiringSoon = skpList.filter(skp => {
      if (!skp.periodEnd) return false;
      const end = new Date(skp.periodEnd);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays <= 7 && diffDays >= -30; // Expiring in 7 days or expired within last month
    }).length;

    // Chart Data: Group by Month of Period Start
    const chartDataMap = new Array(12).fill(0);
    skpList.forEach(skp => {
        if (skp.periodStart) {
            const month = new Date(skp.periodStart).getMonth();
            chartDataMap[month]++;
        }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    // Show only current year months or a sliding window. For simplicity, showing all months.
    const chartData = monthNames.map((name, index) => ({
        name,
        value: chartDataMap[index]
    }));

    return { totalSKP, totalProducts, waitingApproval, expiringSoon, chartData };
  }, [skpList]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Promosi</h2>
        <p className="text-gray-500">Ringkasan status Surat Kerjasama Promosi (SKP) Alpro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Dokumen SKP" 
          value={stats.totalSKP}
          subtitle="Arsip Digital"
          icon={<FileCheck size={20} className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Item Produk Promo" 
          value={stats.totalProducts}
          subtitle="Total SKU aktif promo"
          icon={<ShoppingBag size={20} className="text-green-600" />} 
          color="bg-green-50"
        />
        <StatCard 
          title="Menunggu TTD" 
          value={stats.waitingApproval}
          subtitle="Belum lengkap tanda tangan"
          icon={<PenTool size={20} className="text-orange-600" />} 
          color="bg-orange-50"
        />
        <StatCard 
          title="Segera Berakhir" 
          value={stats.expiringSoon}
          subtitle="Exp < 7 hari / Expired"
          icon={<AlertCircle size={20} className="text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Tren Mulai Promo (Per Bulan)</h3>
            <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} allowDecimals={false} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="value" name="Jumlah SKP" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terakhir</h3>
            <div className="space-y-4">
                {skpList.slice(0, 5).map((skp) => (
                    <div key={skp.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{skp.principal.nama || 'Tanpa Nama'}</p>
                            <p className="text-xs text-gray-500">{skp.noSurat}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap">
                            {new Date(skp.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        </span>
                    </div>
                ))}
                {skpList.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};