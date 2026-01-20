<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';
import { useRouter } from 'vue-router';
import { Pengguna } from '../models/Pengguna';
import type { IPengajuan, IPengguna } from '../models/types';
import { Pengajuan } from '../models/Pengajuan';
import { Dokumen } from '../models/Dokumen';
import { KotakMasuk } from '../models/KotakMasuk';

const router = useRouter()
const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dokumen.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const id = router.currentRoute.value.params.id

const forms = ref<IPengajuan>({
  nama: '',
  pesanan: false,
  status: 'Diproses',
  tim: 'Tim SPIP',
  disetujui: false
})
const namaPengajuan = ref<string>('')
const daftarPengguna = ref<IPengguna[] | null>(null)
const isLoading = ref<boolean>(false)

async function ubahPengajuan() {
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { nama: forms.value.nama, pesanan: forms.value.pesanan, status: forms.value.status, disetujui: forms.value.disetujui, selesai: forms.value.status === 'Selesai' ? new Date().toISOString() : null })
    await kotakMasukModel.insert(pjId, `Salah satu pengajuan Anda telah diedit oleh Admin.`)
    await kotakMasukModel.insert(ketuaId, `Salah satu pengajuan Anda telah diedit oleh Admin.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Salah satu pengajuan telah diedit oleh Admin.`)
    })
    router.push('/menu-admin?filter=pengajuan')
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
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await dokumenModel.deleteFiles(id as string)
    await pengajuanModel.deleteById(id as string)
    await kotakMasukModel.insert(pjId, `Salah satu pengajuan Anda telah dihapus oleh Admin.`)
    await kotakMasukModel.insert(ketuaId, `Salah satu pengajuan Anda telah dihapus oleh Admin.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Salah satu pengajuan telah dihapus oleh Admin.`)
    })
    router.push('/menu-admin?filter=pengajuan')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function getData() {
  try {
    isLoading.value = true
    const data = await pengajuanModel.getById(id as string)
    const dataPengguna = await penggunaModel.getByTim([data[0]!.tim!])
    if (data.length && dataPengguna.length) {
      forms.value = data[0]!
      namaPengajuan.value = data[0]!.nama ?? ''
      daftarPengguna.value = dataPengguna
    } else {
      daftarPengguna.value = null
      router.push('/menu-admin?filter=pengajuan')
    }
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.push('/menu-admin?filter=pengajuan')
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
      <p class="text-xl font-semibold">Edit Pengajuan</p>
      <RouterLink to="/menu-admin?filter=pengajuan" class="btn btn-link">&lt; Kembali</RouterLink>
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
        <legend class="fieldset-legend">Persetujuan Ketua Tim
          <Required />
        </legend>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.disetujui" type="radio" class="radio" name="disetujui" :value="true" required />
          <p class="truncate">Disetujui</p>
        </div>
        <div class="flex items-center gap-2 truncate">
          <input v-model="forms.disetujui" type="radio" class="radio" name="disetujui" :value="false" required />
          <p class="truncate">Belum disetujui</p>
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
      <!-- <fieldset class="fieldset">
        <legend class="fieldset-legend">Tim
          <Required />
        </legend>
        <div v-for="team in teams" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim" type="radio" class="radio" name="tim" :value="team" required />
          <p class="truncate">{{ team }}</p>
        </div>
      </fieldset> -->
    </form>
    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
          class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button>
      <button @click="hapusPengajuan" class="w-full btn btn-error" :disabled="isLoading"><i
          class="fa-solid fa-trash"></i>
        Hapus Pengajuan</button>
    </div>
  </main>
</template>