import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import FavoritesView from './views/FavoritesView.vue'
import WelcomeView from './views/WelcomeView.vue'

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
