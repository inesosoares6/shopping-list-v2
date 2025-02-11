import { useSettingsStore } from 'src/stores/store-settings'

export const addListPayload = {
	title: 'Add list',
	message: 'Write the new list name or the code if is a shared one'
}

export const useSettingsPopupPayload = () => {
	const storeSettings = useSettingsStore()
	const payload = [
		{ ...addListPayload, successAction: storeSettings.setList },
		{
			title: 'Add username',
			message: 'Insert your username',
			successAction: storeSettings.setUsername
		}
	]
	return payload.filter(
		item =>
			(!storeSettings.getSettings.username ||
				!item.title.includes('username')) &&
			(!storeSettings.getSettings.list || !item.title.includes('list'))
	)
}
