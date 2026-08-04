<script setup lang="ts">
import { RefreshCw, Search } from 'lucide-vue-next'
import type { StatusFilter } from '../../types/blog'

interface Props {
  searchQuery: string
  statusFilter: StatusFilter
  categoryFilter: string
  categories: string[]
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:statusFilter', value: StatusFilter): void
  (e: 'update:categoryFilter', value: string): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <section
    class="mt-8 rounded-[2rem] border
           border-nebula/20 bg-cosmic/20
           p-5"
  >
    <div
      class="grid gap-4
             lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]"
    >
      <label class="relative">
        <Search
          :size="19"
          class="pointer-events-none absolute
                 left-4 top-1/2 -translate-y-1/2
                 text-nebula-light"
        />

        <input
          :value="props.searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="search"
          placeholder="Search by title, category or tag..."
          class="w-full rounded-2xl border
                 border-nebula/30 bg-deep-space/60
                 py-3 pl-12 pr-4 text-starlight
                 outline-none transition
                 placeholder:text-nebula-light/40
                 focus:border-nebula-light"
        />
      </label>

      <select
        :value="props.statusFilter"
        @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value as StatusFilter)"
        class="rounded-2xl border border-nebula/30
               bg-deep-space px-4 py-3
               text-starlight outline-none"
      >
        <option value="all">All statuses</option>
        <option value="published">Published</option>
        <option value="draft">Drafts</option>
      </select>

      <select
        :value="props.categoryFilter"
        @change="emit('update:categoryFilter', ($event.target as HTMLSelectElement).value)"
        class="rounded-2xl border border-nebula/30
               bg-deep-space px-4 py-3
               text-starlight outline-none"
      >
        <option value="all">
          All categories
        </option>

        <option
          v-for="category in props.categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>

      <button
        type="button"
        class="inline-flex items-center justify-center
               gap-2 rounded-full border
               border-nebula/40 px-5 py-3
               font-semibold transition
               hover:border-starlight
               hover:bg-starlight/10"
        :disabled="props.isLoading"
        @click="emit('refresh')"
      >
        <RefreshCw
          :size="18"
          :class="{ 'animate-spin': props.isLoading }"
        />

        Refresh
      </button>
    </div>
  </section>
</template>