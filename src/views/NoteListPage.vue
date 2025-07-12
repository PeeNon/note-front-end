<template>
  <div
    class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800"
  >
    <div class="absolute top-4 right-4">
      <Menu :model="menuItems" popup ref="menu" />
      <PButton
        icon="pi pi-user"
        class="p-button-rounded p-button-text custom-icon-size"
        @click="toggleMenu"
      />
    </div>
    <div class="container bg-white p-8 rounded-lg shadow-lg w-full">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-center text-black w-full">
          Notes App
        </h2>
      </div>
      <DataTable
        lazy
        :value="notes"
        :loading="loading"
        paginator
        :first="offset"
        :rows="limit"
        :rowsPerPageOptions="rowOptions"
        :totalRecords="totalRecords"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['title']"
        v-model:selection="selectedNotes"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        @page="onPageChange($event)"
        @update:rows="limit = $event"
        @sort="onSortChange"
      >
        <template #header>
          <div
            class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          >
            <div
              class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto"
            >
              <IconField class="w-full md:w-48">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="searchQuery"
                  @input="onSearchChange"
                  placeholder="Search Title"
                  class="w-full professional-input"
                />
              </IconField>
              <DatePicker
                v-model="dateFrom"
                @change="onDateFilterChange"
                showIcon
                fluid
                iconDisplay="input"
                placeholder="Filter Start Date"
                class="w-full md:w-auto flex-grow"
                :dateFormat="'yy-mm-dd'"
                style="min-width: 150px"
              />
              <DatePicker
                v-model="dateTo"
                @change="onDateFilterChange"
                showIcon
                fluid
                iconDisplay="input"
                placeholder="Filter End Date"
                class="w-full md:w-auto flex-grow"
                :dateFormat="'yy-mm-dd'"
                style="min-width: 150px"
              />
            </div>
            <div
              class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2 w-full md:w-auto justify-end"
            >
              <PButton
                type="button"
                icon="pi pi-trash"
                label="Delete Selected"
                outlined
                class="w-full md:w-auto p-button-danger"
                @click="openDeleteModal"
              />
              <PButton
                type="button"
                icon="pi pi-pencil"
                label="Create Note"
                outlined
                class="w-full md:w-auto p-button-success"
                @click="openCreateModal"
              />
              <PButton
                type="button"
                icon="pi pi-filter-slash"
                label="Clear Search"
                outlined
                class="w-full md:w-auto p-button-secondary"
                @click="clearFilter"
              />
            </div>
          </div>
        </template>
        <template #empty> No Note found. </template>
        <template #loading>
          <div class="loading-backdrop">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner loading-icon"></i>
              <p>Loading notes data. Please wait...</p>
            </div>
          </div>
        </template>
        <PColumn selectionMode="multiple" headerStyle="width: 3rem"></PColumn>
        <PColumn field="title" header="Title" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <div @click="editNote(data)" class="cursor-pointer">
              {{ data.title }}
            </div>
          </template>
        </PColumn>
        <PColumn
          field="createdAt"
          header="Created At"
          dataType="date"
          sortable
          style="min-width: 10rem"
        >
          <template #body="{ data }">
            <div @click="editNote(data)" class="cursor-pointer">
              {{ formatDateTime(data.createdAt) }}
            </div>
          </template>
        </PColumn>
        <PColumn
          field="updatedAt"
          header="Updated At"
          dataType="date"
          sortable
          style="min-width: 10rem"
        >
          <template #body="{ data }">
            <div @click="editNote(data)" class="cursor-pointer">
              {{ formatDateTime(data.updatedAt) }}
            </div>
          </template>
        </PColumn>
        <PColumn class="w-24 !text-end">
          <template #body="{ data }">
            <div class="flex justify-end space-x-2">
              <PButton
                icon="pi pi-file-edit"
                @click="editNote(data)"
                severity="success"
              ></PButton>
              <PButton
                icon="pi pi-trash"
                @click="deleteNoteConfirmation(data.id)"
                severity="danger"
              ></PButton>
            </div>
          </template>
        </PColumn>
      </DataTable>
    </div>
  </div>
  <NoteModal
    :visible="isModalVisible"
    :isUpdate="isUpdate"
    :noteId="selectedNoteId !== null ? selectedNoteId.toString() : undefined"
    @close="closeModal"
    @showMessage="displayMessage"
  />
  <ConfirmDeleteModal
    :visible="isDeleteModalVisible"
    @close="closeDeleteModal"
    @confirm="confirmDelete"
  />
  <div
    v-if="showMessage"
    class="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authentication";
import axios from "../utils/axios";
import type { DataTableSortEvent } from "primevue/datatable";
import NoteModal from "../components/NoteModal.vue";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.vue";
import Menu from "primevue/menu";
import PButton from "primevue/button";
import DatePicker from "primevue/calendar";

const router = useRouter();
const auth = useAuthStore();
const searchQuery = ref("");
const sort = ref("createdAt");
const order = ref("desc");
const notes = ref([]);
const selectedNotes = ref<{ id: number }[]>([]);
const limit = ref(10);
const page = ref(0);
const loading = ref(false);
const rowOptions = [5, 10, 25, 50];

const totalRecords = ref(0);

const offset = computed(() => page.value * limit.value);

const isModalVisible = ref(false);
const isUpdate = ref(false);
const selectedNoteId = ref<number | null>(null);

const openUpdateDrawer = (noteId: number) => {
  isUpdate.value = true;
  selectedNoteId.value = noteId;
  isModalVisible.value = true;
};

const openCreateDrawer = () => {
  isUpdate.value = false;
  selectedNoteId.value = null;
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
  fetchNotes();
};

// Replace modal functions with drawer functions
const openUpdateModal = openUpdateDrawer;
const openCreateModal = openCreateDrawer;

const onPageChange = async (event: { page: number }) => {
  page.value = event.page;
};

const onSortChange = async (event: DataTableSortEvent) => {
  if (typeof event.sortField === "string") {
    sort.value = event.sortField;
  }
  order.value = event.sortOrder === 1 ? "asc" : "desc";
  page.value = 0;
  await fetchNotes();
};

const fetchNotes = async () => {
  await auth.loadToken();
  const token = auth.token;

  try {
    loading.value = true;
    const response = await axios.get("/api/notes", {
      params: {
        pageNumber: page.value + 1,
        pageSize: limit.value,
        searchQuery: searchQuery.value,
        sort: sort.value,
        order: order.value,
        dfrom: dateFrom.value
          ? new Date(
              dateFrom.value.getTime() -
                dateFrom.value.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : "",
        dto: dateTo.value
          ? new Date(
              dateTo.value.getTime() - dateTo.value.getTimezoneOffset() * 60000
            )
              .toISOString()
              .split("T")[0]
          : "",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    notes.value = response.data.data;
    totalRecords.value = response.data.total;
    loading.value = false;
  } catch (error) {
    console.log("Error fetching notes", error);
  }
};

const editNote = (data: { id: number }) => {
  openUpdateModal(data.id);
};

const openDeleteModal = () => {
  if (selectedNotes.value.length > 0) {
    isDeleteModalVisible.value = true;
  } else {
    displayMessage("Please select at least one note to delete.");
  }
};

const closeDeleteModal = () => {
  isDeleteModalVisible.value = false;
};

const confirmDelete = async () => {
  if (selectedNoteId.value !== null) {
    await deleteNote(selectedNoteId.value);
    selectedNoteId.value = null;
  } else if (selectedNotes.value.length > 0) {
    const ids = selectedNotes.value.map((note) => note.id);
    await deleteManyNotes(ids);
    selectedNotes.value = [];
  }
  closeDeleteModal();
};

const deleteNote = async (id: number) => {
  await auth.loadToken();
  const token = auth.token;

  try {
    await axios.delete(`/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchNotes();
  } catch (error) {
    console.log("Error deleting note", error);
  }
};

const deleteManyNotes = async (ids: number[]) => {
  await auth.loadToken();
  const token = auth.token;

  try {
    await axios.delete(`/api/notes`, {
      data: ids,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchNotes();
  } catch (error) {
    console.log("Error deleting note", error);
  }
};

const deleteNoteConfirmation = (noteId: number) => {
  selectedNoteId.value = noteId;
  isDeleteModalVisible.value = true;
};

const clearFilter = async () => {
  searchQuery.value = "";
  dateFrom.value = null;
  dateTo.value = null;
  await fetchNotes();
};

const logout = async () => {
  await auth.clearToken();
  router.push({ name: "Login" });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  const seconds = String(localDate.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const onSearchChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  page.value = 0;
  await fetchNotes();
};

const message = ref("");
const showMessage = ref(false);

const displayMessage = (msg: string) => {
  message.value = msg;
  showMessage.value = true;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const isDeleteModalVisible = ref(false);

const menuItems = [
  {
    label: "Logout",
    icon: "pi pi-sign-out",
    command: () => logout(),
  },
];

const menu = ref<InstanceType<typeof Menu> | null>(null);

const toggleMenu = (event: Event) => {
  menu.value?.toggle(event);
};

const dateFrom = ref<Date | null>(null);
const dateTo = ref<Date | null>(null);

const onDateFilterChange = async () => {
  page.value = 0;
  await fetchNotes();
};

watch([dateFrom, dateTo], onDateFilterChange);

const isDarkMode = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const updateTextColor = () => {
  const textColor = isDarkMode.value ? "white" : "black";
  document.documentElement.style.setProperty("--text-color", textColor);
};

watch(isDarkMode, updateTextColor);

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    isDarkMode.value = e.matches;
  });

onMounted(() => {
  updateTextColor();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      isDarkMode.value = e.matches;
    });
});

onMounted(fetchNotes);
watch([page], fetchNotes);
</script>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.professional-input {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.professional-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  outline: none;
}

.professional-edit-button {
  background-color: #3b82f6;
  border: none;
  color: white;
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

.professional-edit-button:hover {
  background-color: #2563eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.professional-edit-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.custom-icon-size .pi {
  font-size: 2rem; /* Adjust the size as needed */
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  text-align: center;
  color: var(--text-color);
}

.loading-spinner i {
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-size: 1.25rem;
  font-weight: 500;
}

.loading-icon {
  font-size: 3rem; /* Adjust the size as needed */
}
</style>
