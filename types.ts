export type CooperationType = 'CONSIGNMENT' | 'OUTRIGHT';
export type TaxStatus = 'INCLUDE' | 'EXCLUDE';
export type CompanyType = 'PRORESULT' | 'PRIMA_RETAIL';
export type EntityType = 'PRINCIPAL' | 'DISTRIBUTOR';
export type PaymentType = 'POTONG_TAGIHAN' | 'TRANSFER';

export interface ProductItem {
  id: string;
  itemCode: string;
  namaProduk: string;
  mekanismePromo: string;
  discountPercent: number;
  potongHarga: number;
}

export interface EntityInfo {
  nama: string;
  hasNpwp: boolean;
  npwpNumber: string;
  alamatPajak: string;
}

export interface PicInfo {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
}

export interface SKPData {
  id: string;
  noSurat: string;
  cooperationType: CooperationType;
  principal: EntityInfo;
  distributor: EntityInfo;
  periodStart: string;
  periodEnd: string;
  products: ProductItem[];
  taxStatus: TaxStatus;
  jenisKerjasama: {
    rafaksi: string;
    marketingSupport: string;
  };
  jenisPerusahaan: CompanyType[];
  invoiceTo: EntityType;
  paymentType: PaymentType;
  cutInvoiceTo: EntityType;
  pic: PicInfo;
  createdAt: string;
  status: 'Draft' | 'Final';
  // New signature fields (Base64 string)
  signatureAlpro?: string;
  signaturePrincipal?: string;
}