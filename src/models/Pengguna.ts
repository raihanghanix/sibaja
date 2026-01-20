import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type { IPengguna, TPeran } from "./types";

export class Pengguna implements IPengguna {
  private static instance: Pengguna;

  id?: string = "";
  nama?: string = "";
  created_at?: string = "";
  email?: string = "";
  password?: string = "";
  peran?: string = "";
  tim?: string[] = [];

  public get(): IPengguna {
    return {
      id: this.id,
      nama: this.nama,
      created_at: this.created_at,
      email: this.email,
      password: this.password,
      peran: this.peran,
      tim: this.tim,
    };
  }

  public set(val: IPengguna) {
    this.id = val.id;
    this.nama = val.nama;
    this.created_at = val.created_at;
    this.email = val.email;
    this.password = val.password;
    this.peran = val.peran;
    this.tim = val.tim;
  }

  public async getAll() {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getById(id: string) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .eq("id", id)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByNama(nama: string) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .eq("nama", nama)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByEmail(email: string) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .eq("email", email)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPassword(password: string) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .eq("password", password)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByPeran(peran: TPeran) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .eq("peran", peran)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  public async getByTim(tim: string[]) {
    const { data, error } = (await supabase
      .from("pengguna")
      .select("*")
      .contains("tim", tim)) as PostgrestSingleResponse<IPengguna[]>;
    if (error) throw new Error(error.message);
    return data;
  }

  // public async getByTeam(team: string[]) {
  //   const query = (await supabase
  //     .from("pengguna")
  //     .select("*")
  //     .contains("tim", team)) as PostgrestSingleResponse<IPengguna[]>;
  //   if (query.error) {
  //     return null;
  //   } else if (query.data && query.data.length > 0) {
  //     return query.data;
  //   } else {
  //     return null;
  //   }
  // }

  public async updateById(id: string, val: IPengguna) {
    const { error } = (await supabase
      .from("pengguna")
      .update(val)
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async deleteById(id: string) {
    const { error } = (await supabase
      .from("pengguna")
      .delete()
      .eq("id", id)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public async insert(val: IPengguna) {
    const { error } = (await supabase
      .from("pengguna")
      .insert(val)) as PostgrestSingleResponse<null>;
    if (error) throw new Error(error.message);
  }

  public static getInstance() {
    if (!this.instance) this.instance = new Pengguna();
    return this.instance;
  }
}
