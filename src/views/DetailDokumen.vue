<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';
import { useRouter } from 'vue-router';
import { Dokumen } from '../models/Dokumen';
import { getCookies } from '../utils/cookies';
import type { IPengguna, TDokumen } from '../models/types';

const router = useRouter()
const dokumenModel = Dokumen.getInstance()
const id = router.currentRoute.value.params.id
const tipe = router.currentRoute.value.params.tipe
const pengguna = getCookies<IPengguna>('sessionId')

const file = ref<File | null>(null)
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]!
  }
}

async function uploadDokumen() {
  if (file.value?.type !== 'application/pdf') return alert('File harus berformat PDF!')
  if (file.value?.size > 1024000) return alert('Ukuran file harus kurang dari 1MB!')
  try {
    isLoading.value = true
    const dokumenId = crypto.randomUUID()
    await dokumenModel.deleteByPengajuan(id as string, tipe as string)
    await dokumenModel.insert(dokumenId, id as string, pengguna.id!, tipe as TDokumen)
    await dokumenModel.upload(dokumenId, file.value!)
    router.push(`/pengajuan/${id}`)
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusDokumen() {
  const conf = confirm('Apakah Anda ingin menghapus dokumen ini?')
  if (!conf) return
  try {
    isLoading.value = true
    await dokumenModel.deleteByPengajuan(id as string, tipe as string)
    router.push(`/pengajuan/${id}`)
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold">Edit Dokumen ({{ String(tipe).toUpperCase() }})</p>
      <RouterLink :to="`/pengajuan/${id}`" class="btn btn-link">&lt; Kembali</RouterLink>
    </div>
    <form @submit.prevent="uploadDokumen" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">File
          <Required />
        </legend>
        <input @change="handleChange" id="fileInput" type="file" class="w-full file-input" name="kak " accept=".pdf"
          required :disabled="isLoading" />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
    </form>
    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
          class="fa-solid fa-upload"></i> Upload Dokumen</button>
      <button @click="hapusDokumen" class="w-full btn btn-error" form="form" :disabled="isLoading"><i
          class="fa-solid fa-trash"></i> Hapus
        Dokumen</button>
    </div>
  </main>
</template>