<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currUser = getCookies<IPengguna>('sessionId')

const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()

const forms = ref<IPengajuan>({
  nama: '',
  tim: '',
})
const formFiles = ref<Record<string, File | null>>({
  kak: null,
  fp: null,
})
const daftarKetuaTim = ref<IPengguna[]>([])
const daftarPbj = ref<IPengguna[]>([])
const pbjPilihan = ref<string>('')
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formFiles.value[target.name] = target.files[0]!
  }
}

async function tambahPengajuan() {
  try {
    isLoading.value = true
    const pengajuanId = crypto.randomUUID()
    await pengajuanModel.insert({ id: pengajuanId, ...forms.value }, pbjPilihan.value)

    const kakId = crypto.randomUUID()
    await dokumenModel.insert(kakId, pengajuanId, currUser?.id!, 'kak', 'Kerangka Acuan Kerja')
    await dokumenModel.upload(kakId, formFiles.value.kak!)

    if (!formFiles.value.fp?.bytes && formFiles.value.fp === null || formFiles.value.fp === undefined) {
      await kotakMasukModel.insert(currUser.id!, null, `${currUser?.nama} (${currUser.peran}) dari ${forms.value.tim} mengajukan ${forms.value.nama}.`, false)
      return router.push('/')
    } else {
      const fpId = crypto.randomUUID()
      await dokumenModel.insert(fpId, pengajuanId, currUser?.id!, 'fp', 'Form Permintaan')
      await dokumenModel.upload(fpId, formFiles.value.fp!)
      await kotakMasukModel.insert(currUser.id!, null, `${currUser?.nama} (${currUser.peran}) dari ${forms.value.tim} mengajukan ${forms.value.nama}.`, false)
      router.push('/')
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  if (currUser.peran !== 'PJ') return router.go(-1)
  try {
    isLoading.value = true
    const dataKetuaTim = await penggunaModel.getByPeran('Ketua Tim', 'desc')
    const dataPBJ = await penggunaModel.getByPeran('PBJ', 'desc')
    const filteredData = dataKetuaTim.filter((i) => {
      for (let j of i.tim!) {
        if (currUser.tim?.includes(j)) return true
      }
    })
    daftarKetuaTim.value = filteredData
    daftarPbj.value = dataPBJ
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
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">Tambah Pengajuan</p>
        <button @click="() => router.go(-1)" class="underline cursor-pointer text-primary">
          &lt; Kembali
        </button>
      </div>
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
        <div v-for="tim in currUser.tim" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim" type="radio" class="radio" name="tim" :id="tim" :value="tim" required />
          <p class="truncate">
            {{ tim }} (Ketua: {{daftarKetuaTim.find((i) => i.tim?.includes(tim))?.nama ?? '-'}})
          </p>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Pilih PBJ
          <Required />
        </legend>
        <div v-for="pbj in daftarPbj" class="flex items-center gap-2 truncate">
          <input v-model="pbjPilihan" type="radio" class="radio" name="pbj" :id="pbj.id" :value="pbj.id" required />
          <p class="truncate">{{ pbj.nama }}</p>
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
        <legend class="fieldset-legend">Form Permintaan</legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="fp" />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-upload"></i> Upload Pengajuan
      </button>
    </div>

  </div>
</template>