<script setup lang="ts">
import { useRouter } from 'vue-router';
import Login from '../components/Login.vue';
import Beranda from '../components/Beranda.vue';
import AktivitasTim from '../components/AktivitasTim.vue';
import DetailPengajuan from '../components/DetailPengajuan.vue';
import DokumenPengajuan from '../components/DokumenPengajuan.vue';
import AktivitasPengajuan from '../components/AktivitasPengajuan.vue';
import TambahDokumen from '../components/TambahDokumen.vue';
import TambahLampiran from '../components/TambahLampiran.vue';
import PengajuanBaru from '../components/PengajuanBaru.vue';
import AdminPengguna from '../components/AdminPengguna.vue';
import AdminEditPengguna from '../components/AdminEditPengguna.vue';
import AdminTambahPengguna from '../components/AdminTambahPengguna.vue';
import AdminPengajuan from '../components/AdminPengajuan.vue';
import AdminEditPengajuan from '../components/AdminEditPengajuan.vue';
import AdminDokumen from '../components/AdminDokumen.vue';
import AdminEditDokumen from '../components/AdminEditDokumen.vue';
import Profil from '../components/Profil.vue';
import { watch } from 'vue';

const router = useRouter()
const currRoute = router.currentRoute

watch(currRoute, () => {
  if (!currRoute.value.query.view) {
    router.replace('/?view=beranda')
  }
}, { immediate: true })
</script>

<template>
  <Login v-if="currRoute.query.view === 'login'" />
  <Beranda v-if="currRoute.query.view === 'beranda'" />
  <AktivitasTim v-if="currRoute.query.view === 'aktivitas-tim'" />
  <DetailPengajuan v-if="currRoute.query.view === 'detail-pengajuan'" />
  <DokumenPengajuan v-if="currRoute.query.view === 'dokumen-pengajuan'" />
  <AktivitasPengajuan v-if="currRoute.query.view === 'aktivitas-pengajuan'" />
  <TambahDokumen v-if="currRoute.query.view === 'tambah-dokumen'" />
  <TambahLampiran v-if="currRoute.query.view === 'tambah-lampiran'" />
  <PengajuanBaru v-if="currRoute.query.view === 'pengajuan-baru'" />
  <AdminPengguna v-if="currRoute.query.view === 'admin-pengguna'" />
  <AdminEditPengguna v-if="currRoute.query.view === 'admin-edit-pengguna'" />
  <AdminTambahPengguna v-if="currRoute.query.view === 'admin-tambah-pengguna'" />
  <AdminPengajuan v-if="currRoute.query.view === 'admin-pengajuan'" />
  <AdminEditPengajuan v-if="currRoute.query.view === 'admin-edit-pengajuan'" />
  <AdminDokumen v-if="currRoute.query.view === 'admin-dokumen'" />
  <AdminEditDokumen v-if="currRoute.query.view === 'admin-edit-dokumen'" />
  <Profil v-if="currRoute.query.view === 'profil'" />
</template>