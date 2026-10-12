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

    if (detailPengajuan.value.tahap === 1) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'kak' || i.tipe === 'fp' || i.tipe === 'spp').length === 3
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 2 })
        detailPengajuan.value.tahap = 2
      }
    }

    else if (detailPengajuan.value.tahap === 2) {
      const dok = daftarDokumen.value.filter((i) => i.tipe === 'kak' || i.tipe === 'fp' || i.tipe === 'spp')
      const jumlahDok = dok.filter((i) => i.status === "Valid").length === 3
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 3 })
        detailPengajuan.value.tahap = 3
      }
    }

    else if (detailPengajuan.value.tahap === 3) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'drk' || i.tipe === 'st' || i.tipe === 'rabhps' || i.tipe === 'sppp').length === 4
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 4 })
        detailPengajuan.value.tahap = 4
      }
    }

    else if (detailPengajuan.value.tahap === 4) {
      const dok = daftarDokumen.value.filter((i) => i.tipe === 'drk' || i.tipe === 'st' || i.tipe === 'rabhps' || i.tipe === 'sppp')
      const jumlahDok = dok.filter((i) => i.status === "Valid").length === 4
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 5 })
        detailPengajuan.value.tahap = 5
      }
    }

    else if (detailPengajuan.value.tahap === 5) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'ban' || i.tipe === 'bahp').length === 2
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 6 })
        detailPengajuan.value.tahap = 6
      }
    }

    else if (detailPengajuan.value.tahap === 6) {
      const dok = daftarDokumen.value.filter((i) => i.tipe === 'ban' || i.tipe === 'bahp')
      const jumlahDok = dok.filter((i) => i.status === "Valid").length === 2
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 7 })
        detailPengajuan.value.tahap = 7
      }
    }

    else if (detailPengajuan.value.tahap === 7) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'sppbj' || i.tipe === 'sksp').length === 2
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 8 })
        detailPengajuan.value.tahap = 8
      }
    }

    else if (detailPengajuan.value.tahap === 9) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'bap' || i.tipe === 'bast').length === 2
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 10 })
        detailPengajuan.value.tahap = 10
      }
    }

    else if (detailPengajuan.value.tahap === 10) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'spm').length === 1
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 11 })
        detailPengajuan.value.tahap = 11
      }
    }

    else if (detailPengajuan.value.tahap === 11) {
      const dok = daftarDokumen.value.filter((i) => i.tipe === 'spm')
      const jumlahDok = dok.filter((i) => i.status === "Valid").length === 1
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 12 })
        detailPengajuan.value.tahap = 12
      }
    }

    else if (detailPengajuan.value.tahap === 12) {
      const jumlahDok = daftarDokumen.value.filter((i) => i.tipe === 'kui' || i.tipe === 'sp').length === 2
      if (jumlahDok) {
        await pengajuanModel.updateById(currRoute.value.query.id as string, { tahap: 13 })
        detailPengajuan.value.tahap = 13
      }
    }

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
        <button @click="() => router.go(-1)" class="link bg-base-200 px-2 rounded-sm">
          <i class="fa-solid fa-chevron-left"></i> Kembali
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

    <div class="card bg-primary text-primary-content w-full card-sm">
      <div class="card-body">
        <h2 class="card-title"><i class="fa-solid fa-info-circle"></i> Tahap {{ detailPengajuan.tahap }}</h2>
        <p v-if="detailPengajuan.tahap === 1">PJ mengunggah Kerangka Acuan Kerja, Form Permintaan, dan Surat Permintaan
          ke PPK
        </p>
        <p v-if="detailPengajuan.tahap === 2">PPK memvalidasi Kerangka Acuan Kerja, Form Permintaan, dan Surat
          Permintaan ke
          PPK
        </p>
        <p v-if="detailPengajuan.tahap === 3">PPK mengunggah Dokumen Rancangan Kontrak, Spekteknis, Harga Perkiraan
          Sendiri,
          dan Surat Penunjukan Pejabat Pengadaan</p>
        <p v-if="detailPengajuan.tahap === 4">PBJ memvalidasi Dokumen Rancangan Kontrak, Spekteknis, Harga Perkiraan
          Sendiri,
          dan Surat Penunjukan Pejabat Pengadaan</p>
        <p v-if="detailPengajuan.tahap === 5">PBJ mengunggah Berita Acara Negosiasi, Berita Acara Berhasil Pemilihan</p>
        <p v-if="detailPengajuan.tahap === 6">PPK memvalidasi Berita Acara Negosiasi, Berita Acara Berhasil Pemilihan
        </p>
        <p v-if="detailPengajuan.tahap === 7">PPK mengunggah Surat Penetapan Pemenang Barang dan Jasa, Surat
          Kontrak/Pesanan
        </p>
        <p v-if="detailPengajuan.tahap === 8">PBJ menyelesaikan pesanan pada pengajuan ini</p>
        <p v-if="detailPengajuan.tahap === 9">PPK mengunggah Berita Acara Serah Terima Pekerjaan, Berita Acara
          Pembayaran
        </p>
        <p v-if="detailPengajuan.tahap === 10">Bendahara mengunggah Surat Perintah Pembayaran dan mencairkan dana
        </p>
        <p v-if="detailPengajuan.tahap === 11">PPK memvalidasi Surat Perintah Pembayaran
        </p>
        <p v-if="detailPengajuan.tahap === 12">PPK mengunggah Kuitansi dan Surat Pesanan
        </p>
        <p v-if="detailPengajuan.tahap === 13">PPK menyelesaikan pengajuan ini</p>
      </div>
    </div>

    <div class="flex gap-2 max-sm:flex-col">
      <fieldset class="flex-1 fieldset">
        <legend class="fieldset-legend">Tipe Dokumen</legend>
        <select v-model="filter" @change="handleFilter" class="w-full select">
          <option value="pj">PJ</option>
          <option value="ppk">PPK</option>
          <option value="pbj">PBJ</option>
          <option value="bendahara">Bendahara</option>
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
    <div v-else class="divider">Menampilkan Dokumen {{ filter.toUpperCase() }} pada Tahap Ini</div>

    <div v-if="filter === 'pj' && !isLoading" class="flex flex-col gap-2">
      <Dokumen v-if="detailPengajuan.tahap! >= 1" title="Kerangka Acuan Kerja"
        :data="daftarDokumen.find((i) => i.tipe === 'kak') ?? null" uploader="PJ" validator="PPK" tipe="kak" :tahap="1"
        :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 1" title="Form Permintaan"
        :data="daftarDokumen.find((i) => i.tipe === 'fp') ?? null" uploader="PJ" validator="PPK" tipe="fp" :tahap="1"
        :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 1" title="Surat Permintaan ke PPK"
        :data="daftarDokumen.find((i) => i.tipe === 'spp') ?? null" uploader="PJ" validator="PPK" tipe="spp" :tahap="1"
        :fn="getData" />
    </div>
    <div v-if="filter === 'ppk' && !isLoading" class="flex flex-col gap-2">
      <Dokumen v-if="detailPengajuan.tahap! >= 3" title="Dokumen Rancangan Kontrak"
        :data="daftarDokumen.find((i) => i.tipe === 'drk') ?? null" uploader="PPK" validator="PBJ" tipe="drk"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="3" :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 3" title="Spekteknis"
        :data="daftarDokumen.find((i) => i.tipe === 'st') ?? null" uploader="PPK" validator="PBJ" tipe="st"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="3" :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 3" title="RAB/HPS (Harga Perkiraan Sendiri)"
        :data="daftarDokumen.find((i) => i.tipe === 'rabhps') ?? null" uploader="PPK" validator="PBJ" tipe="rabhps"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="3" :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 3" title="Surat Penunjukan Pejabat Pengadaan"
        :data="daftarDokumen.find((i) => i.tipe === 'sppp') ?? null" uploader="PPK" validator="PBJ" tipe="sppp"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="3" :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 7" title="Surat Penetapan Pemenang Barang dan Jasa"
        :data="daftarDokumen.find((i) => i.tipe === 'sppbj') ?? null" uploader="PPK" validator="PPK" tipe="sppbj"
        :tahap="7" :fn="getData" :self-valid="true" />
      <Dokumen v-if="detailPengajuan.tahap! >= 7" title="Surat Kontrak atau Surat Pesanan"
        :data="daftarDokumen.find((i) => i.tipe === 'sksp') ?? null" uploader="PPK" validator="PPK" tipe="sksp"
        :tahap="7" :fn="getData" :self-valid="true" />
      <Dokumen v-if="detailPengajuan.tahap! >= 9" title="Berita Acara Serah Terima Pekerjaan"
        :data="daftarDokumen.find((i) => i.tipe === 'bast') ?? null" uploader="PPK" validator="PPK" tipe="bast"
        :tahap="10" :self-valid="true" />
      <Dokumen v-if="detailPengajuan.tahap! >= 9" title="Berita Acara Pembayaran"
        :data="daftarDokumen.find((i) => i.tipe === 'bap') ?? null" uploader="PPK" validator="PPK" tipe="bap"
        :tahap="10" :self-valid="true" />
      <Dokumen v-if="detailPengajuan.tahap! >= 12" title="Kuitansi"
        :data="daftarDokumen.find((i) => i.tipe === 'kui') ?? null" uploader="PPK" validator="PPK" tipe="kui"
        :tahap="13" :self-valid="true" />
      <Dokumen v-if="detailPengajuan.tahap! >= 12" title="Surat Pesanan"
        :data="daftarDokumen.find((i) => i.tipe === 'sp') ?? null" uploader="PPK" validator="PPK" tipe="sp" :tahap="13"
        :self-valid="true" />
    </div>
    <div v-if="filter === 'pbj' && !isLoading" class="flex flex-col gap-2">
      <Dokumen v-if="detailPengajuan.tahap! >= 5" title="Berita Acara Negosiasi"
        :data="daftarDokumen.find((i) => i.tipe === 'ban') ?? null" uploader="PBJ" validator="PPK" tipe="ban"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="5" :fn="getData" />
      <Dokumen v-if="detailPengajuan.tahap! >= 5" title="Berita Acara Berhasil Pemilihan"
        :data="daftarDokumen.find((i) => i.tipe === 'bahp') ?? null" uploader="PBJ" validator="PPK" tipe="bahp"
        :id-pbj="detailPengajuan.pbj?.id" :tahap="5" :fn="getData" />
    </div>
    <div v-if="filter === 'bendahara' && !isLoading" class="flex flex-col gap-2">
      <Dokumen v-if="detailPengajuan.tahap! >= 10" title="Surat Perintah Membayar"
        :data="daftarDokumen.find((i) => i.tipe === 'spm') ?? null" uploader="Bendahara" validator="PPK" tipe="spm"
        :tahap="11" :fn="getData" />
    </div>
    <div v-if="filter === 'lampiran' && !isLoading" class="flex flex-col gap-2">
      <Lampiran :data="daftarDokumen.filter((i) => i.tipe === 'lampiran') ?? null" tipe="lampiran" />
    </div>
  </div>
</template>