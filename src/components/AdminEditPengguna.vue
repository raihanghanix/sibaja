<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { roles, teams, type IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
const penggunaModel = Pengguna.getInstance()

const forms = ref<IPengguna>({
  id: '',
  nama: '',
  email: '',
  password: '',
  peran: '',
  tim: []
})
const isLoading = ref<boolean>(false)

async function ubahProfil() {
  try {
    isLoading.value = true
    await penggunaModel.updateById(currRoute.value.query.id as string, forms.value)
    alert('Akun berhasil diubah!')
    router.push('/?view=admin-pengguna')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusAkun() {
  const conf = confirm('Apakah Anda ingin menghapus akun ini?')
  if (!conf) return
  try {
    isLoading.value = true
    await penggunaModel.deleteById(currRoute.value.query.id as string)
    alert('Akun berhasil dihapus!')
    router.push('/?view=admin-pengguna')
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
    const data = await penggunaModel.getById(currRoute.value.query.id as string)
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
  <div class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">

    <div class="flex flex-col gap-2">
      <div class="flex justify-between gap-1">
        <p class="text-lg font-semibold">Edit Pengguna</p>
        <button @click="() => router.go(-1)" class="link link-primary">
          &lt; Kembali
        </button>
      </div>
    </div>

    <form @submit.prevent="ubahProfil" class="grid grid-cols-2 gap-2 max-sm:grid-cols-1" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">NIP
          <Required />
        </legend>
        <input v-model="forms.id" type="text" class="w-full input" placeholder="NIP Anda..." name="nip"
          :disabled="currUser?.id === currRoute.query.id" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama
          <Required />
        </legend>
        <input v-model="forms.nama" type="text" class="w-full input" placeholder="Nama Anda..." name="nama"
          :disabled="currUser?.id === currRoute.query.id" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email
          <Required />
        </legend>
        <input v-model="forms.email" type="email" class="w-full input" placeholder="Email Anda..." name="email"
          :disabled="currUser?.id === currRoute.query.id" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Password
          <Required />
        </legend>
        <input v-model="forms.password" type="text" class="w-full input" placeholder="Password Anda..." name="password"
          :disabled="currUser?.id === currRoute.query.id" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Peran
          <Required />
        </legend>
        <div v-for="role in roles" class="flex items-center gap-2 truncate">
          <input v-model="forms.peran" type="radio" class="radio" name="peran" :value="role"
            :disabled="currUser?.id === currRoute.query.id" required />
          <p class="truncate">{{ role }}</p>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Tim
          <Required />
        </legend>
        <div v-for="team in teams" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim![0]" type="radio" class="radio" name="tim" :value="team" required
            :disabled="currUser?.id === currRoute.query.id" />
          <p class="truncate">{{ team }}</p>
        </div>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form"
        :disabled="isLoading || currUser?.id === currRoute.query.id">
        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan
      </button>
      <button @click="hapusAkun" class="w-full btn btn-error"
        :disabled="isLoading || currUser?.id === currRoute.query.id">
        <i class="fa-solid fa-trash"></i> Hapus Akun
      </button>
    </div>

  </div>
</template>