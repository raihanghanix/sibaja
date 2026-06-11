import { createRouter, createWebHistory } from "vue-router";
import Index from "../views/Index.vue";

const routes = [
  {
    path: "/",
    component: Index,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes,
});
