import {writable} from "svelte/store";

export const messages = writable([]),
    selectedMessageIndex = writable(-1),
    newMessageText = writable(''),
    showModal = writable(false),
    user = writable(null),
    uploadedImage = writable(null),
    users = writable([]),
    searchResults = writable([]),
    theme = writable('light');