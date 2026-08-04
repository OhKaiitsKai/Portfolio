<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Search,
} from 'lucide-vue-next'

import { db } from '../firebase/config'

interface PublicBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  readingTime: number
  publishedAt: Timestamp | null
  createdAt: Timestamp | null
}

const posts = ref<PublicBlogPost[]>([])
const searchQuery = ref('')
const selectedCategory = ref('all')

const isLoading = ref(true)
const errorMessage = ref('')

const categories = computed(() => {
  return Array.from(
    new Set(
      posts.value
        .map((post) => post.category)
        .filter(Boolean),
    ),
  ).sort()
})

const featuredPost = computed(() => {
  return filteredPosts.value[0] ?? null
})

const remainingPosts = computed(() => {
  return filteredPosts.value.slice(1)
})

const filteredPosts = computed(() => {
  const search = searchQuery.value.trim().toLowerCase()

  return posts.value.filter((post) => {
    const matchesCategory =
      selectedCategory.value === 'all' ||
      post.category === selectedCategory.value

    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search) ||
      post.excerpt.toLowerCase().includes(search) ||
      post.category.toLowerCase().includes(search) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(search),
      )

    return matchesCategory && matchesSearch
  })
})

async function loadPublishedPosts(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const postsQuery = query(
      collection(db, 'blogPosts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
    )

    const snapshot = await getDocs(postsQuery)

    posts.value = snapshot.docs.map((document) => {
      const data = document.data()

      return {
        id: document.id,
        title: data.title ?? '',
        slug: data.slug ?? '',
        excerpt: data.excerpt ?? '',
        coverImage: data.coverImage ?? '',
        category: data.category ?? 'Uncategorized',
        tags: Array.isArray(data.tags)
          ? data.tags
          : [],
        readingTime: data.readingTime ?? 1,
        publishedAt: data.publishedAt ?? null,
        createdAt: data.createdAt ?? null,
      } satisfies PublicBlogPost
    })
  } catch (error: unknown) {
    console.error(
      'Unable to load published articles:',
      error,
    )

    errorMessage.value =
      'The articles could not be loaded. Please try again later.'
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

onMounted(loadPublishedPosts)
</script>

<template>
  <main class="min-h-screen pb-24 pt-32 text-starlight">
    <!-- Hero -->
    <section class="relative mx-auto max-w-7xl px-6">
      <div
        class="pointer-events-none absolute -left-40 -top-36
               h-96 w-96 rounded-full
               bg-nebula/15 blur-3xl"
      ></div>

      <div class="relative max-w-4xl">
        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Space journal
        </p>

        <h1
          class="mt-5 text-5xl font-bold leading-tight
                 md:text-7xl"
        >
          Stories from my universe.
        </h1>

        <p
          class="mt-7 max-w-2xl text-lg leading-8
                 text-nebula-light md:text-xl"
        >
          Development logs, creative thoughts, music,
          Nintendo, languages and everything I discover
          along the way.
        </p>
      </div>
    </section>

    <!-- Search and categories -->
    <section class="mx-auto mt-14 max-w-7xl px-6">
      <div
        class="rounded-[2rem] border border-nebula/20
               bg-cosmic/20 p-5 backdrop-blur-md"
      >
        <label class="relative block">
          <span class="sr-only">
            Search articles
          </span>

          <Search
            :size="20"
            class="pointer-events-none absolute
                   left-4 top-1/2 -translate-y-1/2
                   text-nebula-light"
            aria-hidden="true"
          />

          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search the journal..."
            class="w-full rounded-2xl border
                   border-nebula/30 bg-deep-space/60
                   py-3 pl-12 pr-4 text-starlight
                   outline-none transition
                   placeholder:text-nebula-light/40
                   focus:border-nebula-light"
          />
        </label>

        <div class="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full border px-4 py-2
                   text-sm font-semibold transition"
            :class="
              selectedCategory === 'all'
                ? 'border-starlight bg-starlight text-deep-space'
                : 'border-nebula/30 text-nebula-light hover:border-starlight hover:text-starlight'
            "
            @click="selectedCategory = 'all'"
          >
            All
          </button>

          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="rounded-full border px-4 py-2
                   text-sm font-semibold transition"
            :class="
              selectedCategory === category
                ? 'border-starlight bg-starlight text-deep-space'
                : 'border-nebula/30 text-nebula-light hover:border-starlight hover:text-starlight'
            "
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <section
      v-if="isLoading"
      class="mx-auto flex min-h-96 max-w-7xl
             items-center justify-center px-6"
    >
      <div class="flex items-center gap-3 text-nebula-light">
        <LoaderCircle
          :size="26"
          class="animate-spin"
          aria-hidden="true"
        />

        Loading journal...
      </div>
    </section>

    <!-- Error -->
    <section
      v-else-if="errorMessage"
      class="mx-auto mt-10 max-w-7xl px-6"
    >
      <p
        class="rounded-2xl border border-red-300/30
               bg-red-300/10 px-5 py-4 text-red-200"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </section>

    <!-- Empty blog -->
    <section
      v-else-if="posts.length === 0"
      class="mx-auto mt-10 max-w-7xl px-6"
    >
      <div
        class="rounded-[3rem] border border-dashed
               border-nebula/30 bg-cosmic/15
               px-8 py-24 text-center"
      >
        <BookOpen
          :size="48"
          class="mx-auto text-nebula-light"
          aria-hidden="true"
        />

        <h2 class="mt-6 text-3xl font-semibold">
          The journal is still waiting for its first story.
        </h2>

        <p
          class="mx-auto mt-4 max-w-xl leading-7
                 text-nebula-light"
        >
          Published articles will appear here automatically.
        </p>
      </div>
    </section>

    <!-- No filtered results -->
    <section
      v-else-if="filteredPosts.length === 0"
      class="mx-auto mt-10 max-w-7xl px-6"
    >
      <div
        class="rounded-[2rem] border border-nebula/20
               bg-cosmic/20 px-8 py-16 text-center"
      >
        <h2 class="text-2xl font-semibold">
          No stories were found.
        </h2>

        <p class="mt-3 text-nebula-light">
          Try another search or category.
        </p>
      </div>
    </section>

    <template v-else>
      <!-- Featured article -->
      <section
        v-if="featuredPost"
        class="mx-auto mt-12 max-w-7xl px-6"
      >
        <RouterLink
          :to="{
            name: 'blog-post',
            params: {
              slug: featuredPost.slug,
            },
          }"
          class="group grid overflow-hidden
                 rounded-[2.5rem] border border-nebula/25
                 bg-cosmic/25 transition duration-500
                 hover:-translate-y-1
                 hover:border-nebula/70
                 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div
            class="relative min-h-80 overflow-hidden
                   bg-deep-space/60"
          >
            <img
              v-if="featuredPost.coverImage"
              :src="featuredPost.coverImage"
              :alt="`Cover for ${featuredPost.title}`"
              class="h-full w-full object-cover
                     transition duration-700
                     group-hover:scale-105"
            />

            <div
              v-else
              class="flex h-full min-h-80
                     items-center justify-center"
            >
              <BookOpen
                :size="54"
                class="text-nebula-light"
                aria-hidden="true"
              />
            </div>

            <span
              class="absolute left-6 top-6 rounded-full
                     border border-starlight/30
                     bg-deep-space/75 px-4 py-2
                     text-xs font-semibold uppercase
                     tracking-[0.2em] backdrop-blur"
            >
              Featured
            </span>
          </div>

          <div
            class="flex flex-col justify-center
                   p-8 md:p-12"
          >
            <div
              class="flex flex-wrap items-center gap-4
                     text-sm text-nebula-light"
            >
              <span>
                {{ featuredPost.category }}
              </span>

              <span class="inline-flex items-center gap-2">
                <CalendarDays
                  :size="16"
                  aria-hidden="true"
                />

                {{
                  formatDate(
                    featuredPost.publishedAt ??
                    featuredPost.createdAt,
                  )
                }}
              </span>

              <span class="inline-flex items-center gap-2">
                <Clock3
                  :size="16"
                  aria-hidden="true"
                />

                {{ featuredPost.readingTime }} min read
              </span>
            </div>

            <h2
              class="mt-5 text-4xl font-semibold leading-tight
                     md:text-5xl"
            >
              {{ featuredPost.title }}
            </h2>

            <p
              class="mt-6 text-lg leading-8
                     text-nebula-light"
            >
              {{ featuredPost.excerpt }}
            </p>

            <div
              v-if="featuredPost.tags.length"
              class="mt-6 flex flex-wrap gap-2"
            >
              <span
                v-for="tag in featuredPost.tags"
                :key="tag"
                class="rounded-full border border-nebula/25
                       bg-deep-space/30 px-3 py-1
                       text-xs text-nebula-light"
              >
                {{ tag }}
              </span>
            </div>

            <span
              class="mt-9 inline-flex items-center gap-3
                     font-semibold text-starlight"
            >
              Read article

              <ArrowRight
                :size="20"
                class="transition
                       group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </RouterLink>
      </section>

      <!-- Other articles -->
      <section
        v-if="remainingPosts.length"
        class="mx-auto mt-20 max-w-7xl px-6"
      >
        <div class="max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Latest entries
          </p>

          <h2 class="mt-4 text-4xl font-bold md:text-5xl">
            More stories to explore.
          </h2>
        </div>

        <div
          class="mt-10 grid gap-7
                 md:grid-cols-2 xl:grid-cols-3"
        >
          <RouterLink
            v-for="post in remainingPosts"
            :key="post.id"
            :to="{
              name: 'blog-post',
              params: {
                slug: post.slug,
              },
            }"
            class="group flex overflow-hidden
                   rounded-[2rem] border border-nebula/20
                   bg-cosmic/20 transition duration-300
                   hover:-translate-y-2
                   hover:border-nebula/60
                   md:flex-col"
          >
            <div
              class="relative min-h-52 overflow-hidden
                     bg-deep-space/60 md:aspect-video"
            >
              <img
                v-if="post.coverImage"
                :src="post.coverImage"
                :alt="`Cover for ${post.title}`"
                class="h-full w-full object-cover
                       transition duration-500
                       group-hover:scale-105"
              />

              <div
                v-else
                class="flex h-full min-h-52
                       items-center justify-center"
              >
                <BookOpen
                  :size="42"
                  class="text-nebula-light"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div class="flex flex-1 flex-col p-6">
              <div
                class="flex flex-wrap items-center gap-3
                       text-sm text-nebula-light"
              >
                <span>
                  {{ post.category }}
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {{ post.readingTime }} min read
                </span>
              </div>

              <h3
                class="mt-4 text-2xl font-semibold
                       leading-tight"
              >
                {{ post.title }}
              </h3>

              <p
                class="mt-4 line-clamp-3 flex-1
                       leading-7 text-nebula-light"
              >
                {{ post.excerpt }}
              </p>

              <div
                class="mt-7 flex items-center justify-between
                       border-t border-nebula/20 pt-5"
              >
                <time
                  :datetime="
                    (
                      post.publishedAt ??
                      post.createdAt
                    )?.toDate().toISOString()
                  "
                  class="text-sm text-nebula-light"
                >
                  {{
                    formatDate(
                      post.publishedAt ??
                      post.createdAt,
                    )
                  }}
                </time>

                <ArrowRight
                  :size="20"
                  class="text-nebula-light transition
                         group-hover:translate-x-1
                         group-hover:text-starlight"
                  aria-hidden="true"
                />
              </div>
            </div>
          </RouterLink>
        </div>
      </section>
    </template>
  </main>
</template>