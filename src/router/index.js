import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory('/glosary/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App
    },
    {
      path: '/term/:termName',
      name: 'term',
      component: App,
      props: true
    },
    {
      // Catch all route to handle 404s
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Remove the navigation guard as it's causing the redirect issue
// The base path is already handled by createWebHistory('/glosary/')

export default router 