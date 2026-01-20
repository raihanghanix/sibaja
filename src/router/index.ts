import {
  createRouter,
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router";

import Beranda from "../views/Beranda.vue";
import Login from "../views/Login.vue";
import KotakMasuk from "../views/KotakMasuk.vue";
import Pengajuan from "../views/Pengajuan.vue";
import DetailDokumen from "../views/DetailDokumen.vue";
import TambahPengajuan from "../views/TambahPengajuan.vue";
import Profil from "../views/Profil.vue";
import { getCookies } from "../utils/cookies";
import { IPengguna } from "../models/types";
import MenuAdmin from "../views/MenuAdmin.vue";
import TambahPengguna from "../views/TambahPengguna.vue";
import DetailPengguna from "../views/DetailPengguna.vue";
import DetailPengajuan from "../views/DetailPengajuan.vue";
import Dokumen from "../views/Dokumen.vue";

const validateUser = (
  to?: RouteLocationNormalized,
  from?: RouteLocationNormalized
) => {
  const pengguna = getCookies<IPengguna>("sessionId");
  if (!pengguna) {
    return "/login";
  } else if (to?.fullPath === "/tambah-pengajuan" && pengguna.peran !== "PJ") {
    return "/";
  } else if (to?.fullPath === "/menu-admin" && pengguna.peran !== "Admin") {
    return "/";
  } else if (
    to?.fullPath === "/menu-admin/tambah-pengguna" &&
    pengguna.peran !== "Admin"
  ) {
    return "/";
  } else if (
    to?.fullPath === "/menu-admin/pengguna/:id" &&
    pengguna.peran !== "Admin"
  ) {
    return "/";
  } else if (
    to?.fullPath === "/menu-admin/pengajuan/:id" &&
    pengguna.peran !== "Admin"
  ) {
    return "/";
  } else if (
    to?.fullPath === "/menu-admin/dokumen/:id" &&
    pengguna.peran !== "Admin"
  ) {
    return "/";
  }
};

const routes = [
  { path: "/", component: Beranda, beforeEnter: () => validateUser() },

  {
    path: "/tambah-pengajuan",
    component: TambahPengajuan,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/pengajuan/:id",
    component: Pengajuan,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/pengajuan/:id/:tipe",
    component: DetailDokumen,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/kotak-masuk",
    component: KotakMasuk,
    beforeEnter: () => validateUser(),
  },
  {
    path: "/menu-admin",
    component: MenuAdmin,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/menu-admin/tambah-pengguna",
    component: TambahPengguna,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/menu-admin/pengguna/:id",
    component: DetailPengguna,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/menu-admin/pengajuan/:id",
    component: DetailPengajuan,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/menu-admin/dokumen/:id",
    component: Dokumen,
    beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized) =>
      validateUser(to, from),
  },
  {
    path: "/profil",
    component: Profil,
    beforeEnter: () => validateUser(),
  },
  { path: "/login", component: Login, beforeEnter: () => {} },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
