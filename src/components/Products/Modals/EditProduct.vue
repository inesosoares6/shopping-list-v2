<template>
	<q-card>
		<modal-header>Edit Product</modal-header>

		<form @submit.prevent="submitForm">
			<q-card-section class="q-pt-none">
				<ModalProductName
					v-model:name="productToSubmit.name"
					label="Product Name"
					ref="nameProductRef"
				/>

				<ModalProductNotes
					v-if="list"
					v-model:notes="productToSubmit.notes"
					ref="notesProductRef"
				/>

				<ModalProductKeywords
					v-if="!list"
					v-model:keywords="productToSubmit.keywords"
					ref="keywordsProductRef"
				/>
			</q-card-section>

			<ModalButtons />
		</form>
	</q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { date } from 'quasar'
import type { QInput } from 'quasar'
import { useCatalogStore } from 'src/stores/store-catalog'
import { useListStore } from 'src/stores/store-list'
import { useSettingsStore } from 'src/stores/store-settings'
import ModalHeader from 'components/Products/Modals/Shared/ModalHeader.vue'
import ModalProductName from 'src/components/Products/Modals/Shared/ModalProductName.vue'
import ModalProductKeywords from 'components/Products/Modals/Shared/ModalProductKeywords.vue'
import ModalProductNotes from 'components/Products/Modals/Shared/ModalProductNotes.vue'
import ModalButtons from 'components/Products/Modals/Shared/ModalButtons.vue'
import type { Product } from 'src/models'

const storeSettings = useSettingsStore()
const storeCatalog = useCatalogStore()
const storeList = useListStore()

const props = defineProps<{
	product: Product
	id: string
	list: boolean
}>()

const productToSubmit = ref({
	name: '',
	completed: false,
	keywords: '',
	selected: false,
	notes: '',
	owner: '',
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

const emit = defineEmits(['close'])
const submitProduct = async () => {
	if (props.list) {
		productToSubmit.value.owner =
			'edited by ' +
			storeSettings.settings.username +
			' @ ' +
			date.formatDate(Date.now(), 'DD-MM')
		await storeList.fbUpdateProduct({
			id: props.id,
			updates: productToSubmit.value
		})
	} else {
		await storeCatalog.fbUpdateProduct({
			id: props.id,
			updates: productToSubmit.value
		})
	}
	emit('close')
}

onMounted(() => {
	productToSubmit.value = Object.assign({}, props.product)
})
</script>
