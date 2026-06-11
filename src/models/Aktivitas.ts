import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type { IAktivitas, IPengajuan, IPengguna } from "./types";

export class Aktivitas implements IAktivitas {
  private static instance: Aktivitas;

  id?: string = "";
  created_at?: string = "";
  pengguna?: IPengguna = {};
  pengajuan?: IPengajuan = {};
  pesan?: string = "";
  khusus?: boolean = false;

  public get(): IAktivitas {
    return {
      id: this.id,
      created_at: this.created_at,
      pengguna: this.pengguna,
      pengajuan: this.pengajuan,
      pesan: this.pesan,
      khusus: this.khusus,
    };
  }

  public set(val: IAktivitas) {
    this.id = val.id;
    this.created_at = val.created_at;
    this.pengguna = val.pengguna;
    this.pengajuan = val.pengajuan;
    this.pesan = val.pesan;
    this.khusus = val.khusus;
  }

  public async getAll(sort: string, khusus: boolean) {
    const { data, error } = (await supabase
      .from("aktivitas")
      .select("*, pengguna (*)")
      .eq("khusus", khusus)
      .order("created_at", {
        ascending: sort === "asc" ? true : false,
      })) as PostgrestSingleResponse<IAktivitas[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getById(id: string) {
    const { data, error } = (await supabase
      .from("aktivitas")
      .select("*, pengguna (*)")
      .eq("id", id)) as PostgrestSingleResponse<IAktivitas[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPengguna(pengguna: string) {
    const { data, error } = (await supabase
      .from("aktivitas")
      .select("*, pengguna (*)")
      .eq("pengguna", pengguna)
      .order("dibaca", { ascending: true })
      .order("created_at", { ascending: false })) as PostgrestSingleResponse<
      IAktivitas[]
    >;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPesan(pesan: string) {
    const { data, error } = (await supabase
      .from("aktivitas")
      .select("*, pengguna (*)")
      .eq("pesan", pesan)) as PostgrestSingleResponse<IAktivitas[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByDibaca(dibaca: boolean) {
    const { data, error } = (await supabase
      .from("aktivitas")
      .select("*, pengguna (*)")
      .eq("dibaca", dibaca)) as PostgrestSingleResponse<IAktivitas[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async updateAll(id: string, val: IAktivitas) {
    const query = (await supabase
      .from("aktivitas")
      .update(val)
      .eq("pengguna", id)) as PostgrestSingleResponse<null[]>;
    if (query.error) return false;
    else return true;
  }

  public async updateById(id: string, val: IAktivitas) {
    const query = (await supabase
      .from("aktivitas")
      .update(val)
      .eq("id", id)) as PostgrestSingleResponse<null[]>;
    if (query.error) return false;
    else return true;
  }

  public async deleteById(id: string) {
    const query = (await supabase
      .from("aktivitas")
      .delete()
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (query.error) return false;
    else return true;
  }

  public async deleteByPengguna(pengguna: string) {
    const query = (await supabase
      .from("aktivitas")
      .delete()
      .eq("pengguna", pengguna)) as PostgrestSingleResponse<null>;
    if (query.error) return false;
    else return true;
  }

  public async insert(
    pengguna: string,
    pengajuan: string | null,
    pesan: string,
    khusus: boolean,
  ) {
    const { error } = (await supabase.from("aktivitas").insert({
      id: crypto.randomUUID(),
      pengguna,
      pengajuan,
      pesan,
      khusus,
    })) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new Aktivitas();
    return this.instance;
  }
}
