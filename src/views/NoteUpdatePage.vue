<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950">
    <div class="container bg-pink-200 p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Create Note</h2>
      <SubmitForm :isUpdateForm="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SubmitForm from '../components/SubmitForm.vue'
</script>
