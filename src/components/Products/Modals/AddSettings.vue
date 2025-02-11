<script setup lang="ts">
import { useQuasar } from 'quasar'

const props = defineProps<{
	payload: {
		title: string
		message: string
		successAction: (data: string) => void
	}
}>()

const $q = useQuasar()
$q.dialog({
	title: props.payload.title,
	message: props.payload.message,
	prompt: {
		model: '',
		type: 'text',
		isValid: val => !!val.length
	},
	ok: {
		push: true
	},
	persistent: true
}).onOk(data => {
	props.payload.successAction(data)
})
</script>
