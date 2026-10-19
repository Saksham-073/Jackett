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
</script>

<template>
  <div>
    <div :class="searchResults.length ? 'mt-8' : 'h-98 mt-46 flex items-center justify-center'">
      <Hero @search="handleSearch" />
    </div>

    <transition name="fade" mode="out-in">
      <Results v-if="showResults" :results="searchResults" />
    </transition>
  </div>
</template>

<style scoped>
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
