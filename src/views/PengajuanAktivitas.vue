<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { Pengajuan } from '../models/Pengajuan';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IKotakMasuk, IPengajuan } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute

const pengajuanModel = Pengajuan.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()

const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const detailPengajuan = ref<IPengajuan>({})
const daftarAktivitas = ref<IKotakMasuk[]>([])
const isLoading = ref<boolean>(false)

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
  router.push(`/aktivitas-pengajuan?id=${currRoute.value.query.id}&sort=${sort.value}`)
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
    detailPengajuan.value = dataPengajuan[0]!
    const data = await kotakMasukModel.getAll(sort.value, true)
    const filteredData = data.filter((i) => i.pengajuan === currRoute.value.query.id as string)
    daftarAktivitas.value = filteredData
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.replace('/')
    }
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
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">{{ detailPengajuan.nama ?? '...' }}</p>
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
      <p class="font-semibold">Daftar Aktivitas</p>
      <p class="text-sm">Pengajuan ini</p>
    </div>

    <div class="flex flex-col gap-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Urutkan Berdasarkan</legend>
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