<template>
  <div
    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-xl mx-auto mt-4"
    role="alert"
  >
    <span class="block sm:inline">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();
</script>
