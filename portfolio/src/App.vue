<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/layout/AppHeader.vue'
import AdminHeader from './components/layout/AdminHeader.vue'

const route = useRoute()

const isAdminRoute = computed(() =>
  route.path.startsWith('/admin')
)

const isAdminLogin = computed(() =>
  route.name === 'admin-login'
)
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <AppHeader v-if="!isAdminRoute" />

    <AdminHeader
      v-else-if="!isAdminLogin"
    />

    <RouterView />
  </div>
</template>