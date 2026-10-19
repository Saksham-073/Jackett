<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref, onMounted, computed } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useIndexersStore } from "@/stores/indexers";
import IndexerModal from "./IndexerModal.vue";
import { getJackettSettings } from "@/Utlis/settings";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(["close", "indexers-updated"]);

const indexersStore = useIndexersStore();

const isLoadingAll = ref(false);
const errorAll = ref("");
const showAddModal = ref(false);
const tempSelectedIndexerIds = ref<string[]>([]);

const testingId = ref("");
const testResult = ref<{ [id: string]: string }>({});

const sidebarIndexers = computed(() =>
  indexersStore.allIndexers.filter((ix) => indexersStore.selectedIndexerIds.includes(ix.id))
);

async function fetchAllIndexers() {
  isLoadingAll.value = true;
  errorAll.value = "";
  try {
    const { baseUrl, apiKey } = getJackettSettings();
    await indexersStore.fetchAllIndexers(baseUrl, apiKey);
  } catch (err: any) {
    errorAll.value = err.message || "Failed to fetch indexers.";
    toast.error("Failed to fetch indexers: " + err.message);
  } finally {
    isLoadingAll.value = false;
  }
}

onMounted(async () => {
  indexersStore.loadSelectedFromStorage();
  await fetchAllIndexers();
});

function openAddModal() {
  fetchAllIndexers();
  tempSelectedIndexerIds.value = [...indexersStore.selectedIndexerIds];
  showAddModal.value = true;
}

function handleModalSave() {
  indexersStore.setSelectedIndexers([...tempSelectedIndexerIds.value]);
  showAddModal.value = false;
  toast.success("Indexer selection saved successfully!");
  emit("indexers-updated");
}

function handleModalClose() {
  showAddModal.value = false;
}

async function testIndexer(id: string) {
  testingId.value = id;
  testResult.value[id] = "";
  try {
  
    const indexer = indexersStore.allIndexers.find(ix => ix.id === id);
    if (!indexer || indexer.configured === false) {
      testResult.value[id] = "Failed";
      toast.error(`Indexer "${id}" is not configured and cannot be tested.`);
      return;
    }
    const { baseUrl, apiKey } = getJackettSettings();
    const url = `${baseUrl}/api/v2.0/indexers/${id}/results/torznab/api?t=caps&apikey=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      testResult.value[id] = "Success";
      toast.success(`Indexer "${id}" is working!`);
    } else {
      testResult.value[id] = "Failed";
      toast.error(`Indexer "${id}" test failed!`);
    }
  } catch (err: any) {
    testResult.value[id] = "Failed";
    toast.error(`Indexer "${id}" test failed: ` + err.message);
  } finally {
    testingId.value = "";
  }
}

function removeIndexerFromSidebar(id: string) {
  const indexerName = sidebarIndexers.value.find((ix) => ix.id === id)?.name || id;
  const updated = indexersStore.selectedIndexerIds.filter((i) => i !== id);
  indexersStore.setSelectedIndexers(updated);
  toast.success(`"${indexerName}" removed from sidebar successfully!`);
}
</script>

<template>
  <transition name="sidebar-slide">
    <div
      v-if="props.show"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transition-transform duration-300"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg text-gray-800 font-semibold font-Poppins">Indexers</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 cursor-pointer">
            <Icon icon="mingcute:close-fill" width="24" height="24" />
          </button>
        </div>
        <button
          class="bg-purple text-white px-3 py-2 rounded-lg mt-4 mb-6 hover:bg-purple/80"
          @click="openAddModal"
        >
          + Add Indexer
        </button>
        <ul v-if="sidebarIndexers.length" class="text-black/70 my-6 ml-3 text-sm font-Poppins">
          <li
            v-for="key in sidebarIndexers"
            :key="key.id"
            class="my-6 flex justify-between items-center"
          >
            <span>
              {{ key.name }}
              <span class="ml-2 text-sm text-black">({{ key.id }})</span>
            </span>
            <span class="flex items-center gap-2">
              <button
                class="text-gray-400 hover:text-gray-700 cursor-pointer"
                @click="testIndexer(key.id)"
                :disabled="testingId === key.id"
              >
                Test
              </button>
              <span v-if="testingId === key.id" class="text-xs ml-1">Testing...</span>
              <span
                v-else-if="testResult[key.id]"
                :class="testResult[key.id] === 'Success' ? 'text-green-600' : 'text-red-500'"
                class="text-xs ml-1"
              >
                {{ testResult[key.id] }}
              </span>
              <button
                class="ml-2 text-red-400 hover:text-red-600 cursor-pointer"
                title="Remove from sidebar"
                @click="removeIndexerFromSidebar(key.id)"
              >
                <Icon icon="mdi:trash-can-outline" width="18" height="18" />
              </button>
            </span>
          </li>
        </ul>
        <div v-else class="my-6 text-gray-500">No indexers selected.</div>
      </div>
      <IndexerModal
        :show="showAddModal"
        :is-loading="isLoadingAll"
        :error="errorAll"
        :all-indexers="indexersStore.allIndexers"
        :selected-indexer-ids="tempSelectedIndexerIds"
        :is-saving="false"
        :save-error="''"
        @close="handleModalClose"
        @update:selectedIndexerIds="(ids: string[]) => { tempSelectedIndexerIds = ids; }"
        @save="handleModalSave"
      />
    </div>
  </transition>
</template>

<style scoped>
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.sidebar-slide-enter-to,
.sidebar-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
