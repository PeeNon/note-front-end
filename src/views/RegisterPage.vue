<template>
  <section
    class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4"
  >
    <div
      class="bg-opacity-0 backdrop-blur-lg rounded-3xl p-8 shadow-2xl w-full max-w-md transform hover:scale-105 transition-all duration-300"
      @mouseenter="animateEntry"
    >
      <h2
        class="text-4xl font-extrabold text-white mb-6 text-center animate-pulse"
      >
        Create an account
      </h2>
      <form class="space-y-6" @submit.prevent="handleRegister">
        <div class="input-field relative">
          <input
            type="text"
            id="username"
            v-model="username"
            class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 focus:bg-opacity-30 focus:ring-2 focus:ring-purple-300 text-black placeholder-gray-200 transition duration-200"
            placeholder="Username"
            required
          />
          <i class="fas fa-user absolute right-3 top-3 text-white"></i>
        </div>
        <div class="input-field relative mt-4">
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 focus:bg-opacity-30 focus:ring-2 focus:ring-purple-300 text-black placeholder-gray-200 transition duration-200"
            placeholder="Password"
            required
          />
          <i class="fas fa-lock absolute right-3 top-3 text-white"></i>
        </div>
        <div class="input-field relative mt-4">
          <input
            type="password"
            id="passwordConfirm"
            v-model="passwordConfirm"
            class="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 focus:bg-opacity-30 focus:ring-2 focus:ring-purple-300 text-black placeholder-gray-200 transition duration-200"
            placeholder="Confirm Password"
            required
          />
          <i class="fas fa-lock absolute right-3 top-3 text-white"></i>
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-purple-300 transition duration-300 transform hover:scale-105"
        >
          Sign up
          <i class="fas fa-arrow-right ml-2"></i>
        </button>
      </form>
      <p class="text-white text-center mt-6">
        Already have an account?
        <a @click.prevent="navigateToLogin" class="font-bold hover:underline"
          >Sign in here</a
        >
      </p>
      <div
        v-if="errorMessage"
        class="mt-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex justify-center"
      >
        {{ errorMessage }}
      </div>
    </div>
  </section>
  <Dialog
    v-model:visible="showLoginPrompt"
    header="Registration Successful"
    modal
  >
    <p class="mb-4">Registration successful! Do you want to log in now?</p>
    <div class="flex justify-center space-x-4">
      <button
        @click="loginAfterRegister"
        class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
      >
        Log in now
      </button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import axios from "../utils/axios";
import Dialog from "primevue/dialog";
import gsap from "gsap"; // Ensure this import statement is correct

const router = useRouter();

const username = ref("");
const password = ref("");
const passwordConfirm = ref("");
const errorMessage = ref("");
const showLoginPrompt = ref(false);

interface ErrorResponse {
  response: {
    data: string;
  };
}

const handleRegister = async () => {
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = "Passwords do not match";
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
    return;
  }

  try {
    await axios.post("/user/register", {
      username: username.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    });
    showLoginPrompt.value = true;
  } catch (error) {
    console.log("Registration error", error);
    errorMessage.value = (error as ErrorResponse).response.data;
    setTimeout(() => {
      errorMessage.value = "";
    }, 3000);
  }
};

const loginAfterRegister = () => {
  showLoginPrompt.value = false;
  router.replace({ name: "Login" });
};

const navigateToLogin = () => {
  router.push({ name: "Login" });
};

const animateEntry = () => {
  gsap.from(".input-field", {
    opacity: 0,
    x: -50,
    stagger: 0.2,
    duration: 0.8,
    ease: "power2.out",
  });
  gsap.from(".btn", {
    opacity: 0,
    scale: 0.5,
    duration: 0.5,
    delay: 1,
    ease: "elastic.out(1, 0.5)",
  });
};

gsap.to(".fab", {
  y: -10,
  stagger: 0.1,
  duration: 0.8,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
});
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

.input-field {
  display: flex;
  align-items: center;
  position: relative;
}

.input-field input {
  flex: 1;
}

.input-field i {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}
</style>
