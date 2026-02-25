<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { getCookies, removeCookies, setCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';
import { roles, teams, type IPengguna } from '../models/types';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';

const router = useRouter()
const currUser = getCookies<IPengguna>('sessionId')
const penggunaModel = Pengguna.getInstance()

const forms = ref<IPengguna>({
  id: currUser.id,
  nama: currUser.nama,
  email: currUser.email,
  password: currUser.password,
  peran: currUser.peran,
  tim: currUser.tim
})
const isLoading = ref<boolean>(false)

function logout() {
  removeCookies('sessionId')
  router.push('/login')
}

async function ubahProfil() {
  try {
    isLoading.value = true
    await penggunaModel.updateById(currUser.id!, forms.value)
    setCookies<IPengguna>('sessionId', forms.value)
    router.go(-1)
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
    await penggunaModel.deleteById(currUser.id!)
    removeCookies('sessionId')
    router.go(-1)
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Navbar />
  <div class="flex flex-col gap-4 p-8">

    <div class="flex flex-col gap-2">
      <p class="text-lg font-semibold">Profil</p>
    </div>

    <form @submit.prevent="ubahProfil" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">NIP
          <Required />
        </legend>
        <input v-model="forms.id" type="text" class="w-full input" placeholder="NIP Anda..." name="nip" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama
          <Required />
        </legend>
        <input v-model="forms.nama" type="text" class="w-full input" placeholder="Nama Anda..." name="nama" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email
          <Required />
        </legend>
        <input v-model="forms.email" type="email" class="w-full input" placeholder="Email Anda..." name="email"
          required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Password
          <Required />
        </legend>
        <input v-model="forms.password" type="text" class="w-full input" placeholder="Password Anda..." name="password"
          required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Peran
          <Required />
        </legend>
        <div v-for="role in roles" class="flex items-center gap-2 truncate">
          <input v-model="forms.peran" type="radio" class="radio" name="peran" :value="role" required />
          <p class="truncate">{{ role }}</p>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Tim
          <Required />
        </legend>
        <div v-for="team in teams" class="flex items-center gap-2 truncate">
          <input v-model="forms.tim" type="checkbox" class="checkbox" name="tim" :id="team" :value="team" />
          <p class="truncate">{{ team }}</p>
        </div>
      </fieldset>
    </form>

    <div class="flex flex-col gap-2">
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading">
        <i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan
      </button>
      <button @click="hapusAkun" class="w-full btn btn-error" :disabled="isLoading">
        <i class="fa-solid fa-trash"></i> Hapus Akun
      </button>
      <button @click="logout" class="w-full btn" :disabled="isLoading">
        <i class="fa-solid fa-right-from-bracket"></i> Keluar
      </button>
    </div>

  </div>
</template>