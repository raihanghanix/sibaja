<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const pengajuanModel = Pengajuan.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'Diproses')
const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const daftarPengajuan = ref<IPengajuan[]>([])
const jumlahDiproses = ref<number>(0)
const jumlahSelesai = ref<number>(0)
const jumlahDitolak = ref<number>(0)
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

function reset() {
  jumlahDiproses.value = 0
  jumlahSelesai.value = 0
  jumlahDitolak.value = 0
  daftarPengajuan.value = []
  filter.value = currRoute.value.query.filter as string ?? 'Diproses'
  sort.value = currRoute.value.query.sort as string ?? 'desc'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLSelectElement
  filter.value = target.value
  router.push(`/?view=beranda&filter=${filter.value}&sort=${sort.value}`)
}

function handleSort(e: Event) {
  const target = e.target as HTMLSelectElement
  sort.value = target.value
  router.push(`/?view=beranda&filter=${filter.value}&sort=${sort.value}`)
}

async function getData() {
  try {
    isLoading.value = true
    reset()
    if (currUser?.peran === 'PJ') {
      const data = await pengajuanModel.getByTim(currUser?.tim!, sort.value)
      jumlahDiproses.value = data.filter((i) => i.status === 'Diproses').length
      jumlahSelesai.value = data.filter((i) => i.status === 'Selesai').length
      jumlahDitolak.value = data.filter((i) => i.status === 'Ditolak').length
      daftarPengajuan.value = data.filter((i) => i.status === filter.value)
    } else {
      const data = await pengajuanModel.getAll(sort.value)
      jumlahDiproses.value = data.filter((i) => i.status === 'Diproses').length
      jumlahSelesai.value = data.filter((i) => i.status === 'Selesai').length
      jumlahDitolak.value = data.filter((i) => i.status === 'Ditolak').length
      daftarPengajuan.value = data.filter((i) => i.status === filter.value)
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
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
      <p class="text-lg font-semibold">Daftar Pengajuan</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <span v-if="currUser?.peran === 'PJ' || currUser?.peran === 'Ketua Tim'" v-for="i in currUser.tim"
        class="badge badge-secondary">
        {{ i }}
      </span>
      <span v-else class="badge badge-secondary">Semua Tim</span>
    </div>

    <div class="flex gap-2 max-sm:flex-col">
      <fieldset class="flex-1 fieldset">
        <legend class="fieldset-legend">Status</legend>
        <select v-model="filter" @change="handleFilter" class="w-full select">
          <option value="Diproses">Diproses ({{ jumlahDiproses }})</option>
          <option value="Selesai">Selesai ({{ jumlahSelesai }})</option>
          <option value="Ditolak">Ditolak ({{ jumlahDitolak }})</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Urutkan</legend>
        <select v-model="sort" @change="handleSort" class="w-full select">
          <option value="asc">Terlama (Z-A)</option>
          <option value="desc">Terbaru (A-Z)</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <button @click="getData" class="btn"><i class="fa-solid fa-rotate"></i> Refresh</button>
      </fieldset>
      <fieldset v-if="currUser?.peran === 'PJ'" class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <RouterLink to="/?view=pengajuan-baru" class="btn btn-soft btn-primary">
          <i class="fa-solid fa-plus"></i> Pengajuan Baru
        </RouterLink>
      </fieldset>
    </div>

    <div class="divider">Menampilkan {{ daftarPengajuan.length ?? 0 }} Item</div>

    <div v-if="daftarPengajuan.length" class="flex flex-col gap-2">
      <div v-for="i in daftarPengajuan" class="w-full card card-border bg-base-100">
        <RouterLink :to="`/?view=detail-pengajuan&id=${i.id}`" class="card-body hover:bg-base-200">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">{{ i.nama }}</h2>
            <div v-if="i.status === 'Diproses'" class="badge badge-soft badge-info">Diproses</div>
            <div v-if="i.status === 'Selesai'" class="badge badge-soft badge-success">Selesai</div>
            <div v-if="i.status === 'Ditolak'" class="badge badge-soft badge-error">Ditolak</div>
          </div>
          <div class="flex flex-col gap-1 text-sm truncate">
            <p><i class="truncate fa-solid fa-users"></i> {{ i.tim }}</p>
            <p>
              <i class="truncate fa-solid fa-calendar"></i> Diajukan: {{
                i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-'
              }}
            </p>
            <p>
              <i class="truncate fa-solid fa-calendar-check"></i> Selesai: {{
                i.selesai ? `${formatDate(i.selesai)} (${formatTime(i.selesai)})` : '-'
              }}
            </p>
            <p><i class="truncate fa-solid fa-box"></i> Pesanan {{ i.pesanan ? 'selesai' : 'diproses' }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2 text-sm font-semibold text-center">
      <p>{{ isLoading ? 'Loading...' : 'Tidak ada pengajuan' }}</p>
    </div>

  </div>
</template>