<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';
import { type IPengajuan, type IPengguna } from '../models/types';
import { onMounted, ref } from 'vue';
import { Pengajuan } from '../models/Pengajuan';
import { useRouter } from 'vue-router';
import { getCookies } from '../utils/cookies';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';
import { Pengguna } from '../models/Pengguna';

const router = useRouter()
const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const pengguna = getCookies<IPengguna>('sessionId')

const forms = ref<IPengajuan>({
  nama: '',
  tim: ''
})
const formFiles = ref<Record<string, File | null>>({
  kak: null,
  fp: null,
  spp: null
})
const daftarKetuaTim = ref<IPengguna[] | null>(null)
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formFiles.value[target.name] = target.files[0]
  }
}

async function getData() {
  try {
    isLoading.value = true
    const data = await penggunaModel.getByPeran('Ketua Tim')
    const filteredData = data.filter((i) => {
      for (let j of i.tim!) {
        if (pengguna.tim?.includes(j)) return true
      }
    })
    daftarKetuaTim.value = filteredData
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tambahPengajuan() {
  try {
    isLoading.value = true
    const pengajuanId = crypto.randomUUID()
    const kakId = crypto.randomUUID()
    const fpId = crypto.randomUUID()
    const sppId = crypto.randomUUID()
    const ketuaId = daftarKetuaTim.value?.find((i) => i.tim?.includes((forms.value.tim!)))?.id
    await pengajuanModel.insert({ id: pengajuanId, ...forms.value })
    await dokumenModel.insert(kakId, pengajuanId, pengguna.id!, 'kak')
    await dokumenModel.insert(fpId, pengajuanId, pengguna.id!, 'fp')
    await dokumenModel.insert(sppId, pengajuanId, pengguna.id!, 'spp')
    await dokumenModel.upload(kakId, formFiles.value.kak!)
    await dokumenModel.upload(fpId, formFiles.value.fp!)
    await dokumenModel.upload(sppId, formFiles.value.spp!)
    await kotakMasukModel.insert(ketuaId!, `Anda mempunyai pengajuan baru: ${forms.value.nama} (${forms.value.tim}).`)
    router.push('/')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold">Tambah Pengajuan</p>
      <RouterLink to="/" class="btn btn-link">&lt; Kembali</RouterLink>
    </div>
    <form @submit.prevent="tambahPengajuan" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama Kegiatan
          <Required />
        </legend>
        <input v-model="forms.nama" type="text" class="w-full input" placeholder="Contoh: Pengadaan Pakaian Dinas 2025"
          name="namaKegiatan" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama Tim
          <Required />
        </legend>
        <div v-for="tim, i in pengguna.tim" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim" type="radio" class="radio" name="tim" :id="tim" :value="tim" required />
          <p class="truncate">{{ tim }} (Ketua: {{daftarKetuaTim?.find((i) => i.tim?.includes(tim))?.nama ?? '-'}})</p>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Kerangka Acuan Kerja
          <Required />
        </legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="kak" required />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Form Permintaan
          <Required />
        </legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="fp" required />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Surat Permintaan PPK
          <Required />
        </legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="spp" required />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
    </form>
    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
          class="fa-solid fa-upload"></i> Upload Pengajuan</button>
    </div>
  </main>
</template>