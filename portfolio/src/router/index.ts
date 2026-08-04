import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
    },
    {
      path: '/socials',
      name: 'socials',
      component: () => import('../views/SocialsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../admin/LoginView.vue'),
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../admin/DashboardView.vue'),
      meta: { requiresAuth: true },
    }

  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

export default router