<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IPengguna, IPengajuan } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()

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
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengubah status pengajuan ini menjadi Diproses.`, true)
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
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengubah status pengajuan ini menjadi Selesai.`, true)
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tolakPengajuan() {
  const input = prompt('Apa alasan Anda menolak pengajuan ini?')
  const alasan = input ? input : 'Tidak ada alasan'
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, { status: 'Ditolak', selesai: null })
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengubah status pengajuan ini menjadi Ditolak dengan alasan: "${alasan}".`, true)
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
    await kotakMasukModel.insert(currUser.id!, null, `${currUser?.nama} (${currUser.peran}) dari ${pengajuan.value.tim} menghapus ${pengajuan.value.nama}.`, false)
    await dokumenModel.deleteFiles(currRoute.value.query.id as string)
    await pengajuanModel.deleteById(currRoute.value.query.id as string)
    router.push('/')
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
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengubah status pesanan pada pengajuan ini menjadi Selesai.`, true)
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
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengubah status pesanan pada pengajuan ini menjadi Diproses.`, true)
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <Navbar />
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">{{ pengajuan.nama ?? '...' }}</p>
        <button @click="() => router.push('/')" class="underline cursor-pointer text-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div role="tablist" class="tabs tabs-box w-fit">
        <RouterLink :to="`/pengajuan?id=${currRoute.query.id}`" role="tab"
          :class="`tab ${currRoute.path === '/pengajuan' && 'tab-active'}`">
          Detail
        </RouterLink>
        <RouterLink :to="`/dokumen?id=${currRoute.query.id}`" role="tab"
          :class="`tab ${currRoute.path === '/dokumen' && 'tab-active'}`">
          Dokumen
        </RouterLink>
        <RouterLink :to="`/aktivitas-pengajuan?id=${currRoute.query.id}`" role="tab"
          :class="`indicator tab ${currRoute.path === '/aktivitas-pengajuan' && 'tab-active'}`">
          Aktivitas<span class="indicator-item status status-error"></span>
        </RouterLink>
      </div>
    </div>

    <div class="divider"></div>

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
      <p class="text-sm">
        <i class="fa-solid fa-user"></i> {{daftarPengguna.find((i) => i.peran === 'Ketua Tim')?.nama}} (Ketua Tim)
      </p>
      <p class="text-sm"><i class="fa-solid fa-user"></i> {{ pengajuan.pbj?.nama }} (PBJ)</p>
    </div>
    <div class="flex flex-col gap-2">
      <p class="font-semibold">Status Pesanan</p>
      <p class="text-sm"><i class="fa-solid fa-box"></i> Pesanan {{ pengajuan.pesanan ? 'selesai' : 'diproses' }}</p>
    </div>

    <div class="divider"></div>

    <div v-if="currUser.peran === 'PJ'" class="flex flex-col gap-2">
      <p class="font-semibold">Aksi Pengajuan (PJ)</p>
      <p class="text-sm">Hapus pengajuan ini</p>
      <div class="flex gap-2">
        <button @click="hapusPengajuan" class="btn btn-square btn-error" :disabled="isLoading || !dapatDihapus">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-if="currUser.peran === 'PPK'" class="flex flex-col gap-2">
      <p class="font-semibold">Aksi Pengajuan (PPK)</p>
      <p class="text-sm">Ubah status dan hapus pengajuan ini</p>
      <div class="flex gap-2">
        <button @click="prosesPengajuan" class="btn btn-square btn-primary"
          :disabled="isLoading || pengajuan.status === 'Diproses'">
          <i class="fa-solid fa-hourglass"></i>
        </button>
        <button @click="selesaikanPengajuan" class="btn btn-square btn-success"
          :disabled="isLoading || pengajuan.status === 'Selesai'">
          <i class="fa-solid fa-check"></i>
        </button>
        <button @click="tolakPengajuan" class="btn btn-square btn-error"
          :disabled="isLoading || pengajuan.status === 'Ditolak'">
          <i class="fa-solid fa-x"></i>
        </button>
        <button @click="hapusPengajuan" class="btn btn-square btn-error" :disabled="isLoading || !dapatDihapus">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-if="currUser.peran === 'PBJ' && currUser.id === pengajuan.pbj?.id" class="flex flex-col gap-2">
      <p class="font-semibold">Aksi Pengajuan (PBJ)</p>
      <p class="text-sm">Ubah status pesanan pengajuan ini</p>
      <div class="flex gap-2">
        <button @click="prosesPesanan" class="btn btn-square btn-primary" :disabled="isLoading || !pengajuan.pesanan">
          <i class="fa-solid fa-hourglass"></i>
        </button>
        <button @click="selesaikanPesanan" class="btn btn-square btn-success"
          :disabled="isLoading || pengajuan.pesanan">
          <i class="fa-solid fa-check"></i>
        </button>
      </div>
    </div>

  </div>
</template>