import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

import {
	selectedUser,
	selectedChat,
	user,
	searchResults,
	owner,
	messages,
	showModal,
	uploadedImage, selectedMessageIndex, timeStatus,newMessageText,users,sessionUser,userIcon,showMenu,newIcon,newName,showUser,messagesContainer,selectedTheme,theme
} from "../../lib/store.js"
import {writable} from "svelte/store";

export const actions: Actions = {
	async default({ locals: { supabase } }) {
		await supabase.auth.signOut();
		selectedChat.set(null);
		selectedUser.set(null);
		user.set(null);
		searchResults.set([]);
		owner.set(null);
		messages.set([]);
		uploadedImage.set([]);
		selectedMessageIndex.set(-1);
		timeStatus.set(null);
		userIcon.set('');
		newName.set(' ');
		newIcon.set(' ');
		showMenu.set(false)
		showModal.set(false);
		selectedMessageIndex.set(-1);
		messagesContainer.set([]);
		showUser.set(false);
		theme.set('');
		selectedTheme.set('');
		sessionUser.set(null);
		throw redirect(303, '/');
	}
};