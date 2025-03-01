import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authentication";
import LoginPage from "@/views/LoginPage.vue";
import RegisterPage from "@/views/RegisterPage.vue"; // Import RegisterPage
import NoteListPage from "@/views/NoteListPage.vue";
import NoteCreatePage from "@/views/NoteCreatePage.vue";
import NoteUpdatePage from "@/views/NoteUpdatePage.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/register",
    name: "RegisterPage",
    component: RegisterPage,
  },
  {
    path: "/note-list",
    name: "NoteList",
    component: NoteListPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/note-create",
    name: "NoteCreate",
    component: NoteCreatePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/note-update/:id",
    name: "NoteUpdate",
    component: NoteUpdatePage,
    meta: { requiresAuth: true },
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  await auth.loadToken();
  if (to.meta.requiresAuth && (!auth.token || auth.token === "")) {
    next({ name: "Login" });
  } else if (to.name === "Login" && auth.token) {
    next({ name: "NoteList" });
  } else {
    next();
  }
});

export default router;
