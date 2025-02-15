<template>
	<q-page>
		<div class="q-pa-md absolute full-width full-height column">
			<template v-if="areSettingsLoaded">
				<div class="row q-mb-lg">
					<SearchBox />
					<SortSelect />
				</div>

				<p v-if="search && !thereAreProductInList">No search results.</p>

				<div
					class="row"
					v-if="thereAreProductInList"
				>
					<q-btn
						class="col q-mb-xs bg-orange-4"
						color="primary"
						icon="keyboard_double_arrow_left"
						label="Add to List"
						@click="storeCatalog.addProductsToList(productsToList)"
						:disable="!Object.keys(productsToList).length"
					/>
				</div>

				<q-scroll-area class="q-scroll-area-products">
					<NoProducts
						v-if="!thereAreProductInList && !search"
						@show-add-product="showAddProduct = true"
						text="Catalog is empty!"
						button-text="Add Product"
						:show-button="true"
					/>

					<ListCatalog
						v-if="thereAreProductInList"
						:catalog-list-items="getProducts"
					/>
				</q-scroll-area>

				<div class="absolute-bottom text-center q-mb-lg no-pointer-events">
					<q-btn
						@click="showAddProduct = true"
						class="all-pointer-events"
						round
						color="primary"
						size="17px"
						icon="add"
					/>
				</div>

				<div v-if="showUsernamePopup">
					<AddSettings
						v-for="(payload, index) in useSettingsPopupPayload()"
						:key="index"
						:payload="payload"
					/>
				</div>

				<q-dialog v-model="showAddProduct">
					<AddProduct @close="showAddProduct = false" />
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
import { ref, computed } from 'vue'
import NoProducts from 'src/components/Products/NoProducts.vue'
import ListCatalog from 'src/components/Products/Catalog/ListCatalog.vue'
import AddProduct from 'src/components/Products/Modals/AddProduct.vue'
import AddSettings from 'src/components/Products/Modals/AddSettings.vue'
import SearchBox from 'src/components/Products/Tools/SearchBox.vue'
import SortSelect from 'src/components/Products/Tools/SortSelect.vue'
import { useCatalogStore } from 'src/stores/store-catalog'
import { useSettingsStore } from 'src/stores/store-settings'
import { useSettingsPopupPayload } from 'src/composables/useSettingsPopupPayload'

const storeSettings = useSettingsStore()
const storeCatalog = useCatalogStore()

const showAddProduct = ref(false)

const areSettingsLoaded = computed(() => storeSettings.settingsDownloaded)
const showUsernamePopup = computed(() => storeSettings.getShowUsernamePopup)

const productsToList = computed(() => storeCatalog.getProductsSelected)
const getProducts = computed(() => storeCatalog.getProducts)

const search = computed(() => storeCatalog.search)
const thereAreProductInList = computed(
	() => Object.keys(getProducts.value).length
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
