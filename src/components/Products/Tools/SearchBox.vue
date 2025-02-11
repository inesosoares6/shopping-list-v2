<template>
	<q-input
		outlined
		v-model="searchField"
		label="Search"
		class="col"
		v-select-all
		@keyup.esc="searchField = ''"
	>
		<template v-slot:append>
			<q-icon
				v-if="searchField"
				name="close"
				@click="searchField = ''"
				class="cursor-pointer"
			/>
			<q-icon name="search" />
		</template>
	</q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { vSelectAll } from 'src/directives/vSelectAll'
import { useCatalogStore } from 'src/stores/store-catalog'

const storeCatalog = useCatalogStore()

const searchField = computed({
	get() {
		return storeCatalog.search
	},
	set(value) {
		storeCatalog.setSearch(value)
	}
})
</script>
