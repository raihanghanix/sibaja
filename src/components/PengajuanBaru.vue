<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { Aktivitas } from '../models/Aktivitas';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const aktivitasModel = Aktivitas.getInstance()

const forms = ref<IPengajuan>({
  nama: '',
  tim: currUser?.tim![0] ?? '',
})
const formFiles = ref<Record<string, File | null>>({
  kak: null,
  fp: null,
})
const daftarPengajuan = ref<IPengajuan[]>([])
const daftarKetuaTim = ref<IPengguna[]>([])
const daftarPbj = ref<IPengguna[]>([])
const idPbjTersedia = ref<string[]>([])
const pbjPilihan = ref<string>('')
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formFiles.value[target.name] = target.files[0]!
  }
}

function isDisabled() {
  const arr = daftarPbj.value.map((i) => {
    const num = daftarPengajuan.value.filter((j) => j.pbj?.id === i.id).length
    return num
  })
  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const pbj = daftarPbj.value.map((i) => {
    const num = daftarPengajuan.value.filter((j) => j.pbj?.id === i.id).length
    if (num === min || num < max) return i.id
  })
  idPbjTersedia.value = pbj.filter((i) => i !== undefined || typeof i !== 'undefined')
}

async function tambahPengajuan() {
  try {
    isLoading.value = true

    if (daftarPengajuan.value.find((i) => i.nama?.includes(forms.value.nama as string))) {
      alert('Nama kegiatan sudah ada pada sistem!')
      return
    }

    const pengajuanId = crypto.randomUUID()
    await pengajuanModel.insert({ id: pengajuanId, ...forms.value }, pbjPilihan.value)

    const kakId = crypto.randomUUID()
    await dokumenModel.insert(kakId, pengajuanId, currUser?.id!, 'kak', 'Kerangka Acuan Kerja')
    await dokumenModel.upload(kakId, formFiles.value.kak!)

    if (!formFiles.value.fp?.bytes && formFiles.value.fp === null || formFiles.value.fp === undefined) {
      await aktivitasModel.insert(currUser?.id!, null, `${currUser?.nama} (${currUser?.peran}) dari ${forms.value.tim} mengajukan ${forms.value.nama}.`, false)
      alert('Pengajuan berhasil ditambahkan!')
      return router.push('/')
    } else {
      const fpId = crypto.randomUUID()
      await dokumenModel.insert(fpId, pengajuanId, currUser?.id!, 'fp', 'Form Permintaan')
      await dokumenModel.upload(fpId, formFiles.value.fp!)
      await aktivitasModel.insert(currUser?.id!, null, `${currUser?.nama} (${currUser?.peran}) dari ${forms.value.tim} mengajukan ${forms.value.nama}.`, false)
      alert('Pengajuan berhasil ditambahkan!')
      router.push('/')
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  try {
    isLoading.value = true
    const dataSemuaPengajuan = (await pengajuanModel.getAll('Diproses')).filter((i) => i.status === 'Diproses')
    const dataPBJ = await penggunaModel.getByPeran('PBJ', 'desc')
    const dataKetuaTim = await penggunaModel.getByPeran('Ketua Tim', 'desc')
    const filteredData = dataKetuaTim.filter((i) => {
      for (let j of i.tim!) {
        if (currUser?.tim?.includes(j)) return true
      }
    })
    daftarKetuaTim.value = filteredData
    daftarPengajuan.value = dataSemuaPengajuan
    daftarPbj.value = dataPBJ
    isDisabled()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
  if (!currUser) {
    router.replace('/?view=login')
    return
  }
  if (currUser && currUser.peran !== 'PJ') {
    router.go(-1)
    return
  }
  getData()
})
</script>

<template>
  <Navbar />
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <p class="text-lg font-semibold">Pengajuan Baru</p>
    </div>

    <form @submit.prevent="tambahPengajuan" class="grid grid-cols-2 gap-2 max-sm:grid-cols-1" id="form">
      <fieldset class="col-span-2 max-sm:col-span-1 fieldset">
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
        <div v-for="tim in currUser?.tim" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim" type="radio" class="radio" name="tim" :id="tim" :value="tim" disabled required />
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
          <input v-model="pbjPilihan" type="radio" class="radio" name="pbj" :id="pbj.id" :value="pbj.id"
            :disabled="!idPbjTersedia.includes(pbj.id!)" required />
          <p class="truncate">
            {{ pbj.nama }} ({{daftarPengajuan.filter((i) => i.pbj?.nama?.includes(pbj.nama!)).length}} Pengajuan
            Diproses)
          </p>
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