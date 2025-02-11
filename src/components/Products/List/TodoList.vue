<template>
	<transition
		appear
		enter-active-class="animated zoomIn"
		leave-active-class="animated zoomOut absolute-top"
	>
		<div>
			<list-header bgColor="bg-orange-4">
				<template v-slot:title>List</template>
				<template v-slot:button>
					<q-btn
						flat
						round
						color="orange-9"
						icon="share"
						:disable="!Object.keys(props.productsTodo)"
						@click.stop="shareList()"
					/>
				</template>
			</list-header>

			<q-list
				separator
				bordered
			>
				<!-- prettier-ignore -->
				<product-list
					v-for="(product, key) in productsTodo"
					:key="key"
					:product="product"
					:id="(key as string)"
				/>
			</q-list>
		</div>
	</transition>
</template>

<script setup lang="ts">
import ListHeader from 'components/Shared/ListHeader.vue'
import ProductList from 'src/components/Products/List/ProductList.vue'
import { Share } from '@capacitor/share'
import type { ProductObject } from 'src/models'

const props = defineProps<{
	productsTodo: ProductObject
}>()

const createList = (title: string) => {
	let messageText = title
	for (const product of Object.values(props.productsTodo)) {
		messageText =
			`${messageText} \n - ${product.name}` +
			(product.notes ? ` (${product.notes})` : '')
	}
	return messageText
}

const shareList = async () => {
	const title = `Shopping List - ${new Date().toLocaleDateString()}`
	await Share.share({
		title,
		text: createList(title)
	})
}
</script>
