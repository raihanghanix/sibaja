import { createRouter, createWebHistory } from "vue-router";
import { getCookies } from "../utils/cookies";
import type { IPengguna } from "../models/types";
import Beranda from "../views/Beranda.vue";
import PengajuanDetail from "../views/PengajuanDetail.vue";
import PengajuanDokumen from "../views/PengajuanDokumen.vue";
import PengajuanAktivitas from "../views/PengajuanAktivitas.vue";
import TambahPengajuan from "../views/TambahPengajuan.vue";
import TambahDokumen from "../views/TambahDokumen.vue";
import TambahLampiran from "../views/TambahLampiran.vue";
import AktivitasTim from "../views/AktivitasTim.vue";
import AdminPengguna from "../views/AdminPengguna.vue";
import AdminPengajuan from "../views/AdminPengajuan.vue";
import AdminDokumen from "../views/AdminDokumen.vue";
import AdminTambahPengguna from "../views/AdminTambahPengguna.vue";
import AdminEditPengguna from "../views/AdminEditPengguna.vue";
import AdminEditPengajuan from "../views/AdminEditPengajuan.vue";
import AdminEditDokumen from "../views/AdminEditDokumen.vue";
import Profil from "../views/Profil.vue";
import Login from "../views/Login.vue";

const validateUser = () => {
  const currUser = getCookies<IPengguna>("sessionId");
  if (!currUser) return "/login";
};

const routes = [
  {
    path: "/",
    component: Beranda,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/pengajuan",
    component: PengajuanDetail,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/dokumen",
    component: PengajuanDokumen,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/aktivitas-pengajuan",
    component: PengajuanAktivitas,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/tambah-dokumen",
    component: TambahDokumen,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/tambah-pengajuan",
    component: TambahPengajuan,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/tambah-lampiran",
    component: TambahLampiran,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/aktivitas",
    component: AktivitasTim,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-pengguna",
    component: AdminPengguna,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-pengajuan",
    component: AdminPengajuan,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-dokumen",
    component: AdminDokumen,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-tambah-pengguna",
    component: AdminTambahPengguna,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-edit-pengguna",
    component: AdminEditPengguna,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-edit-pengajuan",
    component: AdminEditPengajuan,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/admin-edit-dokumen",
    component: AdminEditDokumen,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/profil",
    component: Profil,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/login",
    component: Login,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes,
});
