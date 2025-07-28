<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from "@headlessui/vue";
import { Icon } from "@iconify/vue";

const props = defineProps<{
  availableCategories?: string[];
  availableIndexers?: string[];
}>();

const isCyrillic = (str: string) => /[\u0400-\u04FF]/.test(str);

const selectedCategory = ref("All");
const selectedIndexer = ref("All");
const categoryQuery = ref("");
const indexerQuery = ref("");

const emit = defineEmits(["filter"]);

const categories = computed(() =>
  props.availableCategories?.length
    ? Array.from(new Set(props.availableCategories)).filter((cat) => !isCyrillic(cat))
    : []
);
const indexers = computed(() =>
  props.availableIndexers?.length ? ["All", ...Array.from(new Set(props.availableIndexers))] : []
);

const filteredCategories = computed(() =>
  categoryQuery.value === ""
    ? categories.value
    : categories.value.filter((cat) =>
        cat.toLowerCase().includes(categoryQuery.value.toLowerCase())
      )
);
const filteredIndexers = computed(() =>
  indexerQuery.value === ""
    ? indexers.value
    : indexers.value.filter((ind) =>
        ind.toLowerCase().includes(indexerQuery.value.toLowerCase())
      )
);

watch([selectedCategory, selectedIndexer], () => {
  emit("filter", { category: selectedCategory.value, indexer: selectedIndexer.value });
});

function handleReset() {
  selectedCategory.value = "All";
  selectedIndexer.value = "All";
  emit("filter", { category: "All", indexer: "All" });
}
</script>

<template>
  <div class="w-full flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-6 items-start sm:items-center justify-center">
    <div class="w-full sm:w-auto">
      <label class="block text-xs font-medium text-gray-600 mb-1">Category</label>
      <Combobox v-model="selectedCategory">
        <div class="relative">
          <ComboboxInput
            class="border border-gray-300 rounded-lg w-full sm:w-50 px-2 py-2 text-sm focus:outline-purple focus:ring-2 focus:ring-purple-200 transition-all"
            :displayValue="(cat: unknown) => typeof cat === 'string' ? cat : ''"
            placeholder="Select category"
            @change="categoryQuery = $event.target.value"/>

          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon icon="mdi:chevron-down" class="w-6 h-6 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            @after-leave="categoryQuery = ''">

            <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div
                v-if="filteredCategories.length === 0 && categoryQuery !== ''"
                class="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
              <ComboboxOption
                v-for="cat in filteredCategories"
                :key="cat"
                :value="cat"
                v-slot="{ selected, active }">
                <li
                  class="relative cursor-default select-none py-2 pl-10 pr-4"
                  :class="{'bg-purple text-white': active, 'text-gray-900': !active}">
                  <span class="block truncate"
                    :class="{ 'font-medium': selected, 'font-normal': !selected }">{{ cat }}</span>
                  <span v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3"
                    :class="{ 'text-white': active, 'text-purple': !active }">
                    <Icon icon="mdi:check" class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
    </div>
    <div class="w-full sm:w-auto">
      <label class="block text-xs font-medium text-gray-600 mb-1">Indexers</label>
      <Combobox v-model="selectedIndexer">
        <div class="relative">
          <ComboboxInput
            class="border border-gray-300 w-full sm:w-50 rounded-lg px-2 py-2 text-sm focus:outline-purple focus:ring-2 focus:ring-purple-200 transition-all"
            :displayValue="(ind: unknown) => typeof ind === 'string' ? ind : ''"
            placeholder="Select indexer"
            @change="indexerQuery = $event.target.value"
          />
          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon icon="mdi:chevron-down" class="w-6 h-6 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            @after-leave="indexerQuery = ''">
            <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div v-if="filteredIndexers.length === 0 && indexerQuery !== ''"
                class="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
              <ComboboxOption
                v-for="ind in filteredIndexers"
                :key="ind"
                :value="ind"
                v-slot="{ selected, active }" >
                <li class="relative cursor-default select-none py-2 pl-10 pr-4"
                  :class="{'bg-purple text-white': active, 'text-gray-900': !active}"
                  >
                  <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                    {{ ind }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3"
                    :class="{ 'text-white': active, 'text-purple': !active }">
                    <Icon icon="mdi:check" class="w-5 h-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
    </div>
    <button @click="handleReset" class="w-full sm:w-auto sm:ml-2 sm:mt-5 px-4 py-2 rounded-lg bg-purple text-white text-sm hover:bg-purple/90 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-200">
      Reset Filters
    </button>
  </div>
</template>
