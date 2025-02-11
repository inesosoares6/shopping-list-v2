import { showErrorMessage } from 'src/functions/utils'
import { defineStore } from 'pinia'
import { firebaseDb } from 'src/boot/firebase'
import { Payload, PayloadUpdate, ProductObject, Product } from 'src/models'
import { Notify, date, uid } from 'quasar'
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
			let productsSorted = {} as ProductObject,
				keysOrdered = Object.keys(state.products)

			keysOrdered.sort((a, b) => {
				let productAProp = useCleanString(
						state.products[a][state.sort] as string
					),
					productBProp = useCleanString(state.products[b][state.sort] as string)
				if (productAProp > productBProp) return 1
				else if (productAProp < productBProp) return -1
				else return 0
			})

			keysOrdered.forEach(key => {
				productsSorted[key] = state.products[key]
			})

			return productsSorted
		},
		getProductsFiltered(state): ProductObject {
			let productsSorted = this.getProductsSorted
			let productsFiltered = {} as ProductObject
			if (state.search) {
				Object.keys(productsSorted).forEach(key => {
					let product = productsSorted[key],
						productName = useCleanString(product.name),
						productKeywords = useCleanString(product.keywords),
						search = useCleanString(state.search)
					if (
						productName.includes(search) ||
						productKeywords.includes(search)
					) {
						productsFiltered[key] = product
					}
				})
				return productsFiltered
			}
			return productsSorted
		},
		getProducts(): ProductObject {
			let productsFiltered = this.getProductsFiltered
			let products = {} as ProductObject
			Object.keys(productsFiltered).forEach(key => {
				let product = productsFiltered[key]
				if (!product.completed) {
					products[key] = product
				}
			})

			return products
		},
		getProductsFavorites() {
			let productsSorted = this.getProductsSorted
			let products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				let product = productsSorted[key]
				if (product.favorite) {
					products[key] = product
				}
			})
			return products
		},
		getProductsSelected() {
			let productsSorted = this.getProductsSorted
			let products = {} as ProductObject
			Object.keys(productsSorted).forEach(key => {
				let product = productsSorted[key]
				if (product.selected) {
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
				let product = productsToList[key]
				this.fbUpdateProduct({
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
				storeList.fbAddProduct({ id: key, product })
			})
		},
		fbReadData() {
			const storeSettings = useSettingsStore()
			const catalogProducts = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/'
			)

			// initial check for data
			catalogProducts.once(
				'value',
				() => {
					this.productsDownloaded = true
				},
				error => {
					showErrorMessage(error.message)
				}
			)

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
		fbAddProduct(payload: Payload) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + payload.id
			)
			productRef.set(payload.product, error => {
				if (error) showErrorMessage(error.message)
				else Notify.create('Product added!')
			})
		},
		fbUpdateProduct(payload: PayloadUpdate) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + payload.id
			)
			if (Object.keys(this.products).includes(payload.id)) {
				productRef.update(payload.updates, error => {
					if (error) showErrorMessage(error.message)
					else {
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
					}
				})
			}
		},
		fbDeleteProduct(productId: string) {
			const storeSettings = useSettingsStore()
			const productRef = firebaseDb.ref(
				'lists/' + storeSettings.getSettings.list + '/catalog/' + productId
			)
			productRef.remove(error => {
				if (error) showErrorMessage(error.message)
				else Notify.create('Product deleted!')
			})
		}
	}
})
