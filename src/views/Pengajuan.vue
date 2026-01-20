<script setup lang="ts">
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { onMounted, ref } from 'vue';
import { Pengajuan } from '../models/Pengajuan';
import { IPengguna, type IPengajuan } from '../models/types';
import { KotakMasuk } from '../models/KotakMasuk';
import { Dokumen as Dok } from '../models/Dokumen';
import Dokumen from '../components/Dokumen.vue';
import { getCookies } from '../utils/cookies';
import { Pengguna } from '../models/Pengguna';

const router = useRouter()
const penggunaModel = Pengguna.getInstance()
const pengajuanModel = Pengajuan.getInstance()
const dokumenModel = Dok.getInstance()
const kotakMasukModel = KotakMasuk.getInstance()
const id = router.currentRoute.value.params.id
const pengguna = getCookies<IPengguna>('sessionId')

const daftarPengguna = ref<IPengguna[] | null>(null)
const pengajuan = ref<IPengajuan | null>(null)
const isLoading = ref<boolean>(false)

async function getData() {
  try {
    isLoading.value = true
    const dataPengajuan = await pengajuanModel.getById(id as string)
    const dataPengguna = await penggunaModel.getByTim([dataPengajuan[0].tim!])
    if (dataPengajuan.length && dataPengguna.length) {
      pengajuan.value = dataPengajuan[0]
      daftarPengguna.value = dataPengguna
    } else {
      pengajuan.value = null
      daftarPengguna.value = null
      router.push('/')
    }
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
      router.push('/')
    }
  } finally {
    isLoading.value = false
  }
}

async function setujuiPengajuan() {
  if (pengajuan.value?.disetujui) {
    alert('Pengajuan sudah disetujui!')
    return
  }
  const conf = confirm('Apakah Anda ingin menyetujui pengajuan ini?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { status: 'Diproses', disetujui: true })
    await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah disetujui.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) telah disetujui.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function tolakPengajuan() {
  if (pengajuan.value?.status === 'Ditolak') {
    alert('Pengajuan sudah ditolak!')
    return
  }
  const input = prompt('Apa alasan Anda menolak pengajuan ini?')
  const alasan = input ? input : 'Tidak ada alasan'
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { status: 'Ditolak', disetujui: false })
    await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah ditolak. Alasan: ${alasan}.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) telah ditolak. Alasan: ${alasan}.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function selesaikanPesanan() {
  if (pengajuan.value?.pesanan) {
    alert('Pesanan sudah selesai!')
    return
  }
  const conf = confirm('Apakah Anda ingin menyelesaikan pesanan ini?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { pesanan: true })
    await kotakMasukModel.insert(pjId, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah selesai.`)
    await kotakMasukModel.insert(ketuaId, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah selesai.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) telah selesai.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function prosesPesanan() {
  if (!pengajuan.value?.pesanan) {
    alert('Pesanan masih diproses!')
    return
  }
  const conf = confirm('Apakah Anda ingin merubah status pesanan ini menjadi diproses?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { pesanan: false })
    await kotakMasukModel.insert(pjId, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda masih diproses.`)
    await kotakMasukModel.insert(ketuaId, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda masih diproses.`)
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pesanan pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) masih diproses.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function selesaikanPengajuan() {
  if (pengajuan.value?.status === 'Selesai') {
    alert('Pengajuan sudah selesai!')
    return
  }
  const conf = confirm('Apakah Anda ingin menyelesaikan pengajuan ini?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { status: 'Selesai', selesai: new Date().toISOString() })
    if (pengguna.peran === 'PPK') {
      await kotakMasukModel.insert(ketuaId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah selesai.`)
      await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah selesai.`)
    } else if (pengguna.peran === 'Ketua Tim') {
      await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah selesai.`)
    }
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) telah selesai.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function prosesPengajuan() {
  if (pengajuan.value?.status === 'Diproses') {
    alert('Pengajuan masih diproses!')
    return
  }
  const conf = confirm('Apakah Anda ingin merubah status pengajuan ini menjadi diproses?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await pengajuanModel.updateById(id as string, { status: 'Diproses', selesai: null })
    if (pengguna.peran === 'PPK') {
      await kotakMasukModel.insert(ketuaId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda masih diproses.`)
      await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda masih diproses.`)
    } else if (pengguna.peran === 'Ketua Tim') {
      await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda masih diproses.`)
    }
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) masih diproses.`)
    })
    location.reload()
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

async function hapusPengajuan() {
  const conf = confirm('Apakah Anda ingin menghapus pengajuan ini?')
  if (!conf) return
  try {
    isLoading.value = true
    const pjId = daftarPengguna.value?.find((i) => i.peran === 'PJ')?.id ?? ''
    const ketuaId = daftarPengguna.value?.find((i) => i.peran === 'Ketua Tim')?.id ?? ''
    const dataPengguna = await penggunaModel.getAll()
    const dataPenggunaFiltered = dataPengguna.filter((i) => i.peran === 'PPK' || i.peran === 'PBJ' || i.peran === 'Bendahara')
    await dokumenModel.deleteFiles(id as string)
    await pengajuanModel.deleteById(id as string)
    if (pengguna.peran === 'PJ') {
      await kotakMasukModel.insert(ketuaId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah dihapus.`)
    } else if (pengguna.peran === 'Ketua Tim') {
      await kotakMasukModel.insert(pjId, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) Anda telah dihapus.`)
    }
    dataPenggunaFiltered.forEach(async (i) => {
      await kotakMasukModel.insert(i.id!, `Pengajuan ${pengajuan.value?.nama} (${pengajuan.value?.tim}) telah dihapus.`)
    })
    router.push('/')
  } catch (err) {
    if (err instanceof Error) alert(err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <Navbar />
  <main class="flex flex-col w-full max-w-5xl gap-4 p-8 mx-auto">
    <div class="flex items-center justify-between">
      <p class="text-xl font-semibold">{{ pengajuan?.nama }}</p>
      <RouterLink to="/" class="btn btn-link">&lt; Kembali</RouterLink>
    </div>
    <div class="flex flex-col gap-2">
      <div v-if="pengajuan?.status === 'Diproses'" class="badge badge-soft badge-info">{{ pengajuan?.status }}</div>
      <div v-if="pengajuan?.status === 'Selesai'" class="badge badge-soft badge-success">{{ pengajuan?.status }}</div>
      <div v-if="pengajuan?.status === 'Ditolak'" class="badge badge-soft badge-error">{{ pengajuan?.status }}</div>
      <div v-if="pengajuan?.disetujui" class="badge badge-soft badge-success">Disetujui ketua tim</div>
      <div v-if="!pengajuan?.disetujui" class="badge badge-soft badge-error">Belum disetujui ketua tim</div>
    </div>
    <div class="truncate divider divider-start">Detail Pengajuan</div>
    <div class="flex flex-col gap-2">
      <p class="truncate"><i class="fa-solid fa-key"></i> {{ id }}</p>
      <p class="truncate"><i class="fa-solid fa-calendar"></i> Diajukan: {{ new Date(pengajuan?.created_at ??
        '').toLocaleDateString('id', {
          dateStyle:
            'full'
        }) }}
        ({{ new Date(pengajuan?.created_at ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
      <p v-if="pengajuan?.selesai" class="truncate"><i class="fa-solid fa-calendar-check"></i> Selesai: {{ new
        Date(pengajuan?.selesai ??
          '').toLocaleDateString('id', {
            dateStyle:
              'full'
          }) }}
        ({{ new Date(pengajuan?.selesai ?? '').toLocaleTimeString('id', { timeStyle: 'short' }) }})</p>
      <p v-else><i class="fa-solid fa-calendar-check"></i> Selesai: -</p>
      <p class="truncate"><i class="fa-solid fa-users"></i> {{ pengajuan?.tim }}</p>
      <p class="truncate"><i class="fa-solid fa-user"></i> {{daftarPengguna?.find((i) => i.peran === 'PJ')?.nama}} (PJ)
      </p>
      <p class="truncate"><i class="fa-solid fa-user"></i> {{daftarPengguna?.find((i) => i.peran === 'Ketua Tim')?.nama
      }} (Ketua Tim)</p>
      <p class="truncate"><i class="fa-solid fa-box"></i> Pesanan {{ pengajuan?.pesanan ? 'selesai' : 'diproses' }}</p>
    </div>
    <div v-if="pengguna.peran === 'Ketua Tim'" class="truncate divider divider-start">Validasi Pengajuan (Ketua Tim)
    </div>
    <div v-if="pengguna.peran === 'Ketua Tim'" class="flex gap-1">
      <button @click="setujuiPengajuan" class="btn btn-soft btn-success btn-square" title="Setujui pengajuan"
        :disabled="isLoading"><i class="fa-solid fa-check"></i></button>
      <button @click="tolakPengajuan" class="btn btn-soft btn-error btn-square" title="Tolak pengajuan"
        :disabled="isLoading"><i class="fa-solid fa-x"></i></button>
    </div>
    <div v-if="pengguna.peran === 'PBJ'" class="truncate divider divider-start">Status Pesanan (PBJ)</div>
    <div v-if="pengguna.peran === 'PBJ'" class="flex gap-1">
      <button @click="selesaikanPesanan" class="btn btn-soft btn-success btn-square" title="Pesanan selesai"
        :disabled="isLoading"><i class="fa-solid fa-check"></i></button>
      <button @click="prosesPesanan" class="btn btn-soft btn-error btn-square" title="Pesanan diproses"
        :disabled="isLoading"><i class="fa-solid fa-hourglass"></i></button>
    </div>
    <div v-if="pengguna.peran === 'Ketua Tim' || pengguna.peran === 'PPK'" class="truncate divider divider-start">Status
      Pengajuan (Ketua Tim & PPK)</div>
    <div v-if="pengguna.peran === 'Ketua Tim' || pengguna.peran === 'PPK'" class="flex gap-1">
      <button @click="selesaikanPengajuan" class="btn btn-soft btn-success btn-square" title="Pengajuan selesai"
        :disabled="isLoading"> <i class=" fa-solid fa-check"></i></button>
      <button @click="prosesPengajuan" class="btn btn-soft btn-info btn-square" title="Pengajuan diproses"
        :disabled="isLoading"> <i class=" fa-solid fa-hourglass"></i></button>
    </div>
    <div v-if="pengguna.peran === 'Ketua Tim' || pengguna.peran === 'PJ'" class="truncate divider divider-start">Hapus
      Pengajuan (Ketua Tim & PJ)</div>
    <div v-if="pengguna.peran === 'Ketua Tim' || pengguna.peran === 'PJ'" class="flex gap-1">
      <button @click="hapusPengajuan" class="btn btn-soft btn-error btn-square" title="Hapus pengajuan"
        :disabled="isLoading"> <i class=" fa-solid fa-trash"></i></button>
    </div>
    <div class="truncate divider divider-start">Dokumen Pengajuan</div>
    <div v-if="pengajuan?.nama" class="flex flex-col gap-2">
      <Dokumen judul="Kerangka Acuan Kerja (KAK)" type='kak' :pengajuan="pengajuan?.nama ?? ''" validator="Ketua Tim"
        uploader="PJ" />
      <Dokumen judul=" Form Permintaan" type='fp' :pengajuan="pengajuan?.nama ?? ''" validator="Ketua Tim"
        uploader="PJ" />
      <Dokumen judul=" Surat Permintaan ke PPK" type='spp' :pengajuan="pengajuan?.nama ?? ''" validator="Ketua Tim"
        uploader="PJ" />
      <Dokumen judul=" Dokumen Rancangan Kontrak" type='drk' :pengajuan="pengajuan?.nama!" validator="PBJ"
        uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Spekteknis" type='st' :pengajuan="pengajuan?.nama!" validator="PBJ" uploader="PPK"
        :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" RAB/HPS (Harga Perkiraan Sendiri)" type='rabhps' :pengajuan="pengajuan?.nama!" validator="PBJ"
        uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Surat Penunjukan Pejabat Pengadaan" type='sppp' :pengajuan="pengajuan?.nama!" validator="PBJ"
        uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Berita Acara Negosiasi" type='ban' :pengajuan="pengajuan?.nama!" validator="PPK" uploader="PBJ"
        :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Berita Acara Berhasil Pemilihan" type='bahp' :pengajuan="pengajuan?.nama!" validator="PPK"
        uploader="PBJ" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Surat Penetapan Pemenang Barang dan Jasa" type='sppbj' :pengajuan="pengajuan?.nama!"
        validator="PBJ" uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Surat Kontrak atau Surat Pesanan" type='sksp' :pengajuan="pengajuan?.nama!" validator="PBJ"
        uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Berita Acara Serah Terima Pekerjaan" type='bast' :pengajuan="pengajuan?.nama!" validator="PBJ"
        uploader="PPK" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Berita Acara Pembayaran" type='bap' :pengajuan="pengajuan?.nama!" validator="PBJ" uploader="PPK"
        :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Surat Perintah Pembayaran" type='spm' :pengajuan="pengajuan?.nama!" validator="PPK"
        uploader="Bendahara" :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Kuitansi" type='kui' :pengajuan="pengajuan?.nama!" validator="PPK" uploader="PPK"
        :validasi="!pengajuan.disetujui" />
      <Dokumen judul=" Surat Pesanan" type='sp' :pengajuan="pengajuan?.nama!" validator="PPK" uploader="PPK"
        :validasi="!pengajuan.disetujui" />
      <!-- <Dokumen judul=" Surat Permintaan Penawaran Harga" type='spph' /> -->
      <!-- <Dokumen judul=" Surat Perintah Kerja" type='spk' /> -->
      <!-- <Dokumen judul=" Surat Perintah Mulai Kerja" type='spmk'   /> -->
      <!-- <Dokumen judul=" Berita Acara Pemeriksaan Barang" type='bapp' /> -->
      <!-- <Dokumen judul=" Permohonan Pembayaran" type='pp' /> -->
    </div>
  </main>
</template>