<script setup lang="ts">
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Eye,
  FilePenLine,
  LoaderCircle,
  Pencil,
  Send,
  Trash2,
} from 'lucide-vue-next'

import type { BlogPost } from '../../types/blog'

interface Props {
  post: BlogPost
  isProcessing: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [post: BlogPost]
  delete: [post: BlogPost]
  toggleStatus: [post: BlogPost]
}>()

function formatDate(
  timestamp: BlogPost['createdAt'],
): string {
  if (!timestamp) {
    return 'Pending timestamp'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(timestamp.toDate())
}
</script>

<template>
  <article
    class="grid overflow-hidden rounded-[2rem]
           border border-nebula/20
           bg-cosmic/20 transition
           hover:border-nebula/50
           lg:grid-cols-[18rem_minmax(0,1fr)]"
  >
    <!-- Cover -->
    <div
      class="relative min-h-56 overflow-hidden
             bg-deep-space/60"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="`Cover for ${post.title}`"
        class="h-full w-full object-cover"
      />

      <div
        v-else
        class="flex h-full min-h-56
               items-center justify-center
               text-nebula-light"
      >
        <BookOpen
          :size="42"
          aria-hidden="true"
        />
      </div>

      <span
        class="absolute left-4 top-4 rounded-full
               border px-3 py-1 text-xs
               font-semibold uppercase
               tracking-[0.15em] backdrop-blur"
        :class="
          post.status === 'published'
            ? 'border-nebula-light/40 bg-nebula-light/15 text-starlight'
            : 'border-nebula/40 bg-deep-space/75 text-nebula-light'
        "
      >
        {{ post.status }}
      </span>
    </div>

    <!-- Information -->
    <div
      class="flex flex-col justify-between
             gap-7 p-6 md:p-8"
    >
      <div>
        <div
          class="flex flex-wrap items-center
                 gap-x-5 gap-y-2 text-sm
                 text-nebula-light"
        >
          <span>
            {{ post.category }}
          </span>

          <span class="inline-flex items-center gap-2">
            <CalendarDays
              :size="16"
              aria-hidden="true"
            />

            {{ formatDate(post.createdAt) }}
          </span>

          <span class="inline-flex items-center gap-2">
            <Clock3
              :size="16"
              aria-hidden="true"
            />

            {{ post.readingTime }} min read
          </span>
        </div>

        <h2
          class="mt-4 text-3xl font-semibold
                 leading-tight"
        >
          {{ post.title }}
        </h2>

        <p
          class="mt-4 max-w-3xl leading-7
                 text-nebula-light"
        >
          {{ post.excerpt }}
        </p>

        <div
          v-if="post.tags.length"
          class="mt-5 flex flex-wrap gap-2"
        >
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-full border
                   border-nebula/25
                   bg-deep-space/40
                   px-3 py-1 text-xs
                   text-nebula-light"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex flex-col gap-4
               border-t border-nebula/20
               pt-5 sm:flex-row
               sm:items-center
               sm:justify-between"
      >
        <code
          class="truncate text-sm
                 text-nebula-light/70"
        >
          /blog/{{ post.slug }}
        </code>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2
                   rounded-full border
                   border-nebula/40 px-4 py-2
                   text-sm font-semibold
                   transition
                   hover:border-starlight
                   hover:bg-starlight/10
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="isProcessing"
            @click="emit('toggleStatus', post)"
          >
            <LoaderCircle
              v-if="isProcessing"
              :size="17"
              class="animate-spin"
              aria-hidden="true"
            />

            <Send
              v-else-if="post.status === 'draft'"
              :size="17"
              aria-hidden="true"
            />

            <FilePenLine
              v-else
              :size="17"
              aria-hidden="true"
            />

            {{
              post.status === 'published'
                ? 'Move to draft'
                : 'Publish'
            }}
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2
                   rounded-full border
                   border-nebula/40 px-4 py-2
                   text-sm font-semibold
                   transition
                   hover:border-starlight
                   hover:bg-starlight/10
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="isProcessing"
            @click="emit('edit', post)"
          >
            <Pencil
              :size="17"
              aria-hidden="true"
            />

            Edit
          </button>

          <a
            v-if="post.status === 'published'"
            :href="`/blog/${post.slug}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2
                   rounded-full border
                   border-nebula/40 px-4 py-2
                   text-sm font-semibold
                   transition
                   hover:border-starlight
                   hover:bg-starlight/10"
          >
            <Eye
              :size="17"
              aria-hidden="true"
            />

            Preview
          </a>

          <button
            type="button"
            class="inline-flex items-center gap-2
                   rounded-full border
                   border-red-300/30 px-4 py-2
                   text-sm font-semibold
                   text-red-200 transition
                   hover:bg-red-300/10
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="isProcessing"
            @click="emit('delete', post)"
          >
            <Trash2
              :size="17"
              aria-hidden="true"
            />

            Delete
          </button>
        </div>
      </div>
    </div>
  </article>
</template>