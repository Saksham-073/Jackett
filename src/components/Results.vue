<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref, computed, watch } from "vue";
import Pagination from "./Pagination.vue";

const props = defineProps<{ results: Array<any> }>();

const currentPage = ref(1);
const resultsPerPage = ref(10);
const sortBy = ref("default");

const resultsPerPageOptions = [10, 20, 50];
const sortOptions = [
  { value: "default", label: "Default" },
  { value: "name", label: "Name" },
  { value: "seeds", label: "Seeds" },
  { value: "size", label: "Size" },
  { value: "date", label: "Date" },
];

const totalPages = computed(() => Math.ceil(props.results.length / resultsPerPage.value));

const sortedResults = computed(() => {
  let sorted = [...props.results];
  switch (sortBy.value) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "seeds":
      sorted.sort((a, b) => b.seeds - a.seeds);
      break;
    case "size":
      sorted.sort((a, b) => {
        const sizeA = parseFloat(a.size) || 0;
        const sizeB = parseFloat(b.size) || 0;
        return sizeB - sizeA;
      });
      break;
    case "date":
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      break;
    default:
      break;
  }
  return sorted;
});

const paginatedResults = computed(() => {
  const startIndex = (currentPage.value - 1) * resultsPerPage.value;
  const endIndex = startIndex + resultsPerPage.value;
  return sortedResults.value.slice(startIndex, endIndex);
});

watch([resultsPerPage, () => props.results], () => {
  currentPage.value = 1;
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}
function handleDownload(item: any) {
  const downloadUrl = item.link;
  if (downloadUrl) {
    window.open(downloadUrl, "_blank");
  }
}
function handleTitleClick(item: any) {
  const detailsUrl = item.comments;
  if (detailsUrl) {
    window.open(detailsUrl, "_blank");
  }
}
function handleCopyLink(item: any) {
  if (item.link) {
    navigator.clipboard.writeText(item.link);
  }
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <h2 class="text-xl sm:text-2xl font-semibold">Search Results</h2>
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span class="text-gray-500 text-sm sm:text-base">{{ results.length }} Results</span>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 whitespace-nowrap">Show:</label>
          <select
            v-model="resultsPerPage"
            class="border border-purple rounded-md px-2 py-1 text-sm focus:outline-purple w-16"
          >
            <option v-for="option in resultsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <select
          v-model="sortBy"
          class="border border-purple rounded-md px-2 py-1 text-sm focus:outline-purple w-full sm:w-auto"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="space-y-4">
      <div
        v-for="(item, idx) in paginatedResults"
        :key="idx"
        class="flex flex-col lg:flex-row lg:justify-between lg:items-center p-4 lg:py-6 lg:px-0 border border-gray-200 lg:border-0 lg:border-b lg:border-gray-300 rounded-lg lg:rounded-none bg-white lg:bg-transparent shadow-sm lg:shadow-none"
      >
        <div class="flex-1 mb-4 lg:mb-0">
          <div
            @click="handleTitleClick(item)"
            class="font-medium text-base lg:text-lg mb-2 line-clamp-2 lg:line-clamp-1 cursor-pointer hover:text-purple-600 transition-colors"
          >
            {{ item.name }}
          </div>
          <div class="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm text-gray-500">
            <span class="px-2 py-1 rounded-full text-xs text-white bg-blue-500 font-medium">
              {{ item.indexer }}
            </span>
            <span class="hidden sm:inline">{{ item.category }}</span>
            <span class="hidden md:inline">{{ item.quality }}</span>
            <span class="font-medium text-gray-700">{{ item.size }}</span>
            <span class="hidden sm:inline">{{ item.date }}</span>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500 sm:hidden">
            <span>{{ item.category }}</span>
            <span> </span>
            <span>{{ item.quality }}</span>
            <span> </span>
            <span>{{ item.date }}</span>
          </div>
        </div>
        <div
          class="flex flex-row lg:flex-col xl:flex-row items-center justify-between lg:justify-end gap-4 lg:gap-8 lg:min-w-[180px]"
        >
          <div class="flex items-center gap-1 lg:text-right">
            <span class="text-green-600 font-semibold text-sm lg:text-base">{{ item.seeds }}</span>
            <span class="text-gray-400 text-sm">/</span>
            <span class="text-red-500 font-semibold text-sm lg:text-base">{{ item.peers }}</span>
            <span class="text-xs text-gray-500 ml-1 lg:hidden">S/P</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="handleDownload(item)"
              class="bg-green-600 text-white px-3 lg:px-4 py-1 lg:py-1 text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Download
            </button>
            <button @click="handleCopyLink(item)" class="text-gray-500 hover:text-gray-700 cursor-pointer p-1" title="Copy link">
              <Icon icon="solar:copy-bold" width="18" height="18" class="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 mb-8">
      <div class="text-sm text-gray-600 order-2 sm:order-1 mb-2 sm:mb-0">
        Showing {{ (currentPage - 1) * resultsPerPage + 1 }}-{{
          Math.min(currentPage * resultsPerPage, results.length)
        }}
        of {{ results.length }} results
      </div>
      <div class="order-1 sm:order-2 w-full sm:w-auto flex justify-center sm:justify-end gap-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @goToPage="goToPage"
          @nextPage="nextPage"
          @previousPage="previousPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
