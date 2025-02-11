<template>
	<router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/store-auth'
import { useIpcRenderer } from '@vueuse/electron'
import { useRouter } from 'vue-router'

const router = useRouter()

const storeAuth = useAuthStore()
const $q = useQuasar()

onMounted(() => {
	if ($q.platform.is.electron) {
		useIpcRenderer().on('show-settings', () => {
			void router.push('/settings')
		})
	}

	storeAuth.handleAuthStateChange()
})
</script>
