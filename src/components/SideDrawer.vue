<template>
  <div v-if="props.visible" class="fixed inset-0 z-50 flex justify-end">
    <div class="fixed inset-0 bg-black opacity-50" @click="close"></div>
    <div class="relative bg-white dark:bg-gray-800 w-80 p-4">
      <h2 class="text-xl font-bold mb-4">
        {{ props.isUpdate ? "Update Note" : "Create Note" }}
      </h2>
      <SubmitForm
        :isUpdateForm="props.isUpdate"
        :noteId="props.noteId"
        @close="close"
        @showMessage="onShowMessage"
      />
      <button
        @click="close"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import SubmitForm from "./SubmitForm.vue";

const props = defineProps({
  visible: Boolean,
  isUpdate: Boolean,
  noteId: String,
});

const emit = defineEmits(["close", "showMessage"]);

const close = () => {
  emit("close");
};

const onShowMessage = (message: string) => {
  emit("showMessage", message);
};
</script>

<style scoped>
/* Add any necessary styles for the side drawer */
</style>
