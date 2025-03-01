<template>
  <transition name="fade">
    <Dialog
      v-model:visible="localVisible"
      modal
      :closable="false"
      class="w-full max-w-md"
    >
      <h3 class="text-lg font-semibold text-center mb-4">Delete Note</h3>
      <p class="mb-6 text-center text-gray-700">
        Are you sure you want to delete the selected note? This action cannot be
        undone.
      </p>
      <div class="flex justify-center space-x-4">
        <button
          @click="confirm"
          class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Yes, Delete
        </button>
        <button
          @click="closeModal"
          class="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps<{ visible: boolean }>();
const emits = defineEmits(["close", "confirm"]);

const localVisible = ref(props.visible);

watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal;
  }
);

const closeModal = () => {
  localVisible.value = false;
  emits("close");
};

const confirm = () => {
  emits("confirm");
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
