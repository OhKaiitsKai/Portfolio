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
     path: '/blog/:slug',
     name: 'blog-post',
      component: () => import('../views/BlogPostView.vue'),
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

    // Admin
    {
      path: '/admin',
      redirect: {
        name: 'admin-login',
      },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../admin/LoginView.vue'),
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../admin/DashboardView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/blog',
      name: 'admin-blog',
      component: () => import('../admin/BlogView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/blog/new',
      name: 'admin-blog-new',
      component: () => import('../admin/NewPostView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/board',
      name: 'admin-board',
      component: () => import('../admin/BoardView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/messages',
      name: 'admin-messages',
      component: () => import('../admin/MessagesView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('../admin/SettingsView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

export default router