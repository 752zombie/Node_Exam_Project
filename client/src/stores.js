import { writable } from "svelte/store";

export const loginStore = writable(sessionStorage.getItem("isLoggedIn") === "true");

export const basketStore = writable([]);
