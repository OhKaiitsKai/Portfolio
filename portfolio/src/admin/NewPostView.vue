<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
  Tag,
  X,
} from 'lucide-vue-next'
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'

import { auth, db, storage } from '../firebase/config'

type PostStatus = 'draft' | 'published'

interface BlogPostForm {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  status: PostStatus
}

const router = useRouter()

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

const form = reactive<BlogPostForm>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  status: 'draft',
})

const tagInput = ref('')
const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const titleCharacters = computed(() => form.title.length)
const excerptCharacters = computed(() => form.excerpt.length)
const contentWords = computed(() => {
  const content = form.content.trim()

  return content ? content.split(/\s+/).length : 0
})

const readingTime = computed(() => {
  return Math.max(1, Math.ceil(contentWords.value / 200))
})

const canSubmit = computed(() => {
  return (
    form.title.trim() !== '' &&
    form.slug.trim() !== '' &&
    form.excerpt.trim() !== '' &&
    form.content.trim() !== '' &&
    form.category !== '' &&
    !isSaving.value
  )
})

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

function updateSlug(): void {
  form.slug = generateSlug(form.title)
}

function normalizeTag(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
}

function addTag(): void {
  const normalizedTag = normalizeTag(tagInput.value)

  if (!normalizedTag) return

  const tagAlreadyExists = form.tags.some(
    (tag) => tag.toLowerCase() === normalizedTag.toLowerCase(),
  )

  if (tagAlreadyExists) {
    tagInput.value = ''
    return
  }

  if (form.tags.length >= 8) {
    errorMessage.value = 'You can add a maximum of 8 tags.'
    return
  }

  form.tags.push(normalizedTag)
  tagInput.value = ''
  errorMessage.value = ''
}

function handleTagKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  }
}

function removeTag(tagToRemove: string): void {
  form.tags = form.tags.filter((tag) => tag !== tagToRemove)
}

function openFilePicker(): void {
  fileInput.value?.click()
}

function handleCoverChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value =
      'The cover must be a JPG, PNG or WebP image.'
    input.value = ''
    return
  }

  const maximumSize = 5 * 1024 * 1024

  if (file.size > maximumSize) {
    errorMessage.value =
      'The cover image cannot exceed 5 MB.'
    input.value = ''
    return
  }

  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
  }

  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  errorMessage.value = ''
}

function removeCover(): void {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
  }

  coverFile.value = null
  coverPreview.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadCover(): Promise<string> {
  if (!coverFile.value) return ''

  const extension =
    coverFile.value.name.split('.').pop()?.toLowerCase() ?? 'webp'

  const uniqueName = `${crypto.randomUUID()}.${extension}`

  const imageReference = storageRef(
    storage,
    `blog/covers/${uniqueName}`,
  )

  await uploadBytes(imageReference, coverFile.value, {
    contentType: coverFile.value.type,
  })

  return getDownloadURL(imageReference)
}

function validateForm(status: PostStatus): boolean {
  errorMessage.value = ''
  successMessage.value = ''

  if (!auth.currentUser) {
    errorMessage.value =
      'Your administrator session is not available.'
    return false
  }

  if (!form.title.trim()) {
    errorMessage.value = 'Please enter a title.'
    return false
  }

  if (!form.slug.trim()) {
    errorMessage.value = 'Please enter a slug.'
    return false
  }

  if (!form.category) {
    errorMessage.value = 'Please select a category.'
    return false
  }

  if (!form.excerpt.trim()) {
    errorMessage.value = 'Please write an excerpt.'
    return false
  }

  if (!form.content.trim()) {
    errorMessage.value = 'Please write the article content.'
    return false
  }

  if (status === 'published' && !coverFile.value) {
    errorMessage.value =
      'Please select a cover image before publishing.'
    return false
  }

  return true
}

async function savePost(status: PostStatus): Promise<void> {
  if (!validateForm(status)) return

  isSaving.value = true
  form.status = status

  try {
    const coverImage = await uploadCover()

    const postReference = await addDoc(
      collection(db, 'blogPosts'),
      {
        title: form.title.trim(),
        slug: generateSlug(form.slug),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        tags: form.tags,
        coverImage,
        status,
        readingTime: readingTime.value,
        authorId: auth.currentUser?.uid,
        authorEmail: auth.currentUser?.email ?? '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt:
          status === 'published'
            ? serverTimestamp()
            : null,
      },
    )

    successMessage.value =
      status === 'published'
        ? 'Your article was published successfully.'
        : 'Your draft was saved successfully.'

    await router.push({
      name: 'admin-blog',
      query: {
        saved: postReference.id,
        status,
      },
    })
  } catch (error) {
    console.error('Unable to save blog post:', error)

    errorMessage.value =
      'The article could not be saved. Check Firebase and try again.'
  } finally {
    isSaving.value = false
  }
}

onBeforeUnmount(() => {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value)
  }
})
</script>

<template>
  <main class="min-h-screen pb-24 pt-12 text-starlight">
    <section class="mx-auto max-w-7xl px-6">
      <!-- Top bar -->
      <div
        class="flex flex-col gap-6 border-b border-nebula/20
               pb-8 lg:flex-row lg:items-end
               lg:justify-between"
      >
        <div>
          <RouterLink
            :to="{ name: 'admin-blog' }"
            class="inline-flex items-center gap-2
                   text-sm text-nebula-light transition
                   hover:text-starlight"
          >
            <ArrowLeft
              :size="18"
              aria-hidden="true"
            />

            Return to posts
          </RouterLink>

          <p
            class="mt-8 text-sm uppercase tracking-[0.35em]
                   text-nebula-light"
          >
            Blog editor
          </p>

          <h1 class="mt-4 text-4xl font-bold md:text-6xl">
            Create a new article.
          </h1>

          <p class="mt-4 max-w-2xl leading-7 text-nebula-light">
            Write a new entry for your journal and decide whether
            to save it privately or publish it immediately.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full
                   border border-nebula/40 px-6 py-3
                   font-semibold transition
                   hover:border-starlight
                   hover:bg-starlight/10
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="!canSubmit"
            @click="savePost('draft')"
          >
            <LoaderCircle
              v-if="isSaving && form.status === 'draft'"
              :size="19"
              class="animate-spin"
              aria-hidden="true"
            />

            <Save
              v-else
              :size="19"
              aria-hidden="true"
            />

            Save draft
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full
                   bg-starlight px-6 py-3 font-semibold
                   text-deep-space transition
                   hover:bg-nebula-light
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            :disabled="!canSubmit"
            @click="savePost('published')"
          >
            <LoaderCircle
              v-if="isSaving && form.status === 'published'"
              :size="19"
              class="animate-spin"
              aria-hidden="true"
            />

            <Send
              v-else
              :size="19"
              aria-hidden="true"
            />

            Publish
          </button>
        </div>
      </div>

      <div
        class="mt-10 grid gap-8
               xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <!-- Main editor -->
        <section
          class="rounded-[2.5rem] border border-nebula/20
                 bg-cosmic/20 p-6 md:p-9"
        >
          <div class="space-y-7">
            <div>
              <div class="mb-2 flex justify-between gap-4">
                <label
                  for="post-title"
                  class="text-sm text-nebula-light"
                >
                  Title
                </label>

                <span class="text-xs text-nebula-light/70">
                  {{ titleCharacters }}/120
                </span>
              </div>

              <input
                id="post-title"
                v-model="form.title"
                type="text"
                maxlength="120"
                placeholder="Write the title of your article"
                class="w-full rounded-2xl border
                       border-nebula/30 bg-deep-space/60
                       px-4 py-4 text-xl font-semibold
                       text-starlight outline-none transition
                       placeholder:text-nebula-light/35
                       focus:border-nebula-light"
                @input="updateSlug"
              />
            </div>

            <div>
              <label
                for="post-slug"
                class="mb-2 block text-sm text-nebula-light"
              >
                Slug
              </label>

              <div
                class="flex overflow-hidden rounded-2xl border
                       border-nebula/30 bg-deep-space/60
                       focus-within:border-nebula-light"
              >
                <span
                  class="border-r border-nebula/20
                         px-4 py-3 text-nebula-light/60"
                >
                  /blog/
                </span>

                <input
                  id="post-slug"
                  v-model="form.slug"
                  type="text"
                  maxlength="140"
                  placeholder="article-title"
                  class="min-w-0 flex-1 bg-transparent
                         px-4 py-3 text-starlight
                         outline-none
                         placeholder:text-nebula-light/35"
                  @blur="form.slug = generateSlug(form.slug)"
                />
              </div>
            </div>

            <div>
              <div class="mb-2 flex justify-between gap-4">
                <label
                  for="post-excerpt"
                  class="text-sm text-nebula-light"
                >
                  Excerpt
                </label>

                <span class="text-xs text-nebula-light/70">
                  {{ excerptCharacters }}/240
                </span>
              </div>

              <textarea
                id="post-excerpt"
                v-model="form.excerpt"
                maxlength="240"
                rows="4"
                placeholder="Write a short introduction for the article card..."
                class="w-full resize-none rounded-2xl border
                       border-nebula/30 bg-deep-space/60
                       px-4 py-3 text-starlight
                       outline-none transition
                       placeholder:text-nebula-light/35
                       focus:border-nebula-light"
              ></textarea>
            </div>

            <div>
              <div class="mb-2 flex justify-between gap-4">
                <label
                  for="post-content"
                  class="text-sm text-nebula-light"
                >
                  Content
                </label>

                <span class="text-xs text-nebula-light/70">
                  {{ contentWords }} words ·
                  {{ readingTime }} min read
                </span>
              </div>

              <textarea
                id="post-content"
                v-model="form.content"
                rows="24"
                placeholder="Start writing your article..."
                class="w-full resize-y rounded-2xl border
                       border-nebula/30 bg-deep-space/60
                       px-5 py-4 font-mono text-sm
                       leading-7 text-starlight
                       outline-none transition
                       placeholder:text-nebula-light/35
                       focus:border-nebula-light"
              ></textarea>

              <p class="mt-2 text-xs text-nebula-light/60">
                Plain text for now. Later this field can be
                replaced with TipTap or a Markdown editor.
              </p>
            </div>
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="space-y-6">
          <!-- Publishing -->
          <section
            class="rounded-[2rem] border border-nebula/20
                   bg-cosmic/20 p-6"
          >
            <p
              class="text-xs uppercase tracking-[0.28em]
                     text-nebula-light"
            >
              Article details
            </p>

            <div class="mt-6">
              <label
                for="post-category"
                class="mb-2 block text-sm text-nebula-light"
              >
                Category
              </label>

              <select
                id="post-category"
                v-model="form.category"
                class="w-full rounded-2xl border
                       border-nebula/30 bg-deep-space
                       px-4 py-3 text-starlight
                       outline-none transition
                       focus:border-nebula-light"
              >
                <option value="" disabled>
                  Select a category
                </option>

                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="mt-6">
              <label
                for="post-tag"
                class="mb-2 block text-sm text-nebula-light"
              >
                Tags
              </label>

              <div class="relative">
                <Tag
                  :size="18"
                  class="pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-nebula-light"
                  aria-hidden="true"
                />

                <input
                  id="post-tag"
                  v-model="tagInput"
                  type="text"
                  maxlength="30"
                  placeholder="Type and press Enter"
                  class="w-full rounded-2xl border
                         border-nebula/30 bg-deep-space/60
                         py-3 pl-11 pr-4 text-starlight
                         outline-none transition
                         placeholder:text-nebula-light/35
                         focus:border-nebula-light"
                  @keydown="handleTagKeydown"
                  @blur="addTag"
                />
              </div>

              <div
                v-if="form.tags.length"
                class="mt-4 flex flex-wrap gap-2"
              >
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="inline-flex items-center gap-2
                         rounded-full border border-nebula/30
                         bg-deep-space/50 px-3 py-1
                         text-sm text-nebula-light"
                >
                  {{ tag }}

                  <button
                    type="button"
                    :aria-label="`Remove ${tag}`"
                    class="transition hover:text-starlight"
                    @click="removeTag(tag)"
                  >
                    <X
                      :size="14"
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </div>

              <p class="mt-3 text-xs text-nebula-light/60">
                Maximum 8 tags.
              </p>
            </div>
          </section>

          <!-- Cover -->
          <section
            class="rounded-[2rem] border border-nebula/20
                   bg-cosmic/20 p-6"
          >
            <p
              class="text-xs uppercase tracking-[0.28em]
                     text-nebula-light"
            >
              Cover image
            </p>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleCoverChange"
            />

            <div
              v-if="coverPreview"
              class="relative mt-5 overflow-hidden
                     rounded-2xl border border-nebula/30"
            >
              <img
                :src="coverPreview"
                alt="Article cover preview"
                class="aspect-video w-full object-cover"
              />

              <button
                type="button"
                aria-label="Remove cover image"
                class="absolute right-3 top-3
                       flex h-9 w-9 items-center
                       justify-center rounded-full
                       bg-deep-space/80 text-starlight
                       backdrop-blur transition
                       hover:bg-deep-space"
                @click="removeCover"
              >
                <X
                  :size="18"
                  aria-hidden="true"
                />
              </button>
            </div>

            <button
              v-else
              type="button"
              class="mt-5 flex aspect-video w-full
                     flex-col items-center justify-center
                     rounded-2xl border border-dashed
                     border-nebula/40 bg-deep-space/30
                     px-5 text-center transition
                     hover:border-starlight
                     hover:bg-deep-space/50"
              @click="openFilePicker"
            >
              <ImagePlus
                :size="34"
                class="text-nebula-light"
                aria-hidden="true"
              />

              <span class="mt-3 font-semibold">
                Choose a cover image
              </span>

              <span class="mt-1 text-xs text-nebula-light/60">
                JPG, PNG or WebP · maximum 5 MB
              </span>
            </button>

            <button
              v-if="coverPreview"
              type="button"
              class="mt-4 w-full rounded-full border
                     border-nebula/40 px-4 py-2
                     text-sm font-semibold transition
                     hover:border-starlight
                     hover:bg-starlight/10"
              @click="openFilePicker"
            >
              Replace image
            </button>
          </section>

          <!-- Feedback -->
          <p
            v-if="errorMessage"
            class="rounded-2xl border border-red-300/30
                   bg-red-300/10 px-4 py-3
                   text-sm text-red-200"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="successMessage"
            class="rounded-2xl border
                   border-nebula-light/30
                   bg-nebula-light/10 px-4 py-3
                   text-sm text-starlight"
            role="status"
          >
            {{ successMessage }}
          </p>
        </aside>
      </div>
    </section>
  </main>
</template>