import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import {selectedUser,selectedChat} from "../../lib/store.js"

export const actions: Actions = {
	async default({ locals: { supabase } }) {
		await supabase.auth.signOut();
		selectedChat.set(null);
		selectedUser.set(null);
		throw redirect(303, '/');
	}
};
