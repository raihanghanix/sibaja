<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Aktivitas } from '../models/Aktivitas';
import type { IAktivitas, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const aktivitasModel = Aktivitas.getInstance()

const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const daftarAktivitas = ref<IAktivitas[]>([])
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

function isSameDate(date: string) {
  const currDate = `${new Date().getDay()}${new Date().getMonth()}${new Date().getFullYear()}`
  const targetDate = `${new Date(date).getDay()}${new Date(date).getMonth()}${new Date(date).getFullYear()}`
  if (currDate.localeCompare(targetDate)) return true
  else return false
}

function reset() {
  daftarAktivitas.value = []
  sort.value = currRoute.value.query.sort as string ?? 'desc'
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/?view=aktivitas-tim&sort=${sort.value}`)
}

async function getData() {
  try {
    isLoading.value = true
    reset()
    if (currUser?.peran === 'PJ') {
      const data = await aktivitasModel.getAll(sort.value, false)
      const filteredData = data.filter((i) => {
        for (let j of i.pengguna?.tim!) {
          if (currUser?.tim?.includes(j)) return true
        }
      })
      daftarAktivitas.value = filteredData
    } else {
      const data = await aktivitasModel.getAll(sort.value, false)
      daftarAktivitas.value = data
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
      <p class="text-lg font-semibold">Daftar Aktivitas Tim</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <span v-if="currUser?.peran === 'PJ' || currUser?.peran === 'Ketua Tim'" v-for="i in currUser?.tim"
        class="badge badge-secondary">
        {{ i }}
      </span>
      <span v-else class="badge badge-secondary">Semua Tim</span>
    </div>

    <div class="flex gap-2 max-sm:flex-col">
      <fieldset class="flex-1 fieldset">
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

    <div class="divider">Menampilkan {{ daftarAktivitas.length ?? 0 }} Item</div>

    <div v-if="daftarAktivitas.length" class="flex flex-col gap-2">
      <div v-for="i in daftarAktivitas" class="w-full card card-border bg-base-100">
        <div class="card-body">
          <div v-if="!isSameDate(i.created_at!)" class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">
              Hari ini {{ i.created_at ? `(${formatTime(i.created_at)})` : '-' }}
            </h2>
            <div v-if="i.pesan?.includes('mengajukan')" class="badge badge-soft badge-success">Ajukan</div>
            <div v-else-if="i.pesan?.includes('menghapus')" class="badge badge-soft badge-error">Hapus</div>
          </div>
          <div v-else class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">
              {{ i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-' }}
            </h2>
            <div v-if="i.pesan?.includes('mengajukan')" class="badge badge-soft badge-success">Ajukan</div>
            <div v-else-if="i.pesan?.includes('menghapus')" class="badge badge-soft badge-error">Hapus</div>
          </div>
          <ul class="flex flex-col gap-1">
            <li class="text-sm"> {{ i.pesan }} </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2 text-sm font-semibold text-center">
      <p>{{ isLoading ? 'Loading...' : 'Tidak ada aktivitas' }}</p>
    </div>

  </div>
</template>