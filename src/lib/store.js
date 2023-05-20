import {writable} from "svelte/store";

export const messages = writable([]),
    selectedMessageIndex = writable(-1),
    newMessageText = writable(''),
    showModal = writable(false),
    user = writable(null),
    uploadedImage = writable([]),
    users = writable([]),
    searchResults = writable([]),
    selectedUser = writable(null),
    selectedChat = writable(null),
    owner = writable(null),
    timeStatus = writable(null),
    sessionUser = writable(null);