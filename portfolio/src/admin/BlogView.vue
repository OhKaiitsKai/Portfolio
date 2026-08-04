<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  deleteObject,
  ref as storageRef,
} from 'firebase/storage'
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Eye,
  FilePenLine,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-vue-next'

import EditPostModal from '../components/admin/EditPostModal.vue'
import BlogStats from '../components/admin/BlogStats.vue'
import BlogFilters from '../components/admin/BlogFilters.vue'
import { db, storage } from '../firebase/config'
import type {
  BlogPost,
  PostStatus,
  StatusFilter,
} from '../types/blog'

const posts = ref<BlogPost[]>([])

const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('all')
const categoryFilter = ref('all')

const isLoading = ref(true)
const processingPostId = ref<string | null>(null)

const errorMessage = ref('')
const successMessage = ref('')

const selectedPost = ref<BlogPost | null>(null)
const isEditModalOpen = ref(false)

const categories = computed(() => {
  return Array.from(
    new Set(
      posts.value
        .map((post) => post.category)
        .filter(Boolean),
    ),
  ).sort()
})

const publishedCount = computed(() => {
  return posts.value.filter(
    (post) => post.status === 'published',
  ).length
})

const draftCount = computed(() => {
  return posts.value.filter(
    (post) => post.status === 'draft',
  ).length
})

const filteredPosts = computed(() => {
  const search = searchQuery.value.trim().toLowerCase()

  return posts.value.filter((post) => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      post.status === statusFilter.value

    const matchesCategory =
      categoryFilter.value === 'all' ||
      post.category === categoryFilter.value

    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search) ||
      post.excerpt.toLowerCase().includes(search) ||
      post.category.toLowerCase().includes(search) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(search),
      )

    return (
      matchesStatus &&
      matchesCategory &&
      matchesSearch
    )
  })
})

async function loadPosts(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const postsQuery = query(
      collection(db, 'blogPosts'),
      orderBy('createdAt', 'desc'),
    )

    const snapshot = await getDocs(postsQuery)

    posts.value = snapshot.docs.map((document) => {
      const data = document.data()

      return {
        id: document.id,
        title: data.title ?? '',
        slug: data.slug ?? '',
        excerpt: data.excerpt ?? '',
        content: data.content ?? '',
        coverImage: data.coverImage ?? '',
        category: data.category ?? 'Uncategorized',
        tags: Array.isArray(data.tags)
          ? data.tags
          : [],
        status:
          data.status === 'published'
            ? 'published'
            : 'draft',
        readingTime: data.readingTime ?? 1,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
        publishedAt: data.publishedAt ?? null,
      } satisfies BlogPost
    })
  } catch (error: unknown) {
    console.error('Unable to load posts:', error)

    errorMessage.value =
      'The articles could not be loaded from Firestore.'
  } finally {
    isLoading.value = false
  }
}

async function togglePostStatus(
  post: BlogPost,
): Promise<void> {
  processingPostId.value = post.id
  errorMessage.value = ''
  successMessage.value = ''

  const nextStatus: PostStatus =
    post.status === 'published'
      ? 'draft'
      : 'published'

  try {
    await updateDoc(
      doc(db, 'blogPosts', post.id),
      {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        publishedAt:
          nextStatus === 'published'
            ? serverTimestamp()
            : null,
      },
    )

    post.status = nextStatus

    successMessage.value =
      nextStatus === 'published'
        ? `"${post.title}" is now published.`
        : `"${post.title}" was moved to drafts.`
  } catch (error: unknown) {
    console.error(
      'Unable to update article status:',
      error,
    )

    errorMessage.value =
      'The article status could not be updated.'
  } finally {
    processingPostId.value = null
  }
}

function openEditModal(post: BlogPost): void {
  selectedPost.value = {
    ...post,
    tags: [...post.tags],
  }

  isEditModalOpen.value = true
}

function closeEditModal(): void {
  selectedPost.value = null
  isEditModalOpen.value = false
}

function updatePostLocally(
  updatedPost: BlogPost,
): void {
  const index = posts.value.findIndex(
    (post) => post.id === updatedPost.id,
  )

  if (index === -1) return

  posts.value[index] = updatedPost

  successMessage.value =
    `"${updatedPost.title}" was updated successfully.`
}

async function deleteCover(
  coverImage: string,
): Promise<void> {
  if (!coverImage) return

  try {
    const imageReference = storageRef(
      storage,
      coverImage,
    )

    await deleteObject(imageReference)
  } catch (error: unknown) {
    console.warn(
      'The cover image could not be deleted:',
      error,
    )
  }
}

async function deletePost(
  post: BlogPost,
): Promise<void> {
  const confirmed = window.confirm(
    `Delete "${post.title}" permanently?`,
  )

  if (!confirmed) return

  processingPostId.value = post.id
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteDoc(
      doc(db, 'blogPosts', post.id),
    )

    await deleteCover(post.coverImage)

    posts.value = posts.value.filter(
      (item) => item.id !== post.id,
    )

    successMessage.value =
      `"${post.title}" was deleted.`
  } catch (error: unknown) {
    console.error(
      'Unable to delete article:',
      error,
    )

    errorMessage.value =
      'The article could not be deleted.'
  } finally {
    processingPostId.value = null
  }
}

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

onMounted(loadPosts)
</script>

<template>
  <main class="min-h-screen pb-24 pt-12 text-starlight">
    <section class="mx-auto max-w-7xl px-6">
      <!-- Heading -->
      <div
        class="flex flex-col gap-7 border-b
               border-nebula/20 pb-9
               lg:flex-row lg:items-end
               lg:justify-between"
      >
        <div class="max-w-3xl">
          <p
            class="text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Blog administration
          </p>

          <h1
            class="mt-4 text-5xl font-bold
                   md:text-6xl"
          >
            Manage your journal.
          </h1>

          <p
            class="mt-5 text-lg leading-8
                   text-nebula-light"
          >
            Create, review and organize every article
            published across your universe.
          </p>
        </div>

        <RouterLink
          :to="{ name: 'admin-blog-new' }"
          class="inline-flex items-center justify-center
                 gap-3 rounded-full bg-starlight
                 px-6 py-3 font-semibold text-deep-space
                 transition hover:bg-nebula-light"
        >
          <Plus
            :size="20"
            aria-hidden="true"
          />

          New article
        </RouterLink>
      </div>

      <!-- Statistics -->
      <BlogStats
       :total="posts.length"
       :published="publishedCount"
       :drafts="draftCount"
       />

      <!-- Filters -->
      <BlogFilters
      :search-query="searchQuery"
      :status-filter="statusFilter"
      :category-filter="categoryFilter"
      :categories="categories"
      :is-loading="isLoading"
      @update:search-query="searchQuery = $event"
      @update:status-filter="statusFilter = $event"
      @update:category-filter="categoryFilter = $event"
      @refresh="loadPosts"
      />

      <!-- Feedback -->
      <p
        v-if="errorMessage"
        class="mt-6 rounded-2xl border
               border-red-300/30 bg-red-300/10
               px-4 py-3 text-sm text-red-200"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-6 rounded-2xl border
               border-nebula-light/30
               bg-nebula-light/10 px-4 py-3
               text-sm text-starlight"
        role="status"
      >
        {{ successMessage }}
      </p>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex min-h-80 items-center
               justify-center"
      >
        <div
          class="flex items-center gap-3
                 text-nebula-light"
        >
          <LoaderCircle
            :size="25"
            class="animate-spin"
            aria-hidden="true"
          />

          Loading articles...
        </div>
      </div>

      <!-- Empty state -->
      <section
        v-else-if="posts.length === 0"
        class="mt-10 rounded-[3rem] border
               border-dashed border-nebula/30
               bg-cosmic/15 px-8 py-20
               text-center"
      >
        <BookOpen
          :size="46"
          class="mx-auto text-nebula-light"
          aria-hidden="true"
        />

        <h2 class="mt-6 text-3xl font-semibold">
          Your journal is still empty.
        </h2>

        <p
          class="mx-auto mt-4 max-w-xl
                 leading-7 text-nebula-light"
        >
          Create your first article and begin documenting
          your ideas, projects and discoveries.
        </p>

        <RouterLink
          :to="{ name: 'admin-blog-new' }"
          class="mt-8 inline-flex items-center gap-2
                 rounded-full bg-starlight px-6 py-3
                 font-semibold text-deep-space
                 transition hover:bg-nebula-light"
        >
          <Plus
            :size="19"
            aria-hidden="true"
          />

          Create article
        </RouterLink>
      </section>

      <!-- No search results -->
      <section
        v-else-if="filteredPosts.length === 0"
        class="mt-10 rounded-[2rem] border
               border-nebula/20 bg-cosmic/20
               px-8 py-14 text-center"
      >
        <h2 class="text-2xl font-semibold">
          No matching articles.
        </h2>

        <p class="mt-3 text-nebula-light">
          Try changing the search term or filters.
        </p>
      </section>

      <!-- Article list -->
      <section
        v-else
        class="mt-10 space-y-6"
      >
        <article
          v-for="post in filteredPosts"
          :key="post.id"
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

          <!-- Post information -->
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
                  :disabled="
                    processingPostId === post.id
                  "
                  @click="togglePostStatus(post)"
                >
                  <LoaderCircle
                    v-if="
                      processingPostId === post.id
                    "
                    :size="17"
                    class="animate-spin"
                    aria-hidden="true"
                  />

                  <Send
                    v-else-if="
                      post.status === 'draft'
                    "
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
                  :disabled="
                    processingPostId === post.id
                  "
                  @click="openEditModal(post)"
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
                  :disabled="
                    processingPostId === post.id
                  "
                  @click="deletePost(post)"
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
      </section>
    </section>

    <EditPostModal
      :post="selectedPost"
      :open="isEditModalOpen"
      @close="closeEditModal"
      @updated="updatePostLocally"
    />
  </main>
</template>