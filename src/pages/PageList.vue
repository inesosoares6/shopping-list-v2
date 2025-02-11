<template>
	<q-page>
		<div class="q-pa-md absolute full-width full-height column">
			<template v-if="areSettingsLoaded">
				<q-scroll-area class="q-scroll-area-products">
					<no-products
						v-if="!Object.keys(getProductsTodo).length"
						@show-add-product="
							storeCatalog.addProductsToList(favProductsToList)
						"
						text="No items in list!"
						button-text="Add Favorites"
						:show-button="showButtonFavorites"
					/>

					<todo-list
						v-if="Object.keys(getProductsTodo).length"
						:products-todo="getProductsTodo"
					/>

					<cart-list
						v-if="Object.keys(getProductsCompleted).length"
						:products-completed="getProductsCompleted"
						class="q-mb-xl"
					/>
				</q-scroll-area>

				<div
					class="absolute-bottom text-right q-mb-lg no-pointer-events q-mr-md"
					v-if="Object.keys(getProductsTodo).length"
				>
					<q-btn
						@click="storeCatalog.addProductsToList(favProductsToList)"
						:disable="!Object.keys(favProductsToList).length"
						class="all-pointer-events"
						color="primary"
						icon-right="star"
						label="Add"
						rounded
						stack
					/>
				</div>

				<q-dialog v-model="showUsernamePopup">
					<AddSettings
						v-for="(payload, index) in useSettingsPopupPayload()"
						:key="index"
						:payload="payload"
					/>
				</q-dialog>
			</template>
			<template v-else>
				<span class="absolute-center">
					<q-spinner
						color="primary"
						size="3em"
					/>
				</span>
			</template>
		</div>
	</q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import NoProducts from 'src/components/Products/NoProducts.vue'
import TodoList from 'src/components/Products/List/TodoList.vue'
import CartList from 'src/components/Products/List/CartList.vue'
import AddSettings from 'src/components/Products/Modals/AddSettings.vue'
import { useListStore } from 'src/stores/store-list'
import { useSettingsStore } from 'src/stores/store-settings'
import { useCatalogStore } from 'src/stores/store-catalog'
import { useSettingsPopupPayload } from 'src/composables/useSettingsPopupPayload'

const storeCatalog = useCatalogStore()
const storeSettings = useSettingsStore()
const storeList = useListStore()

const areSettingsLoaded = computed(() => storeSettings.settingsDownloaded)
const showUsernamePopup = computed(() => storeSettings.getShowUsernamePopup)

const getProductsTodo = computed(() => storeList.getProductsTodo)
const getProductsCompleted = computed(() => storeList.getProductsCompleted)

const favProductsToList = computed(() => storeCatalog.getProductsFavorites)
const showButtonFavorites = computed(
	() => !!Object.keys(favProductsToList.value).length
)

watch(
	() => storeSettings.settings,
	() => {
		if (storeSettings.settings.list) {
			storeList.fbReadData()
			storeCatalog.fbReadData()
		}
	},
	{
		deep: true
	}
)
</script>

<style scoped lang="scss">
.q-scroll-area-products {
	display: flex;
	flex-grow: 1;
	.scroll {
		height: auto !important;
	}
}
</style>
