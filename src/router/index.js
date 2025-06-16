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
      component: App,
      props: true
    }
  ]
})

// Add navigation guard to handle base path
router.beforeEach((to, from, next) => {
  // Remove the base path from the URL for internal routing
  if (to.path.startsWith('/glosary')) {
    next(to.path.replace('/glosary', ''))
  } else {
    next()
  }
})

export default router 