<script setup lang="ts">
import { ref, watch } from 'vue';
import Navbar from '../components/Navbar.vue';
import { KotakMasuk } from '../models/KotakMasuk';
import type { IPengguna, IKotakMasuk } from '../models/types';
import { getCookies } from '../utils/cookies';

const kotakMasukModel = KotakMasuk.getInstance()
const pengguna = getCookies<IPengguna>('sessionId')

const inboxes = ref<IKotakMasuk[] | null>(null)
const filter = ref<true | false | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    const data = await kotakMasukModel.getByPengguna(pengguna.id!)
    if (data.length) {
      if (filter.value === null) inboxes.value = data
      else if (filter.value === true) inboxes.value = data.filter((i) => i.dibaca === true)
      else if (filter.value === false) inboxes.value = data.filter((i) => i.dibaca === false)
    }
    else inboxes.value = null
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function readOne(id: string) {
  try {
    isLoading.value = true
    await kotakMasukModel.updateById(id, { dibaca: true })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function deleteOne(id: string) {
  try {
    isLoading.value = true
    await kotakMasukModel.deleteById(id)
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function readAll() {
  try {
    isLoading.value = true
    await kotakMasukModel.updateAll(pengguna.id!, { dibaca: true })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function deleteAll() {
  try {
    isLoading.value = true
    await kotakMasukModel.deleteByPengguna(pengguna.id!)
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

watch(filter, getData, { immediate: true })
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <p class="text-xl font-semibold">Kotak Masuk ({{inboxes?.filter((i) => !i.dibaca).length ?? 0}})</p>
    <div class="truncate divider divider-start">
      {{ pengguna.tim }}
    </div>
    <div class="filter">
      <input v-model="filter" class="btn btn-soft filter-reset" type="radio" name="metaframeworks" aria-label="X"
        :value="null" />
      <input v-model="filter" class="btn btn-soft btn-info" type="radio" name="metaframeworks" aria-label="Belum dibaca"
        :value="false" />
      <input v-model="filter" class="btn btn-soft btn-success" type="radio" name="metaframeworks" aria-label="Dibaca"
        :value="true" />
    </div>
    <div v-if="inboxes?.length" class="flex flex-col gap-2">
      <div v-for="inbox in inboxes" :class="`w-full shadow-sm card ${inbox.dibaca ? 'bg-base-200' : 'bg-base-100'}`">
        <div class="card-body">
          <h2 class="text-base card-title">
            {{ new Date(inbox.created_at ?? '').toLocaleDateString('id', { dateStyle: 'full' }) }}
            ({{ new Date(inbox.created_at ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})
          </h2>
          <div :class="`badge badge-soft ${inbox.dibaca ? 'badge-success' : 'badge-info'}`">{{ inbox.dibaca ? 'Dibaca' :
            'Belum dibaca' }}</div>
          <p>{{ inbox.pesan }}</p>
          <div class="justify-end card-actions">
            <button @click="() => readOne(inbox.id ?? '')" class="btn btn-primary btn-square"
              :disabled="isLoading || inbox.dibaca"><i class="fa-solid fa-check"></i></button>
            <button @click="() => deleteOne(inbox.id ?? '')" class="btn btn-error btn-square" :disabled="isLoading"><i
                class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada kotak masuk' }}</p>
    </div>
    <div class="flex flex-col gap-2">
      <button @click="readAll" class="w-full btn btn-primary" :disabled="isLoading || !inboxes?.length"><i
          class="fa-solid fa-eye"></i> Baca
        Semua</button>
      <button @click="deleteAll" class="w-full btn btn-error" :disabled="isLoading || !inboxes?.length"><i
          class="fa-solid fa-trash"></i> Hapus
        Semua</button>
    </div>
  </main>
</template>