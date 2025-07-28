<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  show: boolean;
  isLoading: boolean;
  error: string;
  allIndexers: Array<{ id: string; name: string; type?: string; configured: boolean }>;
  selectedIndexerIds: string[];
  isSaving: boolean;
  saveError: string;
}>();

const emit = defineEmits(["close", "update:selectedIndexerIds", "save"]);

const searchIndexer = ref("");
const indexerTypeFilter = ref("all");

const filteredAllIndexers = computed(() => {
  let filtered = [...(props.allIndexers || [])];
  if (indexerTypeFilter.value !== "all") {
    filtered = filtered.filter(
      (ix) => (ix.type || "public").toLowerCase() === indexerTypeFilter.value
    );
  }
  if (!searchIndexer.value.trim()) return filtered;
  return filtered.filter(
    (ix) =>
      ix.name.toLowerCase().includes(searchIndexer.value.trim().toLowerCase()) ||
      ix.id.toLowerCase().includes(searchIndexer.value.trim().toLowerCase())
  );
});

const allFilteredSelected = computed(() => {
  const filteredIds = filteredAllIndexers.value.map((ix) => ix.id);
  return filteredIds.length > 0 && filteredIds.every((id) => props.selectedIndexerIds.includes(id));
});

function handleCheckboxChange(id: string) {
  const ids = [...props.selectedIndexerIds];
  if (ids.includes(id)) {
    emit(
      "update:selectedIndexerIds",
      ids.filter((i) => i !== id)
    );
  } else {
    emit("update:selectedIndexerIds", [...ids, id]);
  }
}

function toggleSelectAll() {
  const filteredIds = filteredAllIndexers.value.map((ix) => ix.id);
  if (allFilteredSelected.value) {
    // Deselect all
    emit(
      "update:selectedIndexerIds",
      props.selectedIndexerIds.filter((id) => !filteredIds.includes(id))
    );
  } else {
    // Select all
    emit(
      "update:selectedIndexerIds",
      Array.from(new Set([...props.selectedIndexerIds, ...filteredIds]))
    );
  }
}

function handleSave(e: Event) {
  e.preventDefault();
  emit("save");
}
</script>

<template>
  <div
    v-if="props.show"
    class="fixed inset-0 bg-black/70 bg-opacity-30 flex items-center justify-center z-50"
  >
    <div
      class="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md relative max-h-[80vh] flex flex-col"
    >
      <button @click="$emit('close')" class="absolute top-2 right-2">
        <Icon
          class="text-black/70 mt-6 cursor-pointer"
          icon="mingcute:close-fill"
          width="20"
          height="20"
        />
      </button>
      <h3 class="text-lg text-black/70 font-semibold mb-4">Select Indexers to Show</h3>
      <div v-if="props.isLoading" class="text-gray-500">Loading indexers...</div>
      <div v-if="props.error" class="text-red-500">{{ props.error }}</div>

      <form
        v-if="!props.isLoading && !props.error"
        @submit="handleSave"
        class="flex flex-col flex-1 min-h-0"
      >
        <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          <div class="flex gap-2 mb-2">
            <label class="text-xs text-gray-600 mt-1">Type:</label>
            <select
              v-model="indexerTypeFilter"
              class="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-purple"
            >
              <option value="all">All</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <input
            v-model="searchIndexer"
            type="text"
            placeholder="Search indexers..."
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-purple mb-2"
          />
         
          <div class="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              :id="'select-all-checkbox'"
              :checked="allFilteredSelected"
              @change="toggleSelectAll"
            />
            <label :for="'select-all-checkbox'" class="text-sm font-medium cursor-pointer">
              {{ allFilteredSelected ? 'Deselect All' : 'Select All' }}
            </label>
          </div>
          <div v-for="ix in filteredAllIndexers" :key="ix.id" class="flex items-center gap-2">
            <input
              type="checkbox"
              :id="'ix-' + ix.id"
              :value="ix.id"
              :checked="props.selectedIndexerIds.includes(ix.id)"
              @change="handleCheckboxChange(ix.id)"
            />
            <label :for="'ix-' + ix.id" >
              {{ ix.name }}
              <span class="text-sm text-gray-500">({{ ix.id }})</span>
              <span
                v-if="ix.type"
                class="ml-2 px-2 py-0.5 rounded-full text-xs"
                :class="
                  ix.type.toLowerCase() === 'private'
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                "
              >
                {{ ix.type.charAt(0).toUpperCase() + ix.type.slice(1) }}
              </span>
              <span v-if="ix.configured === false" class="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">(not configured)</span>
            </label>
          </div>
        </div>
        <div class="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-2 z-10">
          <button
            type="submit"
            class="bg-purple text-white px-4 py-2 rounded hover:bg-purple/90 cursor-pointer w-full"
            :disabled="props.isSaving"
          >
            {{ props.isSaving ? "Saving..." : "Save Selection" }}
          </button>
          <div v-if="props.saveError" class="text-red-500 text-sm mt-2">{{ props.saveError }}</div>
        </div>
      </form>
    </div>
  </div>
</template>
