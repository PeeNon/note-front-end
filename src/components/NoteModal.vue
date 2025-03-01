<template>
  <Dialog
    :visible="visible"
    modal
    closable
    @hide="closeModal"
    class="w-full max-w-md"
  >
    <template #header>
      <h2
        :class="{ 'text-white': isDarkMode, 'text-black': !isDarkMode }"
        class="text-2xl font-bold mb-6 text-center"
      >
        {{ isUpdate ? "Update Note" : "Create Note" }}
      </h2>
    </template>
    <template #closeicon>
      <button
        @click="closeModal"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <i class="pi pi-times"></i>
      </button>
    </template>
    <SubmitForm
      :isUpdateForm="isUpdate"
      :noteId="noteId"
      @close="closeModal"
      @showMessage="showMessage"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import SubmitForm from "./SubmitForm.vue";

const { visible, isUpdate, noteId } = defineProps<{
  visible: boolean;
  isUpdate: boolean;
  noteId?: string;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "showMessage", message: string): void;
}>();

const closeModal = () => {
  emits("close");
};

const showMessage = (message: string) => {
  emits("showMessage", message);
};

const isDarkMode = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

watch(isDarkMode, () => {
  document.documentElement.style.setProperty(
    "--text-color",
    isDarkMode.value ? "white" : "black"
  );
});

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    isDarkMode.value = e.matches;
  });
</script>

<style scoped>
/* Add any additional styling if needed */
</style>
