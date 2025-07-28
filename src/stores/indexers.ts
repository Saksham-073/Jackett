import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { XMLParser } from "fast-xml-parser";

export type Indexer = { id: string; name: string; type?: string; configured: boolean };
export type Category = { id: string; name: string };

export const useIndexersStore = defineStore("indexers", () => {
  const selectedIndexerIds = ref<string[]>([]);
  const allIndexers = ref<Indexer[]>([]);
  const allCategories = ref<Category[]>([]);

  const selectedIndexers = computed(() =>
    allIndexers.value.filter((ix) => selectedIndexerIds.value.includes(ix.id))
  );
  const configuredIndexers = computed(() =>
    allIndexers.value.filter((ix) => ix.configured === true)
  );

  function persistSelection() {
    localStorage.setItem("selectedIndexerIds", JSON.stringify(selectedIndexerIds.value));
  }

  function loadSelectedFromStorage() {
    const stored = localStorage.getItem("selectedIndexerIds");
    if (stored) {
      selectedIndexerIds.value = JSON.parse(stored);
    } else {
      selectedIndexerIds.value = allIndexers.value.map((ix) => ix.id);
      persistSelection();
    }
  }

  function setSelectedIndexers(ids: string[]) {
    selectedIndexerIds.value = ids;
    persistSelection();
  }

  function updateAllIndexers(indexers: Indexer[]) {
    allIndexers.value = indexers;

    setSelectedIndexers(selectedIndexerIds.value.filter((id) => indexers.some((ix) => ix.id === id)));
  }

  function toggleIndexer(id: string) {
    setSelectedIndexers(
      selectedIndexerIds.value.includes(id)
        ? selectedIndexerIds.value.filter((i) => i !== id)
        : [...selectedIndexerIds.value, id]
    );
  }

  async function fetchAllIndexers(baseUrl: string, apiKey: string) {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/api/v2.0/indexers/all/results/torznab/api?t=indexers&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch indexers");
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const json = parser.parse(xml);
    const indexerArr = json?.rss?.channel?.indexer || json?.indexers?.indexer || [];
    const indexers = Array.isArray(indexerArr) ? indexerArr : [indexerArr];
    const mapped: Indexer[] = indexers.map((ix: any) => ({
      id: ix["@_id"] || ix.id || "",
      name: ix["@_name"] || ix.name || "",
      type: ix["@_type"] || ix.type || "",
      configured: ix["@_configured"] === "true" || ix.configured === "true" ? true : false,
    }));
    updateAllIndexers(mapped);
  }

  async function fetchAllCategories(baseUrl: string, apiKey: string) {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const categoriesSet = new Map();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    for (const ix of allIndexers.value) {
      try {
        const url = `${cleanBaseUrl}/api/v2.0/indexers/${ix.id}/results/torznab/api?t=caps&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const xml = await res.text();
        const json = parser.parse(xml);
        const catArr = json?.caps?.categories?.category || [];
        const cats = Array.isArray(catArr) ? catArr : [catArr];
        for (const cat of cats) {
          const id = cat["@_id"] || cat.id || cat["#text"] || cat.text || "";
          const name = cat["@_name"] || cat.name || cat["#text"] || cat.text || id;
          if (id && !categoriesSet.has(id)) {
            categoriesSet.set(id, name);
          }
        }
      } catch {}
    }
    allCategories.value = Array.from(categoriesSet, ([id, name]) => ({ id, name }));
  }

  return {
    selectedIndexerIds,
    allIndexers,
    configuredIndexers,
    selectedIndexers,
    allCategories,
    loadSelectedFromStorage,
    setSelectedIndexers,
    updateAllIndexers,
    toggleIndexer,
    fetchAllIndexers,
    fetchAllCategories,
  };
});