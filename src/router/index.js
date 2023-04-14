import { createRouter, createWebHistory } from 'vue-router'
import { computed } from 'vue'
import store  from '../store/index'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { guest: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegistrationView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('../views/ToolsView.vue'),
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if(to.meta.requiresAuth && !computed(() => store.getters.getAuth).value){
    return{
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
}) 

router.beforeEach((to) => {
  if(to.meta.guest && computed(() => store.getters.getAuth).value){
    return{
      name: 'dashboard',
    }
  }
}) 

export default router
