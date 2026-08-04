<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  collection,
  getDocs,
  limit,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  LoaderCircle,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'

import { db } from '../firebase/config'

interface PublicBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  readingTime: number
  publishedAt: Timestamp | null
  createdAt: Timestamp | null
}

const route = useRoute()

const post = ref<PublicBlogPost | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const notFound = ref(false)

const slug = computed(() => {
  return String(route.params.slug ?? '')
})

const postDate = computed(() => {
  if (!post.value) return null

  return (
    post.value.publishedAt ??
    post.value.createdAt
  )
})

async function loadPost(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  notFound.value = false
  post.value = null

  if (!slug.value) {
    notFound.value = true
    isLoading.value = false
    return
  }

  try {
    const postQuery = query(
      collection(db, 'blogPosts'),
      where('slug', '==', slug.value),
      where('status', '==', 'published'),
      limit(1),
    )

    const snapshot = await getDocs(postQuery)

    if (snapshot.empty) {
      notFound.value = true
      return
    }

    const postDocument = snapshot.docs[0]
    const data = postDocument.data()

    post.value = {
      id: postDocument.id,
      title: data.title ?? '',
      slug: data.slug ?? '',
      excerpt: data.excerpt ?? '',
      content: data.content ?? '',
      coverImage: data.coverImage ?? '',
      category: data.category ?? 'Uncategorized',
      tags: Array.isArray(data.tags)
        ? data.tags
        : [],
      readingTime: data.readingTime ?? 1,
      publishedAt: data.publishedAt ?? null,
      createdAt: data.createdAt ?? null,
    }

    document.title = `${post.value.title} | Aymée`
  } catch (error: unknown) {
    console.error(
      'Unable to load the article:',
      error,
    )

    errorMessage.value =
      'The article could not be loaded. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

function formatDate(
  timestamp: Timestamp | null,
): string {
  if (!timestamp) {
    return 'Recently published'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
  }).format(timestamp.toDate())
}

watch(slug, loadPost)

onMounted(loadPost)
</script>

<template>
  <main class="min-h-screen pb-24 pt-32 text-starlight">
    <!-- Loading -->
    <section
      v-if="isLoading"
      class="mx-auto flex min-h-[60vh] max-w-7xl
             items-center justify-center px-6"
    >
      <div
        class="flex items-center gap-3
               text-nebula-light"
      >
        <LoaderCircle
          :size="26"
          class="animate-spin"
          aria-hidden="true"
        />

        Loading article...
      </div>
    </section>

    <!-- Error -->
    <section
      v-else-if="errorMessage"
      class="mx-auto max-w-4xl px-6"
    >
      <div
        class="rounded-[2rem] border
               border-red-300/30 bg-red-300/10
               px-8 py-12 text-center"
      >
        <h1 class="text-3xl font-bold">
          Something went wrong.
        </h1>

        <p class="mt-4 text-red-200">
          {{ errorMessage }}
        </p>

        <RouterLink
          :to="{ name: 'blog' }"
          class="mt-8 inline-flex items-center gap-2
                 rounded-full border
                 border-nebula/40 px-6 py-3
                 font-semibold transition
                 hover:border-starlight
                 hover:bg-starlight/10"
        >
          <ArrowLeft
            :size="19"
            aria-hidden="true"
          />

          Return to blog
        </RouterLink>
      </div>
    </section>

    <!-- Not found -->
    <section
      v-else-if="notFound"
      class="mx-auto max-w-4xl px-6"
    >
      <div
        class="rounded-[3rem] border
               border-dashed border-nebula/30
               bg-cosmic/15 px-8 py-20
               text-center"
      >
        <BookOpen
          :size="50"
          class="mx-auto text-nebula-light"
          aria-hidden="true"
        />

        <p
          class="mt-7 text-sm uppercase
                 tracking-[0.35em]
                 text-nebula-light"
        >
          Lost in space
        </p>

        <h1 class="mt-4 text-4xl font-bold md:text-5xl">
          This story could not be found.
        </h1>

        <p
          class="mx-auto mt-5 max-w-xl
                 leading-7 text-nebula-light"
        >
          The article may not exist, may have been moved
          or may still be saved as a draft.
        </p>

        <RouterLink
          :to="{ name: 'blog' }"
          class="mt-8 inline-flex items-center gap-2
                 rounded-full bg-starlight
                 px-6 py-3 font-semibold
                 text-deep-space transition
                 hover:bg-nebula-light"
        >
          <ArrowLeft
            :size="19"
            aria-hidden="true"
          />

          Explore the journal
        </RouterLink>
      </div>
    </section>

    <!-- Article -->
    <article
      v-else-if="post"
      class="mx-auto max-w-7xl px-6"
    >
      <!-- Back link -->
      <RouterLink
        :to="{ name: 'blog' }"
        class="inline-flex items-center gap-2
               text-sm text-nebula-light
               transition hover:text-starlight"
      >
        <ArrowLeft
          :size="18"
          aria-hidden="true"
        />

        Return to the journal
      </RouterLink>

      <!-- Article header -->
      <header class="mx-auto mt-12 max-w-5xl text-center">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          {{ post.category }}
        </p>

        <h1
          class="mt-6 text-5xl font-bold leading-tight
                 md:text-7xl"
        >
          {{ post.title }}
        </h1>

        <p
          class="mx-auto mt-7 max-w-3xl
                 text-lg leading-8
                 text-nebula-light md:text-xl"
        >
          {{ post.excerpt }}
        </p>

        <div
          class="mt-8 flex flex-wrap items-center
                 justify-center gap-x-6 gap-y-3
                 text-sm text-nebula-light"
        >
          <span
            class="inline-flex items-center gap-2"
          >
            <CalendarDays
              :size="17"
              aria-hidden="true"
            />

            {{ formatDate(postDate) }}
          </span>

          <span
            class="inline-flex items-center gap-2"
          >
            <Clock3
              :size="17"
              aria-hidden="true"
            />

            {{ post.readingTime }} min read
          </span>
        </div>

        <div
          v-if="post.tags.length"
          class="mt-7 flex flex-wrap
                 justify-center gap-2"
        >
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="rounded-full border
                   border-nebula/30
                   bg-cosmic/20 px-4 py-2
                   text-xs text-nebula-light"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <!-- Cover image -->
      <div
        class="mx-auto mt-14 max-w-6xl
               overflow-hidden rounded-[2.5rem]
               border border-nebula/25
               bg-cosmic/20"
      >
        <img
          v-if="post.coverImage"
          :src="post.coverImage"
          :alt="`Cover for ${post.title}`"
          class="max-h-[42rem] w-full object-cover"
        />

        <div
          v-else
          class="flex aspect-video items-center
                 justify-center text-nebula-light"
        >
          <BookOpen
            :size="56"
            aria-hidden="true"
          />
        </div>
      </div>

      <!-- Content -->
      <section
        class="mx-auto mt-16 max-w-3xl"
      >
        <div
          class="whitespace-pre-wrap
                 text-lg leading-9
                 text-nebula-light"
        >
          {{ post.content }}
        </div>
      </section>

      <!-- Footer -->
      <footer
        class="mx-auto mt-20 max-w-3xl
               border-t border-nebula/20 pt-10"
      >
        <div
          class="rounded-[2rem] border
                 border-nebula/20 bg-cosmic/20
                 p-7 text-center"
        >
          <p
            class="text-sm uppercase tracking-[0.3em]
                   text-nebula-light"
          >
            End of transmission
          </p>

          <h2 class="mt-4 text-3xl font-semibold">
            Thank you for reading.
          </h2>

          <p
            class="mx-auto mt-4 max-w-xl
                   leading-7 text-nebula-light"
          >
            Continue exploring more stories,
            projects and fragments of my universe.
          </p>

          <RouterLink
            :to="{ name: 'blog' }"
            class="mt-7 inline-flex items-center
                   gap-2 rounded-full
                   bg-starlight px-6 py-3
                   font-semibold text-deep-space
                   transition hover:bg-nebula-light"
          >
            <ArrowLeft
              :size="19"
              aria-hidden="true"
            />

            More stories
          </RouterLink>
        </div>
      </footer>
    </article>
  </main>
</template>