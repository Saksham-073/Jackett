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

  // False until the user has a saved selection; the first indexer fetch then selects all.
  let hasSelection = false;

  function loadSelectedFromStorage() {
    try {
      const stored = JSON.parse(localStorage.getItem("selectedIndexerIds") ?? "null");
      if (Array.isArray(stored)) {
        selectedIndexerIds.value = stored;
        hasSelection = true;
      }
    } catch {}
  }

  function setSelectedIndexers(ids: string[]) {
    selectedIndexerIds.value = ids;
    hasSelection = true;
    persistSelection();
  }

  function updateAllIndexers(indexers: Indexer[]) {
    allIndexers.value = indexers;
    // An empty response says nothing about the selection; keep it as is.
    if (indexers.length === 0) return;

    setSelectedIndexers(
      hasSelection
        ? selectedIndexerIds.value.filter((id) => indexers.some((ix) => ix.id === id))
        : indexers.map((ix) => ix.id)
    );
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
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", parseTagValue: false });
    const json = parser.parse(xml);
    const indexerArr = json?.rss?.channel?.indexer || json?.indexers?.indexer || [];
    const indexers = Array.isArray(indexerArr) ? indexerArr : [indexerArr];
    const mapped: Indexer[] = indexers.map((ix: any) => ({
      id: ix.id || "",
      name: ix.title || ix.name || ix.id || "",
      type: ix.type || "",
      configured: ix.configured === "true",
    }));
    updateAllIndexers(mapped);
  }

  async function fetchAllCategories(baseUrl: string, apiKey: string) {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const categoriesSet = new Map<string, string>();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", parseTagValue: false });
    const responses = await Promise.allSettled(
      configuredIndexers.value.map(async (ix) => {
        const url = `${cleanBaseUrl}/api/v2.0/indexers/${ix.id}/results/torznab/api?t=caps&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
    );
    for (const response of responses) {
      if (response.status !== "fulfilled") continue;
      const json = parser.parse(response.value);
      const catArr = json?.caps?.categories?.category || [];
      const cats = Array.isArray(catArr) ? catArr : [catArr];
      for (const cat of cats) {
        const id = cat.id || cat["#text"] || "";
        const name = cat.name || cat["#text"] || id;
        if (id && !categoriesSet.has(id)) {
          categoriesSet.set(id, name);
        }
      }
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