<script setup lang="ts">
import {
  Eraser,
  PaintBucket,
  Pencil,
  RotateCcw,
} from 'lucide-vue-next'

type DrawingTool = 'pencil' | 'eraser'

interface Props {
  color: string
  brushSize: number
  activeTool: DrawingTool
}

defineProps<Props>()

const emit = defineEmits<{
  'update:color': [value: string]
  'update:brushSize': [value: number]
  'update:activeTool': [value: DrawingTool]
  fill: []
  clear: []
}>()

function updateColor(event: Event): void {
  const input = event.target as HTMLInputElement

  emit('update:color', input.value)
}

function updateBrushSize(event: Event): void {
  const input = event.target as HTMLInputElement

  emit(
    'update:brushSize',
    Number(input.value),
  )
}
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-2xl
           border border-nebula/20
           bg-deep-space/30 p-4
           xl:flex-row xl:items-end"
  >
    <!-- Drawing tools -->
    <div>
      <p class="mb-2 text-sm text-nebula-light">
        Tool
      </p>

      <div class="flex gap-2">
        <button
          type="button"
          class="flex h-12 w-12 items-center
                 justify-center rounded-xl
                 border transition"
          :class="
            activeTool === 'pencil'
              ? 'border-starlight bg-starlight text-deep-space'
              : 'border-nebula/30 text-nebula-light hover:border-starlight hover:text-starlight'
          "
          aria-label="Pencil"
          :aria-pressed="
            activeTool === 'pencil'
          "
          @click="
            emit(
              'update:activeTool',
              'pencil',
            )
          "
        >
          <Pencil
            :size="20"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          class="flex h-12 w-12 items-center
                 justify-center rounded-xl
                 border transition"
          :class="
            activeTool === 'eraser'
              ? 'border-starlight bg-starlight text-deep-space'
              : 'border-nebula/30 text-nebula-light hover:border-starlight hover:text-starlight'
          "
          aria-label="Eraser"
          :aria-pressed="
            activeTool === 'eraser'
          "
          @click="
            emit(
              'update:activeTool',
              'eraser',
            )
          "
        >
          <Eraser
            :size="20"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- Color -->
    <label>
      <span
        class="mb-2 block text-sm
               text-nebula-light"
      >
        Color
      </span>

      <input
        :value="color"
        type="color"
        class="h-12 w-20 cursor-pointer
               rounded-lg border
               border-nebula/30 bg-transparent"
        @input="updateColor"
      />
    </label>

    <!-- Brush size -->
    <label class="min-w-48 flex-1">
      <span
        class="mb-2 block text-sm
               text-nebula-light"
      >
        Brush: {{ brushSize }}px
      </span>

      <input
        :value="brushSize"
        type="range"
        min="1"
        max="30"
        class="w-full cursor-pointer"
        @input="updateBrushSize"
      />
    </label>

    <!-- Canvas actions -->
    <div
      class="flex flex-col gap-3
             sm:flex-row"
    >
      <button
        type="button"
        class="inline-flex items-center
               justify-center gap-2
               rounded-full border
               border-nebula/40
               px-6 py-3 transition
               hover:border-starlight
               hover:bg-starlight/10"
        @click="emit('fill')"
      >
        <PaintBucket
          :size="19"
          aria-hidden="true"
        />

        Fill canvas
      </button>

      <button
        type="button"
        class="inline-flex items-center
               justify-center gap-2
               rounded-full border
               border-nebula/40
               px-6 py-3 transition
               hover:border-starlight
               hover:bg-starlight/10"
        @click="emit('clear')"
      >
        <RotateCcw
          :size="19"
          aria-hidden="true"
        />

        Clear
      </button>
    </div>
  </div>
</template>