import { defineStore } from 'pinia'
import { Loading } from 'quasar'
import { firebaseAuth, firebaseDb } from 'src/boot/firebase'
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updatePassword,
	updateEmail,
	deleteUser
} from 'firebase/auth'
import type { LoginInfo } from 'src/models'
import { showErrorMessage } from 'src/functions/utils'
import { useSettingsStore } from 'src/stores/store-settings'
import { Notify } from 'quasar'

export const useAuthStore = defineStore('storeAuth', {
	state: () => ({
		loggedIn: false
	}),
	actions: {
		setLoggedIn(value: boolean) {
			this.loggedIn = value
		},
		handleAuthStateChange() {
			firebaseAuth.onAuthStateChanged(async user => {
				Loading.hide()
				const storeSettings = useSettingsStore()
				if (user) {
					this.setLoggedIn(true)
					await this.router.push('/')
					await storeSettings.fbReadData()
				} else {
					await storeSettings.clearProducts()
					storeSettings.clearSettings()
					this.setLoggedIn(false)
					await this.router.replace('/auth')
				}
			})
		},
		registerUser(payload: LoginInfo) {
			Loading.show()
			createUserWithEmailAndPassword(
				firebaseAuth,
				payload.email,
				payload.password
			)
				.then(response => {
					console.log(response)
				})
				.catch(error => {
					console.log(error.message)
					showErrorMessage(error.message)
				})
		},
		loginUser(payload: LoginInfo) {
			Loading.show()
			signInWithEmailAndPassword(firebaseAuth, payload.email, payload.password)
				.then(response => {
					console.log(response)
				})
				.catch(error => {
					console.log(error.message)
					showErrorMessage(error.message)
				})
		},
		async logoutUser() {
			await signOut(firebaseAuth)
		},
		passwordUpdate(newPassword: string) {
			const user = firebaseAuth.currentUser
			if (user !== null) {
				updatePassword(user, newPassword)
					.then(() => {
						Notify.create('Password updated!')
					})
					.catch((error: { message: string }) => {
						showErrorMessage(error.message)
					})
			}
		},
		emailUpdate(newEmail: string) {
			const user = firebaseAuth.currentUser
			if (user !== null) {
				updateEmail(user, newEmail)
					.then(() => {
						Notify.create('Email updated!')
					})
					.catch((error: { message: string }) => {
						showErrorMessage(error.message)
					})
			}
		},
		async deleteAccount() {
			const user = firebaseAuth.currentUser
			if (user !== null) {
				const userRef = firebaseDb.ref('users/' + user.uid)
				try {
					await userRef.remove()
					deleteUser(user)
						.then(() => {
							Notify.create('Account deleted!')
						})
						.catch((error: { message: string }) => {
							showErrorMessage(error.message)
						})
				} catch (error: unknown) {
					showErrorMessage((error as Error).message)
				}
			}
		}
	}
})
