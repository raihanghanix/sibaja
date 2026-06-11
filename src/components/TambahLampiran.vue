<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { Aktivitas } from '../models/Aktivitas';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const aktivitasModel = Aktivitas.getInstance()

const detailPengajuan = ref<IPengajuan>({})
const idLampiran = ref<string>('')
const namaLampiran = ref<string>('')
const lampiran = ref<File>()
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    lampiran.value = target.files[0]!
  }
}

async function tambahLampiran() {
  if (lampiran.value?.type !== 'application/pdf') return alert('File harus berformat PDF!')
  if (lampiran.value?.size > 1024000) return alert('Ukuran file harus kurang dari 1MB!')
  try {
    isLoading.value = true
    if (!currRoute.value.query.idLampiran) {
      const lampiranId = crypto.randomUUID()
      await dokumenModel.insert(lampiranId, currRoute.value.query.id as string, currUser?.id!, 'lampiran', namaLampiran.value)
      await dokumenModel.upload(lampiranId, lampiran.value!)
      await aktivitasModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengirim lampiran ${namaLampiran.value}.`, true)
    } else {
      const lampiranId = crypto.randomUUID()
      await dokumenModel.deleteById(currRoute.value.query.idLampiran as string)
      await dokumenModel.deleteFile(currRoute.value.query.idLampiran as string)
      await dokumenModel.insert(lampiranId, currRoute.value.query.id as string, currUser?.id!, 'lampiran', namaLampiran.value)
      await dokumenModel.upload(lampiranId, lampiran.value!)
      await aktivitasModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengirim lampiran ${namaLampiran.value}.`, true)
    }
    router.push(`/?view=dokumen-pengajuan&id=${currRoute.value.query.id as string}&filter=lampiran`)
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusLampiran() {
  const conf = confirm('Apakah Anda ingin menghapus lampiran ini?')
  if (!conf) return
  try {
    isLoading.value = true
    if (currRoute.value.query.idLampiran) {
      await dokumenModel.deleteById(currRoute.value.query.idLampiran as string)
      await dokumenModel.deleteFile(currRoute.value.query.idLampiran as string)
      await aktivitasModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) menghapus lampiran ${namaLampiran.value}.`, true)
    }
    router.push(`/?view=dokumen-pengajuan&id=${currRoute.value.query.id as string}&filter=lampiran`)
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  if (!currRoute.value.query.id) {
    alert('Id tidak ditemukan!')
    return router.replace('/')
  }
  try {
    isLoading.value = true
    const data = await pengajuanModel.getById(currRoute.value.query.id as string)
    if (!data[0]) throw new Error('Id pengajuan tidak ditemukan!')
    detailPengajuan.value = data[0]
    const dataLampiran = await dokumenModel.getById(currRoute.value.query.idLampiran as string)
    idLampiran.value = dataLampiran[0]?.id ?? ''
    namaLampiran.value = dataLampiran[0]?.nama ?? ''
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.replace('/')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <Navbar />
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">Tambah/Edit Lampiran</p>
        <button @click="() => router.go(-1)" class="link link-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <span class="badge badge-secondary">{{ detailPengajuan.nama ?? '...' }}</span>
    </div>

    <form @submit.prevent="tambahLampiran" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama Lampiran
          <Required />
        </legend>
        <input v-model="namaLampiran" type="text" class="w-full input" placeholder="Nama lampiran..."
          name="namaLampiran" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">File Lampiran
          <Required />
        </legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="lampiran" required />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-upload"></i> Upload Lampiran
      </button>
      <button v-if="currRoute.query.idLampiran" @click="hapusLampiran" class="w-full btn btn-error"
        :disabled="isLoading">
        <i class="fa-solid fa-trash"></i> Hapus Lampiran
      </button>
    </div>

  </div>
</template>