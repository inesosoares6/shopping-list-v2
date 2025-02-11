<template>
	<q-banner
		dense
		inline-actions
		:class="bgColor"
		class="list-header text-white text-center"
	>
		<span class="text-bold text-subtitle1"><slot name="title"></slot></span>
		<template v-slot:action>
			<slot name="button"></slot>
		</template>
	</q-banner>
</template>

<script setup lang="ts">
defineProps<{
	bgColor: string
}>()
</script>

<style lang="css">
.list-header {
	border-top-left-radius: 5px;
	border-top-right-radius: 5px;
}
</style>
