<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';
import { useRouter } from 'vue-router';
import type { IDokumen } from '../models/types';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';

const router = useRouter()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const id = router.currentRoute.value.params.id

const forms = ref<IDokumen>({
  pengajuan: {},
  pengguna: {},
  status: 'Diproses',
  tipe: 'kak'
})
const isLoading = ref<boolean>(false)

async function ubahDokumen() {
  try {
    isLoading.value = true
    await dokumenModel.updateById(id as string, { status: forms.value.status })
    await kotakMasukModel.insert(forms.value.pengguna?.id!, `Salah satu dokumen Anda telah diedit oleh Admin.`)
    router.push('/menu-admin?filter=dokumen')
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
    await dokumenModel.deleteByPengajuan(forms.value.pengajuan?.id!, forms.value.tipe!)
    await kotakMasukModel.insert(forms.value.pengguna?.id!, `Salah satu dokumen Anda telah dihapus oleh Admin.`)
    router.push('/menu-admin?filter=dokumen')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  try {
    isLoading.value = true
    const data = await dokumenModel.getById(id as string)
    if (data.length) forms.value = data[0]!
    else router.push('/menu-admin?filter=dokumen')
  }
  catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.push('/menu-admin?filter=dokumen')
    }
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
      <p class="text-xl font-semibold">Edit Dokumen</p>
      <RouterLink to="/menu-admin?filter=dokumen" class="btn btn-link">&lt; Kembali</RouterLink>
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
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
          class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button>
      <button @click="hapusDokumen" class="w-full btn btn-error" :disabled="isLoading"><i class="fa-solid fa-trash"></i>
        Hapus Dokumen</button>
    </div>
  </main>
</template>