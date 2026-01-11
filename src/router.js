import { createRouter, createWebHistory } from 'vue-router'

// 路由懶加載 - 減少初始載入體積
const WelcomeView = () => import('./views/WelcomeView.vue')
const HomeView = () => import('./views/HomeView.vue')
const FavoritesView = () => import('./views/FavoritesView.vue')

const routes = [
    {
        path: '/',
        name: 'welcome',
        component: WelcomeView
    },
    {
        path: '/explore',
        name: 'explore',
        component: HomeView
    },
    {
        path: '/favorites',
        name: 'favorites',
        component: FavoritesView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
