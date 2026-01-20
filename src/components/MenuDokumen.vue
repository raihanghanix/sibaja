<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { IDokumen, TDokumen } from '../models/types';
import { Dokumen } from '../models/Dokumen';

const dokumenModel = Dokumen.getInstance()

const daftarDokumen = ref<IDokumen[] | null>(null)
const filter = ref<'Diproses' | 'Valid' | 'Tidak valid' | null>(null)
const isLoading = ref<boolean>(false)

function abbr(tipe: TDokumen) {
  if (tipe === 'kak') return 'Kerangka Acuan Kerja (KAK)'
  if (tipe === 'fp') return 'Form Permintaan'
  if (tipe === 'spp') return 'Surat Permintaan ke PPK'
  if (tipe === "spph") return 'Surat Permintaan Penawaran Harga'
  if (tipe === "st") return 'Spekteknis'
  if (tipe === "drk") return 'Dokumen Rancangan Kontrak'
  if (tipe === "rabhps") return 'RAB/HPS (Harga Perkiraan Sendiri)'
  if (tipe === "sppp") return 'Surat Penunjukan Pejabat Pengadaan'
  if (tipe === "ban") return 'Berita Acara Negosiasi'
  if (tipe === "bahp") return 'Berita Acara Berhasil Pemilihan'
  if (tipe === "spk") return 'Surat Perintah Kerja'
  if (tipe === "spmk") return 'Surat Perintah Mulai Kerja'
  if (tipe === "sppbj") return 'Surat Penetapan Pemenang Barang dan Jasa'
  if (tipe === "sksp") return 'Surat Kontrak atau Surat Pesanan'
  if (tipe === "bast") return 'Berita Acara Serah Terima Pekerjaan'
  if (tipe === "bapp") return 'Berita Acara Pemeriksaan Barang'
  if (tipe === "bap") return 'Berita Acara Pembayaran'
  if (tipe === "pp") return 'Permohonan Pembayaran'
  if (tipe === "spm") return 'Surat Perintah Pembayaran'
  if (tipe === "kui") return 'Kuitansi'
  if (tipe === "sp") return 'Surat Pesanan'
}

async function getData() {
  try {
    isLoading.value = true
    if (!filter.value) {
      const data = await dokumenModel.getAll()
      const filteredData = data.sort((a, b) => {
        const dateA = new Date(a.created_at ?? '').valueOf()
        const dateB = new Date(b.created_at ?? '').valueOf()
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })
      if (filteredData.length) daftarDokumen.value = filteredData
      else daftarDokumen.value = null
    }
    else {
      const data = await dokumenModel.getByStatus(filter.value!)
      const filteredData = data.sort((a, b) => {
        const dateA = new Date(a.created_at ?? '').valueOf()
        const dateB = new Date(b.created_at ?? '').valueOf()
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })
      if (filteredData.length) daftarDokumen.value = filteredData
      else daftarDokumen.value = null
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
    <input @change="getData" v-model="filter" class="btn btn-soft btn-info" type="radio" name="metaframeworks"
      aria-label="Diproses" value="Diproses" />
    <input @change="getData" v-model="filter" class="btn btn-soft btn-success" type="radio" name="metaframeworks"
      aria-label="Valid" value="Valid" />
    <input @change="getData" v-model="filter" class="btn btn-soft btn-error" type="radio" name="metaframeworks"
      aria-label="Tidak valid" value="Tidak valid" />
  </div>
  <div v-if="daftarDokumen?.length" class="flex flex-col gap-2">
    <div v-for="i in daftarDokumen" class="w-full shadow-sm card bg-base-100">
      <div class="card-body">
        <h2 class="text-base card-title">{{ abbr(i.tipe!) }}</h2>
        <div v-if="i.status === 'Diproses'" class="badge badge-soft badge-info">{{ i.status }}</div>
        <div v-if="i.status === 'Valid'" class="badge badge-soft badge-success">{{ i.status }}</div>
        <div v-if="i.status === 'Tidak valid'" class="badge badge-soft badge-error">{{ i.status }}</div>
        <p class="truncate"><i class="fa-solid fa-file"></i> {{ i.pengajuan?.nama }}</p>
        <p class="truncate"><i class="fa-solid fa-calendar"></i> Diajukan: {{ new Date(i.created_at ??
          '').toLocaleDateString('id', {
            dateStyle:
              'full'
          }) }}
          ({{ new Date(i.created_at ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
        <p class="truncate"><i class="fa-solid fa-user"></i> {{ i.pengguna?.nama ?? '-' }} ({{
          i?.pengguna?.peran ?? '-' }}) ({{ i.pengajuan?.tim ?? '-' }})</p>
        <div class="justify-end card-actions">
          <RouterLink :to="`/menu-admin/dokumen/${i.id}`" class="btn btn-primary btn-square"><i
              class="fa-solid fa-pencil"></i>
          </RouterLink>
          <a v-if="i.status" :href="`https://jzybgguiugsdfdgfyczr.supabase.co/storage/v1/object/public/dokumen/${i.id}`"
            target="_blank" class="btn btn-primary btn-square"><i class="fa-solid fa-download"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col gap-2">
    <p class="text-center">{{ isLoading ? 'Loading...' : 'Tidak ada dokumen' }}</p>
  </div>
</template>