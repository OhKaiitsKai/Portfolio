<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  RouterLink,
  useRoute,
  useRouter,
} from 'vue-router'
import { signOut } from 'firebase/auth'
import {
  BookOpen,
  Brush,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  Rocket,
  Settings,
} from 'lucide-vue-next'

import { auth } from '../../firebase/config'

interface AdminNavigationItem {
  name: string
  route: string
  icon: typeof LayoutDashboard
}

const route = useRoute()
const router = useRouter()

const isLoggingOut = ref(false)

const navigation: AdminNavigationItem[] = [
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

const currentRouteName = computed(() => {
  return String(route.name ?? '')
})

function isActive(routeName: string): boolean {
  return currentRouteName.value === routeName
}

async function handleLogout(): Promise<void> {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await signOut(auth)

    await router.replace({
      name: 'admin-login',
    })
  } catch (error: unknown) {
    console.error(
      'Unable to log out:',
      error,
    )
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50
           border-b border-nebula/20
           bg-deep-space/80 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex h-20 max-w-7xl
             items-center justify-between
             gap-6 px-6"
    >
      <!-- Logo -->
      <RouterLink
        :to="{ name: 'admin-dashboard' }"
        class="flex shrink-0 items-center gap-3"
      >
        <div
          class="flex h-11 w-11 items-center
                 justify-center rounded-2xl
                 border border-nebula/30
                 bg-cosmic/40"
        >
          <Rocket
            :size="20"
            class="text-nebula-light"
            aria-hidden="true"
          />
        </div>

        <div>
          <p
            class="text-xs uppercase
                   tracking-[0.25em]
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
      <nav
        class="hidden items-center gap-2 lg:flex"
        aria-label="Administration navigation"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.route"
          :to="{ name: item.route }"
          class="flex items-center gap-2
                 rounded-full px-4 py-2
                 text-sm transition"
          :class="
            isActive(item.route)
              ? 'bg-nebula/20 text-starlight'
              : 'text-nebula-light hover:bg-white/5 hover:text-starlight'
          "
        >
          <component
            :is="item.icon"
            :size="18"
            aria-hidden="true"
          />

          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- Right buttons -->
      <div class="flex shrink-0 items-center gap-3">
        <RouterLink
          :to="{ name: 'home' }"
          class="hidden rounded-full border
                 border-nebula/30 px-5 py-2
                 text-sm text-starlight
                 transition hover:border-starlight
                 hover:bg-white/5 sm:inline-flex"
        >
          View Portfolio
        </RouterLink>

        <button
          type="button"
          class="flex items-center gap-2
                 rounded-full bg-starlight
                 px-5 py-2 font-semibold
                 text-deep-space transition
                 hover:bg-nebula-light
                 disabled:cursor-not-allowed
                 disabled:opacity-50"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          <LoaderCircle
            v-if="isLoggingOut"
            :size="18"
            class="animate-spin"
            aria-hidden="true"
          />

          <LogOut
            v-else
            :size="18"
            aria-hidden="true"
          />

          <span class="hidden sm:inline">
            {{
              isLoggingOut
                ? 'Logging out...'
                : 'Logout'
            }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>