<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IPengajuan, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currRoute = router.currentRoute
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const currUser = getCookies<IPengguna>('sessionId')

const forms = ref<IPengajuan>({
  nama: '',
  pesanan: false,
  status: 'Diproses',
  selesai: null
})
const isLoading = ref<boolean>(false)

async function ubahPengajuan() {
  try {
    isLoading.value = true
    await pengajuanModel.updateById(currRoute.value.query.id as string, {
      nama: forms.value.nama,
      pesanan: forms.value.pesanan,
      status: forms.value.status,
      selesai: forms.value.status === 'Selesai' ? new Date().toISOString() : null
    })
    await kotakMasukModel.insert(currUser.id!, currRoute.value.query.id as string, `${currUser.nama} (${currUser.peran}) mengedit pengajuan ini.`, true)
    router.push('/admin-pengajuan')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusPengajuan() {
  const conf = confirm('Apakah Anda ingin menghapus pengajuan ini?')
  if (!conf) return
  try {
    isLoading.value = true
    await kotakMasukModel.insert(currUser.id!, null, `${currUser?.nama} (${currUser.peran}) dari ${forms.value.tim} menghapus ${forms.value.nama}.`, false)
    await dokumenModel.deleteFiles(currRoute.value.query.id as string)
    await pengajuanModel.deleteById(currRoute.value.query.id as string)
    router.push('/admin-pengajuan')
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
    if (data.length) forms.value = data[0]!
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.replace('/')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (currUser.peran !== 'Admin') return router.go(-1)
  getData()
})
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold">Edit Pengajuan</p>
      <button @click="() => router.go(-1)" class="underline cursor-pointer text-primary">
        &lt; Kembali
      </button>
    </div>
    <form @submit.prevent="ubahPengajuan" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama
          <Required />
        </legend>
        <input v-model="forms.nama" type="text" class="w-full input" placeholder="Nama..." name="nama" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Status Pengajuan
          <Required />
        </legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Diproses" required />
          <p class="truncate">Diproses</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Selesai" required />
          <p class="truncate">Selesai</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Ditolak" required />
          <p class="truncate">Ditolak</p>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Status Pesanan
          <Required />
        </legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.pesanan" type="radio" class="radio" name="pesanan" :value="false" required />
          <p class="truncate">Diproses</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.pesanan" type="radio" class="radio" name="pesanan" :value="true" required />
          <p class="truncate">Selesai</p>
        </div>
      </fieldset>
    </form>
    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan
      </button>
      <button @click="hapusPengajuan" class="w-full btn btn-error" :disabled="isLoading">
        <i class="fa-solid fa-trash"></i> Hapus Pengajuan
      </button>
    </div>
  </main>
</template>