<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Filters from "./Filters.vue";
import { Icon } from "@iconify/vue";
import Spinner from "./Spinner.vue";
import ErrorMessage from "./Error.vue";
import { useIndexersStore } from "@/stores/indexers";
import categoryMapJson from "@/Utlis/categoryMap.json";
import { getJackettSettings } from "@/Utlis/settings";
import { XMLParser } from "fast-xml-parser";
const categoryMap: Record<string, string> = categoryMapJson as Record<string, string>;

type Result = {
  name: string;
  indexer: string;
  category: string;
  quality: string;
  size: string;
  date: string;
  seeds: number;
  peers: number;
  downloadUrl: string;
  link: string;
  guid: string;
  comments?: string;
};

const showFilters = ref(false);
const searchQuery = ref("");
const emit = defineEmits(["search"]);

const allResults = ref<Result[]>([]);
const currentFilters = ref<{ category: string; indexer: string }>({
  category: "All",
  indexer: "All",
});
const lastSubmittedQuery = ref("");
const indexersStore = useIndexersStore();

function getCategoryName(category: any): string {
  const categoryId = String(Array.isArray(category) ? category[0] : category);
  if (!categoryId || isNaN(Number(categoryId))) {
    return categoryId;
  }
  if (categoryMap[categoryId]) {
    return categoryMap[categoryId];
  }
  const parentId = String(Math.floor(Number(categoryId) / 1000) * 1000);
  if (categoryMap[parentId]) {
    return categoryMap[parentId];
  }
  return categoryId;
}

const availableCategories = computed(() => {
  const cats = indexersStore.allCategories.map((cat) => cat.name).sort();
  return ["All", ...cats];
});

const availableIndexers = computed(() => {
  return indexersStore.selectedIndexers.map((indexer) => indexer.id).sort();
});

const filteredResults = computed(() => {
  const selectedIndexerIds = indexersStore.selectedIndexers.map((ix) => ix.id);
  if (selectedIndexerIds.length === 0) return [];
  return allResults.value.filter((item) => {
    const inSidebar = selectedIndexerIds.includes(item.indexer);
    const categoryMatch =
      currentFilters.value.category === "All" ||
      item.category.toLowerCase().includes(currentFilters.value.category.toLowerCase());
    const indexerMatch =
      currentFilters.value.indexer === "All" || item.indexer === currentFilters.value.indexer;
    return inSidebar && categoryMatch && indexerMatch;
  });
});

watch(filteredResults, (results) => emit("search", results));

function handleFilter(filters: { category: string; indexer: string }) {
  currentFilters.value = filters;
}

const isLoading = ref(false);
const errorMessage = ref("");

async function performSearch() {
  const { baseUrl, apiKey } = getJackettSettings();
  if (!searchQuery.value.trim()) {
    return;
  }
  lastSubmittedQuery.value = searchQuery.value.trim();
  isLoading.value = true;
  errorMessage.value = "";
  const url = `${baseUrl}/api/v2.0/indexers/all/results/torznab/api?t=search&q=${encodeURIComponent(
    searchQuery.value
  )}&apikey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your Jackett API key in settings.");
      } else if (response.status === 404) {
        throw new Error("API endpoint not found. Please check your Jackett base URL.");
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();
    if (contentType.includes("application/json")) {
      let jsonError;
      try {
        jsonError = JSON.parse(responseText);
      } catch {
        throw new Error(`Received JSON response instead of XML: ${responseText.substring(0, 200)}`);
      }
      throw new Error(`API Error: ${jsonError.message || jsonError.error || "Unknown error"}`);
    }
    if (contentType.includes("text/html") || responseText.trim().startsWith("<!")) {
      throw new Error(
        "Received HTML error page instead of XML. This usually means:\n1. Wrong base URL (should be http://your-ip:9117)\n2. Invalid API key\n3. Jackett server is not running"
      );
    }
    if (!responseText.trim().startsWith("<?xml") && !responseText.trim().startsWith("<")) {
      throw new Error(
        `Invalid response format. Expected XML but got: ${responseText.substring(0, 100)}`
      );
    }
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", parseTagValue: false });
    const json = parser.parse(responseText);
    const itemArr = json?.rss?.channel?.item || [];
    const items = Array.isArray(itemArr) ? itemArr : [itemArr];
    const results: Result[] = items.map((item: any) => {
      const attrs: any[] = [].concat(item["torznab:attr"] || []);
      const attr = (name: string) => attrs.find((a) => a.name === name)?.value;
      const indexerId = item.jackettindexer?.id || "";
      const indexerObj = indexersStore.allIndexers.find((ix) => ix.id === indexerId);
      return {
        name: item.title || "",
        indexer: indexerObj ? indexerObj.id : "",
        category: getCategoryName(item.category || ""),
        quality: "",
        size: item.size ? `${(parseInt(item.size) / 1024 ** 3).toFixed(2)} GB` : "",
        date: item.pubDate || "",
        seeds: parseInt(attr("seeders") || "0"),
        peers: parseInt(attr("peers") || "0"),
        downloadUrl: item.link || item.enclosure?.url || attr("downloadUrl") || attr("magneturl") || "",
        link: item.link || "",
        guid: item.guid || "",
        comments: item.comments || "",
      };
    });
    allResults.value = results;
  } catch (err: any) {
    errorMessage.value = `Failed to fetch results: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  const { baseUrl, apiKey } = getJackettSettings();
  indexersStore.loadSelectedFromStorage();
  try {
    await indexersStore.fetchAllIndexers(baseUrl, apiKey);
    await indexersStore.fetchAllCategories(baseUrl, apiKey);
  } catch (err: any) {
    errorMessage.value = `Failed to load indexers: ${err.message}`;
  }
});
</script>

<template>
  <div class="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8">
    <h1
      class="font-Poppins text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-r from-purple to-pink-400 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient text-center"
    >
      Jackett
    </h1>
    <div class="relative w-full max-w-xs sm:max-w-lg lg:max-w-2xl">
      <div class="absolute flex items-center inset-y-0 start-0">
        <Icon
          class="text-purple mx-2 sm:mx-3 w-5 h-5 sm:w-6 sm:h-6"
          icon="material-symbols:search-rounded"
        />
      </div>
      <input
        v-model="searchQuery"
        @keyup.enter="performSearch"
        type="text"
        class="border border-gray-400 hover:border-purple focus:outline-purple p-3 sm:p-4 ps-8 sm:ps-10 text-sm sm:text-base rounded-xl h-10 sm:h-12 w-full transition-colors"
        placeholder="Search Torrents..."
        :class="{ 'placeholder:text-xs sm:placeholder:text-sm': true }"
      />
      <button
        @click="showFilters = !showFilters"
        class="absolute right-2 top-1 sm:top-2 text-gray-400 hover:text-gray-500 cursor-pointer p-1 rounded-md transition-colors"
        :title="showFilters ? 'Hide Filters' : 'Show Filters'"
      >
        <Icon icon="lsicon:filter-outline" class="w-6 h-6 sm:w-8 sm:h-6" />
      </button>
    </div>
    <button
      v-if="searchQuery.trim()"
      @click="performSearch"
      class="mt-4 sm:hidden bg-purple text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
    >
      Search
    </button>
    <Filters
      v-show="showFilters"
      class="w-full max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto mt-4 sm:mt-6"
      @filter="handleFilter"
      :available-categories="availableCategories"
      :available-indexers="availableIndexers"
    />
    <ErrorMessage
      v-if="errorMessage"
      :message="errorMessage"
      class="w-full max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto mt-4"
    />
    <div v-if="isLoading" class="mt-6 sm:mt-8">
      <Spinner />
    </div>
    <div
      v-if="!isLoading && !errorMessage && filteredResults.length === 0 && lastSubmittedQuery"
      class="mt-8 text-gray-500 text-center"
    >
      {{
        indexersStore.selectedIndexers.length === 0
          ? "No indexers selected. Open Indexers to add some."
          : "No results found for your search."
      }}
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient-move {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animate-gradient {
  animation: gradient-move 4s ease-in-out infinite;
}
</style>
