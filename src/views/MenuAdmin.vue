<script setup lang="ts">
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { watch } from 'vue';
import MenuPengguna from '../components/MenuPengguna.vue';
import MenuPengajuan from '../components/MenuPengajuan.vue';
import MenuDokumen from '../components/MenuDokumen.vue';

const router = useRouter()
const currRoute = router.currentRoute

function getData() {
  if (!currRoute.value.query.filter) router.push('?filter=pengguna')
}

watch(currRoute, getData, { immediate: true })
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <p class="text-xl font-semibold">Menu Admin</p>
    <div class="flex gap-1 max-sm:flex-col">
      <RouterLink to="?filter=pengguna"
        :class="`btn btn-soft max-sm:w-full ${currRoute.query.filter === 'pengguna' && 'btn-secondary'}`">
        Pengguna</RouterLink>
      <RouterLink to="?filter=pengajuan"
        :class="`btn btn-soft max-sm:w-full ${currRoute.query.filter === 'pengajuan' && 'btn-secondary'}`">Pengajuan
      </RouterLink>
      <RouterLink to="?filter=dokumen"
        :class="`btn btn-soft max-sm:w-full ${currRoute.query.filter === 'dokumen' && 'btn-secondary'}`">Dokumen
      </RouterLink>
    </div>
    <div v-if="currRoute.query.filter === 'pengguna'" class="flex flex-col gap-4">
      <MenuPengguna />
    </div>
    <div v-if="currRoute.query.filter === 'pengajuan'" class="flex flex-col gap-4">
      <MenuPengajuan />
    </div>
    <div v-if="currRoute.query.filter === 'dokumen'" class="flex flex-col gap-4">
      <MenuDokumen />
    </div>
  </main>
</template>