import React, { useState, useEffect } from 'react';
import { Save, Printer, ArrowLeft, Plus, Trash2, Sparkles, Loader2, PenTool, MousePointerClick } from 'lucide-react';
import { SKPData, ProductItem, EntityInfo, CompanyType } from '../types';
import { extractPromoData } from '../services/geminiService';
import { SignaturePad } from './SignaturePad';

interface CreateSKPProps {
  onSave: (data: SKPData) => void;
  onCancel: () => void;
  totalDocuments: number; // For auto numbering
}

export const CreateSKP: React.FC<CreateSKPProps> = ({ onSave, onCancel, totalDocuments }) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  
  // Signature State
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [activeSigner, setActiveSigner] = useState<'alpro' | 'principal' | null>(null);

  const [formData, setFormData] = useState<SKPData>({
    id: Date.now().toString(),
    noSurat: '', // Will be populated automatically
    cooperationType: 'OUTRIGHT',
    principal: { nama: '', hasNpwp: true, npwpNumber: '', alamatPajak: '' },
    distributor: { nama: '', hasNpwp: true, npwpNumber: '', alamatPajak: '' },
    periodStart: '',
    periodEnd: '',
    products: [
      { id: '1', itemCode: '', namaProduk: '', mekanismePromo: '', discountPercent: 0, potongHarga: 0 }
    ],
    taxStatus: 'INCLUDE',
    jenisKerjasama: { rafaksi: '', marketingSupport: '' },
    jenisPerusahaan: [],
    invoiceTo: 'PRINCIPAL',
    paymentType: 'POTONG_TAGIHAN',
    cutInvoiceTo: 'PRINCIPAL',
    pic: { nama: '', email: '', telepon: '', alamat: '' },
    createdAt: new Date().toISOString(),
    status: 'Draft'
  });

  // Auto Generate No Surat on Mount
  useEffect(() => {
    const generateNoSurat = () => {
      const date = new Date();
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      const month = romanMonths[date.getMonth()];
      const year = date.getFullYear();
      // Simple sequence: totalDocuments + 1, padded to 3 digits
      const sequence = String(totalDocuments + 1).padStart(3, '0');
      
      return `${sequence}/SKP-ALPRO/${month}/${year}`;
    };

    setFormData(prev => {
        if (!prev.noSurat) {
            return { ...prev, noSurat: generateNoSurat() };
        }
        return prev;
    });
  }, [totalDocuments]);

  const handleEntityChange = (entity: 'principal' | 'distributor', field: keyof EntityInfo, value: any) => {
    setFormData({
      ...formData,
      [entity]: { ...formData[entity], [field]: value }
    });
  };

  const handleProductChange = (id: string, field: keyof ProductItem, value: any) => {
    setFormData({
      ...formData,
      products: formData.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, {
        id: Date.now().toString(),
        itemCode: '',
        namaProduk: '',
        mekanismePromo: '',
        discountPercent: 0,
        potongHarga: 0
      }]
    });
  };

  const removeProduct = (id: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.id !== id)
    });
  };

  const handleAiFill = async () => {
    if (!aiInput.trim()) return;
    setLoadingAI(true);
    try {
      const extracted = await extractPromoData(aiInput);
      if (extracted) {
        setFormData(prev => ({
          ...prev,
          principal: { ...prev.principal, nama: extracted.principalName || prev.principal.nama },
          distributor: { ...prev.distributor, nama: extracted.distributorName || prev.distributor.nama },
          periodStart: extracted.periodStart || prev.periodStart,
          periodEnd: extracted.periodEnd || prev.periodEnd,
          jenisKerjasama: {
            rafaksi: extracted.rafaksi || prev.jenisKerjasama.rafaksi,
            marketingSupport: extracted.marketingSupport || prev.jenisKerjasama.marketingSupport
          },
          products: extracted.products?.length > 0 ? extracted.products.map((p: any, idx: number) => ({
            id: Date.now().toString() + idx,
            itemCode: p.itemCode || '',
            namaProduk: p.namaProduk || '',
            mekanismePromo: p.mekanismePromo || '',
            discountPercent: p.discountPercent || 0,
            potongHarga: p.potongHarga || 0
          })) : prev.products
        }));
        setShowAiInput(false);
        setAiInput('');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal memproses data AI');
    } finally {
      setLoadingAI(false);
    }
  };

  const openSignaturePad = (role: 'alpro' | 'principal') => {
    setActiveSigner(role);
    setShowSignaturePad(true);
  };

  const handleSignatureSave = (dataUrl: string) => {
    if (activeSigner === 'alpro') {
      setFormData(prev => ({ ...prev, signatureAlpro: dataUrl }));
    } else if (activeSigner === 'principal') {
      setFormData(prev => ({ ...prev, signaturePrincipal: dataUrl }));
    }
    setShowSignaturePad(false);
    setActiveSigner(null);
  };

  // Print View Component - Styled exactly like the paper form
  const PrintView = () => (
    <div className="bg-white p-6 md:p-10 max-w-[210mm] mx-auto shadow-lg print:shadow-none print:w-full print:max-w-none print:p-0 text-[11px] font-sans text-black leading-tight relative">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
        <div className="flex items-start gap-4">
          {/* Logo Placeholder */}
          <div className="flex flex-col items-center justify-center bg-blue-600 p-1 w-20 h-12 border border-black print-color-adjust">
            <div className="bg-white w-full h-full flex flex-col items-center justify-center rounded-full p-1">
               <div className="text-[8px] font-bold italic text-blue-600">alpro</div>
            </div>
          </div>
          <div className="flex flex-col justify-center h-12">
             <h1 className="text-2xl font-bold text-orange-600 italic leading-none">apotekalpro</h1>
             <span className="text-[8px] text-orange-500 tracking-widest bg-orange-600 text-white px-1 mt-1 print-color-adjust">pharmacy</span>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <h1 className="text-xl font-bold text-black mb-2">Surat Kerjasama Promosi</h1>
          <div className="flex gap-6 text-[11px] font-semibold">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
                {formData.cooperationType === 'CONSIGNMENT' && '✓'}
              </div>
              CONSIGNMENT
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 border border-black flex items-center justify-center`}>
                {formData.cooperationType === 'OUTRIGHT' && '✓'}
              </div>
              OUTRIGHT
            </div>
          </div>
        </div>
      </div>

      {/* Document No & Intro */}
      <div className="mb-3">
        <div className="flex gap-2 items-end mb-2">
          <span className="font-bold w-16">No. Surat :</span>
          <div className="border-b border-black flex-1 px-2 font-medium">{formData.noSurat}</div>
        </div>
        <p>Berikut adalah kesepakatan program kegiatan Promosi <span className="border-b border-black px-4 inline-block min-w-[150px]"></span> antara Apotek Alpro Indonesia dengan :</p>
      </div>

      {/* Principal */}
      <div className="mb-2">
        <div className="font-bold underline mb-1">Principal</div>
        <div className="grid grid-cols-[120px_1fr] gap-y-1">
          <div>Nama Principal</div>
          <div className="flex items-center gap-1">
            : <div className="border-b border-black flex-1 px-1">{formData.principal.nama}</div>
          </div>
          
          <div>NPWP</div>
          <div className="flex items-center gap-1">
            : 
            <div className="flex items-center gap-6 w-full border-b border-black pb-0.5">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.principal.hasNpwp ? '✓' : ''}</div> YA
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{!formData.principal.hasNpwp ? '✓' : ''}</div> TIDAK
                </div>
                <span className="ml-auto mr-2">No. NPWP: {formData.principal.npwpNumber}</span>
            </div>
          </div>
          
          <div>Alamat Pajak</div>
          <div className="flex items-start gap-1">
            : <div className="border-b border-black flex-1 px-1">{formData.principal.alamatPajak}</div>
          </div>
        </div>
      </div>

      {/* Distributor */}
      <div className="mb-2">
        <div className="font-bold underline mb-1">Distributor</div>
        <div className="grid grid-cols-[120px_1fr] gap-y-1">
          <div>Nama Distributor</div>
          <div className="flex items-center gap-1">
            : <div className="border-b border-black flex-1 px-1">{formData.distributor.nama}</div>
          </div>
          
          <div>NPWP</div>
          <div className="flex items-center gap-1">
            : 
            <div className="flex items-center gap-6 w-full border-b border-black pb-0.5">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.distributor.hasNpwp ? '✓' : ''}</div> YA
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{!formData.distributor.hasNpwp ? '✓' : ''}</div> TIDAK
                </div>
                <span className="ml-auto mr-2">No. NPWP: {formData.distributor.npwpNumber}</span>
            </div>
          </div>
          
          <div>Alamat Pajak</div>
          <div className="flex items-start gap-1">
            : <div className="border-b border-black flex-1 px-1">{formData.distributor.alamatPajak}</div>
          </div>
        </div>
      </div>

      {/* Period */}
      <div className="mb-4 border-b-2 border-black pb-2">
        <div className="grid grid-cols-[120px_1fr] gap-1 items-center">
          <div className="font-bold">Priode (Tanggal)</div>
          <div className="flex items-center gap-2">
             : 
             <div className="border-b border-black px-4 min-w-[100px] text-center">{formData.periodStart}</div>
             <span className="font-bold">s.d</span>
             <div className="border-b border-black px-4 min-w-[100px] text-center">{formData.periodEnd}</div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-4">
        <div className="font-bold underline mb-1">Nama Produk :</div>
        <table className="w-full border-collapse border border-black text-center text-[10px]">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-100 print-color-adjust">
              <th className="border border-black p-1 w-6 font-bold">No.</th>
              <th className="border border-black p-1 w-24 font-bold">Item Code</th>
              <th className="border border-black p-1 font-bold">Nama Produk</th>
              <th className="border border-black p-1 w-32 font-bold">Mekanisme Promo</th>
              <th className="border border-black p-0 w-48 font-bold">
                <div className="p-1 border-b border-black">Sistem Claim Sellings Out</div>
                <div className="flex">
                   <div className="w-1/2 border-r border-black py-1">% Discount</div>
                   <div className="w-1/2 py-1">Potong Harga (Rp)</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...formData.products, ...Array(Math.max(0, 5 - formData.products.length)).fill(null)].map((product, index) => (
              <tr key={index} className="h-6">
                <td className="border border-black p-1">{index + 1}.</td>
                <td className="border border-black p-1">{product?.itemCode || ''}</td>
                <td className="border border-black p-1 text-left px-2">{product?.namaProduk || ''}</td>
                <td className="border border-black p-1">{product?.mekanismePromo || ''}</td>
                <td className="border border-black p-1">{product?.discountPercent ? `${product.discountPercent}%` : ''}</td>
                <td className="border border-black p-1">{product?.potongHarga ? product.potongHarga.toLocaleString('id-ID') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[9px] mt-1">Sistem claim selling out Harga Jual Apotek Alpro Indonesia</div>
      </div>

      {/* Admin Section */}
      <div className="mb-4">
        <div className="flex justify-end gap-6 mb-2 font-bold text-[10px]">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.taxStatus === 'INCLUDE' ? '✓' : ''}</div> Harga Termasuk Tax
          </div>
          <div className="flex items-center gap-1">
             <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.taxStatus === 'EXCLUDE' ? '✓' : ''}</div> Belum Termasuk Tax
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <div className="mb-3">
              <span className="font-bold underline text-[11px]">Jenis Kerjasama :</span>
              <div className="grid grid-cols-[90px_1fr] gap-1 mt-1">
                <div>Rafaksi</div>
                <div className="border-b border-black border-dotted text-center">: {formData.jenisKerjasama.rafaksi}</div>
              </div>
              <div className="grid grid-cols-[90px_1fr] gap-1 mt-1">
                <div>Marketing Supp</div>
                <div className="border-b border-black border-dotted text-center">: {formData.jenisKerjasama.marketingSupport}</div>
              </div>
            </div>
            
            <div>
              <div className="grid grid-cols-[90px_1fr] gap-1">
                 <div>Jenis Perusahaan :</div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.jenisPerusahaan.includes('PRORESULT') ? '✓' : ''}</div>
                     PT Proresult Kreasi Utama
                   </div>
                   <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.jenisPerusahaan.includes('PRIMA_RETAIL') ? '✓' : ''}</div>
                     PT Prima Retail Indonesia
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
             <div>
               <span className="font-bold underline block mb-1">Invoice dan Faktur Pajak dibuat atas nama :</span>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.invoiceTo === 'PRINCIPAL' ? '✓' : ''}</div> Principal
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.invoiceTo === 'DISTRIBUTOR' ? '✓' : ''}</div> Distributor
                  </div>
               </div>
             </div>
             <div>
               <span className="font-bold underline block mb-1">Pembayaran</span>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.paymentType === 'POTONG_TAGIHAN' ? '✓' : ''}</div> Potong Tagihan *
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.paymentType === 'TRANSFER' ? '✓' : ''}</div> Transfer
                  </div>
               </div>
             </div>
             <div>
               <span className="font-bold underline block mb-1">Potong tagihan kepada :</span>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.cutInvoiceTo === 'PRINCIPAL' ? '✓' : ''}</div> Principal
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-3 h-3 border border-black flex items-center justify-center`}>{formData.cutInvoiceTo === 'DISTRIBUTOR' ? '✓' : ''}</div> Distributor
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="mb-6">
         <div className="font-bold underline mb-1">Pengiriman Invoice</div>
         <div className="grid grid-cols-[120px_1fr] gap-y-1">
            <div>Nama PIC</div>
            <div className="border-b border-black">: {formData.pic.nama}</div>
            <div>Email PIC</div>
            <div className="border-b border-black">: {formData.pic.email}</div>
            <div>No.Tlp PIC</div>
            <div className="border-b border-black">: {formData.pic.telepon}</div>
            <div>Alamat Pengiriman</div>
            <div className="border-b border-black">: {formData.pic.alamat}</div>
         </div>
      </div>

      {/* Disclaimer & Signatures */}
      <div className="mt-2">
         <p className="text-justify mb-4 leading-snug">
           Biaya support promosi dibayarkan dalam waktu 14 hari kalender sejak invoice dan faktur pajak diterima. Jika lewat dari batas waktu yang ditetapkan maka Principal/Distributor dengan ini setuju bahwa Apotek Alpro Indonesia berhak memotong tagihan Distributor.
         </p>

         <div className="flex justify-between mt-6 px-4">
            <div className="text-center relative group">
              <div className="mb-2">Diajukan Oleh,</div>
              
              {/* Alpro Signature Area */}
              <div 
                className={`h-24 w-40 mx-auto flex items-end justify-center relative cursor-pointer transition-all ${
                  !formData.signatureAlpro 
                    ? 'border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 animate-pulse print:border-0 print:bg-transparent print:animate-none' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => openSignaturePad('alpro')}
              >
                {formData.signatureAlpro ? (
                    <img src={formData.signatureAlpro} alt="Sign Alpro" className="absolute bottom-2 w-32 max-h-20 object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-orange-600 font-bold print:hidden">
                        <MousePointerClick size={20} className="mb-1" />
                        <span className="text-[10px]">KLIK DISINI</span>
                        <span className="text-[8px]">UNTUK TTD</span>
                    </div>
                )}
              </div>

              <div className="border-t border-black px-4 pt-1 w-40 mx-auto font-bold">Apotek Alpro Indonesia</div>
              <div className="text-[9px]">(Nama / Jabatan)</div>
            </div>
            
            <div className="text-center relative group">
              <div className="mb-4 text-right">Jakarta, <span className="inline-block min-w-[20px] border-b border-black"></span> / <span className="inline-block min-w-[20px] border-b border-black"></span> / <span className="inline-block min-w-[30px] border-b border-black"></span></div>
              <div className="mb-2 text-center">Disetujui,</div>
              
               {/* Principal Signature Area */}
               <div 
                className={`h-20 w-48 mx-auto flex items-end justify-center relative cursor-pointer transition-all ${
                  !formData.signaturePrincipal 
                    ? 'border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 animate-pulse print:border-0 print:bg-transparent print:animate-none' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => openSignaturePad('principal')}
              >
                {formData.signaturePrincipal ? (
                    <img src={formData.signaturePrincipal} alt="Sign Principal" className="absolute bottom-2 w-32 max-h-20 object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full text-orange-600 font-bold print:hidden">
                        <MousePointerClick size={20} className="mb-1" />
                        <span className="text-[10px]">KLIK DISINI</span>
                        <span className="text-[8px]">UNTUK TTD</span>
                    </div>
                )}
              </div>

              <div className="border-t border-black px-4 pt-1 w-48 mx-auto font-bold">Principal / Distributor</div>
              <div className="text-[9px]">(Nama, Jabatan, Stempel Perusahaan)</div>
            </div>
         </div>

         <div className="mt-6 text-[8px] italic text-black space-y-0.5">
            <p>*Jika pembayaran potong tagih tetapi tidak ada PO atau tagihan kepada Apotek Alpro, maka metode pembayaran akan berubah menjadi transfer.</p>
            <p>Menggunakan <b>Lampiran Produk</b> kesepakatan program kegiatan Promosi jika produk <b>lebih dari 5 item.</b></p>
            <p>Mohon pastikan stock barang tersedia di pihak distributor selama promo berlangsung.</p>
         </div>
      </div>
    </div>
  );

  if (mode === 'preview') {
    return (
      <div className="space-y-4 print:space-y-0 relative">
        {showSignaturePad && (
            <SignaturePad 
                title={`Tanda Tangan ${activeSigner === 'alpro' ? 'Apotek Alpro' : 'Principal / Distributor'}`}
                onSave={handleSignatureSave}
                onCancel={() => setShowSignaturePad(false)}
            />
        )}

        {/* Control Bar - Hidden on Print */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm print:hidden sticky top-0 z-10">
          <button onClick={() => setMode('edit')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} /> Kembali Edit
          </button>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">
              <Printer size={20} /> Cetak / Simpan PDF
            </button>
            <button onClick={() => onSave(formData)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save size={20} /> Simpan Dokumen
            </button>
          </div>
        </div>
        
        {/* Warning Banner for Signature */}
        {!formData.signatureAlpro && !formData.signaturePrincipal && (
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded shadow-sm print:hidden">
                <p className="font-bold flex items-center gap-2"><PenTool size={18} /> Tanda Tangan Belum Lengkap</p>
                <p className="text-sm">Silakan scroll ke bawah dan klik kotak tanda tangan untuk menambahkan tanda tangan digital.</p>
            </div>
        )}

        {/* The Document */}
        <PrintView />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header & Tools */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Buat SKP (Surat Kerjasama Promosi)</h2>
          <p className="text-sm text-gray-500">Isi formulir di bawah ini untuk membuat dokumen kerjasama.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAiInput(!showAiInput)}
            className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            <Sparkles size={16} /> Isi Otomatis (AI)
          </button>
          <button 
            onClick={() => setMode('preview')} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
             Preview & TTD
          </button>
        </div>
      </div>

      {/* AI Input Section */}
      {showAiInput && (
        <div className="p-6 bg-purple-50 border-b border-purple-100 animate-fade-in">
          <label className="block text-sm font-medium text-purple-900 mb-2">
            Paste email atau teks negosiasi di sini, AI akan mengisi formulir untuk Anda:
          </label>
          <textarea 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none h-24 mb-2"
            placeholder="Contoh: Deal promo dengan PT Indofarma untuk produk OBH Combi diskon 5% periode Januari 2024..."
          />
          <button 
            onClick={handleAiFill} 
            disabled={loadingAI || !aiInput}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loadingAI ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Proses Teks
          </button>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* General Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Surat (Otomatis)</label>
            <input 
              type="text" 
              value={formData.noSurat}
              onChange={(e) => setFormData({...formData, noSurat: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-100 font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kerjasama</label>
            <select 
              value={formData.cooperationType}
              onChange={(e) => setFormData({...formData, cooperationType: e.target.value as any})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="CONSIGNMENT">Consignment</option>
              <option value="OUTRIGHT">Outright</option>
            </select>
          </div>
        </div>

        {/* Principal & Distributor Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">Data Principal</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Principal</label>
              <input type="text" value={formData.principal.nama} onChange={(e) => handleEntityChange('principal', 'nama', e.target.value)} className="w-full p-2 border rounded-md" placeholder="Nama PT / Principal" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.principal.hasNpwp} onChange={(e) => handleEntityChange('principal', 'hasNpwp', e.target.checked)} />
                Ada NPWP?
              </label>
              <input type="text" placeholder="Nomor NPWP" value={formData.principal.npwpNumber} onChange={(e) => handleEntityChange('principal', 'npwpNumber', e.target.value)} className="flex-1 p-2 border rounded-md" disabled={!formData.principal.hasNpwp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Pajak</label>
              <textarea value={formData.principal.alamatPajak} onChange={(e) => handleEntityChange('principal', 'alamatPajak', e.target.value)} className="w-full p-2 border rounded-md h-20 resize-none" placeholder="Alamat lengkap..." />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">Data Distributor</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Distributor</label>
              <input type="text" value={formData.distributor.nama} onChange={(e) => handleEntityChange('distributor', 'nama', e.target.value)} className="w-full p-2 border rounded-md" placeholder="Nama Distributor" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.distributor.hasNpwp} onChange={(e) => handleEntityChange('distributor', 'hasNpwp', e.target.checked)} />
                Ada NPWP?
              </label>
              <input type="text" placeholder="Nomor NPWP" value={formData.distributor.npwpNumber} onChange={(e) => handleEntityChange('distributor', 'npwpNumber', e.target.value)} className="flex-1 p-2 border rounded-md" disabled={!formData.distributor.hasNpwp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Pajak</label>
              <textarea value={formData.distributor.alamatPajak} onChange={(e) => handleEntityChange('distributor', 'alamatPajak', e.target.value)} className="w-full p-2 border rounded-md h-20 resize-none" placeholder="Alamat lengkap..." />
            </div>
          </div>
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
             <input type="date" value={formData.periodStart} onChange={(e) => setFormData({...formData, periodStart: e.target.value})} className="w-full p-2 border rounded-md" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Periode Selesai</label>
             <input type="date" value={formData.periodEnd} onChange={(e) => setFormData({...formData, periodEnd: e.target.value})} className="w-full p-2 border rounded-md" />
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800">Daftar Produk</h3>
            <button onClick={addProduct} className="text-blue-600 text-sm flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"><Plus size={16} /> Tambah Baris</button>
          </div>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 w-12">No</th>
                  <th className="px-4 py-3 w-32">Item Code</th>
                  <th className="px-4 py-3">Nama Produk</th>
                  <th className="px-4 py-3">Mekanisme Promo</th>
                  <th className="px-4 py-3 w-24">Disc %</th>
                  <th className="px-4 py-3 w-32">Potong (Rp)</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {formData.products.map((product, idx) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-2 py-2"><input type="text" value={product.itemCode} onChange={(e) => handleProductChange(product.id, 'itemCode', e.target.value)} className="w-full p-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Kode" /></td>
                    <td className="px-2 py-2"><input type="text" value={product.namaProduk} onChange={(e) => handleProductChange(product.id, 'namaProduk', e.target.value)} className="w-full p-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Nama Produk" /></td>
                    <td className="px-2 py-2"><input type="text" value={product.mekanismePromo} onChange={(e) => handleProductChange(product.id, 'mekanismePromo', e.target.value)} className="w-full p-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Beli 1 Gratis 1" /></td>
                    <td className="px-2 py-2"><input type="number" value={product.discountPercent} onChange={(e) => handleProductChange(product.id, 'discountPercent', parseFloat(e.target.value))} className="w-full p-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none" /></td>
                    <td className="px-2 py-2"><input type="number" value={product.potongHarga} onChange={(e) => handleProductChange(product.id, 'potongHarga', parseFloat(e.target.value))} className="w-full p-1.5 border rounded focus:ring-1 focus:ring-blue-500 outline-none" /></td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => removeProduct(product.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin & Financial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Status Pajak</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.taxStatus === 'INCLUDE'} onChange={() => setFormData({...formData, taxStatus: 'INCLUDE'})} /> Termasuk Tax</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.taxStatus === 'EXCLUDE'} onChange={() => setFormData({...formData, taxStatus: 'EXCLUDE'})} /> Belum Termasuk</label>
              </div>
            </div>
            <div className="space-y-3">
               <label className="block text-sm font-bold text-gray-800">Jenis Kerjasama</label>
               <div>
                 <label className="text-xs text-gray-500">Rafaksi</label>
                 <input type="text" value={formData.jenisKerjasama.rafaksi} onChange={(e) => setFormData({...formData, jenisKerjasama: {...formData.jenisKerjasama, rafaksi: e.target.value}})} className="w-full p-2 border rounded bg-white" placeholder="..." />
               </div>
               <div>
                 <label className="text-xs text-gray-500">Marketing Support</label>
                 <input type="text" value={formData.jenisKerjasama.marketingSupport} onChange={(e) => setFormData({...formData, jenisKerjasama: {...formData.jenisKerjasama, marketingSupport: e.target.value}})} className="w-full p-2 border rounded bg-white" placeholder="..." />
               </div>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-800 mb-2">Jenis Perusahaan</label>
               <div className="space-y-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={formData.jenisPerusahaan.includes('PRORESULT')} onChange={(e) => {
                     const newSet = e.target.checked ? [...formData.jenisPerusahaan, 'PRORESULT'] : formData.jenisPerusahaan.filter(t => t !== 'PRORESULT');
                     setFormData({...formData, jenisPerusahaan: newSet as CompanyType[]});
                   }} />
                   PT Proresult Kreasi Utama
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" checked={formData.jenisPerusahaan.includes('PRIMA_RETAIL')} onChange={(e) => {
                     const newSet = e.target.checked ? [...formData.jenisPerusahaan, 'PRIMA_RETAIL'] : formData.jenisPerusahaan.filter(t => t !== 'PRIMA_RETAIL');
                     setFormData({...formData, jenisPerusahaan: newSet as CompanyType[]});
                   }} />
                   PT Prima Retail Indonesia
                 </label>
               </div>
            </div>
          </div>

          <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
             <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Invoice dibuat atas nama</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.invoiceTo === 'PRINCIPAL'} onChange={() => setFormData({...formData, invoiceTo: 'PRINCIPAL'})} /> Principal</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.invoiceTo === 'DISTRIBUTOR'} onChange={() => setFormData({...formData, invoiceTo: 'DISTRIBUTOR'})} /> Distributor</label>
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Metode Pembayaran</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.paymentType === 'POTONG_TAGIHAN'} onChange={() => setFormData({...formData, paymentType: 'POTONG_TAGIHAN'})} /> Potong Tagihan</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.paymentType === 'TRANSFER'} onChange={() => setFormData({...formData, paymentType: 'TRANSFER'})} /> Transfer</label>
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Potong Tagihan Kepada</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.cutInvoiceTo === 'PRINCIPAL'} onChange={() => setFormData({...formData, cutInvoiceTo: 'PRINCIPAL'})} /> Principal</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formData.cutInvoiceTo === 'DISTRIBUTOR'} onChange={() => setFormData({...formData, cutInvoiceTo: 'DISTRIBUTOR'})} /> Distributor</label>
                </div>
             </div>
          </div>
        </div>

        {/* Shipping PIC */}
        <div className="border-t pt-6">
          <h3 className="font-bold text-gray-800 mb-4">Data PIC & Pengiriman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="text" placeholder="Nama PIC" value={formData.pic.nama} onChange={(e) => setFormData({...formData, pic: {...formData.pic, nama: e.target.value}})} className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none" />
             <input type="email" placeholder="Email PIC" value={formData.pic.email} onChange={(e) => setFormData({...formData, pic: {...formData.pic, email: e.target.value}})} className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none" />
             <input type="text" placeholder="Telepon PIC" value={formData.pic.telepon} onChange={(e) => setFormData({...formData, pic: {...formData.pic, telepon: e.target.value}})} className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none" />
             <textarea placeholder="Alamat Pengiriman" value={formData.pic.alamat} onChange={(e) => setFormData({...formData, pic: {...formData.pic, alamat: e.target.value}})} className="w-full p-2 border rounded h-20 resize-none focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button onClick={onCancel} className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
          <button onClick={() => onSave(formData)} className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
            <Save size={18} /> Simpan Draft
          </button>
        </div>
      </div>
    </div>
  );
};