<script setup lang="ts">
import { ref, watch } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

interface NavigationItem {
  label: string
  routeName: string
}

const navigation: NavigationItem[] = [
  { label: 'Home', routeName: 'home' },
  { label: 'Blog', routeName: 'blog' },
  { label: 'Socials', routeName: 'socials' },
  { label: 'About Me', routeName: 'about' },
  { label: 'Board', routeName: 'board' },
  { label: 'Contact Me', routeName: 'contact' },
]

const route = useRoute()
const isMenuOpen = ref(false)

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(): void {
  isMenuOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50
           border-b border-nebula/20
           bg-deep-space/75 backdrop-blur-xl"
  >
    <nav
      class="mx-auto max-w-7xl px-6"
      aria-label="Main navigation"
    >
      <div
        class="flex h-20 items-center
               justify-between"
      >
        <RouterLink
          :to="{ name: 'home' }"
          class="flex items-center gap-2
                 text-xl font-semibold
                 tracking-wide text-starlight"
          @click="closeMenu"
        >
          <span class="text-nebula-light">
            ✦
          </span>

          Aymée
        </RouterLink>

        <!-- Desktop navigation -->
        <ul class="hidden items-center gap-7 md:flex">
          <li
            v-for="item in navigation"
            :key="item.routeName"
          >
            <RouterLink
              :to="{ name: item.routeName }"
              class="relative py-2 text-sm
                     text-nebula-light transition
                     hover:text-starlight"
              active-class="text-starlight after:absolute
                            after:inset-x-0 after:-bottom-1
                            after:h-px after:bg-starlight"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>

        <!-- Mobile button -->
        <button
          type="button"
          class="flex h-11 w-11 items-center
                 justify-center rounded-xl border
                 border-nebula/40 text-starlight
                 transition hover:border-starlight
                 hover:bg-starlight/10 md:hidden"
          :aria-label="
            isMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          "
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-navigation"
          @click="toggleMenu"
        >
          <X
            v-if="isMenuOpen"
            :size="22"
            aria-hidden="true"
          />

          <Menu
            v-else
            :size="22"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Mobile navigation -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div
          v-if="isMenuOpen"
          id="mobile-navigation"
          class="border-t border-nebula/20
                 pb-6 pt-4 md:hidden"
        >
          <ul class="flex flex-col gap-2">
            <li
              v-for="item in navigation"
              :key="item.routeName"
            >
              <RouterLink
                :to="{ name: item.routeName }"
                class="block rounded-xl px-4 py-3
                       text-nebula-light transition
                       hover:bg-starlight/10
                       hover:text-starlight"
                active-class="bg-starlight/10 text-starlight"
                @click="closeMenu"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </Transition>
    </nav>
  </header>
</template>