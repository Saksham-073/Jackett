<script setup lang="ts">
import { ref } from "vue";
import Hero from "@/components/Hero.vue";
import Results from "@/components/Results.vue";

const searchResults = ref([]);
const showResults = ref(false);

function handleSearch(results: any) {
  searchResults.value = results;
  showResults.value = results.length > 0;
}

function onHeroAfterLeave() {
  if (searchResults.value.length && !showResults.value) {
    showResults.value = true;
  }
}
</script>

<template>
  <div>
    <transition name="hero-slide" mode="out-in" @after-leave="onHeroAfterLeave">
      <div :class="searchResults.length ? 'mt-8' : 'h-98 mt-46 flex items-center justify-center'">
        <Hero @search="handleSearch" />
      </div>
    </transition>

    <transition name="fade" mode="out-in">
      <Results v-if="showResults" :results="searchResults" />
    </transition>
  </div>
</template>

<style scoped>
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.hero-slide-enter-from,
.hero-slide-leave-to {
  transform: translateY(40px);
}
.hero-slide-enter-to,
.hero-slide-leave-from {
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
