import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type { IPengajuan } from "./types";

export class Pengajuan implements IPengajuan {
  private static instance: Pengajuan;

  id?: string = "";
  nama?: string = "";
  created_at?: string = "";
  pesanan?: boolean = false;
  status?: string = "";
  tim?: string = "";
  disetujui?: boolean = false;
  selesai?: string | null = "";

  public get(): IPengajuan {
    return {
      id: this.id,
      nama: this.nama,
      created_at: this.created_at,
      pesanan: this.pesanan,
      status: this.status,
      tim: this.tim,
      disetujui: this.disetujui,
      selesai: this.selesai,
    };
  }

  public set(val: IPengajuan) {
    this.id = val.id;
    this.nama = val.nama;
    this.created_at = val.created_at;
    this.pesanan = val.pesanan;
    this.status = val.status;
    this.tim = val.tim;
    this.disetujui = val.disetujui;
    this.selesai = val.selesai;
  }

  public async getAll() {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getById(id: string) {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .eq("id", id)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByNama(nama: string) {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .eq("nama", nama)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPesanan(pesanan: boolean) {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .eq("pesanan", pesanan)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByStatus(status: "Diproses" | "Selesai" | "Ditolak") {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .eq("status", status)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByTim(tim: string[]) {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .ilikeAnyOf("tim", tim)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getBySetujui(setujui: boolean) {
    const { data, error } = (await supabase
      .from("pengajuan")
      .select("*")
      .eq("setujui", setujui)) as PostgrestSingleResponse<IPengajuan[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async updateById(id: string, val: IPengajuan) {
    const { error } = (await supabase
      .from("pengajuan")
      .update(val)
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async deleteById(id: string) {
    const { error } = (await supabase
      .from("pengajuan")
      .delete()
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async insert(val: IPengajuan) {
    const { error } = (await supabase
      .from("pengajuan")
      .insert(val)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new Pengajuan();
    return this.instance;
  }
}
