<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { IPengguna } from '../models/types';
import { getCookies } from '../utils/cookies';

const router = useRouter()
const currRoute = router.currentRoute
const auth = getCookies<IPengguna>('sessionId')
</script>

<template>
  <nav class="navbar bg-base-100">
    <div class="flex-1 truncate">
      <button @click="() => router.push('/')" class="gap-0 text-lg btn">
        <span class="text-bps-blue">SI</span>
        <span class="text-bps-green">BA</span>
        <span class="text-bps-orange">JA</span>
      </button>
    </div>
    <div class="flex-none">
      <div role="tablist" class="tabs tabs-border">
        <button @click="() => router.push('/')" role="tab"
          :class="`tab ${currRoute.query.halaman === 'beranda' && 'tab-active'}`">
          <i class="fa-solid fa-home"></i>
        </button>
        <button @click="() => router.push('/aktivitas')" role="tab"
          :class="`tab indicator ${currRoute.query.halaman === 'aktivitas' && 'tab-active'}`">
          <i class="fa-solid fa-list"></i><span class="indicator status status-error"></span>
        </button>
        <button v-if="auth?.peran === 'Admin'" @click="() => router.push('/admin-pengguna')" role="tab"
          :class="`tab ${currRoute.query.halaman === 'admin' && 'tab-active'}`">
          <i class="fa-solid fa-lock"></i>
        </button>
        <button @click="() => router.push('/profil')" role="tab"
          :class="`tab ${currRoute.query.halaman === 'profil' && 'tab-active'}`">
          <i class="fa-solid fa-user-circle"></i>
        </button>
      </div>
    </div>
  </nav>
  <div class="p-2 truncate bg-primary text-base-100">
    <span class="p-4 text-sm truncate">{{ auth?.nama }} ({{ auth?.peran }})</span>
  </div>
</template>