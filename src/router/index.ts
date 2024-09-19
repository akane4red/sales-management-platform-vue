import { createRouter, createWebHistory } from 'vue-router'

import LoginComponent from '../components/Login.vue'
import Dashboard from '@/components/Dashboard.vue'

const routes = [
  { path: '/', component: LoginComponent },
  { path: '/admin', component: Dashboard },
  { path: '/sales', component: Dashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export const login = (user: string, pass: string) => {
  if (user === 'admin' && pass === 'admin') {
    localStorage.isAuthenticated = true
    localStorage.userRole = 'admin'
    return '/admin'
  } else if (user === 'sales' && pass === 'sales') {
    localStorage.isAuthenticated = true
    localStorage.userRole = 'sales'
    return '/sales'
  } else {
    localStorage.isAuthenticated = false
    localStorage.userRole = ''
    throw new Error('Invalid username or password')
  }
}

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole') || ''

  if (isAuthenticated) {
    if (userRole === 'admin' && to.path !== '/admin') {
      next('/admin')
    } else if (userRole === 'sales' && to.path !== '/sales') {
      next('/sales')
    } else {
      next()
    }
  } else {
    if (to.path === '/') {
      next()
    } else {
      next('/')
    }
  }
})

export default router
