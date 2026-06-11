<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen as Dok } from '../models/Dokumen';
import type { IDokumen, IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Dokumen from '../components/Dokumen.vue';
import Lampiran from '../components/Lampiran.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dok.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'pj')
const detailPengajuan = ref<IPengajuan>({})
const daftarDokumen = ref<IDokumen[]>([])
const isLoading = ref<boolean>(false)

function reset() {
  filter.value = currRoute.value.query.filter as string ?? 'pj'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLInputElement
  router.push(`/?view=dokumen-pengajuan&id=${currRoute.value.query.id}&filter=${target.value}`)
}

async function getData() {
  if (!currRoute.value.query.id) {
    alert('Id tidak ditemukan!')
    return router.replace('/')
  }
  try {
    isLoading.value = true
    reset()
    const dataPengajuan = await pengajuanModel.getById(currRoute.value.query.id as string)
    const dataDokumen = await dokumenModel.getByPengajuan(currRoute.value.query.id as string)
    daftarDokumen.value = dataDokumen
    detailPengajuan.value = dataPengajuan[0]!
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.replace('/')
    }
  } finally {
    isLoading.value = false
  }
}

watch(currRoute, () => {
  currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
  if (!currUser) {
    router.replace('/?view=login')
    return
  }
  getData()
}, { immediate: true })
</script>

<template>
  <Navbar />
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">{{ detailPengajuan?.nama ?? '...' }}</p>
        <button @click="() => router.go(-1)" class="link link-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <RouterLink :to="`/?view=detail-pengajuan&id=${currRoute.query.id}`"
        :class="`btn btn-xs ${currRoute.query.view === 'detail-pengajuan' && 'btn-secondary'}`">
        Detail Pengajuan
      </RouterLink>
      <RouterLink :to="`/?view=dokumen-pengajuan&id=${currRoute.query.id}`"
        :class="`btn btn-xs ${currRoute.query.view === 'dokumen-pengajuan' && 'btn-secondary'}`">
        Dokumen Pengajuan
      </RouterLink>
      <RouterLink :to="`/?view=aktivitas-pengajuan&id=${currRoute.query.id}`"
        :class="`btn btn-xs ${currRoute.query.view === 'aktivitas-pengajuan' && 'btn-secondary'}`">
        Aktivitas Pengajuan
      </RouterLink>
    </div>

    <div class="flex gap-2 max-sm:flex-col">
      <fieldset class="flex-1 fieldset">
        <legend class="fieldset-legend">Tipe Dokumen</legend>
        <select v-model="filter" @change="handleFilter" class="w-full select">
          <option value="pj">PJ (3)</option>
          <option value="ppk">PPK (10)</option>
          <option value="pbj">PBJ (2)</option>
          <option value="bendahara">Bendahara (1)</option>
          <option value="lampiran">Lampiran ({{daftarDokumen.filter((i) => i.tipe === 'lampiran').length ?? 0}})
          </option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <button @click="getData" class="btn"><i class="fa-solid fa-rotate"></i> Refresh</button>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <RouterLink :to="`/?view=tambah-lampiran&id=${currRoute.query.id}`" class="btn btn-soft btn-primary">
          <i class="fa-solid fa-plus"></i> Lampiran Baru
        </RouterLink>
      </fieldset>
    </div>

    <div v-if="filter === 'lampiran'" class="divider">Menampilkan {{daftarDokumen.filter((i) => i.tipe ===
      'lampiran').length
      ?? 0}} Lampiran</div>
    <div v-else class="divider">Menampilkan Dokumen {{ filter.toUpperCase() }}</div>

    <div v-if="filter === 'pj' && !isLoading" class="flex flex-col gap-2">
      <Dokumen title="Kerangka Acuan Kerja" :data="daftarDokumen.find((i) => i.tipe === 'kak') ?? null" uploader="PJ"
        validator="PPK" tipe="kak" />
      <Dokumen title="Form Permintaan" :data="daftarDokumen.find((i) => i.tipe === 'fp') ?? null" uploader="PJ"
        validator="PPK" tipe="fp" />
      <Dokumen title="Surat Permintaan ke PPK" :data="daftarDokumen.find((i) => i.tipe === 'spp') ?? null" uploader="PJ"
        validator="PPK" tipe="spp" />
    </div>
    <div v-if="filter === 'ppk' && !isLoading" class="flex flex-col gap-2">
      <Dokumen title="Dokumen Rancangan Kontrak" :data="daftarDokumen.find((i) => i.tipe === 'drk') ?? null"
        uploader="PPK" validator="PBJ" tipe="drk" :id-pbj="detailPengajuan.pbj?.id" />
      <Dokumen title="Spekteknis" :data="daftarDokumen.find((i) => i.tipe === 'st') ?? null" uploader="PPK"
        validator="PBJ" tipe="st" :id-pbj="detailPengajuan.pbj?.id" />
      <Dokumen title="RAB/HPS (Harga Perkiraan Sendiri)" :data="daftarDokumen.find((i) => i.tipe === 'rabhps') ?? null"
        uploader="PPK" validator="PBJ" tipe="rabhps" :id-pbj="detailPengajuan.pbj?.id" />
      <Dokumen title="Surat Penunjukan Pejabat Pengadaan" :data="daftarDokumen.find((i) => i.tipe === 'sppp') ?? null"
        uploader="PPK" validator="PBJ" tipe="sppp" :id-pbj="detailPengajuan.pbj?.id" />
      <Dokumen title="Surat Penetapan Pemenang Barang dan Jasa"
        :data="daftarDokumen.find((i) => i.tipe === 'sppbj') ?? null" uploader="PPK" validator="PPK" tipe="sppbj" />
      <Dokumen title="Surat Kontrak atau Surat Pesanan" :data="daftarDokumen.find((i) => i.tipe === 'sksp') ?? null"
        uploader="PPK" validator="PPK" tipe="sksp" />
      <Dokumen title="Berita Acara Serah Terima Pekerjaan" :data="daftarDokumen.find((i) => i.tipe === 'bast') ?? null"
        uploader="PPK" validator="PPK" tipe="bast" />
      <Dokumen title="Berita Acara Pembayaran" :data="daftarDokumen.find((i) => i.tipe === 'bap') ?? null"
        uploader="PPK" validator="PPK" tipe="bap" />
      <Dokumen title="Kuitansi" :data="daftarDokumen.find((i) => i.tipe === 'kui') ?? null" uploader="PPK"
        validator="PPK" tipe="kui" />
      <Dokumen title="Surat Pesanan" :data="daftarDokumen.find((i) => i.tipe === 'sp') ?? null" uploader="PPK"
        validator="PPK" tipe="sp" />
    </div>
    <div v-if="filter === 'pbj' && !isLoading" class="flex flex-col gap-2">
      <Dokumen title="Berita Acara Negosiasi" :data="daftarDokumen.find((i) => i.tipe === 'ban') ?? null" uploader="PBJ"
        validator="PPK" tipe="ban" :id-pbj="detailPengajuan.pbj?.id" />
      <Dokumen title="Berita Acara Berhasil Pemilihan" :data="daftarDokumen.find((i) => i.tipe === 'bahp') ?? null"
        uploader="PBJ" validator="PPK" tipe="bahp" :id-pbj="detailPengajuan.pbj?.id" />
    </div>
    <div v-if="filter === 'bendahara' && !isLoading" class="flex flex-col gap-2">
      <Dokumen title="Surat Perintah Membayar" :data="daftarDokumen.find((i) => i.tipe === 'spm') ?? null"
        uploader="Bendahara" validator="PPK" tipe="spm" />
    </div>
    <div v-if="filter === 'lampiran' && !isLoading" class="flex flex-col gap-2">
      <Lampiran :data="daftarDokumen.filter((i) => i.tipe === 'lampiran') ?? null" tipe="lampiran" />
    </div>
  </div>
</template>