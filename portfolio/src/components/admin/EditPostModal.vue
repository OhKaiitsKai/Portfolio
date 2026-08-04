<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  LoaderCircle,
  Save,
  X,
} from 'lucide-vue-next'

import { db } from '../../firebase/config'
import type {
  BlogPost,
  PostStatus,
} from '../../types/blog'

interface Props {
  post: BlogPost | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: [post: BlogPost]
}>()

const categories = [
  'Development',
  'Art',
  'Music',
  'Gaming',
  'Japanese',
  'Astronomy',
  'Travel',
  'Thoughts',
]

const draft = ref<BlogPost | null>(null)
const tagInput = ref('')
const isSaving = ref(false)
const errorMessage = ref('')

watch(
  () => props.post,
  (post) => {
    draft.value = post
      ? {
          ...post,
          tags: [...post.tags],
        }
      : null

    tagInput.value = ''
    errorMessage.value = ''
  },
  {
    immediate: true,
  },
)

function generateSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function addTag(): void {
  if (!draft.value) return

  const tag = tagInput.value.trim()

  if (!tag) return

  const exists = draft.value.tags.some(
    (item) =>
      item.toLowerCase() === tag.toLowerCase(),
  )

  if (!exists && draft.value.tags.length < 8) {
    draft.value.tags.push(tag)
  }

  tagInput.value = ''
}

function removeTag(tag: string): void {
  if (!draft.value) return

  draft.value.tags = draft.value.tags.filter(
    (item) => item !== tag,
  )
}

function closeModal(): void {
  if (isSaving.value) return

  emit('close')
}

async function saveChanges(): Promise<void> {
  const post = draft.value

  if (!post) return

  errorMessage.value = ''

  if (
    !post.title.trim() ||
    !post.slug.trim() ||
    !post.excerpt.trim() ||
    !post.content.trim() ||
    !post.category
  ) {
    errorMessage.value =
      'Please complete every required field.'
    return
  }

  isSaving.value = true

  try {
    const slug = generateSlug(post.slug)

    const readingTime = Math.max(
      1,
      Math.ceil(
        post.content.trim().split(/\s+/).length / 200,
      ),
    )

    await updateDoc(
      doc(db, 'blogPosts', post.id),
      {
        title: post.title.trim(),
        slug,
        excerpt: post.excerpt.trim(),
        content: post.content.trim(),
        category: post.category,
        tags: post.tags,
        status: post.status,
        readingTime,
        updatedAt: serverTimestamp(),
        publishedAt:
          post.status === 'published'
            ? post.publishedAt ?? serverTimestamp()
            : null,
      },
    )

    emit('updated', {
      ...post,
      title: post.title.trim(),
      slug,
      excerpt: post.excerpt.trim(),
      content: post.content.trim(),
      readingTime,
    })

    emit('close')
  } catch (error) {
    console.error('Unable to update article:', error)

    errorMessage.value =
      'The article could not be updated.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && draft"
      class="fixed inset-0 z-[100] flex items-center
             justify-center bg-deep-space/80
             px-6 py-10 backdrop-blur-md"
      @click.self="closeModal"
    >
      <section
        class="relative max-h-[90vh] w-full max-w-4xl
               overflow-y-auto rounded-[2.5rem]
               border border-nebula/30
               bg-deep-space p-7 shadow-2xl
               md:p-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
      >
        <button
          type="button"
          class="absolute right-6 top-6
                 flex h-10 w-10 items-center
                 justify-center rounded-full
                 border border-nebula/30
                 text-nebula-light transition
                 hover:border-starlight
                 hover:text-starlight"
          aria-label="Close edit modal"
          :disabled="isSaving"
          @click="closeModal"
        >
          <X :size="20" aria-hidden="true" />
        </button>

        <p
          class="text-sm uppercase tracking-[0.35em]
                 text-nebula-light"
        >
          Edit article
        </p>

        <h2
          id="edit-post-title"
          class="mt-4 pr-12 text-4xl font-bold"
        >
          {{ draft.title }}
        </h2>

        <form
          class="mt-8 space-y-6"
          @submit.prevent="saveChanges"
        >
          <div>
            <label
              for="edit-title"
              class="mb-2 block text-sm text-nebula-light"
            >
              Title
            </label>

            <input
              id="edit-title"
              v-model="draft.title"
              type="text"
              maxlength="120"
              class="w-full rounded-2xl border
                     border-nebula/30 bg-cosmic/30
                     px-4 py-3 text-starlight
                     outline-none transition
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <label
              for="edit-slug"
              class="mb-2 block text-sm text-nebula-light"
            >
              Slug
            </label>

            <div
              class="flex overflow-hidden rounded-2xl
                     border border-nebula/30 bg-cosmic/30
                     focus-within:border-nebula-light"
            >
              <span
                class="border-r border-nebula/20
                       px-4 py-3 text-nebula-light/60"
              >
                /blog/
              </span>

              <input
                id="edit-slug"
                v-model="draft.slug"
                type="text"
                class="min-w-0 flex-1 bg-transparent
                       px-4 py-3 text-starlight
                       outline-none"
                @blur="draft.slug = generateSlug(draft.slug)"
              />
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <label
                for="edit-category"
                class="mb-2 block text-sm text-nebula-light"
              >
                Category
              </label>

              <select
                id="edit-category"
                v-model="draft.category"
                class="w-full rounded-2xl border
                       border-nebula/30 bg-deep-space
                       px-4 py-3 text-starlight
                       outline-none focus:border-nebula-light"
              >
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="edit-status"
                class="mb-2 block text-sm text-nebula-light"
              >
                Status
              </label>

              <select
                id="edit-status"
                v-model="draft.status"
                class="w-full rounded-2xl border
                       border-nebula/30 bg-deep-space
                       px-4 py-3 text-starlight
                       outline-none focus:border-nebula-light"
              >
                <option
                  :value="'draft' satisfies PostStatus"
                >
                  Draft
                </option>

                <option
                  :value="'published' satisfies PostStatus"
                >
                  Published
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              for="edit-excerpt"
              class="mb-2 block text-sm text-nebula-light"
            >
              Excerpt
            </label>

            <textarea
              id="edit-excerpt"
              v-model="draft.excerpt"
              rows="4"
              maxlength="240"
              class="w-full resize-none rounded-2xl
                     border border-nebula/30
                     bg-cosmic/30 px-4 py-3
                     text-starlight outline-none
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <label
              for="edit-content"
              class="mb-2 block text-sm text-nebula-light"
            >
              Content
            </label>

            <textarea
              id="edit-content"
              v-model="draft.content"
              rows="14"
              class="w-full resize-y rounded-2xl
                     border border-nebula/30
                     bg-cosmic/30 px-4 py-3
                     font-mono text-sm leading-7
                     text-starlight outline-none
                     focus:border-nebula-light"
            />
          </div>

          <div>
            <label
              for="edit-tags"
              class="mb-2 block text-sm text-nebula-light"
            >
              Tags
            </label>

            <input
              id="edit-tags"
              v-model="tagInput"
              type="text"
              maxlength="30"
              placeholder="Type and press Enter"
              class="w-full rounded-2xl border
                     border-nebula/30 bg-cosmic/30
                     px-4 py-3 text-starlight
                     outline-none transition
                     placeholder:text-nebula-light/40
                     focus:border-nebula-light"
              @keydown.enter.prevent="addTag"
            />

            <div
              v-if="draft.tags.length"
              class="mt-3 flex flex-wrap gap-2"
            >
              <button
                v-for="tag in draft.tags"
                :key="tag"
                type="button"
                class="rounded-full border
                       border-nebula/30 px-3 py-1
                       text-sm text-nebula-light
                       transition hover:text-starlight"
                @click="removeTag(tag)"
              >
                {{ tag }} ×
              </button>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="rounded-2xl border
                   border-red-300/30 bg-red-300/10
                   px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <div
            class="flex flex-col-reverse gap-3
                   border-t border-nebula/20 pt-6
                   sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              class="rounded-full border
                     border-nebula/40 px-6 py-3
                     font-semibold transition
                     hover:border-starlight
                     hover:bg-starlight/10"
              :disabled="isSaving"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="inline-flex items-center
                     justify-center gap-2 rounded-full
                     bg-starlight px-6 py-3
                     font-semibold text-deep-space
                     transition hover:bg-nebula-light
                     disabled:opacity-50"
              :disabled="isSaving"
            >
              <LoaderCircle
                v-if="isSaving"
                :size="18"
                class="animate-spin"
                aria-hidden="true"
              />

              <Save
                v-else
                :size="18"
                aria-hidden="true"
              />

              {{ isSaving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>