export const vSelectAll = {
	mounted: (el: { querySelector: (arg0: string) => any }) => {
		let input = el.querySelector('.q-field__native')
		input.addEventListener('focus', () => {
			if (input.value.length) {
				input.select()
			}
		})
	}
}
