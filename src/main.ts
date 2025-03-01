import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./routers";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";

// PrimeVue components
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

app.component("PButton", Button);
app.component("PColumn", Column);
app.component("DataTable", DataTable);
app.component("InputText", InputText);
app.component("IconField", IconField);
app.component("InputIcon", InputIcon);

app.mount("#app");
