<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Dokumen } from '../models/Dokumen';
import { Aktivitas } from '../models/Aktivitas';
import type { IDokumen, IPengguna, TDokumen } from '../models/types';

const props = defineProps<{ title: string, data: IDokumen | null, uploader: string, validator: string, tipe: TDokumen, idPbj?: string }>()

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const dokumenModel = Dokumen.getInstance()
const aktivitasModel = Aktivitas.getInstance()

const dokumen = ref<IDokumen | null>(props.data)
const isLoading = ref<boolean>(false)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id', { dateStyle: 'full' })
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('id', { timeStyle: 'short' })
}

async function terimaDokumen() {
  if (!dokumen.value?.status) return
  try {
    isLoading.value = true
    await dokumenModel.updateById(dokumen.value.id!, { status: 'Valid', selesai: new Date().toISOString() })
    await aktivitasModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) menerima dokumen ${props.title}.`, true)
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tolakDokumen() {
  if (!dokumen.value?.status) return
  const input = prompt('Apa alasan Anda menolak dokumen ini? (Wajib)')
  const alasan = input
  if (!alasan || !alasan.length) return
  try {
    isLoading.value = true
    await dokumenModel.updateById(dokumen.value.id!, { status: 'Tidak valid', selesai: null })
    await aktivitasModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) menolak dokumen ${props.title} dengan alasan: "${alasan}".`, true)
    await getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  if (!dokumen.value?.status) return
  try {
    isLoading.value = true
    const data = await dokumenModel.getById(dokumen.value.id!)
    dokumen.value = data[0]!
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full shadow-sm card bg-base-100">
    <div class="card-body">
      <div class="flex justify-between gap-1 truncate">
        <h2 class="text-base truncate card-title">{{ props.title }}</h2>
        <div v-if="!dokumen?.status" class="badge badge-soft">Belum diupload</div>
        <div v-else-if="dokumen?.status === 'Diproses'" class="badge badge-soft badge-info">Diproses</div>
        <div v-else-if="dokumen?.status === 'Valid'" class="badge badge-soft badge-success">Valid</div>
        <div v-else-if="dokumen?.status === 'Tidak valid'" class="badge badge-soft badge-error">Tidak valid</div>
      </div>
      <div class="flex flex-col gap-1 text-sm truncate">
        <p><i class="truncate fa-solid fa-key"></i> {{ dokumen?.id ? `${dokumen.id}.pdf` : '-' }}</p>
        <p>
          <i class="truncate fa-solid fa-calendar"></i> Diajukan: {{
            dokumen?.created_at ? `${formatDate(dokumen.created_at)} (${formatTime(dokumen.created_at)})` : '-'
          }}
        </p>
        <p>
          <i class="truncate fa-solid fa-calendar-check"></i> Divalidasi: {{
            dokumen?.selesai ? `${formatDate(dokumen.selesai)} (${formatTime(dokumen.selesai)})` : '-'
          }}
        </p>
        <p>
          <i class="truncate fa-solid fa-user"></i> {{ dokumen?.pengguna?.nama ?? '-' }} ({{
            dokumen?.pengguna?.peran ?? '-' }})
        </p>
      </div>
      <div v-if="dokumen?.status" class="justify-end card-actions">
        <RouterLink v-if="currUser.id === dokumen.pengguna?.id && currUser.peran === props.uploader"
          :to="`/?view=tambah-dokumen&id=${currRoute.query.id}&tipe=${dokumen.tipe}&validator=${props.validator}`"
          class="btn btn-square btn-primary">
          <i class="fa-solid fa-pencil"></i>
        </RouterLink>
        <a :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${dokumen.id}`"
          target="_blank" class="btn btn-square btn-primary">
          <i class="fa-solid fa-download"></i>
        </a>
        <button @click="terimaDokumen"
          v-if="currUser.peran !== 'PBJ' && currUser.peran === props.validator && props.uploader !== props.validator"
          class="btn btn-square btn-success" :disabled="isLoading || dokumen?.status === 'Valid'">
          <i class="fa-solid fa-check"></i>
        </button>
        <button @click="tolakDokumen"
          v-if="currUser.peran !== 'PBJ' && currUser.peran === props.validator && props.uploader !== props.validator"
          class="btn btn-square btn-error" :disabled="isLoading || dokumen?.status === 'Tidak valid'">
          <i class="fa-solid fa-x"></i>
        </button>
        <button @click="terimaDokumen"
          v-if="currUser.peran === 'PBJ' && currUser.peran === props.validator && currUser.id === props.idPbj"
          class="btn btn-square btn-success" :disabled="isLoading || dokumen?.status === 'Valid'">
          <i class="fa-solid fa-check"></i>
        </button>
        <button @click="tolakDokumen"
          v-if="currUser.peran === 'PBJ' && currUser.peran === props.validator && currUser.id === props.idPbj"
          class="btn btn-square btn-error" :disabled="isLoading || dokumen?.status === 'Tidak valid'">
          <i class="fa-solid fa-x"></i>
        </button>
      </div>
      <div v-else class="justify-end card-actions">
        <RouterLink v-if="props.uploader === 'PBJ' && currUser.id === props.idPbj"
          :to="`/?view=tambah-dokumen&id=${currRoute.query.id}&tipe=${props.tipe}&validator=${props.validator}`"
          class="btn btn-square btn-primary">
          <i class="fa-solid fa-plus"></i>
        </RouterLink>
        <RouterLink v-if="props.uploader !== 'PBJ' && currUser.peran === props.uploader"
          :to="`/?view=tambah-dokumen&id=${currRoute.query.id}&tipe=${props.tipe}&validator=${props.validator}`"
          class="btn btn-square btn-primary">
          <i class="fa-solid fa-plus"></i>
        </RouterLink>
      </div>
    </div>
  </div>
</template>