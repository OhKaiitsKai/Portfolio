<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/layout/AppHeader.vue'

const route = useRoute()

const showPublicHeader = computed(() => {
  return !route.path.startsWith('/admin')
})
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <AppHeader v-if="showPublicHeader" />

    <RouterView />
  </div>
</template>