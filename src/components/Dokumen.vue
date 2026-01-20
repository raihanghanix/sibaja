<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IDokumen, IPengguna, TDokumen, TPeran } from '../models/types';
import { onMounted } from 'vue';
import { Dokumen } from '../models/Dokumen';
import { ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { KotakMasuk } from '../models/KotakMasuk';

const props = defineProps<{ judul: string, type: TDokumen, pengajuan: string, validator?: TPeran, uploader?: TPeran, validasi?: boolean }>()

const router = useRouter()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const id = router.currentRoute.value.params.id
const pengguna = getCookies<IPengguna>('sessionId')

const dokumen = ref<IDokumen | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    const data = await dokumenModel.getByPengajuan(id as string)
    if (data.length) dokumen.value = data.find((i) => i.tipe === props.type)!
    else dokumen.value = null
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function terimaDokumen() {
  try {
    isLoading.value = true
    await dokumenModel.updateById(dokumen.value?.id!, { status: 'Valid' })
    await kotakMasukModel.insert(dokumen.value?.pengguna?.id!, `Dokumen ${props.judul} Anda dari pengajuan ${props.pengajuan} diterima.`)
    getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tolakDokumen() {
  const input = prompt('Apa alasan Anda menolak dokumen ini?')
  const alasan = input ? input : 'Tidak ada alasan'
  try {
    isLoading.value = true
    await dokumenModel.updateById(dokumen.value?.id!, { status: 'Tidak valid' })
    await kotakMasukModel.insert(dokumen.value?.pengguna?.id!, `Dokumen ${props.judul} Anda dari pengajuan ${props.pengajuan} ditolak. Alasan: ${alasan}`)
    getData()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <div class="w-full shadow-sm card bg-base-100">
    <div class="card-body">
      <h2 class="text-base card-title">{{ props.judul }}</h2>
      <div v-if="!dokumen?.status" class="badge badge-soft">Belum diupload</div>
      <div v-if="dokumen?.status === 'Diproses'" class="badge badge-soft badge-info">{{ dokumen?.status }}</div>
      <div v-if="dokumen?.status === 'Valid'" class="badge badge-soft badge-success">{{ dokumen?.status }}</div>
      <div v-if="dokumen?.status === 'Tidak valid'" class="badge badge-soft badge-error">{{ dokumen?.status }}
      </div>
      <p class="truncate"><i class="fa-solid fa-file"></i> {{ dokumen?.id ? `${dokumen.id}.pdf` : '-' }}</p>
      <p v-if="!dokumen?.created_at" class="truncate"><i class="fa-solid fa-calendar"></i> -</p>
      <p v-else class="truncate"><i class="fa-solid fa-calendar"></i> {{ new Date(dokumen?.created_at ??
        '').toLocaleDateString('id', {
          dateStyle:
            'full'
        }) }}
        ({{ new Date(dokumen?.created_at ??
          '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
      <p class="truncate"><i class="fa-solid fa-user"></i> {{ dokumen?.pengguna?.nama ?? '-' }} ({{
        dokumen?.pengguna?.peran ?? '-' }})</p>
      <div class="justify-end card-actions">
        <button v-if="props.validasi && pengguna.peran === props.uploader" class="btn btn-square" disabled><i
            class="fa-solid fa-pencil"></i></button>
        <RouterLink v-if="!props.validasi && pengguna.peran === props.uploader" :to="`/pengajuan/${id}/${props.type}`"
          class="btn btn-primary btn-square"><i class="fa-solid fa-pencil"></i>
        </RouterLink>
        <a v-if="dokumen?.status"
          :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${dokumen.id}`"
          target="_blank" class="btn btn-primary btn-square"><i class="fa-solid fa-download"></i>
        </a>
        <button @click="terimaDokumen" v-if="pengguna.peran === props.validator" class="btn btn-success btn-square"
          :disabled="!dokumen?.status || dokumen.status === 'Valid'"><i class="fa-solid fa-check"></i>
        </button>
        <button @click="tolakDokumen" v-if="pengguna.peran === props.validator" class="btn btn-error btn-square"
          :disabled="!dokumen?.status || dokumen.status === 'Tidak valid'"><i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </div>
</template>