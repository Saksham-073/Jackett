<script setup lang="ts">
import { ref } from "vue";
import { useIndexersStore } from "@/stores/indexers";
import IndexersSidebar from "./IndexersSidebar.vue";
import { Icon } from "@iconify/vue";
import { RouterLink, RouterView } from "vue-router";
import SettingsBar from "./SettingsBar.vue";
import { getJackettSettings } from "@/Utlis/settings";

const sidebarVisible = ref(false);
const showSettingbar = ref(false);
const indexersStore = useIndexersStore();
async function refreshIndexers() {
  const { baseUrl, apiKey } = getJackettSettings();
  try {
    await indexersStore.fetchAllIndexers(baseUrl, apiKey);
    await indexersStore.fetchAllCategories(baseUrl, apiKey);
  } catch {}
}
</script>

<template>
  <nav class="bg-purple py-8">
    <div class="flex justify-between text-white mx-6 md:mx-16 lg:mx-28">
      <div class="flex">
        <Icon icon="mingcute:search-3-line" width="24" height="24" class="mt-3 mr-2" />
        <RouterLink class="font-semibold font-Poppins text-2xl" to="/"
          >Jackett
          <span class="flex font-Poppins text-sm font-light">Modern Torrent proxy</span>
        </RouterLink>
      </div>
      <div class="flex mt-3 gap-2 sm:gap-6">
        <div @click="sidebarVisible = true" class="flex gap-1 cursor-pointer">
          <h1 class="font-Poppins text-xl hidden lg:block md:block">Indexers</h1>
          <Icon icon="jam:menu" width="24" height="24" class="mt-1" />
        </div>
        <IndexersSidebar
          :show="sidebarVisible"
          @close="sidebarVisible = false"
          @indexers-updated="refreshIndexers"
        />
        <div @click="showSettingbar = true">
          <Icon icon="solar:settings-outline" width="24" height="24" class="mt-1 cursor-pointer" />
        </div>
        <SettingsBar :show="showSettingbar" @close="showSettingbar = false" @saved="refreshIndexers" />
      </div>
    </div>
  </nav>
  <RouterView />
</template>
