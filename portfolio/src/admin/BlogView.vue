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
  LoaderCircle,
  Plus,
} from 'lucide-vue-next'

import EditPostModal from '../components/admin/EditPostModal.vue'
import BlogStats from '../components/admin/BlogStats.vue'
import BlogFilters from '../components/admin/BlogFilters.vue'
import BlogCard from '../components/admin/BlogCard.vue'
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
  <BlogCard
    v-for="post in filteredPosts"
    :key="post.id"
    :post="post"
    :is-processing="
      processingPostId === post.id
    "
    @toggle-status="togglePostStatus"
    @edit="openEditModal"
    @delete="deletePost"
  />
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