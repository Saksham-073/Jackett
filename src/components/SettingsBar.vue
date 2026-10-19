<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { toast } from "vue3-toastify";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(["close", "saved"]);

const jackettBaseUrl = ref("");
const jackettApiKey = ref("");
const isSaving = ref(false);
const showApiKey = ref(false);

onMounted(() => {
  jackettBaseUrl.value = localStorage.getItem("jackettBaseUrl") || " http://192.168.225.101:9117";
  jackettApiKey.value = localStorage.getItem("jackettApiKey") || "";
});

function toggleApiKeyVisibility() {
  showApiKey.value = !showApiKey.value;
}

function saveSettings() {
  isSaving.value = true;
  try {
    let cleanUrl = jackettBaseUrl.value.trim().replace(/\/+$/, "");
    if (!cleanUrl) throw new Error("Base URL is required");
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "http://" + cleanUrl;
    }
    if (!jackettApiKey.value.trim()) throw new Error("API key is required");
    localStorage.setItem("jackettBaseUrl", cleanUrl);
    localStorage.setItem("jackettApiKey", jackettApiKey.value.trim());
    jackettBaseUrl.value = cleanUrl;
    jackettApiKey.value = jackettApiKey.value.trim();
    toast.success("Settings saved successfully!");
    emit("saved");
    emit("close");
  } catch (error: any) {
    toast.error("Failed to save settings: " + error.message);
  } finally {
    isSaving.value = false;
  }
}

function testConnection() {
  const cleanUrl = jackettBaseUrl.value.trim().replace(/\/+$/, "");
  const apiKey = jackettApiKey.value.trim();
  if (!cleanUrl || !apiKey) {
    toast.error("Please enter both base URL and API key before testing");
    return;
  }
  const testUrl = `${cleanUrl}/api/v2.0/indexers/all/results/torznab/api?t=indexers&apikey=${apiKey}`;
  fetch(testUrl)
    .then((response) => {
      if (response.ok) {
        toast.success("Connection test successful!");
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    })
    .catch((error) => {
      toast.error("Connection test failed: " + error.message);
    });
}
</script>

<template>
  <transition name="settings-slide">
    <div
      v-if="props.show"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transition-transform duration-300"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold font-Poppins text-gray-800">Settings</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 cursor-pointer">
            <Icon icon="mingcute:close-fill" width="24" height="24" />
          </button>
        </div>
        <form @submit.prevent="saveSettings" class="space-y-6">
          <div>
            <label for="baseUrl" class="block text-sm font-medium text-gray-700 mb-2">
              Jackett Base URL
            </label>
            <input
              id="baseUrl"
              v-model="jackettBaseUrl"
              type="url"
              placeholder="http://localhost:9117"
              class="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              Example: http://192.168.1.100:9117 (without /api/v2.0)
            </p>
          </div>
          <div>
            <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div class="relative">
              <input
                id="apiKey"
                v-model="jackettApiKey"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="Your Jackett API key"
                class="w-full px-3 py-2 pr-10 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                @click="toggleApiKeyVisibility"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <Icon :icon="showApiKey ? 'mdi:eye-off' : 'mdi:eye'" width="20" height="20" />
              </button>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="testConnection"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Test Connection
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple/90 cursor-pointer transition disabled:opacity-50"
            >
              {{ isSaving ? "Saving..." : "Save Settings" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.settings-slide-enter-from,
.settings-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.settings-slide-enter-to,
.settings-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
