<template>
	<div class="row">
		<q-input
			outlined
			:modelValue="notes"
			@update:modelValue="event => $emit('update:notes', event)"
			label="Notes"
			class="col"
			ref="nameRef"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
	notes?: string
}>()

const notesRef = ref(null)
defineExpose({ notesRef })
</script>
