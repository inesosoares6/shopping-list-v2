<template>
	<div class="row">
		<q-input
			outlined
			:modelValue="keywords"
			@update:modelValue="event => $emit('update:keywords', event)"
			label="Keywords"
			class="col"
			ref="nameRef"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
	keywords?: string
}>()

const keywordsRef = ref(null)
defineExpose({ keywordsRef })
</script>
