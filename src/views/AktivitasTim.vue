<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IKotakMasuk, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const kotakMasukModel = KotakMasuk.getInstance()

const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const daftarAktivitas = ref<IKotakMasuk[]>([])
const isLoading = ref<boolean>(false)

function formatTim() {
  if (currUser.peran === 'PJ' || currUser.peran === 'Ketua Tim') return currUser.tim
  else return 'Semua tim'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

function reset() {
  sort.value = currRoute.value.query.sort as string ?? 'desc'
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/aktivitas?sort=${sort.value}`)
}

async function getData() {
  try {
    isLoading.value = true
    reset()
    if (currUser.peran === 'PJ' || currUser.peran === 'Ketua Tim') {
      const data = await kotakMasukModel.getAll(sort.value, false)
      const filteredData = data.filter((i) => {
        for (let j of i.pengguna?.tim!) {
          if (currUser.tim?.includes(j)) return true
        }
      })
      daftarAktivitas.value = filteredData
    } else {
      const data = await kotakMasukModel.getAll(sort.value, false)
      daftarAktivitas.value = data
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

watch(currRoute, getData, { immediate: true })
</script>

<template>
  <Navbar />
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <p class="text-lg font-semibold">Daftar Aktivitas</p>
    </div>

    <div class="flex flex-col gap-2 ">
      <p class="text-sm">{{ formatTim() }}</p>
    </div>

    <div class="flex flex-col gap-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Urutkan</legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="sort" @change="handleSort" type="radio" class="radio" name="sort" value="asc" />
          <p class="truncate">Menaik</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="sort" @change="handleSort" type="radio" class="radio" name="sort" value="desc" />
          <p class="truncate">Menurun</p>
        </div>
      </fieldset>
    </div>

    <div v-if="daftarAktivitas.length" class="flex flex-col gap-2">
      <div v-for="i in daftarAktivitas" class="w-full card card-border bg-base-100">
        <div class="card-body">
          <h2 class="text-base card-title">
            {{ i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-' }}
          </h2>
          <p class="text-sm">{{ i.pesan }}</p>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada aktivitas' }}</p>
    </div>

  </div>
</template>