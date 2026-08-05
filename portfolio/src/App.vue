<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AdminHeader from './components/layout/AdminHeader.vue'
import AppHeader from './components/layout/AppHeader.vue'
import StarfieldBackground from './components/layout/StarfieldBackground.vue'

const route = useRoute()

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

const isAdminLogin = computed(() => {
  return route.name === 'admin-login'
})
</script>

<template>
  <div
    class="relative min-h-screen
           overflow-x-hidden"
  >
    <StarfieldBackground />

    <AppHeader
      v-if="!isAdminRoute"
    />

    <AdminHeader
      v-else-if="!isAdminLogin"
    />

    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>