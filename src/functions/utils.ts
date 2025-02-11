import { Dialog } from 'quasar'
import { Loading } from 'quasar'

export const showErrorMessage = (errorMessage: string) => {
	Loading.hide()
	Dialog.create({
		title: 'Error',
		message: errorMessage
	})
}

export const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1)
