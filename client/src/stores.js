import { writable } from "svelte/store";


export const userStore = writable({});

export const postStore = writable({});

export const loginStore = writable(sessionStorage.getItem("isLoggedIn") === "true");

export const basketStore = writable([]);
