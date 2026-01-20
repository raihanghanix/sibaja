<script setup lang="ts">
import { ref, watch } from 'vue';
import Navbar from '../components/Navbar.vue';
import type { IPengguna, IPengajuan } from '../models/types';
import { Pengajuan } from '../models/Pengajuan';
import { getCookies } from '../utils/cookies';

const pengajuanModel = Pengajuan.getInstance()
const pengguna = getCookies<IPengguna>('sessionId')

const pengajuan = ref<IPengajuan[] | null>(null)
const filter = ref<'Diproses' | 'Selesai' | 'Ditolak' | null>(null)
const isLoading = ref<boolean>(false)

// const page = ref<number>(1)
// function prevPage() {
//   page.value--;
//   getData();
// }
// function nextPage() {
//   page.value++;
//   getData();
// }

async function getData() {
  try {
    isLoading.value = true
    if (pengguna.peran === 'PJ' || pengguna.peran === 'Ketua Tim') {
      const data = await pengajuanModel.getByTim(pengguna.tim!)
      if (data.length) {
        if (filter.value === null) pengajuan.value = data
        else if (filter.value === 'Diproses') pengajuan.value = data.filter((i) => i.status === 'Diproses')
        else if (filter.value === 'Ditolak') pengajuan.value = data.filter((i) => i.status === 'Ditolak')
        else if (filter.value === 'Selesai') pengajuan.value = data.filter((i) => i.status === 'Selesai')
      }
      else pengajuan.value = null
    }
    else {
      const data = await pengajuanModel.getAll()
      if (data.length) {
        if (filter.value === null) pengajuan.value = data
        else if (filter.value === 'Diproses') pengajuan.value = data.filter((i) => i.status === 'Diproses')
        else if (filter.value === 'Ditolak') pengajuan.value = data.filter((i) => i.status === 'Ditolak')
        else if (filter.value === 'Selesai') pengajuan.value = data.filter((i) => i.status === 'Selesai')
      }
      else pengajuan.value = null
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

watch(filter, getData, { immediate: true })
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <p class="text-xl font-semibold">Beranda</p>
    <div class="truncate divider divider-start">
      {{ pengguna.peran === 'PJ' || pengguna.peran === 'Ketua Tim' ? pengguna.tim : 'Semua Tim' }}
    </div>
    <div class="filter">
      <input v-model="filter" class="btn btn-soft filter-reset" type="radio" name="metaframeworks" aria-label="X"
        :value="null" />
      <input v-model="filter" class="btn btn-soft btn-info" type="radio" name="metaframeworks" aria-label="Diproses"
        value="Diproses" />
      <input v-model="filter" class="btn btn-soft btn-success" type="radio" name="metaframeworks" aria-label="Selesai"
        value="Selesai" />
      <input v-model="filter" class="btn btn-soft btn-error" type="radio" name="metaframeworks" aria-label="Ditolak"
        value="Ditolak" />
    </div>
    <div v-if="pengajuan?.length" class="flex flex-col gap-2">
      <div v-for="p in pengajuan" class="w-full shadow-sm card bg-base-100">
        <div class="card-body">
          <h2 class="text-base card-title">{{ p.nama }}</h2>
          <div v-if="p.status === 'Diproses'" class="badge badge-soft badge-info">{{ p.status }}</div>
          <div v-if="p.status === 'Selesai'" class="badge badge-soft badge-success">{{ p.status }}</div>
          <div v-if="p.status === 'Ditolak'" class="badge badge-soft badge-error">{{ p.status }}</div>
          <div v-if="p.disetujui" class="badge badge-soft badge-success">Disetujui ketua tim</div>
          <div v-if="!p.disetujui" class="badge badge-soft badge-error">Belum disetujui ketua tim</div>
          <p class="truncate"><i class="fa-solid fa-calendar"></i> Diajukan: {{ new Date(p.created_at ??
            '').toLocaleDateString('id', {
              dateStyle:
                'full'
            }) }}
            ({{ new Date(p.created_at ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
          <p v-if="p?.selesai" class="truncate"><i class="fa-solid fa-calendar-check"></i> Selesai: {{ new
            Date(p?.selesai ??
              '').toLocaleDateString('id', {
                dateStyle:
                  'full'
              }) }}
            ({{ new Date(p?.selesai ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
          <p v-else><i class="fa-solid fa-calendar-check"></i> Selesai: -</p>
          <p class="truncate"><i class="fa-solid fa-users"></i> {{ p.tim }}</p>
          <p class="truncate"><i class="fa-solid fa-box"></i> Pesanan {{ p.pesanan ? 'selesai' : 'diproses' }}</p>
          <div class="justify-end card-actions">
            <RouterLink :to="`/pengajuan/${p.id}`" class="btn btn-primary btn-square"><i class="fa-solid fa-info"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada pengajuan' }}</p>
    </div>
    <div class="flex flex-col gap-2">
      <RouterLink v-if="pengguna.peran === 'PJ'" to="/tambah-pengajuan" class="w-full btn btn-primary"><i
          class="fa-solid fa-plus"></i> Tambah Pengajuan
      </RouterLink>
      <!-- <div class="join">
        <button @click="prevPage" class="join-item btn" :disabled="isLoading || page === 1">«</button>
        <button class="flex-1 join-item btn" :disabled="isLoading">Halaman {{ page }}</button>
        <button @click="nextPage" class="join-item btn" :disabled="isLoading || !pengajuan?.length">»</button>
      </div> -->
    </div>
  </main>
</template>