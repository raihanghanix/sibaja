<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Dokumen } from '../models/Dokumen';
import { Aktivitas } from '../models/Aktivitas';
import type { IDokumen, IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currRoute = router.currentRoute
const dokumenModel = Dokumen.getInstance()
const aktivitasModel = Aktivitas.getInstance()
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined

const forms = ref<IDokumen>({
  nama: '',
  pengajuan: {},
  pengguna: {},
  status: 'Diproses',
  tipe: 'kak'
})
const isLoading = ref<boolean>(false)

async function ubahDokumen() {
  try {
    isLoading.value = true
    await aktivitasModel.insert(currUser?.id!, forms.value.pengajuan?.id!, `${currUser?.nama} (${currUser?.peran}) mengedit status dokumen ${forms.value.nama} menjadi ${forms.value.status}.`, true)
    await dokumenModel.updateById(currRoute.value.query.id as string, { status: forms.value.status, selesai: forms.value.status === 'Valid' ? new Date().toISOString() : null })
    alert('Dokumen berhasil diubah!')
    router.push('/?view=admin-dokumen')
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
    await aktivitasModel.insert(currUser?.id!, forms.value.pengajuan?.id!, `${currUser?.nama} (${currUser?.peran}) menghapus dokumen ${forms.value.nama}.`, true)
    await dokumenModel.deleteByPengajuan(forms.value.pengajuan?.id!, forms.value.tipe!)
    alert('Dokumen berhasil dihapus!')
    router.push('/?view=admin-dokumen')
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
    const data = await dokumenModel.getById(currRoute.value.query.id as string)
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
  currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
  if (!currUser) {
    router.replace('/?view=login')
    return
  }
  if (currUser && currUser.peran !== 'Admin') {
    router.go(-1)
    return
  }
  getData()
})
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">Edit Dokumen</p>
        <button @click="() => router.go(-1)" class="link link-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <form @submit.prevent="ubahDokumen" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Status Dokumen
          <Required />
        </legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Diproses" required />
          <p class="truncate">Diproses</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Valid" required />
          <p class="truncate">Valid</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.status" type="radio" class="radio" name="status" value="Tidak valid" required />
          <p class="truncate">Tidak valid</p>
        </div>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan
      </button>
      <button @click="hapusDokumen" class="w-full btn btn-error" :disabled="isLoading">
        <i class="fa-solid fa-trash"></i> Hapus Dokumen
      </button>
      <a :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${currRoute.query.id}`"
        target="_blank" class="w-full btn">
        <i class="fa-solid fa-download"></i> Download Dokumen
      </a>
    </div>

  </main>
</template>