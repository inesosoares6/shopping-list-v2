export interface ProductObject {
	[key: string]: Product
}

export interface Payload {
	id: string
	product: Product
}

export interface PayloadUpdate {
	id: string
	updates: Partial<Product>
}

export interface Product {
	name: string
	completed: boolean
	keywords: string
	selected: boolean
	notes: string
	owner: string
	favorite: boolean
	inList: boolean
}

export interface LoginInfo {
	email: string
	password: string
}

export interface Settings {
	username: string
	list: string
}

export interface PayloadSettings {
	id: keyof Settings
	updates: string
}

export interface StateSettings {
	settings: Settings
	settingsDownloaded: boolean
	listsPermissions: Record<string, string>
	listNames: Record<string, Record<string, string>>
	listKeys: string[]
}

export enum GeneralActions {
	ADD_LIST = 'add_list'
}

export enum CommonActions {
	SHARE = 'share'
}

export enum AdminActions {
	DELETE_LIST = 'delete_list',
	LIST_NAME = 'list_name'
}

export enum GuestActions {
	REMOVE_LIST = 'remove_list',
	CLONE = 'clone',
  TOOLTIP = 'tooltip'
}

export enum AccountActions {
	EMAIL = 'email',
	PASSWORD = 'password',
	DELETE_ACCOUNT = 'delete_account'
}

export enum AccessType {
	ADMIN = 'admin',
	GUEST = 'guest',
	ALL = 'all'
}

export type SettingsItem<T> = {
  label: string
  key: T
  onClickAction?: () => void
  note?: string
}

export type KeyActionsType = AdminActions | CommonActions | GuestActions | AccountActions | GeneralActions
