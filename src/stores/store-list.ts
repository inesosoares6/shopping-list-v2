import { showErrorMessage } from 'src/functions/utils'
import { defineStore } from 'pinia'
import { firebaseDb } from 'src/boot/firebase'
import { Payload, PayloadUpdate, ProductObject, Product } from 'src/models'
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
			let productsSorted = {} as ProductObject,
				keysOrdered = Object.keys(state.products)

			keysOrdered.sort((a, b) => {
				let productAProp = (state.products[a]['name'] as string).toLowerCase(),
					productBProp = (state.products[b]['name'] as string).toLowerCase()
				if (productAProp > productBProp) return 1
				else if (productAProp < productBProp) return -1
				else return 0
			})

			keysOrdered.forEach(key => {
				productsSorted[key] = state.products[key]
			})

			return productsSorted
		},
		getProductsTodo() {
			let productsSorted = this.getProductsSorted
			let products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				let product = productsSorted[key]
				if (!product.completed) {
					products[key] = product
				}
			})

			return products
		},
		getProductsCompleted() {
			let productsSorted = this.getProductsSorted
			let products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				let product = productsSorted[key]
				if (product.completed) {
					products[key] = product
				}
			})
			return products
		}
	},
	actions: {
		updateProduct(payload: PayloadUpdate) {
			Object.assign(this.products[payload.id], payload.updates)
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
		fbReadData() {
			const storeSettings = useSettingsStore()
			const listProducts = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/'
			)

			// initial check for data
			listProducts.once(
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
		fbAddProduct(payload: Payload) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + payload.id
			)
			if (!Object.keys(this.products).includes(payload.id)) {
				productRef.set(payload.product, error => {
					if (error) showErrorMessage(error.message)
					else Notify.create('Product added!')
				})
			}
		},
		fbUpdateProduct(payload: PayloadUpdate) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + payload.id
			)
			productRef.update(payload.updates, error => {
				if (error) showErrorMessage(error.message)
				else {
					const keys = Object.keys(payload.updates)
					if (!(keys.includes('completed') && keys.length == 1)) {
						Notify.create('Product updated!')
					}
				}
			})
		},
		fbDeleteProduct(productId: string, cart: boolean) {
			const storeSettings = useSettingsStore()
			const storeCatalog = useCatalogStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/list/' + productId
			)
			storeCatalog.fbUpdateProduct({
				id: productId,
				updates: {
					inList: false
				}
			})

			productRef.remove(error => {
				if (error) showErrorMessage(error.message)
				else
					cart
						? Notify.create('Cart emptied!')
						: Notify.create('Product deleted!')
			})
		}
	}
})
