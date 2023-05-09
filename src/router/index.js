import { createRouter, createWebHistory } from 'vue-router'
import { computed } from 'vue'
import store  from '../store/index'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { guest: true, title: 'Home' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegistrationView.vue'),
    meta: { guest: true, title: 'Register' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('../views/ToolsView.vue'),
    meta: { requiresAuth: true, title: 'Tools' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Profile' },
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if(to.meta.requiresAuth && !computed(() => store.getters.getAuth).value){
    document.title = 'Login'
    return{
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
  document.title = to.meta.title
}) 

router.beforeEach((to) => {
  if(to.meta.guest && computed(() => store.getters.getAuth).value){
    document.title = 'Dashboard'
    return{
      name: 'dashboard',
    }
  }
  document.title = to.meta.title
}) 

export default router
