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
  id: '',
  nama: '',
  email: '',
  password: '',
  peran: '',
  tim: []
})
const isLoading = ref<boolean>(false)

async function tambahPengguna() {
  try {
    isLoading.value = true
    await penggunaModel.insert(forms.value)
    router.push('/menu-admin')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold">Tambah Pengguna</p>
      <RouterLink to="/menu-admin" class="btn btn-link">&lt; Kembali</RouterLink>
    </div>
    <form @submit.prevent="tambahPengguna" class="flex flex-col gap-2" id="form">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">NIP
          <Required />
        </legend>
        <input v-model="forms.id" type="text" class="w-full input" placeholder="NIP..." name="nip" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nama
          <Required />
        </legend>
        <input v-model="forms.nama" type="text" class="w-full input" placeholder="Nama..." name="nama" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email
          <Required />
        </legend>
        <input v-model="forms.email" type="email" class="w-full input" placeholder="Email..." name="email" required />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Password
          <Required />
        </legend>
        <input v-model="forms.password" type="text" class="w-full input" placeholder="Password..." name="password"
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
          class="fa-solid fa-floppy-disk"></i> Simpan Pengguna</button>
    </div>
  </main>
</template>