import { showErrorMessage } from 'src/functions/utils'
import { defineStore } from 'pinia'
import { firebaseDb } from 'src/boot/firebase'
import type { Payload, PayloadUpdate, ProductObject, Product } from 'src/models'
import { Notify } from 'quasar'
import { useSettingsStore } from 'src/stores/store-settings'
import { useCatalogStore } from 'src/stores/store-catalog'

export const useListStore = defineStore('storeList', {
	state: () => ({
		products: {} as ProductObject,
		productsDownloaded: false
	}),
	getters: {
		getProductsSorted: state => {
			const productsSorted = {} as ProductObject,
				keysOrdered = Object.keys(state.products)

			keysOrdered.sort((a, b) => {
				const productAProp = (state.products[a] as Product)[
						'name'
					].toLowerCase(),
					productBProp = (state.products[b] as Product)['name'].toLowerCase()
				if (productAProp > productBProp) return 1
				else if (productAProp < productBProp) return -1
				else return 0
			})

			keysOrdered.forEach(key => {
				productsSorted[key] = state.products[key] as Product
			})

			return productsSorted
		},
		getProductsTodo() {
			const productsSorted = this.getProductsSorted
			const products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				const product = productsSorted[key]
				if (!product?.completed) {
					products[key] = product as Product
				}
			})

			return products
		},
		getProductsCompleted() {
			const productsSorted = this.getProductsSorted
			const products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				const product = productsSorted[key]
				if (product?.completed) {
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
		setProductsDownloaded(value: boolean) {
			this.productsDownloaded = value
		},
		async fbReadData() {
			const storeSettings = useSettingsStore()
			const listProducts = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/'
			)

			// initial check for data
			await listProducts.once(
				'value',
				() => {
					this.productsDownloaded = true
				},
				error => {
					showErrorMessage(error.message)
				}
			)

			// child added
			listProducts.on('child_added', snapshot => {
				const product = snapshot.val()
				this.addProduct({
					id: snapshot.key!,
					product: product
				})
			})

			//child changed
			listProducts.on('child_changed', snapshot => {
				const product = snapshot.val()
				this.updateProduct({
					id: snapshot.key!,
					updates: product
				})
			})

			//child removed
			listProducts.on('child_removed', snapshot => {
				this.deleteProduct(snapshot.key!)
			})
		},
		async fbAddProduct(payload: Payload) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + payload.id
			)
			if (!Object.keys(this.products).includes(payload.id)) {
				try {
					await productRef.set(payload.product)
					Notify.create('Product added!')
				} catch (error: unknown) {
					showErrorMessage((error as Error).message)
				}
			}
		},
		async fbUpdateProduct(payload: PayloadUpdate) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + payload.id
			)
			try {
				await productRef.update(payload.updates)
				const keys = Object.keys(payload.updates)
				if (!(keys.includes('completed') && keys.length == 1)) {
					Notify.create('Product updated!')
				}
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		},
		async fbDeleteProduct(productId: string, cart: boolean) {
			const storeSettings = useSettingsStore()
			const storeCatalog = useCatalogStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + productId
			)
			await storeCatalog.fbUpdateProduct({
				id: productId,
				updates: {
					inList: false
				}
			})

			try {
				await productRef.remove()
				if (cart) Notify.create('Cart emptied!')
				else Notify.create('Product deleted!')
			} catch (error: unknown) {
				showErrorMessage((error as Error).message)
			}
		}
	}
})
