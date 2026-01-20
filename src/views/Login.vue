<script setup lang="ts">
import { useRouter } from 'vue-router';
import Required from '../components/Required.vue';
import { Pengguna } from '../models/Pengguna';
import { ref } from 'vue';
import { type IPengguna } from '../models/types';
import { setCookies } from '../utils/cookies';

const router = useRouter()
const penggunaModel = Pengguna.getInstance()

const forms = ref<IPengguna>({
  email: '',
  password: ''
})
const isLoading = ref<boolean>(false)

async function login() {
  try {
    isLoading.value = true
    const data = await penggunaModel.getAll()
    const filteredData = data.find((i) => i.email === forms.value.email && i.password === forms.value.password)
    if (filteredData) {
      setCookies<IPengguna>('sessionId', filteredData)
      router.push('/')
    }
    else {
      alert('Email atau password salah!')
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="flex items-center justify-center min-h-screen p-8">
    <div class="shadow-sm w-72 card bg-base-100">
      <div class="card-body">
        <p class="gap-0 card-title">
          <span class="text-bps-blue">SI</span>
          <span class="text-bps-green">BA</span>
          <span class="text-bps-orange">JA</span>
        </p>
        <p>Silahkan masuk dengan akun Anda</p>
        <form @submit.prevent="login" class="card-actions" id="form">
          <div class="flex flex-col w-full gap-2">
            <fieldset class="w-full fieldset">
              <legend class="fieldset-legend">Email
                <Required />
              </legend>
              <input v-model="forms.email" type="email" class="w-full input" placeholder="Email Anda..." name="email"
                required />
            </fieldset>
            <fieldset class="w-full fieldset">
              <legend class="fieldset-legend">Password
                <Required />
              </legend>
              <input v-model="forms.password" type="password" class="w-full input" placeholder="Password Anda..."
                name="password" required />
            </fieldset>
          </div>
          <div class="flex flex-col w-full gap-2">
            <button type="submit" class="w-full btn btn-primary" form="form" :disabled="isLoading"><i
                class="fa-solid fa-right-from-bracket"></i> Masuk</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>