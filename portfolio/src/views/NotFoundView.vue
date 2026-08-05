<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home, Rocket } from 'lucide-vue-next'
</script>

<template>
  <main class="not-found">
    <div class="not-found__stars" />

    <section class="not-found__content">
      <span class="not-found__code">404</span>

      <div class="not-found__planet">
        <Rocket :size="48" />
      </div>

      <h1>Lost in the galaxy</h1>

      <p>
        This page drifted beyond the known universe.
        Let’s guide you back home.
      </p>

      <RouterLink to="/" class="not-found__button">
        <Home :size="18" />
        Return home
      </RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  position: relative;
  display: grid;
  min-height: 100vh;
  place-items: center;
  overflow: hidden;
  padding: 2rem;
  color: #c7dced;
  text-align: center;
  background:
    radial-gradient(circle at 50% 35%, rgba(86, 146, 169, 0.25), transparent 35%),
    linear-gradient(180deg, #062b43 0%, #021723 100%);

  &__content {
    position: relative;
    z-index: 1;
    width: min(100%, 650px);
  }

  &__code {
    display: block;
    margin-bottom: -1rem;
    color: rgba(199, 220, 237, 0.12);
    font-size: clamp(8rem, 25vw, 15rem);
    font-weight: 800;
    line-height: 1;
  }

  &__planet {
    display: grid;
    width: 100px;
    height: 100px;
    margin: -4rem auto 2rem;
    place-items: center;
    border: 1px solid rgba(199, 220, 237, 0.35);
    border-radius: 50%;
    color: #c7dced;
    background: linear-gradient(145deg, #5692a9, #044568);
    box-shadow:
      0 0 40px rgba(86, 146, 169, 0.4),
      inset -15px -10px 30px rgba(6, 43, 67, 0.5);
  }

  h1 {
    margin-bottom: 1rem;
    font-size: clamp(2rem, 6vw, 4rem);
  }

  p {
    max-width: 520px;
    margin: 0 auto 2rem;
    color: #9dcddc;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.4rem;
    border: 1px solid rgba(199, 220, 237, 0.3);
    border-radius: 999px;
    color: #062b43;
    font-weight: 700;
    text-decoration: none;
    background: #c7dced;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(86, 146, 169, 0.35);
    }
  }

  &__stars,
  &__stars::before,
  &__stars::after {
    position: absolute;
    inset: 0;
    content: "";
    background-image:
      radial-gradient(circle, #ffffff 1px, transparent 1px),
      radial-gradient(circle, #9dcddc 1px, transparent 1px);
    background-position:
      0 0,
      35px 45px;
    background-size:
      90px 90px,
      130px 130px;
    opacity: 0.35;
  }

  &__stars::before {
    transform: scale(1.3);
    opacity: 0.25;
  }

  &__stars::after {
    transform: scale(0.8);
    opacity: 0.2;
  }
}
</style>