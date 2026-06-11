<script setup lang="ts">
import { useRouter } from 'vue-router';
import { getCookies } from '../utils/cookies';
import type { IDokumen, IPengguna, TDokumen } from '../models/types';

const props = defineProps<{ data: IDokumen[] | null, tipe: TDokumen }>()

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}
</script>

<template>
  <div v-if="props.data?.length" v-for="i in props.data" class="w-full shadow-sm card bg-base-100">
    <div class="card-body">
      <div class="flex justify-between gap-1 truncate">
        <h2 class="text-base truncate card-title">{{ i.nama }}</h2>
      </div>
      <div class="flex flex-col gap-1 text-sm truncate">
        <p><i class="truncate fa-solid fa-key"></i> {{ i.id ? `${i.id}.pdf` : '-' }}</p>
        <p>
          <i class="truncate fa-solid fa-calendar"></i> Diajukan: {{
            i.created_at ? `${formatDate(i.created_at)} (${formatTime(i.created_at)})` : '-'
          }}
        </p>
        <p>
          <i class="truncate fa-solid fa-user"></i> {{ i.pengguna?.nama ?? '-' }} ({{
            i.pengguna?.peran ?? '-' }})
        </p>
      </div>
      <div class="justify-end card-actions">
        <RouterLink v-if="currUser.id === i.pengguna?.id"
          :to="`/?view=tambah-lampiran&id=${currRoute.query.id}&idLampiran=${i.id}`" class="btn btn-square btn-primary">
          <i class="fa-solid fa-pencil"></i>
        </RouterLink>
        <a :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${i.id}`" target="_blank"
          class="btn btn-square btn-primary">
          <i class="fa-solid fa-download"></i>
        </a>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-2 text-sm font-semibold text-center">
    <p>Tidak ada lampiran</p>
  </div>
</template>