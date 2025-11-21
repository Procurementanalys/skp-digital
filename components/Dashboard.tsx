import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { FileCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
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

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Promosi</h2>
        <p className="text-gray-500">Ringkasan Surat Kerjasama Promosi (SKP) aktif.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total SKP" 
          value="124" 
          subtitle="Tahun ini"
          icon={<FileCheck size={20} className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Total Nilai Promo" 
          value="Rp 4.2M" 
          subtitle="+12% dari bulan lalu"
          icon={<TrendingUp size={20} className="text-green-600" />} 
          color="bg-green-50"
        />
        <StatCard 
          title="Menunggu Approval" 
          value="8" 
          subtitle="Butuh tanda tangan"
          icon={<Clock size={20} className="text-orange-600" />} 
          color="bg-orange-50"
        />
        <StatCard 
          title="Segera Berakhir" 
          value="5" 
          subtitle="Dalam 7 hari ke depan"
          icon={<AlertCircle size={20} className="text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Tren SKP Promosi per Bulan</h3>
        <div className="h-72">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Jan', value: 12 },
              { name: 'Feb', value: 19 },
              { name: 'Mar', value: 15 },
              { name: 'Apr', value: 22 },
              { name: 'Mei', value: 28 },
              { name: 'Jun', value: 24 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
