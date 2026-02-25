<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import type { IPengguna, TPeran } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const penggunaModel = Pengguna.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'PJ')
const sort = ref<string>(currRoute.value.query.sort as string ?? 'asc')
const daftarPengguna = ref<IPengguna[]>([])
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
  filter.value = currRoute.value.query.filter as string ?? 'PJ'
  sort.value = currRoute.value.query.sort as string ?? 'asc'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLInputElement
  filter.value = target.value
  router.push(`/admin-pengguna?filter=${filter.value}&sort=${sort.value}`)
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/admin-pengguna?filter=${filter.value}&sort=${sort.value}`)
}

async function getData() {
  if (currUser.peran !== 'Admin') return router.go(-1)
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

watch(currRoute, getData, { immediate: true })
</script>

<template>
  <Navbar />
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <p class="text-lg font-semibold">Menu Admin</p>
    </div>

    <div class="flex flex-col gap-2">
      <div role="tablist" class="tabs tabs-box w-fit">
        <RouterLink :to="`/admin-pengguna`" role="tab"
          :class="`tab ${currRoute.path === '/admin-pengguna' && 'tab-active'}`">
          Pengguna
        </RouterLink>
        <RouterLink :to="`/admin-pengajuan`" role="tab"
          :class="`tab ${currRoute.path === '/admin-pengajuan' && 'tab-active'}`">
          Pengajuan
        </RouterLink>
        <RouterLink :to="`/admin-dokumen`" role="tab"
          :class="`tab ${currRoute.path === '/admin-dokumen' && 'tab-active'}`">
          Dokumen
        </RouterLink>
      </div>
    </div>

    <div class="divider"></div>

    <div class="flex flex-col gap-2">
      <p class="font-semibold">Daftar Pengguna</p>
      <p class="text-sm">{{ formatTim() }}</p>
    </div>

    <div class="flex flex-col gap-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Peran</legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="PJ" />
          <p class="truncate">PJ</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Ketua Tim" />
          <p class="truncate">Ketua Tim</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="PPK" />
          <p class="truncate">PPK</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="PBJ" />
          <p class="truncate">PBJ</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Bendahara" />
          <p class="truncate">Bendahara</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Admin" />
          <p class="truncate">Admin</p>
        </div>
      </fieldset>
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

    <div class="flex flex-col gap-2">
      <RouterLink to="/admin-tambah-pengguna" class="btn btn-soft btn-primary">
        <i class="fa-solid fa-plus"></i> Pengguna Baru
      </RouterLink>
    </div>

    <div v-if="daftarPengguna.length" class="flex flex-col gap-2">
      <div v-for="i in daftarPengguna" class="w-full card card-border bg-base-100">
        <div class="card-body">
          <div class="flex justify-between gap-1 truncate">
            <h2 class="text-base truncate card-title">{{ i.nama }}</h2>
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
          <div class="justify-end card-actions">
            <RouterLink v-if="i.id !== currUser.id" :to="`/admin-edit-pengguna?id=${i.id}`"
              class="btn btn-square btn-primary">
              <i class="fa-solid fa-pencil"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada pengguna' }}</p>
    </div>

  </div>
</template>