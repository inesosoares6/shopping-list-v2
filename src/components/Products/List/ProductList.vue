<template>
	<q-item
		@click="
			storeList.fbUpdateProduct({
				id: id,
				updates: { completed: !product.completed }
			})
		"
		:class="`bg-${!product.completed ? 'orange' : 'green'}-1`"
		clickable
		v-ripple
		v-touch-hold:1000.mouse="() => (showEditProduct = true)"
	>
		<q-item-section
			side
			top
		>
			<q-checkbox v-model="product.completed" />
		</q-item-section>
		<q-item-section>
			<q-item-label :class="{ 'text-strike': product.completed }">
				<span v-html="product.name"></span>
			</q-item-label>
			<q-item-label
				v-if="product.notes"
				class="text-caption text-grey-6"
			>
				{{ product.notes }}
			</q-item-label>
		</q-item-section>
		<q-item-section side>
			<div class="row">
				<q-item-label
					class="text-caption text-weight-light text-grey-6 q-mt-md"
					:style="{ fontSize: '10px' }"
				>
					{{ product.owner }}
				</q-item-label>
				<q-btn
					v-if="!product.completed"
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
				:product="product"
				:id="id"
				:list="true"
				@close="showEditProduct = false"
			/>
		</q-dialog>
	</q-item>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import EditProduct from 'src/components/Products/Modals/EditProduct.vue'
import { useListStore } from 'src/stores/store-list'
import type { Product } from 'src/models'

const storeList = useListStore()

defineProps<{
	product: Product
	id: string
}>()

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
		void storeList.fbDeleteProduct(id, false)
	})
}

const showEditProduct = ref(false)
</script>
