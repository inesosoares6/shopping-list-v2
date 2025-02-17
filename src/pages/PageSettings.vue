<template>
	<q-page padding>
		<q-list
			class="q-mb-md"
			bordered
			padding
		>
			<q-item-label header>Settings</q-item-label>

			<q-item
				tag="label"
				v-ripple
			>
				<q-item-section>
					<q-item-label>Add/Select list</q-item-label>
				</q-item-section>
				<q-item-section side>
					<div class="row">
						<q-btn
							flat
							round
							color="primary"
							icon="add"
							@click="showDialog(GeneralActions.ADD_LIST)"
						/>
						<div
							style="min-width: 200px"
							v-if="options.length"
						>
							<q-select
								behavior="menu"
								outlined
								map-options
								emit-value
								v-model="list"
								:options="options"
							/>
						</div>
					</div>
				</q-item-section>
			</q-item>

			<q-item
				tag="label"
				v-ripple
			>
				<q-item-section>
					<q-item-label>Change username</q-item-label>
				</q-item-section>
				<q-item-section side>
					<div style="min-width: 200px">
						<q-input
							v-model="username"
							class="col"
							outlined
						/>
					</div>
				</q-item-section>
			</q-item>
		</q-list>
		<q-list
			v-for="(actionItem, index) in actionItems"
			:key="index"
			class="q-mb-md"
			bordered
			padding
		>
			<q-item-label header>{{ actionItem.title }}</q-item-label>

			<q-item
				v-for="(action, index) in actionItem.items"
				:key="index"
				tag="label"
				v-ripple
				@click="action.onClickAction"
			>
				<q-item-section>
					<q-item-label :class="`text-${getColor(action.key)}`">
						{{ action.label }}
					</q-item-label>
				</q-item-section>
				<q-item-section side>
					<q-icon
						:name="action?.note ? 'info' : 'chevron_right'"
						:color="getColor(action.key)"
					>
						<q-tooltip v-if="action?.note">
							{{ action?.note }}
						</q-tooltip>
					</q-icon>
				</q-item-section>
			</q-item>
		</q-list>
	</q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useSettingsStore } from 'src/stores/store-settings'
import { useAuthStore } from 'src/stores/store-auth'
import { useCatalogStore } from 'src/stores/store-catalog'
import { useQuasar } from 'quasar'
import type { PromptInputType } from 'quasar'
import { Share } from '@capacitor/share'
import { addListPayload } from 'src/composables/useSettingsPopupPayload'
import {
	AccessType,
	AccountActions,
	AdminActions,
	GeneralActions,
	GuestActions,
	CommonActions
} from 'src/models'
import type { KeyActionsType, SettingsItem } from 'src/models'

const storeSettings = useSettingsStore()
const storeCatalog = useCatalogStore()
const storeAuth = useAuthStore()

const options = computed(() => storeSettings.getListsNames)
const isListAdmin = computed(() => storeSettings.getIsListAdmin)
const isListBlocked = computed(() => storeSettings.getIsListBlocked)
const getNumberOfProducts = computed(() => storeCatalog.getNumberOfProducts)

const list = computed({
	get() {
		return storeSettings.getListName
	},
	set(newValue: string) {
		void storeSettings.setList(newValue)
	}
})

const username = computed({
	get() {
		return storeSettings.getSettings.username
	},
	set(newValue) {
		void storeSettings.setUsername(newValue)
	}
})

const blockListText = computed(
	() =>
		`${isListBlocked.value ? 'Unb' : 'B'}lock writing privileges for guest users`
)
const getColor = (key: KeyActionsType) => {
	const action = key.split('_')[0] as string
	if (['delete', 'remove'].includes(action)) return 'red'
	if (key === GuestActions.TOOLTIP) return 'grey'
	return ''
}

const $q = useQuasar()
const showDialog = (key: KeyActionsType) => {
	const details: Record<
		string,
		{
			title?: string
			message?: string
			successAction: (value: string) => void
			promptType?: string
		}
	> = {
		[AccountActions.EMAIL]: {
			successAction: value => {
				storeAuth.emailUpdate(value)
			},
			promptType: 'text'
		},
		[AccountActions.PASSWORD]: {
			successAction: value => {
				storeAuth.passwordUpdate(value)
			},
			promptType: 'password'
		},
		[AccountActions.DELETE_ACCOUNT]: {
			successAction: () => {
				void storeAuth.deleteAccount()
			},
			title: 'Delete account',
			message: 'Are you sure you want to delete your account?'
		},
		[AdminActions.DELETE_LIST]: {
			successAction: () => {
				void storeSettings.fbDeleteList()
			},
			title: `Delete list ${list.value}`,
			message: `You have ${getNumberOfProducts.value} products in ${list.value} list. Are you sure you want to delete the entire list?`
		},
		[AdminActions.LIST_NAME]: {
			successAction: value => {
				void storeSettings.updateListName(value)
			},
			title: `Update list name (current: ${list.value})`,
			message: 'Write the new list name',
			promptType: 'text'
		},
		[GeneralActions.ADD_LIST]: {
			...addListPayload,
			successAction: (value: string) => (list.value = value),
			promptType: 'text'
		},
		[GuestActions.REMOVE_LIST]: {
			successAction: () => {
				void storeSettings.removeListFromUserSettings(list.value as string)
			},
			title: 'Remove shared list',
			message: 'Are you sure you want to remove this list from your account?'
		},
		[CommonActions.CLONE]: {
			successAction: value => {
				void storeSettings.cloneList(value)
			},
			title: `Clone catalog from ${list.value}`,
			message: `The new list will be created with ${getNumberOfProducts.value} products. Write its name`,
			promptType: 'text'
		}
	}

	$q.dialog({
		title: details[key]?.title ?? `Update ${key}`,
		message: details[key]?.message ?? `Write the new ${key}`,
		prompt: {
			model: '',
			type: details[key]?.promptType as PromptInputType
		},
		ok: {
			push: true
		},
		cancel: {
			color: 'negative'
		}
	}).onOk(data => {
		details[key]?.successAction(data)
	})
}

const accountActions: Ref<SettingsItem<AccountActions>[]> = ref([
	{
		label: 'Change email',
		key: AccountActions.EMAIL,
		onClickAction: () => showDialog(AccountActions.EMAIL)
	},
	{
		label: 'Change password',
		key: AccountActions.PASSWORD,
		onClickAction: () => showDialog(AccountActions.PASSWORD)
	},
	{
		label: 'Delete account',
		key: AccountActions.DELETE_ACCOUNT,
		onClickAction: () => showDialog(AccountActions.DELETE_ACCOUNT)
	}
])

const commonListActions: Ref<SettingsItem<CommonActions>[]> = ref([
	{
		label: 'Share list',
		key: CommonActions.SHARE,
		onClickAction: async () => {
			await Share.share({
				text: storeSettings.getSettings.list
			})
		}
	},
	{
		label: 'Clone catalog',
		key: CommonActions.CLONE,
		onClickAction: () => showDialog(CommonActions.CLONE)
	}
])

const adminListActions: Ref<SettingsItem<KeyActionsType>[]> = ref([
	...commonListActions.value,
	{
		label: 'Change list name',
		key: AdminActions.LIST_NAME,
		onClickAction: () => showDialog(AdminActions.LIST_NAME)
	},
	{
		label: blockListText,
		key: AdminActions.LIST_NAME,
		onClickAction: () => storeSettings.handleWritingPrivileges()
	},
	{
		label: 'Delete list',
		key: AdminActions.DELETE_LIST,
		onClickAction: () => showDialog(AdminActions.DELETE_LIST)
	}
])

const guestListActions: Ref<SettingsItem<KeyActionsType>[]> = ref([
	...commonListActions.value,
	{
		label: 'Remove list',
		key: GuestActions.REMOVE_LIST,
		onClickAction: () => showDialog(GuestActions.REMOVE_LIST)
	},
	{
		label: 'The list is currently blocked by the owner',
		key: GuestActions.TOOLTIP,
		note: 'The owner blocked your writing privileges. You can only read the data, share and clone the list.'
	}
])

const actionItems = computed(() => {
	const items = [
		{
			key: AccessType.GUEST,
			title: `Manage list as guest - ${list.value}`,
			items: guestListActions.value
		},
		{
			key: AccessType.ADMIN,
			title: `Manage list as admin - ${list.value}`,
			items: adminListActions.value
		},
		{
			key: AccessType.ALL,
			title: 'Account',
			items: accountActions.value
		}
	]
	return isListAdmin.value
		? items.filter(obj => obj.key !== AccessType.GUEST)
		: items.filter(obj => obj.key !== AccessType.ADMIN)
})

onMounted(() => {
	storeSettings.sanitizeLists()
})
</script>
