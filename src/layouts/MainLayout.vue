<template>
	<q-layout view="hHh lpR fFf">
		<q-header elevated>
			<q-toolbar>
				<q-toolbar-title class="absolute-center">
					{{ listName }}
				</q-toolbar-title>

				<q-btn
					v-if="!storeAuth.loggedIn"
					to="/auth"
					flat
					icon-right="account_circle"
					label="Login"
					class="absolute-right"
				/>
				<q-btn
					v-else
					@click="storeAuth.logoutUser"
					flat
					icon-right="account_circle"
					label="Logout"
					class="absolute-right"
				/>
			</q-toolbar>
		</q-header>

		<q-footer>
			<q-tabs>
				<q-route-tab
					v-for="nav in navs"
					:key="nav.label"
					:icon="nav.icon"
					:label="nav.label"
					:to="nav.to"
				/>
			</q-tabs>
		</q-footer>

		<q-drawer
			v-model="leftDrawerOpen"
			:breakpoint="767"
			:width="250"
			show-if-above
			bordered
			class="bg-primary"
		>
			<q-list dark>
				<q-item-label
					class="text-grey-4"
					header
				>
					Navigation
				</q-item-label>

				<q-item
					v-for="nav in navs"
					:key="nav.label"
					:to="nav.to"
					class="text-grey-4"
					clickable
					exact
				>
					<q-item-section avatar>
						<q-icon :name="nav.icon" />
					</q-item-section>
					<q-item-section>
						<q-item-label>{{ nav.label }}</q-item-label>
					</q-item-section>
				</q-item>

				<q-item
					class="text-grey-4 absolute-bottom"
					clickable
					v-if="$q.platform.is.electron"
					@click="quitApp()"
				>
					<q-item-section avatar>
						<q-icon name="power_settings_new" />
					</q-item-section>
					<q-item-section>
						<q-item-label>Quit</q-item-label>
					</q-item-section>
				</q-item>
			</q-list>
		</q-drawer>

		<q-page-container>
			<q-banner
				v-if="!isOnline"
				class="bg-grey-3 q-pa-lg"
			>
				<template v-slot:avatar>
					<q-icon
						name="signal_wifi_off"
						color="primary"
					/>
				</template>
				No internet connection. Please turn on the Wifi or mobile data to use
				the app.
			</q-banner>
			<router-view v-if="isOnline" />
		</q-page-container>
	</q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useIpcRenderer } from '@vueuse/electron'
import { useAuthStore } from 'src/stores/store-auth'
import { useSettingsStore } from 'src/stores/store-settings'
import { useNetwork } from '@vueuse/core'
const { isOnline } = useNetwork()

const storeAuth = useAuthStore()
const storeSettings = useSettingsStore()

const listName = computed(() => storeSettings.getListName)

const leftDrawerOpen = ref(false)
const navs = [
	{
		label: 'List',
		icon: 'checklist',
		to: '/'
	},
	{
		label: 'Catalog',
		icon: 'menu_book',
		to: '/Catalog'
	},
	{
		label: 'Settings',
		icon: 'settings',
		to: '/settings'
	}
]

const $q = useQuasar()
const quitApp = () => {
	$q.dialog({
		title: 'Confirm',
		message: 'Really quit Shopping List?',
		ok: {
			push: true
		},
		cancel: true,
		persistent: true
	}).onOk(() => {
		console.log('quit app')
		useIpcRenderer().send('quit-app')
	})
}

watch(
	() => storeAuth.loggedIn,
	value => {
		if (value) {
			storeSettings.fetchLists()
		}
	}
)
</script>

<style lang="scss">
@media screen and (min-width: 768px) {
	.q-footer {
		display: none;
	}
}

.q-drawer {
	.q-router-link--exact-active {
		color: white !important;
	}
}
</style>
