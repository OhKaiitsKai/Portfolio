<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  BookOpen,
  Brush,
  LayoutDashboard,
  LogOut,
  Mail,
  Rocket,
  Settings,
} from 'lucide-vue-next'

const route = useRoute()

const navigation = [
  {
    name: 'Dashboard',
    route: 'admin-dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Blog',
    route: 'admin-blog',
    icon: BookOpen,
  },
  {
    name: 'Board',
    route: 'admin-board',
    icon: Brush,
  },
  {
    name: 'Messages',
    route: 'admin-messages',
    icon: Mail,
  },
  {
    name: 'Settings',
    route: 'admin-settings',
    icon: Settings,
  },
]

const isActive = (name: string) =>
  computed(() => route.name === name)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-nebula/20
           bg-deep-space/80 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex h-20 max-w-7xl items-center
             justify-between px-6"
    >
      <!-- Logo -->
      <RouterLink
        :to="{ name: 'admin-dashboard' }"
        class="flex items-center gap-3"
      >
        <div
          class="flex h-11 w-11 items-center justify-center
                 rounded-2xl border border-nebula/30
                 bg-cosmic/40"
        >
          <Rocket
            :size="20"
            class="text-nebula-light"
          />
        </div>

        <div>
          <p
            class="text-xs uppercase tracking-[0.25em]
                   text-nebula-light"
          >
            Portfolio
          </p>

          <h1 class="font-semibold text-starlight">
            Admin Panel
          </h1>
        </div>
      </RouterLink>

      <!-- Navigation -->
      <nav class="hidden gap-2 lg:flex">
        <RouterLink
          v-for="item in navigation"
          :key="item.route"
          :to="{ name: item.route }"
          class="flex items-center gap-2 rounded-full
                 px-4 py-2 transition"
          :class="
            isActive(item.route).value
              ? 'bg-nebula/20 text-starlight'
              : 'text-nebula-light hover:bg-white/5 hover:text-starlight'
          "
        >
          <component
            :is="item.icon"
            :size="18"
          />

          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- Right buttons -->
      <div class="flex items-center gap-3">
        <RouterLink
          :to="{ name: 'home' }"
          class="rounded-full border border-nebula/30
                 px-5 py-2 text-sm transition
                 hover:border-starlight hover:bg-white/5"
        >
          View Portfolio
        </RouterLink>

        <button
          class="flex items-center gap-2 rounded-full
                 bg-starlight px-5 py-2
                 font-semibold text-deep-space
                 transition hover:bg-nebula-light"
        >
          <LogOut :size="18" />

          Logout
        </button>
      </div>
    </div>
  </header>
</template>