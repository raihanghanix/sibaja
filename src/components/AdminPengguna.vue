<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import type { IPengguna, TPeran } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const penggunaModel = Pengguna.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'PJ')
const sort = ref<string>(currRoute.value.query.sort as string ?? 'asc')
const daftarPengguna = ref<IPengguna[]>([])
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

function reset() {
  daftarPengguna.value = []
  filter.value = currRoute.value.query.filter as string ?? 'PJ'
  sort.value = currRoute.value.query.sort as string ?? 'asc'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLInputElement
  filter.value = target.value
  router.push(`/?view=admin-pengguna&filter=${filter.value}&sort=${sort.value}`)
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/?view=admin-pengguna&filter=${filter.value}&sort=${sort.value}`)
}

async function getData() {
  try {
    isLoading.value = true
    reset()
    const data = await penggunaModel.getByPeran(filter.value as TPeran, sort.value)
    daftarPengguna.value = data
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
        <legend class="fieldset-legend">Peran</legend>
        <select v-model="filter" @change="handleFilter" class="w-full select">
          <option value="PJ">PJ</option>
          <option value="Ketua Tim">Ketua Tim</option>
          <option value="PPK">PPK</option>
          <option value="PBJ">PBJ</option>
          <option value="Bendahara">Bendahara</option>
          <option value="Admin">Admin</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Urutkan</legend>
        <select v-model="sort" @change="handleSort" class="w-full select">
          <option value="asc">Teratas (A-Z)</option>
          <option value="desc">Terbawah (Z-A)</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <button @click="getData" class="btn"><i class="fa-solid fa-rotate"></i> Refresh</button>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="invisible max-sm:hidden fieldset-legend">Urutkan</legend>
        <RouterLink to="/?view=admin-tambah-pengguna" class="btn btn-soft btn-primary">
          <i class="fa-solid fa-plus"></i> Pengguna Baru
        </RouterLink>
      </fieldset>
    </div>

    <div class="divider">Menampilkan {{ daftarPengguna.length ?? 0 }} Item</div>

    <div v-if="daftarPengguna.length" class="flex flex-col gap-2">
      <div v-for="i in daftarPengguna" class="w-full card card-border bg-base-100">
        <RouterLink :to="`/?view=admin-edit-pengguna&id=${i.id}`" class="card-body hover:bg-base-200">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">{{ i.nama }} {{ currUser?.id === i.id ? '(Anda)' : '' }}</h2>
            <div class="badge badge-soft badge-info">{{ i.peran }}</div>
          </div>
          <div class="flex flex-col gap-1 text-sm truncate">
            <p><i class="truncate fa-solid fa-key"></i> {{ i.id }}</p>
            <p>
              <i class="truncate fa-solid fa-calendar"></i> Dibuat: {{
                i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-'
              }}
            </p>
            <p><i class="truncate fa-solid fa-envelope"></i> {{ i.email }}</p>
            <p><i class="truncate fa-solid fa-users"></i> {{ i.tim }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2 text-sm font-semibold text-center">
      <p>{{ isLoading ? 'Loading...' : 'Tidak ada pengguna' }}</p>
    </div>

  </div>
</template>