<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Required from '../components/Required.vue';
import { useRouter } from 'vue-router';
import { Pengguna } from '../models/Pengguna';
import { roles, teams, type IPengguna } from '../models/types';
import { getCookies, removeCookies, setCookies } from '../utils/cookies';

const router = useRouter()
const penggunaModel = Pengguna.getInstance()
const pengguna = getCookies<IPengguna>('sessionId')

const forms = ref<IPengguna>({
  id: pengguna.id,
  nama: pengguna.nama,
  email: pengguna.email,
  password: pengguna.password,
  peran: pengguna.peran,
  tim: pengguna.tim
})
const isLoading = ref<boolean>(false)

async function ubahProfil() {
  try {
    isLoading.value = true
    await penggunaModel.updateById(pengguna.id!, forms.value)
    setCookies<IPengguna>('sessionId', forms.value)
    router.push('/')
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
    await penggunaModel.deleteById(pengguna.id!)
    removeCookies('sessionId')
    router.push('/login')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

function logout() {
  removeCookies('sessionId')
  router.push('/login')
}
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <p class="text-xl font-semibold">Profil</p>
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
      <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
          class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button>
      <button @click="hapusAkun" class="w-full btn btn-error" :disabled="isLoading"><i class="fa-solid fa-trash"></i>
        Hapus Akun</button>
      <button @click="logout" class="w-full btn" :disabled="isLoading"><i class="fa-solid fa-right-from-bracket"></i>
        Keluar</button>
    </div>
  </main>
</template>