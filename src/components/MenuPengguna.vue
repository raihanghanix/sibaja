<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IPengguna, TPeran } from '../models/types';
import { Pengguna } from '../models/Pengguna';

const penggunaModel = Pengguna.getInstance()

const daftarPengguna = ref<IPengguna[] | null>(null)
const filter = ref<TPeran | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    if (!filter.value) {
      const data = await penggunaModel.getAll()
      const filteredData = data.sort((a, b) => {
        const nameA = a.nama!.toUpperCase();
        const nameB = b.nama!.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      })
      if (filteredData.length) daftarPengguna.value = filteredData
      else daftarPengguna.value = null
    }
    else {
      const data = await penggunaModel.getByPeran(filter.value!)
      const filteredData = data.sort((a, b) => {
        const nameA = a.nama!.toUpperCase();
        const nameB = b.nama!.toUpperCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      })
      if (filteredData.length) daftarPengguna.value = filteredData
      else daftarPengguna.value = null
    }
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <div class="truncate divider divider-start"></div>
  <div class="filter mb-2">
    <input @change="getData" v-model="filter" class="btn btn-soft filter-reset" type="radio" name="metaframeworks"
      aria-label="X" :value="null" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks"
      aria-label="Ketua Tim" value="Ketua Tim" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks" aria-label="PJ"
      value="PJ" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks" aria-label="PPK"
      value="PPK" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks" aria-label="PBJ"
      value="PBJ" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks"
      aria-label="Bendahara" value="Bendahara" />
    <input @change="getData" v-model="filter" class="btn btn-soft" type="radio" name="metaframeworks" aria-label="Admin"
      value="Admin" />
  </div>
  <div v-if="daftarPengguna?.length" class="flex flex-col gap-2">
    <div v-for="i in daftarPengguna" class="w-full shadow-sm card bg-base-100">
      <div class="card-body">
        <h2 class="text-base card-title">{{ i.nama }}</h2>
        <p class="truncate"><i class="fa-solid fa-id-card"></i> {{ i.id }}</p>
        <p class="truncate"><i class="fa-solid fa-users"></i> {{ i.tim }}</p>
        <p class="truncate"><i class="fa-solid fa-key"></i> {{ i.peran }}</p>
        <div class="justify-end card-actions">
          <RouterLink :to="`/menu-admin/pengguna/${i.id}`" class="btn btn-primary btn-square"><i
              class="fa-solid fa-pencil"></i>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-2">
    <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada pengguna' }}</p>
  </div>
  <div class="flex flex-col gap-2">
    <RouterLink to="/menu-admin/tambah-pengguna" class="w-full btn btn-primary"><i class="fa-solid fa-plus"></i> Tambah
      Pengguna
    </RouterLink>
  </div>
</template>