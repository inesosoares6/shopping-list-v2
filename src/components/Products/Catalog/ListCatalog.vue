<template>
	<transition
		appear
		enter-active-class="animated zoomIn"
		leave-active-class="animated zoomOut absolute-top"
	>
		<div>
			<q-list
				separator
				bordered
			>
				<product-catalog
					v-for="(product, key) in catalogListItems"
					:key="key"
					:product="product"
					:id="key.toString()"
				/>
			</q-list>
		</div>
	</transition>
</template>

<script setup lang="ts">
import ProductCatalog from 'src/components/Products/Catalog/ProductCatalog.vue'
import type { ProductObject } from 'src/models'

defineProps<{
	catalogListItems: ProductObject
}>()
</script>
