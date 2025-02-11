<template>
	<transition
		appear
		enter-active-class="animated zoomIn"
		leave-active-class="animated zoomOut absolute-top"
	>
		<q-banner class="bg-grey-3">
			<template v-slot:avatar>
				<q-icon
					name="check"
					color="primary"
				/>
			</template>
			{{ text }}
			<template
				v-slot:action
				v-if="showButton"
			>
				<q-btn
					flat
					color="primary"
					:label="buttonText"
					@click="$emit('showAddProduct')"
				/>
			</template>
		</q-banner>
	</transition>
</template>

<script setup lang="ts">
defineProps<{
	text: string
	buttonText: string
	showButton: boolean
}>()
</script>
