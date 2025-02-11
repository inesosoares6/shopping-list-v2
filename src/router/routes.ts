import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{
				path: '',
				name: 'home',
				component: () => import('src/pages/PageList.vue')
			},
			{
				path: '/catalog',
				name: 'catalog',
				component: () => import('pages/PageCatalog.vue')
			},
			{ path: '/settings', component: () => import('pages/PageSettings.vue') },
			{
				path: '/auth',
				name: 'auth',
				component: () => import('pages/PageAuth.vue')
			}
		]
	},

	// Always leave this as last one,
	// but you can also remove it
	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
]

export default routes
