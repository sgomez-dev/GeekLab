import { defineStore } from "pinia";
import api from "../api/axios";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(email, password) {
      const res = await api.post("/auth/login", { email, password });
      this.token = res.data.token;
      const payload = decodeJwtPayload(this.token) || {};
      this.user = { username: res.data.username, role: res.data.role, email, id: payload.id };
      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));
    },

    async register(username, email, password) {
      await api.post("/auth/register", { username, email, password });
      // user need to login after register
    },

    initFromToken() {
      if (this.token && this.user && !this.user.id) {
        const payload = decodeJwtPayload(this.token) || {};
        this.user = { ...this.user, id: payload.id };
        localStorage.setItem("user", JSON.stringify(this.user));
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
