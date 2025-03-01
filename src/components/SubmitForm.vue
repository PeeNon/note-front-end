<template>
  <form
    ref="submitFormRef"
    class="validate-form"
    @submit.prevent="handleSubmit"
  >
    <div class="mb-4">
      <label
        for="title"
        :class="{ 'text-white': isDarkMode, 'text-black': !isDarkMode }"
        class="block"
      >
        Title
        <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="title"
        v-model="title"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        required
      />
      <span v-if="!v$.title.required" class="text-red-500"
        >Title is required</span
      >
      <span v-if="!v$.title.minLength" class="text-red-500"
        >Title must be at least 3 characters long</span
      >
    </div>
    <div class="mb-4">
      <label
        for="content"
        :class="{ 'text-white': isDarkMode, 'text-black': !isDarkMode }"
        class="block"
      >
        Content
      </label>
      <textarea
        id="content"
        v-model="content"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      ></textarea>
    </div>
    <button
      type="submit"
      class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
    >
      {{ isUpdateForm ? "Update" : "Submit" }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authentication";
import axios from "../utils/axios";
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

const router = useRouter();
const auth = useAuthStore();

const title = ref("");
const content = ref("");

const props = defineProps({
  isUpdateForm: {
    type: Boolean,
    default: false,
  },
  noteId: {
    type: String,
    default: undefined,
  },
});

const emits = defineEmits(["close", "showMessage"]);

const rules = {
  title: { required, minLength: minLength(3) },
};

const v$ = useVuelidate(rules, { title });

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

onMounted(async () => {
  if (props.isUpdateForm && props.noteId) {
    const resp = await fetchDetails(props.noteId);

    if (resp) {
      setForm(resp);
    }
  } else {
    resetForm();
  }
});

watch(
  () => props.noteId,
  async (newNoteId) => {
    if (props.isUpdateForm && newNoteId) {
      const resp = await fetchDetails(newNoteId);

      if (resp) {
        setForm(resp);
      }
    } else {
      resetForm();
    }
  }
);

const setForm = (data: { title: string; content: string }) => {
  title.value = data.title;
  content.value = data.content;
};

const resetForm = () => {
  title.value = "";
  content.value = "";
};

const fetchDetails = async (id: string) => {
  try {
    await auth.loadToken();
    const token = auth.token;

    const response = await axios.get(`/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const note = response.data;
    return note;
  } catch (error) {
    console.log("Error fetching note details", error);
    return null;
  }
};

const handleSubmit = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    try {
      await auth.loadToken();
      const token = auth.token;

      if (props.isUpdateForm) {
        const id = props.noteId;
        const response = await axios.put(
          `/api/notes/${id}`,
          {
            title: title.value,
            content: content.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Update response:", response.data);
        emits("showMessage", "Note updated successfully");
        emits("close");
      } else {
        const response = await axios.post(
          "/api/notes",
          {
            title: title.value,
            content: content.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Create response:", response.data);
        emits("showMessage", "Note created successfully");
        emits("close");
      }
      router.push({ name: "NoteList" });
    } catch (error) {
      console.log("Error submitting form", error);
    }
  }
};
</script>
