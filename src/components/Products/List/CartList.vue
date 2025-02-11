<template>
	<transition
		appear
		enter-active-class="animated zoomIn"
		leave-active-class="animated zoomOut"
	>
		<div class="q-mt-lg">
			<list-header bgColor="bg-green-4">
				<template v-slot:title>Cart</template>
				<template v-slot:button>
					<q-btn
						flat
						round
						dense
						color="green-10"
						icon="shopping_cart"
						@click.stop="promptToDelete()"
					/>
				</template>
			</list-header>

			<q-list
				separator
				bordered
			>
				<product-list
					v-for="(product, key) in productsCompleted"
					:key="key"
					:product="product"
					:id="key.toString()"
				/>
			</q-list>
		</div>
	</transition>
</template>

<script setup lang="ts">
import ListHeader from 'components/Shared/ListHeader.vue'
import ProductList from 'src/components/Products/List/ProductList.vue'
import { useListStore } from 'src/stores/store-list'
import { useQuasar } from 'quasar'
import type { ProductObject } from 'src/models'

const storeList = useListStore()

const props = defineProps<{
	productsCompleted: ProductObject
}>()

const $q = useQuasar()
const promptToDelete = () => {
	$q.dialog({
		title: 'Confirm',
		message: 'Really empty cart?',
		ok: {
			push: true
		},
		cancel: {
			color: 'negative'
		},
		persistent: true
	}).onOk(() => {
		Object.keys(props.productsCompleted).forEach(key => {
			void storeList.fbDeleteProduct(key, true)
		})
	})
}
</script>
