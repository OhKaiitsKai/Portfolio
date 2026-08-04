<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/layout/AppHeader.vue'
import AdminHeader from './components/layout/AdminHeader.vue'

const route = useRoute()

const isAdmin = computed(() =>
  route.path.startsWith('/admin')
)
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <AppHeader v-if="!isAdmin" />

    <AdminHeader v-else />

    <RouterView />
  </div>
</template>