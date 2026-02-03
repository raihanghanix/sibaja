import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type { IDokumen, IPengajuan, IPengguna, TDokumen } from "./types";

export class Dokumen implements IDokumen {
  private static instance: Dokumen;

  id?: string = "";
  nama?: string = "";
  created_at?: string = "";
  pengajuan?: IPengajuan = {};
  pengguna?: IPengguna = {};
  status?: string = "";
  tipe?: TDokumen = "kak";

  public get(): IDokumen {
    return {
      id: this.id,
      nama: this.nama,
      created_at: this.created_at,
      pengajuan: this.pengajuan,
      pengguna: this.pengguna,
      status: this.status,
      tipe: this.tipe,
    };
  }

  public set(val: IDokumen) {
    this.id = val.id;
    this.nama = val.nama;
    this.created_at = val.created_at;
    this.pengajuan = val.pengajuan;
    this.pengguna = val.pengguna;
    this.status = val.status;
    this.tipe = val.tipe;
  }

  public async getAll() {
    const { error, data } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")) as PostgrestSingleResponse<
      IDokumen[]
    >;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getById(id: string) {
    const { data, error } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")
      .eq("id", id)) as PostgrestSingleResponse<IDokumen[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPengajuan(pengajuan: string) {
    const { data, error } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")
      .eq("pengajuan", pengajuan)) as PostgrestSingleResponse<IDokumen[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPengguna(pengguna: string) {
    const { data, error } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")
      .eq("pengguna", pengguna)) as PostgrestSingleResponse<IDokumen[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByStatus(status: "Diproses" | "Valid" | "Tidak valid") {
    const { data, error } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")
      .eq("status", status)) as PostgrestSingleResponse<IDokumen[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByTipe(tipe: TDokumen) {
    const { data, error } = (await supabase
      .from("dokumen")
      .select("*, pengajuan (*), pengguna (*)")
      .eq("tipe", tipe)) as PostgrestSingleResponse<IDokumen[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async updateById(id: string, val: IDokumen) {
    const { error } = (await supabase
      .from("dokumen")
      .update(val)
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async deleteById(id: string) {
    const { error } = (await supabase
      .from("dokumen")
      .delete()
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async deleteByPengajuan(id: string, tipe: string) {
    const { data, error: selectError } = await supabase
      .from("dokumen")
      .select("id")
      .eq("pengajuan", id)
      .eq("tipe", tipe);
    if (selectError) throw new Error(selectError.message);
    const ids = data?.map((i) => i.id) as string[];
    const { error: deleteError } = (await supabase
      .from("dokumen")
      .delete()
      .eq("pengajuan", id)
      .eq("tipe", tipe)) as PostgrestSingleResponse<null>;
    if (deleteError) throw new Error(deleteError.message);
    this.deleteFile(ids[0]!);
  }

  public async insert(
    id: string,
    pengajuan: string,
    pengguna: string,
    tipe: TDokumen,
    nama: string | null = null,
  ) {
    const { error } = (await supabase.from("dokumen").insert({
      id,
      pengajuan,
      pengguna,
      tipe,
      nama,
    })) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async upload(fileName: string, file: File) {
    const { error } = await supabase.storage
      .from("dokumen")
      .upload(fileName, file);
    if (error) throw new Error(error.message);
  }

  public async deleteFile(id: string) {
    const { error } = await supabase.storage.from("dokumen").remove([id]);
    if (error) throw new Error(error.message);
  }

  public async deleteFiles(id: string) {
    const dokumen = await this.getByPengajuan(id);
    const ids = dokumen.map((i) => i.id!);
    if (!ids.length) return;
    const { error } = await supabase.storage.from("dokumen").remove(ids);
    if (error) throw new Error(error.message);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new Dokumen();
    return this.instance;
  }
}
