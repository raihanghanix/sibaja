<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Dokumen } from '../models/Dokumen';
import type { IDokumen, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const dokumenModel = Dokumen.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'Diproses')
const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const daftarDokumen = ref<IDokumen[]>([])
const jumlahDiproses = ref<number>(0)
const jumlahValid = ref<number>(0)
const jumlahTidakValid = ref<number>(0)
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

function reset() {
  jumlahDiproses.value = 0
  jumlahValid.value = 0
  jumlahTidakValid.value = 0
  daftarDokumen.value = []
  filter.value = currRoute.value.query.filter as string ?? 'Diproses'
  sort.value = currRoute.value.query.sort as string ?? 'desc'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLInputElement
  filter.value = target.value
  router.push(`/?view=admin-dokumen&filter=${filter.value}&sort=${sort.value}`)
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/?view=admin-dokumen&filter=${filter.value}&sort=${sort.value}`)
}

async function getData() {
  try {
    isLoading.value = true
    reset()
    const data = await dokumenModel.getByStatus(sort.value)
    jumlahDiproses.value = data.filter((i) => i.status === 'Diproses').length
    jumlahValid.value = data.filter((i) => i.status === 'Valid').length
    jumlahTidakValid.value = data.filter((i) => i.status === 'Tidak valid').length
    daftarDokumen.value = data.filter((i) => i.status === filter.value)
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
  if (currUser && currUser.peran !== 'Admin') {
    router.go(-1)
    return
  }
  getData()
}, { immediate: true })
</script>

<template>
  <Navbar />
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <p class="text-lg font-semibold">Menu Admin</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <RouterLink to="/?view=admin-pengguna"
        :class="`btn btn-xs ${currRoute.query.view === 'admin-pengguna' && 'btn-secondary'}`">
        Daftar Pengguna
      </RouterLink>
      <RouterLink to="/?view=admin-pengajuan"
        :class="`btn btn-xs ${currRoute.query.view === 'admin-pengajuan' && 'btn-secondary'}`">
        Daftar Pengajuan
      </RouterLink>
      <RouterLink to="/?view=admin-dokumen"
        :class="`btn btn-xs ${currRoute.query.view === 'admin-dokumen' && 'btn-secondary'}`">
        Daftar Dokumen
      </RouterLink>
    </div>

    <div class="flex gap-2 max-sm:flex-col">
      <fieldset class="flex-1 fieldset">
        <legend class="fieldset-legend">Status</legend>
        <select v-model="filter" @change="handleFilter" class="w-full select">
          <option value="Diproses">Diproses ({{ jumlahDiproses }})</option>
          <option value="Valid">Valid ({{ jumlahValid }})</option>
          <option value="Tidak valid">Tidak valid ({{ jumlahTidakValid }})</option>
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
    </div>

    <div class="divider">Menampilkan {{ daftarDokumen.length ?? 0 }} Item</div>

    <div v-if="daftarDokumen.length" class="flex flex-col gap-2">
      <div v-for="i in daftarDokumen" class="w-full card card-border bg-base-100">
        <RouterLink :to="`/?view=admin-edit-dokumen&id=${i.id}`" class="card-body hover:bg-base-200">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">{{ i.id }}.pdf</h2>
            <div v-if="i.status === 'Diproses'" class="badge badge-soft badge-info">Diproses</div>
            <div v-if="i.status === 'Valid'" class="badge badge-soft badge-success">Valid</div>
            <div v-if="i.status === 'Tidak valid'" class="badge badge-soft badge-error">Tidak valid</div>
          </div>
          <div class="flex flex-col gap-1 text-sm truncate">
            <p><i class="truncate fa-solid fa-file"></i> {{ i.pengajuan?.nama }}</p>
            <p>
              <i class="truncate fa-solid fa-calendar"></i> Diajukan: {{
                i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-'
              }}
            </p>
            <p><i class="truncate fa-solid fa-user"></i> {{ i.pengguna?.nama }} ({{ i.pengguna?.peran }}, {{
              i.pengajuan?.tim }})</p>
            <p><i class="truncate fa-solid fa-info-circle"></i> {{ i.nama }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2 text-sm font-semibold text-center">
      <p>{{ isLoading ? 'Loading...' : 'Tidak ada dokumen' }}</p>
    </div>

  </div>
</template>