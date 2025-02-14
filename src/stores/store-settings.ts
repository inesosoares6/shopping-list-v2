import type {
	PayloadSettings,
	Product,
	Settings,
	StateSettings
} from './../models'
import { defineStore } from 'pinia'
import { firebaseAuth, firebaseDb } from 'src/boot/firebase'
import { showErrorMessage } from 'src/functions/utils'
import { useCatalogStore } from './store-catalog'
import { useListStore } from './store-list'
import { uid } from 'quasar'

export const useSettingsStore = defineStore('storeSettings', {
	state: (): StateSettings => ({
		settings: {
			username: '',
			list: ''
		},
		settingsDownloaded: false,
		listsPermissions: {},
		listNames: {},
		listKeys: []
	}),
	getters: {
		getSettings: state => state.settings,
		getShowUsernamePopup: state =>
			state.settingsDownloaded && Object.values(state.settings).some(e => !e),
		getListsNames: state =>
			Object.entries(state.listNames).map(([key, value]) => ({
				label: value,
				value: key
			})),
		getListName: state => state.listNames[state.settings.list],
		getIsListAdmin: state =>
			state.listsPermissions[state.settings.list] === 'admin'
	},
	actions: {
		clearSettings() {
			this.settings = {
				username: '',
				list: ''
			}
		},
		updateSetting(payload: PayloadSettings) {
			this.settings[payload.id] = payload.updates
		},
		fetchLists() {
			this.fetchListKeys()
			const userId = firebaseAuth.currentUser?.uid
			const listSettings = firebaseDb.ref('users/' + userId + '/lists')
			listSettings.on('value', snapshot => {
				const data = snapshot.val()
				if (data) {
					this.listsPermissions = data
					this.fetchListNames()
				}
			})
		},
		fetchListNames() {
			this.listNames = {}
			Object.keys(this.listsPermissions).forEach(id => {
				const listRef = firebaseDb.ref('lists/' + id)
				listRef.on('value', snapshot => {
					if (snapshot.val()?.name) {
						this.listNames[id] = snapshot.val()?.name
					}
				})
			})
		},
		fetchListKeys() {
			const listsRef = firebaseDb.ref('lists/')
			listsRef.on('value', snapshot => {
				this.listKeys = Object.keys(snapshot.val())
			})
		},
		removeListFromUserSettings(listId: string) {
			try {
				const removingSelectedList = listId === this.settings.list
				const userId = firebaseAuth.currentUser?.uid
				const listSettings = firebaseDb.ref(
					'users/' + userId + '/lists/' + listId
				)
				void listSettings.remove()
				if (this.getListsNames.length && removingSelectedList) {
					this.setList(this.getListsNames[0]?.value as string)
				}
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		sanitizeLists() {
			Object.keys(this.listsPermissions).forEach(listKey => {
				if (!this.listKeys.includes(listKey)) {
					void this.removeListFromUserSettings(listKey)
				}
			})
		},
		clearProducts() {
			const storeCatalog = useCatalogStore()
			const storeList = useListStore()
			void Promise.all([
				storeCatalog.clearProducts(),
				storeCatalog.setProductsDownloaded(false),
				storeList.clearProducts(),
				storeList.setProductsDownloaded(false)
			])
		},
		setList(value: string) {
			try {
				const storeCatalog = useCatalogStore()
				const storeList = useListStore()

				this.clearProducts()

				const userId = firebaseAuth.currentUser?.uid
				let listId = value

				// if it's new list: create it first
				if (!this.listKeys.includes(listId)) {
					listId = uid()
					const listRef = firebaseDb.ref('users/' + userId + '/lists')
					void listRef.update({ [listId]: 'admin' })
					const listCreationRef = firebaseDb.ref('lists/' + listId)
					void listCreationRef.set({ name: value })
				} else if (!Object.keys(this.listsPermissions).includes(listId)) {
					const listCreationRef = firebaseDb.ref('users/' + userId + '/lists')
					void listCreationRef.update({ [listId]: 'shared' })
				}

				const userRef = firebaseDb.ref('users/' + userId)
				void userRef.update({ list: listId })

				void Promise.all([storeList.fbReadData(), storeCatalog.fbReadData()])
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		setUsername(value: string) {
			try {
				const userId = firebaseAuth.currentUser?.uid
				const userRef = firebaseDb.ref('users/' + userId)
				void userRef.update({ username: value })
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		updateListName(value: string) {
			try {
				const listRef = firebaseDb.ref('lists/' + this.settings.list)
				void listRef.update({ name: value })
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		cloneList(listName: string) {
			const storeCatalog = useCatalogStore()
			const products = storeCatalog.products
			this.setList(listName)
			Object.values(products).forEach((element: Product) => {
				void storeCatalog.fbAddProduct({
					id: uid(),
					product: {
						...element,
						inList: false,
						completed: false,
						selected: false
					}
				})
			})
		},
		fbReadData() {
			const userId = firebaseAuth.currentUser?.uid
			const listSettings = firebaseDb.ref('users/' + userId)

			// initial check for data
			try {
				void listSettings.once('value', () => {
					this.settingsDownloaded = true
				})
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}

			// child added
			listSettings.on('child_added', snapshot => {
				this.updateSetting({
					id: snapshot.key! as keyof Settings,
					updates: snapshot.val()
				})
			})

			// child updated
			listSettings.on('child_changed', snapshot => {
				this.updateSetting({
					id: snapshot.key! as keyof Settings,
					updates: snapshot.val()
				})
			})
		},
		fbDeleteList() {
			try {
				const listRef = firebaseDb.ref('lists/' + this.getSettings.list)
				void listRef.remove()
				void this.removeListFromUserSettings(this.getSettings.list)
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		}
	}
})
