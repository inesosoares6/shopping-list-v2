export const vSelectAll = {
	mounted: (el: HTMLElement) => {
		const input = el.querySelector('.q-field__native') as HTMLInputElement
		input.addEventListener('focus', () => {
			if (input.value.length) {
				input.select()
			}
		})
	}
}
