<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { IPengajuan } from '../models/types';
import { Pengajuan } from '../models/Pengajuan';

const pengajuanModel = Pengajuan.getInstance()

const daftarPengajuan = ref<IPengajuan[] | null>(null)
const filter = ref<'Diproses' | 'Selesai' | 'Ditolak' | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    if (!filter.value) {
      const data = await pengajuanModel.getAll()
      const filteredData = data.sort((a, b) => {
        const dateA = new Date(a.created_at ?? '').valueOf()
        const dateB = new Date(b.created_at ?? '').valueOf()
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })
      if (filteredData.length) daftarPengajuan.value = filteredData
      else daftarPengajuan.value = null
    }
    else {
      const data = await pengajuanModel.getByStatus(filter.value!)
      const filteredData = data.sort((a, b) => {
        const dateA = new Date(a.created_at ?? '').valueOf()
        const dateB = new Date(b.created_at ?? '').valueOf()
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })
      if (filteredData.length) daftarPengajuan.value = filteredData
      else daftarPengajuan.value = null
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <div class="truncate divider divider-start"></div>
  <div class="filter mb-2">
    <input @change="getData" v-model="filter" class="btn btn-soft filter-reset" type="radio" name="metaframeworks"
      aria-label="X" :value="null" />
    <input @change="getData" v-model="filter" class="btn btn-soft btn-info" type="radio" name="metaframeworks"
      aria-label="Diproses" value="Diproses" />
    <input @change="getData" v-model="filter" class="btn btn-soft btn-success" type="radio" name="metaframeworks"
      aria-label="Selesai" value="Selesai" />
    <input @change="getData" v-model="filter" class="btn btn-soft btn-error" type="radio" name="metaframeworks"
      aria-label="Ditolak" value="Ditolak" />
  </div>
  <div v-if="daftarPengajuan?.length" class="flex flex-col gap-2">
    <div v-for="i in daftarPengajuan" class="w-full shadow-sm card bg-base-100">
      <div class="card-body">
        <h2 class="text-base card-title">{{ i.nama }}</h2>
        <div v-if="i.status === 'Diproses'" class="badge badge-soft badge-info">{{ i.status }}</div>
        <div v-if="i.status === 'Selesai'" class="badge badge-soft badge-success">{{ i.status }}</div>
        <div v-if="i.status === 'Ditolak'" class="badge badge-soft badge-error">{{ i.status }}</div>
        <div v-if="i.disetujui" class="badge badge-soft badge-success">Disetujui ketua tim</div>
        <div v-if="!i.disetujui" class="badge badge-soft badge-error">Belum disetujui ketua tim</div>
        <p class="truncate"><i class="fa-solid fa-calendar"></i> Diajukan: {{ new Date(i.created_at ??
          '').toLocaleDateString('id', {
            dateStyle:
              'full'
          }) }}
          ({{ new Date(i.created_at ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
        <p v-if="i?.selesai" class="truncate"><i class="fa-solid fa-calendar-check"></i> Selesai: {{ new
          Date(i?.selesai ??
            '').toLocaleDateString('id', {
              dateStyle:
                'full'
            }) }}
          ({{ new Date(i?.selesai ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
        <p v-else><i class="fa-solid fa-calendar-check"></i> Selesai: -</p>
        <p class="truncate"><i class="fa-solid fa-users"></i> {{ i.tim }}</p>
        <p class="truncate"><i class="fa-solid fa-box"></i> Pesanan {{ i.pesanan ? 'selesai' : 'diproses' }}</p>
        <div class="justify-end card-actions">
          <RouterLink :to="`/menu-admin/pengajuan/${i.id}`" class="btn btn-primary btn-square"><i
              class="fa-solid fa-pencil"></i>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-2">
    <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada pengajuan' }}</p>
  </div>
</template>