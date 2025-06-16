import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory('/glosary/'),
  routes: [
    {
      path: '/',
      component: App
    },
    {
      path: '/term/:termName',
      component: App
    }
  ]
})

export default router 