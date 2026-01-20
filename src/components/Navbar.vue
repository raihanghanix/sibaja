<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { KotakMasuk } from '../models/KotakMasuk';
import { getCookies } from '../utils/cookies';
import { IPengguna } from '../models/types';

const router = useRouter()
const kotakMasukModel = KotakMasuk.getInstance()
const currRoute = router.currentRoute
const pengguna = getCookies<IPengguna>('sessionId')

const inboxCount = ref<number | null>(null)
const isLoading = ref<boolean>(false)

async function getDataNavbar() {
  try {
    isLoading.value = true
    const data = await kotakMasukModel.getByPengguna(pengguna.id!)
    if (data.length) inboxCount.value = data.filter((i) => i.dibaca === false).length
    else inboxCount.value = null
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

watch(currRoute, getDataNavbar, { immediate: true })
</script>

<template>
  <nav class="shadow-sm navbar bg-base-100">
    <div class="flex-1">
      <RouterLink to="/" class="gap-0 text-xl btn btn-ghost">
        <span class="text-bps-blue">SI</span>
        <span class="text-bps-green">BA</span>
        <span class="text-bps-orange">JA</span>
      </RouterLink>
    </div>
    <div class="flex-none">
      <div role="tablist" class="tabs tabs-border">
        <RouterLink to="/" role="tab" class="tab"><i class="fa-solid fa-home"></i></RouterLink>
        <RouterLink v-if="inboxCount" to="/kotak-masuk" role="tab" class="tab"><i
            :class="`fa-solid fa-envelope animate-pulse`"></i>
        </RouterLink>
        <RouterLink v-else to="/kotak-masuk" role="tab" class="tab"><i :class="`fa-solid fa-envelope`"></i>
        </RouterLink>
        <RouterLink v-if="pengguna.peran === 'Admin'" to="/menu-admin" role="tab" class="tab"><i
            class="fa-solid fa-user-gear"></i></RouterLink>
        <RouterLink to="/profil" role="tab" class="tab"><i class="fa-solid fa-user-circle"
            :title="`${pengguna.nama} (${pengguna.peran})`"></i>
        </RouterLink>
      </div>
    </div>
  </nav>
  <div v-if="inboxCount" class="p-2 text-center bg-primary text-base-100">
    <RouterLink to="/kotak-masuk" class="underline"><i class="fa-solid fa-info-circle"></i> Anda mempunyai
      {{ inboxCount }} kotak
      masuk yang
      belum dibaca!</RouterLink>
  </div>
</template>