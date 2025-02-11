import { showErrorMessage } from 'src/functions/utils'
import { defineStore } from 'pinia'
import { firebaseDb } from 'src/boot/firebase'
import type { Payload, PayloadUpdate, ProductObject, Product } from 'src/models'
import { Notify, date } from 'quasar'
import { useSettingsStore } from 'src/stores/store-settings'
import { useListStore } from 'src/stores/store-list'
import { useCleanString } from 'src/composables/useStringHelpers'

export const useCatalogStore = defineStore('storeCatalog', {
	state: () => ({
		products: {} as ProductObject,
		search: '',
		sort: 'name' as keyof Product,
		productsDownloaded: false
	}),
	getters: {
		getNumberOfProducts: state =>
			state.products ? Object.keys(state.products).length : 0,
		getProductsSorted: state => {
			const productsSorted = {} as ProductObject
			const keysOrdered = Object.keys(state.products)

			keysOrdered.sort((a, b) => {
				const productAProp = useCleanString(
						(state.products[a] as Product)[state.sort] as string
					),
					productBProp = useCleanString(
						(state.products[b] as Product)[state.sort] as string
					)
				if (productAProp > productBProp) return 1
				else if (productAProp < productBProp) return -1
				else return 0
			})

			keysOrdered.forEach(key => {
				productsSorted[key] = state.products[key] as Product
			})

			return productsSorted
		},
		getProductsFiltered(state): ProductObject {
			const productsSorted = this.getProductsSorted
			const productsFiltered = {} as ProductObject
			if (state.search) {
				Object.keys(productsSorted).forEach(key => {
					const product = productsSorted[key],
						productName = useCleanString(product?.name),
						productKeywords = useCleanString(product?.keywords),
						search = useCleanString(state.search)
					if (
						productName.includes(search) ||
						productKeywords.includes(search)
					) {
						productsFiltered[key] = product as Product
					}
				})
				return productsFiltered
			}
			return productsSorted
		},
		getProducts(): ProductObject {
			const productsFiltered = this.getProductsFiltered
			const products = {} as ProductObject
			Object.keys(productsFiltered).forEach(key => {
				const product = productsFiltered[key]
				if (!product?.completed) {
					products[key] = product as Product
				}
			})

			return products
		},
		getProductsFavorites() {
			const productsSorted = this.getProductsSorted
			const products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				const product = productsSorted[key]
				if (product?.favorite) {
					products[key] = product
				}
			})
			return products
		},
		getProductsSelected() {
			const productsSorted = this.getProductsSorted
			const products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				const product = productsSorted[key]
				if (product?.selected) {
					products[key] = product
				}
			})
			return products
		}
	},
	actions: {
		updateProduct(payload: PayloadUpdate) {
			Object.assign(this.products[payload.id] as Product, payload.updates)
		},
		deleteProduct(id: string) {
			delete this.products[id]
		},
		addProduct(payload: Payload) {
			this.products[payload.id] = payload.product
		},
		clearProducts() {
			this.products = {}
		},
		setSearch(value: string) {
			this.search = value
		},
		setSort(value: keyof Product) {
			this.sort = value
		},
		setProductsDownloaded(value: boolean) {
			this.productsDownloaded = value
		},
		addProductsToList(productsToList: ProductObject) {
			const storeSettings = useSettingsStore()
			const storeList = useListStore()
			Object.keys(productsToList).forEach(key => {
				const product = productsToList[key] as Product
				void this.fbUpdateProduct({
					id: key,
					updates: {
						selected: false,
						inList: true,
						owner:
							'added by ' +
							storeSettings.settings.username +
							' @ ' +
							date.formatDate(Date.now(), 'DD-MM')
					}
				})
				void storeList.fbAddProduct({ id: key, product })
			})
		},
		async fbReadData() {
			const storeSettings = useSettingsStore()
			const catalogProducts = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/'
			)

			// initial check for data
			try {
				await catalogProducts.once('value', () => {
					this.productsDownloaded = true
				})
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}

			// child added
			catalogProducts.on('child_added', snapshot => {
				const product = snapshot.val()
				this.addProduct({
					id: snapshot.key!,
					product: product
				})
			})

			//child changed
			catalogProducts.on('child_changed', snapshot => {
				const product = snapshot.val()
				this.updateProduct({
					id: snapshot.key!,
					updates: product
				})
			})

			//child removed
			catalogProducts.on('child_removed', snapshot => {
				this.deleteProduct(snapshot.key!)
			})
		},
		async fbAddProduct(payload: Payload) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + payload.id
			)
			try {
				await productRef.set(payload.product)
				Notify.create('Product added!')
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		async fbUpdateProduct(payload: PayloadUpdate) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + payload.id
			)
			if (Object.keys(this.products).includes(payload.id)) {
				try {
					await productRef.update(payload.updates)
					const keys = Object.keys(payload.updates)
					if (
						!(
							keys.includes('completed') ||
							keys.includes('selected') ||
							keys.includes('favorite') ||
							keys.includes('inList')
						)
					) {
						Notify.create('Product updated!')
					}
				} catch (error: unknown) {
					showErrorMessage((error as Error).message)
				}
			}
		},
		async fbDeleteProduct(productId: string) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + productId
			)
			await productRef.remove(error => {
				if (error) showErrorMessage(error.message)
				else Notify.create('Product deleted!')
			})
		}
	}
})
