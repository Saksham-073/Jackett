<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();
const emit = defineEmits(["goToPage", "nextPage", "previousPage"]);

function goToPage(page: number) {
  emit("goToPage", page);
}
function previousPage() {
  emit("previousPage");
}
function nextPage() {
  emit("nextPage");
}

const pagesToShow = computed(() => {
  const pages: (number | string)[] = [];
  if (props.totalPages <= 7) {
    for (let i = 1; i <= props.totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (props.currentPage > 3) pages.push("...");
    for (let i = Math.max(2, props.currentPage - 1); i < props.currentPage; i++) {
      if (i < props.totalPages) pages.push(i);
    }
    if (props.currentPage !== 1 && props.currentPage !== props.totalPages)
      pages.push(props.currentPage);
    for (
      let i = props.currentPage + 1;
      i <= Math.min(props.totalPages - 1, props.currentPage + 1);
      i++
    ) {
      if (i > 1 && i < props.totalPages) pages.push(i);
    }
    if (props.currentPage < props.totalPages - 2) pages.push("...");
    pages.push(props.totalPages);
  }
  return pages;
});
</script>

<template>
  <div class="flex items-center justify-between bg-white px-4 py-3 sm:px-6 w-full">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="previousPage"
        :disabled="props.currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        @click="nextPage"
        :disabled="props.currentPage === props.totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
          <button
            @click="previousPage"
            :disabled="props.currentPage === 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Previous</span>
            <Icon icon="mdi:chevron-left" class="w-5 h-5" aria-hidden="true" />
          </button>
          <template v-for="(page, idx) in pagesToShow" :key="page + '-' + idx">
            <span
              v-if="page === '...'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0"
              >...</span
            >
            <button
              v-else
              @click="goToPage(page as number)"
              :aria-current="page === props.currentPage ? 'page' : undefined"
              :class="[
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
                page === props.currentPage
                  ? 'z-10 bg-purple text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  : 'text-gray-900 hover:bg-gray-50',
                page === 1 ? 'rounded-l-md' : '',
                page === props.totalPages ? 'rounded-r-md' : '',
              ]"
            >
              {{ page }}
            </button>
          </template>
          <button
            @click="nextPage"
            :disabled="props.currentPage === props.totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Next</span>
            <Icon icon="mdi:chevron-right" class="w-5 h-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
