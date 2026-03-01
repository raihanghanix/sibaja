<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IPengajuan, IPengguna, TDokumen } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currRoute = router.currentRoute
const currUser = getCookies<IPengguna>('sessionId')

const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()

const detailPengajuan = ref<IPengajuan>({})
const namaDokumen = ref<string>('')
const dokumen = ref<File>()
const isLoading = ref<boolean>(false)

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    dokumen.value = target.files[0]!
  }
}

function abbr() {
  const tipe = currRoute.value.query.tipe as TDokumen
  if (tipe === 'kak') namaDokumen.value = 'Kerangka Acuan Kerja'
  if (tipe === 'fp') namaDokumen.value = 'Form Permintaan'
  if (tipe === 'spp') namaDokumen.value = 'Surat Permintaan ke PPK'
  if (tipe === 'drk') namaDokumen.value = 'Dokumen Rancangan Kontrak'
  if (tipe === 'st') namaDokumen.value = 'Spekteknis'
  if (tipe === 'rabhps') namaDokumen.value = 'RAB/HPS (Harga Perkiraan Sendiri)'
  if (tipe === 'sppp') namaDokumen.value = 'Surat Penunjukan Pejabat Pengadaan'
  if (tipe === 'sppbj') namaDokumen.value = 'Surat Penetapan Pemenang Barang dan Jasa'
  if (tipe === 'sksp') namaDokumen.value = 'Surat Kontrak atau Surat Pesanan'
  if (tipe === 'bast') namaDokumen.value = 'Berita Acara Serah Terima Pekerjaan'
  if (tipe === 'bap') namaDokumen.value = 'Berita Acara Pembayaran'
  if (tipe === 'kui') namaDokumen.value = 'Kuitansi'
  if (tipe === 'sp') namaDokumen.value = 'Surat Pesanan'
  if (tipe === 'ban') namaDokumen.value = 'Berita Acara Negosiasi'
  if (tipe === 'bahp') namaDokumen.value = 'Berita Acara Berhasil Pemilihan'
  if (tipe === 'spm') namaDokumen.value = 'Surat Perintah Pembayaran'
}

async function tambahDokumen() {
  if (dokumen.value?.type !== 'application/pdf') return alert('File harus berformat PDF!')
  if (dokumen.value?.size > 1024000) return alert('Ukuran file harus kurang dari 1MB!')
  try {
    isLoading.value = true
    const dokumenId = crypto.randomUUID()
    await dokumenModel.deleteByPengajuan(currRoute.value.query.id as string, currRoute.value.query.tipe as string)
    await dokumenModel.insert(dokumenId, currRoute.value.query.id as string, currUser?.id!, currRoute.value.query.tipe as TDokumen, namaDokumen.value, currUser.peran === currRoute.value.query.validator as string ? 'Valid' : 'Diproses')
    await dokumenModel.upload(dokumenId, dokumen.value!)
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengirim dokumen ${namaDokumen.value}.`, true)
    router.push(`/dokumen?id=${currRoute.value.query.id as string}&filter=${currUser.peran?.toLowerCase()}`)
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
    await dokumenModel.deleteByPengajuan(currRoute.value.query.id as string, currRoute.value.query.tipe as string)
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) menghapus dokumen ${namaDokumen.value}.`, true)
    router.push(`/dokumen?id=${currRoute.value.query.id as string}&filter=${currUser.peran?.toLowerCase()}`)
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
    abbr()
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
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">Tambah/Edit Dokumen</p>
        <button @click="() => router.go(-1)" class="underline cursor-pointer text-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-2 ">
      <p class="text-sm">{{ detailPengajuan.nama ?? '...' }}</p>
    </div>

    <form @submit.prevent="tambahDokumen" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama Dokumen
          <Required />
        </legend>
        <input v-model="namaDokumen" type="text" class="w-full input" placeholder="Nama dokumen..." name="namaDokumen"
          required disabled />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">File Dokumen
          <Required />
        </legend>
        <input @change="handleChange" type="file" class="w-full file-input" accept=".pdf" name="dokumen" required />
        <label class="label">File PDF (Maks. 1MB)</label>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-upload"></i> Upload Dokumen
      </button>
      <button @click="hapusDokumen" class="w-full btn btn-error" :disabled="isLoading">
        <i class="fa-solid fa-trash"></i> Hapus Dokumen
      </button>
    </div>

  </div>
</template>