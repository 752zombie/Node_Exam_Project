import { writable } from "svelte/store";
import io from "socket.io-client";


export const userStore = writable({});

export const postStore = writable({});

export const loginStore = writable(sessionStorage.getItem("isLoggedIn") === "true");

export const basketStore = writable([]);

export const socketStore = writable(io());
