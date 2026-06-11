<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { Aktivitas } from '../models/Aktivitas';
import type { IPengguna, IPengajuan } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const aktivitasModel = Aktivitas.getInstance()

const pengajuan = ref<IPengajuan>({})
const daftarPengguna = ref<IPengguna[]>([])
const dapatDihapus = ref<boolean>(false)
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

async function getData() {
  if (!currRoute.value.query.id) {
    alert('Id tidak ditemukan!')
    return router.replace('/')
  }
  try {
    isLoading.value = true
    const dataPengajuan = await pengajuanModel.getById(currRoute.value.query.id as string)
    const dataPengguna = await penggunaModel.getByTim([dataPengajuan[0]!.tim!])
    const dataDokumen = await dokumenModel.getByPengajuan(currRoute.value.query.id as string)
    const filteredData = dataDokumen.filter((i) => {
      if (i.tipe === 'kak' && i.status === 'Valid') return true
      if (i.tipe === 'fp' && i.status === 'Valid') return true
      if (i.tipe === 'spp' && i.status === 'Valid') return true
    })
    pengajuan.value = dataPengajuan[0]!
    daftarPengguna.value = dataPengguna
    dapatDihapus.value = filteredData.length > 0 ? false : true
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.replace('/')
    }
  } finally {
    isLoading.value = false
  }
}

async function prosesPengajuan() {
  const conf = confirm('Apakah Anda ingin merubah status pengajuan ini menjadi Diproses?')
  if (!conf) return
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { status: 'Diproses', selesai: null })
    await aktivitasModel.insert(currUser?.id!, currRoute.value.query.id as string, `${currUser?.nama} (${currUser?.peran}) mengubah status pengajuan ini menjadi Diproses.`, true)
    alert('Status pengajuan berhasil diubah!')
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function selesaikanPengajuan() {
  const conf = confirm('Apakah Anda ingin merubah status pengajuan ini menjadi Selesai?')
  if (!conf) return
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { status: 'Selesai', selesai: new Date().toISOString() })
    await aktivitasModel.insert(currUser?.id!, currRoute.value.query.id as string, `${currUser?.nama} (${currUser?.peran}) mengubah status pengajuan ini menjadi Selesai.`, true)
    alert('Pengajuan berhasil diselesaikan!')
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tolakPengajuan() {
  const input = prompt('Apa alasan Anda menolak pengajuan ini? (Wajib)')
  const alasan = input
  if (!alasan || !alasan.length) return
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { status: 'Ditolak', selesai: null })
    await aktivitasModel.insert(currUser?.id!, currRoute.value.query.id as string, `${currUser?.nama} (${currUser?.peran}) mengubah status pengajuan ini menjadi Ditolak dengan alasan: "${alasan}".`, true)
    alert('Pengajuan berhasil ditolak!')
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusPengajuan() {
  const conf = confirm('Apakah Anda ingin menghapus pengajuan ini beserta semua dokumennya?')
  if (!conf) return
  try {
    isLoading.value = true
    if (currUser?.peran === 'PPK') {
      await aktivitasModel.insert(currUser?.id!, null, `${currUser?.nama} (${currUser?.peran}) menghapus ${pengajuan.value.nama}.`, false)
    } else {
      await aktivitasModel.insert(currUser?.id!, null, `${currUser?.nama} (${currUser?.peran}) dari ${pengajuan.value.tim} menghapus ${pengajuan.value.nama}.`, false)
    }
    await dokumenModel.deleteFiles(currRoute.value.query.id as string)
    await pengajuanModel.deleteById(currRoute.value.query.id as string)
    alert('Pengajuan berhasil dihapus!')
    router.push('/?view=beranda')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function selesaikanPesanan() {
  const conf = confirm('Apakah Anda ingin merubah status pesanan ini menjadi Selesai?')
  if (!conf) return
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { pesanan: true })
    await aktivitasModel.insert(currUser?.id!, currRoute.value.query.id as string, `${currUser?.nama} (${currUser?.peran}) mengubah status pesanan pada pengajuan ini menjadi Selesai.`, true)
    alert('Pesanan berhasil diselesaikan!')
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function prosesPesanan() {
  const conf = confirm('Apakah Anda ingin merubah status pesanan ini menjadi Diproses?')
  if (!conf) return
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { pesanan: false })
    await aktivitasModel.insert(currUser?.id!, currRoute.value.query.id as string, `${currUser?.nama} (${currUser?.peran}) mengubah status pesanan pada pengajuan ini menjadi Diproses.`, true)
    alert('Status pesanan berhasil diubah!')
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
  if (!currUser) {
    router.replace('/?view=login')
    return
  }
  getData()
})
</script>

<template>
  <Navbar />
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">{{ pengajuan?.nama ?? '...' }}</p>
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

    <div class="divider">Detail Pengajuan</div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <p class="font-semibold">Status Pengajuan</p>
        <div v-if="isLoading" class="badge badge-soft">...</div>
        <div v-else-if="pengajuan.status === 'Diproses'" class="badge badge-soft badge-info">Diproses</div>
        <div v-else-if="pengajuan.status === 'Selesai'" class="badge badge-soft badge-success">Selesai</div>
        <div v-else-if="pengajuan.status === 'Ditolak'" class="badge badge-soft badge-error">Ditolak</div>
        <p class="text-sm">
          <i class="fa-solid fa-calendar"></i> Diajukan: {{
            pengajuan.created_at ? `${formatDate(pengajuan.created_at)} (${formatTime(pengajuan.created_at)})` : '-'
          }}
        </p>
        <p class="text-sm">
          <i class="fa-solid fa-calendar-check"></i> Selesai: {{
            pengajuan.selesai ? `${formatDate(pengajuan.selesai)} (${formatTime(pengajuan.selesai)})` : '-'
          }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-semibold">Tim Pengajuan</p>
        <p class="text-sm"><i class="fa-solid fa-users"></i> {{ pengajuan.tim }}</p>
        <p class="text-sm">
          <i class="fa-solid fa-user"></i> {{daftarPengguna.find((i) => i.peran === 'PJ')?.nama}} (PJ)
        </p>
        <!-- <p class="text-sm">
          <i class="fa-solid fa-user"></i> {{daftarPengguna.find((i) => i.peran === 'Ketua Tim')?.nama}} (Ketua Tim)
        </p> -->
        <p class="text-sm"><i class="fa-solid fa-user"></i> {{ pengajuan.pbj?.nama }} (PBJ)</p>
      </div>
      <div class="flex flex-col gap-2">
        <p class="font-semibold">Status Pesanan</p>
        <p class="text-sm"><i class="fa-solid fa-box"></i> Pesanan {{ pengajuan.pesanan ? 'selesai' : 'diproses' }}
        </p>
      </div>
    </div>

    <div class="divider">Tautan Pengajuan</div>

    <div class="flex flex-col gap-2">
      <div class="w-full card card-border bg-base-100">
        <RouterLink :to="`/?view=dokumen-pengajuan&id=${currRoute.query.id}`" class="card-body hover:bg-base-200">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title"><i class="fa-solid fa-file"></i> Dokumen Pengajuan</h2>
            <div class="">&gt;</div>
          </div>
        </RouterLink>
      </div>
      <div class="w-full card card-border bg-base-100">
        <RouterLink :to="`/?view=aktivitas-pengajuan&id=${currRoute.query.id}`" class="card-body hover:bg-base-200">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title"><i class="fa-solid fa-list"></i> Aktivitas Pengajuan</h2>
            <div class="">&gt;</div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div v-if="currUser?.peran === 'PJ' || currUser?.peran === 'PPK'" class="divider">
      Aksi Pengajuan
    </div>
    <div v-else-if="currUser?.peran === 'PBJ' && currUser?.id === pengajuan.pbj?.id" class="divider">
      Aksi Pengajuan
    </div>

    <div v-if="currUser?.peran === 'PJ'" class="flex flex-col gap-2">
      <div class="grid grid-cols-1 gap-2">
        <button @click="hapusPengajuan" class="w-full btn btn-error" :disabled="isLoading || !dapatDihapus">
          <i class="fa-solid fa-trash"></i> Hapus Pengajuan
        </button>
      </div>
    </div>
    <div v-if="currUser?.peran === 'PPK'" class="flex flex-col gap-2">
      <div class="grid grid-cols-4 gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <button @click="prosesPengajuan" class="w-full btn btn-primary"
          :disabled="isLoading || pengajuan.status === 'Diproses'">
          <i class="fa-solid fa-hourglass"></i> Proses Pengajuan
        </button>
        <button @click="selesaikanPengajuan" class="w-full btn btn-success"
          :disabled="isLoading || pengajuan.status === 'Selesai'">
          <i class="fa-solid fa-check"></i> Selesaikan Pengajuan
        </button>
        <button @click="tolakPengajuan" class="w-full btn btn-error"
          :disabled="isLoading || pengajuan.status === 'Ditolak'">
          <i class="fa-solid fa-x"></i> Tolak Pengajuan
        </button>
        <button @click="hapusPengajuan" class="w-full btn btn-error" :disabled="isLoading || !dapatDihapus">
          <i class="fa-solid fa-trash"></i> Hapus Pengajuan
        </button>
      </div>
    </div>
    <div v-if="currUser?.peran === 'PBJ' && currUser?.id === pengajuan.pbj?.id" class="flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
        <button @click="prosesPesanan" class="w-full btn btn-primary" :disabled="isLoading || !pengajuan.pesanan">
          <i class="fa-solid fa-hourglass"></i> Proses Pesanan
        </button>
        <button @click="selesaikanPesanan" class="w-full btn btn-success" :disabled="isLoading || pengajuan.pesanan">
          <i class="fa-solid fa-check"></i> Selesaikan Pesanan
        </button>
      </div>
    </div>



  </div>
</template>