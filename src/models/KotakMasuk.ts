import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type { IDokumen, IKotakMasuk, IPengguna, TPeran } from "./types";

export class KotakMasuk implements IKotakMasuk {
  private static instance: KotakMasuk;

  id?: string = "";
  created_at?: string = "";
  pengguna?: IPengguna = {};
  pesan?: string = "";
  dibaca?: boolean = false;

  public get(): IKotakMasuk {
    return {
      id: this.id,
      created_at: this.created_at,
      pengguna: this.pengguna,
      pesan: this.pesan,
      dibaca: this.dibaca,
    };
  }

  public set(val: IKotakMasuk) {
    this.id = val.id;
    this.created_at = val.created_at;
    this.pengguna = val.pengguna;
    this.pesan = val.pesan;
    this.dibaca = val.dibaca;
  }

  public async getAll() {
    const { data, error } = (await supabase
      .from("kotak_masuk")
      .select("*, pengguna (*)")) as PostgrestSingleResponse<IKotakMasuk[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getById(id: string) {
    const { data, error } = (await supabase
      .from("kotak_masuk")
      .select("*, pengguna (*)")
      .eq("id", id)) as PostgrestSingleResponse<IKotakMasuk[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPengguna(pengguna: string) {
    const { data, error } = (await supabase
      .from("kotak_masuk")
      .select("*, pengguna (*)")
      .eq("pengguna", pengguna)
      .order("dibaca", { ascending: true })
      .order("created_at", { ascending: false })) as PostgrestSingleResponse<
      IKotakMasuk[]
    >;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPesan(pesan: string) {
    const { data, error } = (await supabase
      .from("kotak_masuk")
      .select("*, pengguna (*)")
      .eq("pesan", pesan)) as PostgrestSingleResponse<IKotakMasuk[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByDibaca(dibaca: boolean) {
    const { data, error } = (await supabase
      .from("kotak_masuk")
      .select("*, pengguna (*)")
      .eq("dibaca", dibaca)) as PostgrestSingleResponse<IKotakMasuk[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async updateAll(id: string, val: IKotakMasuk) {
    const query = (await supabase
      .from("kotak_masuk")
      .update(val)
      .eq("pengguna", id)) as PostgrestSingleResponse<null[]>;
    if (query.error) return false;
    else return true;
  }

  public async updateById(id: string, val: IKotakMasuk) {
    const query = (await supabase
      .from("kotak_masuk")
      .update(val)
      .eq("id", id)) as PostgrestSingleResponse<null[]>;
    if (query.error) return false;
    else return true;
  }

  public async deleteById(id: string) {
    const query = (await supabase
      .from("kotak_masuk")
      .delete()
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (query.error) return false;
    else return true;
  }

  public async deleteByPengguna(pengguna: string) {
    const query = (await supabase
      .from("kotak_masuk")
      .delete()
      .eq("pengguna", pengguna)) as PostgrestSingleResponse<null>;
    if (query.error) return false;
    else return true;
  }

  public async insert(pengguna: string, pesan: string) {
    const { error } = (await supabase.from("kotak_masuk").insert({
      id: crypto.randomUUID(),
      pengguna,
      pesan,
    })) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new KotakMasuk();
    return this.instance;
  }
}
