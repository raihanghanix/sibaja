export interface IPengguna {
  id?: string;
  nama?: string;
  created_at?: string;
  email?: string;
  password?: string;
  peran?: string;
  tim?: string[];
}
export interface IPengajuan {
  id?: string;
  nama?: string;
  created_at?: string;
  pesanan?: boolean;
  status?: string;
  tim?: string;
  disetujui?: boolean;
  selesai?: string | null;
}
export interface IDokumen {
  id?: string;
  nama?: string;
  created_at?: string;
  pengajuan?: IPengajuan;
  pengguna?: IPengguna;
  status?: string;
  tipe?: TDokumen;
}
export interface IKotakMasuk {
  id?: string;
  created_at?: string;
  pengguna?: IPengguna;
  pesan?: string;
  dibaca?: boolean;
}

export type TPeran = "Ketua Tim" | "PJ" | "PPK" | "PBJ" | "Bendahara" | "Admin";

export type TDokumen =
  | "kak"
  | "fp"
  | "spp"
  | "spph"
  | "st"
  | "drk"
  | "rabhps"
  | "sppp"
  | "ban"
  | "bahp"
  | "spk"
  | "spmk"
  | "sppbj"
  | "sksp"
  | "bast"
  | "bapp"
  | "bap"
  | "pp"
  | "spm"
  | "kui"
  | "sp";

export const teams = [
  "Tim SPIP",
  "Tim Jambi",
  "Tim IPDS, Konsultansi Statistik, Pelayanan Publik, Penyusunan DDA",
  "Tim Statistik Produksi",
  "Tim Penilai Kinerja",
  "Tim NWAS",
  "Tim Statistik Distribusi",
  "Tim Statistik Sosial",
  "Tim Umum",
  "Tim MR dan QG",
  "Tim Kerja Reformasi Birokrasi",
  "Tim Rekomendasi Statistik, Metadata, EPSS",
  "Tim Pojok Statistik",
  "Tim Desa Cantik",
];

export const roles: TPeran[] = [
  "Admin",
  "PJ",
  "Ketua Tim",
  "PPK",
  "PBJ",
  "Bendahara",
];
