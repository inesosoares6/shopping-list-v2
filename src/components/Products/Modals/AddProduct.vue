<template>
	<q-card>
		<modal-header>Add Product</modal-header>

		<form @submit.prevent="submitForm">
			<q-card-section class="q-pt-none">
				<modal-product-name
					label="Product Name"
					v-model:name="productToSubmit.name"
					ref="nameProductRef"
				/>

				<modal-product-keywords
					v-model:keywords="productToSubmit.keywords"
					ref="keywordsProductRef"
				/>
			</q-card-section>

			<modal-buttons />
		</form>
	</q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCatalogStore } from 'src/stores/store-catalog'
import ModalHeader from 'components/Products/Modals/Shared/ModalHeader.vue'
import ModalProductName from 'src/components/Products/Modals/Shared/ModalProductName.vue'
import ModalProductKeywords from 'components/Products/Modals/Shared/ModalProductKeywords.vue'
import ModalButtons from 'components/Products/Modals/Shared/ModalButtons.vue'
import { uid } from 'quasar'
import type { QInput } from 'quasar'

const emit = defineEmits(['close'])
const storeCatalog = useCatalogStore()

const productToSubmit = ref({
	name: '',
	keywords: '',
	notes: '',
	owner: '',
	selected: false,
	completed: false,
	favorite: false,
	inList: false
})

const nameProductRef = ref<{ nameRef: QInput | null } | null>(null)

const submitForm = async () => {
	void (nameProductRef.value?.nameRef as QInput).validate()
	if (!(nameProductRef.value?.nameRef as QInput).hasError) {
		await submitProduct()
	}
}

const submitProduct = async () => {
	await storeCatalog.fbAddProduct({ id: uid(), product: productToSubmit.value })
	emit('close')
}
</script>
