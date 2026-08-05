<script setup lang="ts">
interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  blur: number
}

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

function randomBetween(
  minimum: number,
  maximum: number,
): number {
  return Math.random() * (maximum - minimum) + minimum
}

const stars: Star[] = Array.from(
  {
    length: 190,
  },
  (_, index) => ({
    id: index,
    x: randomBetween(0, 100),
    y: randomBetween(0, 100),
    size: randomBetween(1, 3.2),
    opacity: randomBetween(0.25, 0.9),
    duration: randomBetween(3, 8),
    delay: randomBetween(-8, 0),
    blur: randomBetween(0, 1.2),
  }),
)

const sparkles: Sparkle[] = Array.from(
  {
    length: 22,
  },
  (_, index) => ({
    id: index,
    x: randomBetween(2, 98),
    y: randomBetween(2, 98),
    size: randomBetween(5, 12),
    opacity: randomBetween(0.35, 0.85),
    duration: randomBetween(4, 9),
    delay: randomBetween(-9, 0),
  }),
)
</script>

<template>
  <div
    class="starfield-background"
    aria-hidden="true"
  >
    <!-- Base gradient -->
    <div class="starfield-background__base"></div>

    <!-- Nebulas -->
    <div
      class="starfield-background__nebula
             starfield-background__nebula--one"
    ></div>

    <div
      class="starfield-background__nebula
             starfield-background__nebula--two"
    ></div>

    <div
      class="starfield-background__nebula
             starfield-background__nebula--three"
    ></div>

    <div
      class="starfield-background__nebula
             starfield-background__nebula--four"
    ></div>

    <!-- Small stars -->
    <div class="starfield-background__stars">
      <span
        v-for="star in stars"
        :key="star.id"
        class="starfield-background__star"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          filter: `blur(${star.blur}px)`,
          animationDuration: `${star.duration}s`,
          animationDelay: `${star.delay}s`,
        }"
      ></span>
    </div>

    <!-- Four-point sparkles -->
    <div class="starfield-background__sparkles">
      <span
        v-for="sparkle in sparkles"
        :key="sparkle.id"
        class="starfield-background__sparkle"
        :style="{
          left: `${sparkle.x}%`,
          top: `${sparkle.y}%`,
          width: `${sparkle.size}px`,
          height: `${sparkle.size}px`,
          opacity: sparkle.opacity,
          animationDuration: `${sparkle.duration}s`,
          animationDelay: `${sparkle.delay}s`,
        }"
      ></span>
    </div>

    <!-- Shooting stars -->
    <span
      class="starfield-background__shooting-star
             starfield-background__shooting-star--one"
    ></span>

    <span
      class="starfield-background__shooting-star
             starfield-background__shooting-star--two"
    ></span>

    <!-- Subtle grain -->
    <div class="starfield-background__grain"></div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/starfield';
</style>