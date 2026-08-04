<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <AppHeader />

    <RouterView />
  </div>
</template>