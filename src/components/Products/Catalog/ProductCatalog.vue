<template>
	<q-item
		@click="updateSelected"
		:class="`bg-orange-${!product.selected ? 1 : 2}`"
		:disable="product.inList"
		clickable
		v-ripple
		v-touch-hold:1000.mouse="() => (showEditProduct = true)"
	>
		<q-item-section
			side
			top
		>
			<q-checkbox
				v-model="isSelected"
				class="no-pointer-events"
			/>
		</q-item-section>
		<q-item-section>
			<q-item-label><span v-html="filtered"></span></q-item-label>
			<q-item-label class="text-caption text-grey-6">
				<span v-html="filteredKeywords"></span>
			</q-item-label>
		</q-item-section>
		<q-item-section side>
			<div class="row">
				<q-btn
					flat
					round
					dense
					:color="`${product.favorite ? 'orange' : 'grey'}-5`"
					icon="star"
					@click.stop="updateFavorites"
				/>
				<q-btn
					flat
					round
					dense
					color="primary"
					icon="edit"
					@click.stop="showEditProduct = true"
				/>
				<q-btn
					flat
					round
					dense
					color="red"
					icon="delete"
					@click.stop="promptToDelete(id)"
				/>
			</div>
		</q-item-section>

		<q-dialog v-model="showEditProduct">
			<edit-product
				:list="false"
				:product="product"
				:id="id"
				@close="showEditProduct = false"
			/>
		</q-dialog>
	</q-item>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import EditProduct from 'src/components/Products/Modals/EditProduct.vue'
import { useCatalogStore } from 'src/stores/store-catalog'
import type { Product } from 'src/models'
import { useCleanString } from 'src/composables/useStringHelpers'

const storeCatalog = useCatalogStore()

const props = defineProps<{
	product: Product
	id: string
}>()

const search = computed(() => useCleanString(storeCatalog.search))
const name = computed(() => useCleanString(props.product.name))
const keywords = computed(() => useCleanString(props.product?.keywords))

const showEditProduct = ref(false)
const isSelected = ref(props.product.selected)

const filtered = computed(() => {
	if (!search.value) return props.product.name

	const searchRegExp = new RegExp(search.value, 'ig')
	return name.value.replace(
		searchRegExp,
		match => '<span class="bg-yellow-6">' + match + '</span>'
	)
})

const filteredKeywords = computed(() => {
	if (!search.value) return props.product.keywords

	const searchRegExp = new RegExp(search.value, 'ig')
	return keywords.value.replace(
		searchRegExp,
		match => '<span class="bg-yellow-6">' + match + '</span>'
	)
})

const updateFavorites = async () => {
	await storeCatalog.fbUpdateProduct({
		id: props.id,
		updates: {
			favorite: !props.product.favorite
		}
	})
}

const updateSelected = async () => {
	await storeCatalog.fbUpdateProduct({
		id: props.id,
		updates: {
			selected: !props.product.selected
		}
	})
}

const $q = useQuasar()
const promptToDelete = (id: string) => {
	$q.dialog({
		title: 'Confirm',
		message: 'Really delete?',
		ok: {
			push: true
		},
		cancel: {
			color: 'negative'
		},
		persistent: true
	}).onOk(() => {
		void storeCatalog.fbDeleteProduct(id)
	})
}
</script>
