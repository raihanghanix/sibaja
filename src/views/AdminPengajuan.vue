<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const pengajuanModel = Pengajuan.getInstance()

const filter = ref<string>(currRoute.value.query.filter as string ?? 'Diproses')
const sort = ref<string>(currRoute.value.query.sort as string ?? 'desc')
const daftarPengajuan = ref<IPengajuan[]>([])
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
  filter.value = currRoute.value.query.filter as string ?? 'Diproses'
  sort.value = currRoute.value.query.sort as string ?? 'desc'
}

function handleFilter(e: Event) {
  const target = e.target as HTMLInputElement
  filter.value = target.value
  router.push(`/admin-pengajuan?filter=${filter.value}&sort=${sort.value}`)
}

function handleSort(e: Event) {
  const target = e.target as HTMLInputElement
  sort.value = target.value
  router.push(`/admin-pengajuan?filter=${filter.value}&sort=${sort.value}`)
}

async function getData() {
  if (currUser.peran !== 'Admin') return router.go(-1)
  try {
    isLoading.value = true
    reset()
    const data = await pengajuanModel.getAll(filter.value, sort.value)
    daftarPengajuan.value = data
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
      <p class="font-semibold">Daftar Pengajuan</p>
      <p class="text-sm">{{ formatTim() }}</p>
    </div>

    <div class="flex flex-col gap-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Status</legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Diproses" />
          <p class="truncate">Diproses</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Selesai" />
          <p class="truncate">Selesai</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="filter" @change="handleFilter" type="radio" class="radio" name="filter" value="Ditolak" />
          <p class="truncate">Ditolak</p>
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

    <div v-if="daftarPengajuan.length" IPengajuan="flex flex-col gap-2">
      <div v-for="i in daftarPengajuan" class="IPengajuan-full card card-border bg-base-100">
        <div class="card-body">
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
          <div class="justify-end card-actions">
            <RouterLink :to="`/admin-edit-pengajuan?id=${i.id}`" class="btn btn-square btn-primary">
              <i class="fa-solid fa-pencil"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada pengajuan' }}</p>
    </div>

  </div>
</template>