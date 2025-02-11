<template>
	<q-page padding>
		<q-card class="auth-tabs">
			<q-tabs
				v-model="tab"
				dense
				class="text-grey"
				active-color="primary"
				indicator-color="primary"
				align="justify"
				narrow-indicator
			>
				<q-tab
					v-for="t in tabs"
					:key="t"
					:name="t"
					:label="capitalize(t)"
				/>
			</q-tabs>

			<q-separator />

			<q-tab-panels
				v-model="tab"
				animated
			>
				<q-tab-panel
					v-for="t in tabs"
					:key="t"
					:name="t"
				>
					<login-register :tab="tab" />
				</q-tab-panel>
			</q-tab-panels>
		</q-card>
	</q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginRegister from 'src/components/Auth/LoginRegister.vue'
import { capitalize } from 'src/functions/utils'

const tabs = ['login', 'register']
const tab = ref(tabs[0] as string)
</script>

<style scoped lang="css">
.auth-tabs {
	max-width: 500px;
	margin: 0 auto;
}
</style>
