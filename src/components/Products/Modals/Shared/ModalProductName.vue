<template>
	<div class="row q-mb-sm">
		<q-input
			outlined
			:modelValue="name"
			@update:modelValue="event => $emit('update:name', event)"
			:rules="[val => !!val || 'Field is required']"
			:label="label"
			class="col"
			autofocus
			v-select-all
			ref="nameRef"
		>
			<template v-slot:append>
				<q-icon
					v-if="name"
					@click="$emit('update:name', '')"
					class="cursor-pointer"
					name="close"
				/>
			</template>
		</q-input>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { vSelectAll } from 'src/directives/vSelectAll'

defineProps<{
	name?: string
	label: string
}>()

const nameRef = ref(null)
defineExpose({ nameRef })
</script>
