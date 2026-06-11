<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { IPengguna } from '../models/types';
import { getCookies } from '../utils/cookies';

const router = useRouter()
const currRoute = router.currentRoute
let currUser = getCookies<IPengguna | undefined>('sessionId') ?? undefined
</script>

<template>
  <!-- Desktop -->
  <nav class="shadow-sm navbar bg-base-100 max-sm:hidden">
    <div class="flex-none">
      <RouterLink to="/?view=beranda" class="gap-0 text-xl btn btn-ghost">
        <span class="text-bps-blue">SI</span>
        <span class="text-bps-green">BA</span>
        <span class="text-bps-orange">JA</span>
      </RouterLink>
    </div>
    <div class="flex-1">
      <ul class="px-1 menu menu-horizontal join">
        <li>
          <RouterLink to="/?view=beranda"
            :class="`join-item btn ${currRoute.query.view === 'beranda' && 'btn-active'}`">
            <i class="fa-solid fa-home"></i> Beranda
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/?view=aktivitas-tim"
            :class="`join-item btn ${currRoute.query.view === 'aktivitas-tim' && 'btn-active'}`">
            <i class="fa-solid fa-list"></i> Aktivitas Tim
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="flex-none">
      <ul class="px-1 menu menu-horizontal max join">
        <li v-if="currUser?.peran === 'Admin'">
          <RouterLink to="/?view=admin-pengguna"
            :class="`join-item btn btn-primary ${currRoute.query.view?.includes('admin') && 'btn-active'}`">
            <i class="fa-solid fa-lock"></i> Menu Admin
          </RouterLink>
        </li>
        <li v-if="currUser?.peran === 'PJ'">
          <RouterLink to="/?view=pengajuan-baru"
            :class="`join-item btn btn-primary ${currRoute.query.view === 'pengajuan-baru' && 'btn-active'}`">
            <i class="fa-solid fa-plus"></i> Pengajuan Baru
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/?view=profil" :class="`join-item btn ${currRoute.query.view === 'profil' && 'btn-active'}`">
            <i class="fa-solid fa-user"></i> Profil
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
  <!-- Mobile -->
  <nav class="shadow-sm navbar bg-base-100 sm:hidden">
    <div class="flex-none max-[410px]:hidden">
      <RouterLink to="/" class="gap-0 text-xl btn btn-ghost">
        <span class="text-bps-blue">SI</span>
        <span class="text-bps-green">BA</span>
        <span class="text-bps-orange">JA</span>
      </RouterLink>
    </div>
    <div class="flex-1">
      <ul class="px-1 menu menu-horizontal join">
        <li>
          <RouterLink to="/?view=beranda"
            :class="`join-item btn ${currRoute.query.view === 'beranda' && 'btn-active'}`">
            <i class="fa-solid fa-home"></i>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/?view=aktivitas-tim"
            :class="`join-item btn ${currRoute.query.view === 'aktivitas-tim' && 'btn-active'}`">
            <i class="fa-solid fa-list"></i>
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="flex-none">
      <ul class="px-1 menu menu-horizontal max join">
        <li v-if="currUser?.peran === 'Admin'">
          <RouterLink to="/?view=admin-pengguna"
            :class="`join-item btn btn-primary ${currRoute.query.view?.includes('admin') && 'btn-active'}`">
            <i class="fa-solid fa-lock"></i> Admin
          </RouterLink>
        </li>
        <li v-if="currUser?.peran === 'PJ'">
          <RouterLink to="/?view=pengajuan-baru"
            :class="`join-item btn btn-primary ${currRoute.query.view === 'pengajuan-baru' && 'btn-active'}`">
            <i class="fa-solid fa-plus"></i> Pengajuan
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/?view=profil" :class="`join-item btn ${currRoute.query.view === 'profil' && 'btn-active'}`">
            <i class="fa-solid fa-user"></i>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
  <!-- User -->
  <div class="p-2 truncate bg-primary text-base-100">
    <span class="p-4 text-sm truncate">{{ currUser?.nama }} ({{ currUser?.peran }})</span>
  </div>
</template>