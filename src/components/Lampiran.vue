<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { IDokumen, IPengguna } from '../models/types';
import { getCookies } from '../utils/cookies';
import { useRouter } from 'vue-router';
import { Dokumen } from '../models/Dokumen';

const router = useRouter()
const dokumenModel = Dokumen.getInstance()
const id = router.currentRoute.value.params.id
const pengguna = getCookies<IPengguna>('sessionId')

const daftarLampiran = ref<IDokumen[] | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    const data = await dokumenModel.getByPengajuan(id as string)
    if (data.length) daftarLampiran.value = data.filter((i) => i.tipe === 'lampiran')!
    else daftarLampiran.value = null
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <div v-if="daftarLampiran?.length" class="flex flex-col gap-2">
    <div v-for="lampiran in daftarLampiran" class="w-full shadow-sm card bg-base-100">
      <div class="card-body">
        <h2 class="text-base card-title">{{ lampiran.nama }}</h2>
        <p class="truncate"><i class="fa-solid fa-file"></i> {{ lampiran?.id ? `${lampiran.id}.pdf` : '-' }}</p>
        <p v-if="!lampiran?.created_at" class="truncate"><i class="fa-solid fa-calendar"></i> -</p>
        <p v-else class="truncate"><i class="fa-solid fa-calendar"></i> {{ new Date(lampiran?.created_at ??
          '').toLocaleDateString('id', {
            dateStyle:
              'full'
          }) }}
          ({{ new Date(lampiran?.created_at ??
            '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
        <p class="truncate"><i class="fa-solid fa-user"></i> {{ lampiran?.pengguna?.nama ?? '-' }} ({{
          lampiran?.pengguna?.peran ?? '-' }})</p>
        <div class="justify-end card-actions">
          <RouterLink v-if="pengguna.id === lampiran.pengguna?.id" :to="`/pengajuan/${id}/lampiran`"
            class="btn btn-primary btn-square"><i class="fa-solid fa-pencil"></i>
          </RouterLink>
          <a :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${lampiran.id}`"
            target="_blank" class="btn btn-primary btn-square"><i class="fa-solid fa-download"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-2">
    <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada lampiran' }}</p>
  </div>
</template>