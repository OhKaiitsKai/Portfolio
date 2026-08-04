<script setup lang="ts">
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
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b border-nebula/20
           bg-deep-space/75 backdrop-blur-xl"
  >
    <nav
      class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      aria-label="Main navigation"
    >
      <RouterLink
  :to="{ name: 'home' }"
  class="flex items-center gap-2 text-xl font-semibold
         tracking-wide text-starlight"
   >
     <span class="text-nebula-light">✦</span>
      Aymée
       </RouterLink>

      <ul class="hidden items-center gap-7 md:flex">
        <li
          v-for="item in navigation"
          :key="item.routeName"
        >
          <RouterLink
        :to="{ name: item.routeName }"
        class="relative py-2 text-sm text-nebula-light
         transition hover:text-starlight"
         active-class="text-starlight after:absolute after:inset-x-0
                after:-bottom-1 after:h-px
                after:bg-starlight"
                 >
          {{ item.label }}
            </RouterLink>
        </li>
      </ul>

      <button
        type="button"
        class="rounded-lg border border-nebula/40 p-2 text-starlight md:hidden"
        aria-label="Open navigation menu"
      >
        Menu
      </button>
    </nav>
  </header>
</template>