<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		selectedUser,
		selectedChat,
		user,
		searchResults,
		owner,
		messages,
		showModal,
		uploadedImage, selectedMessageIndex, timeStatus,newMessageText,users,sessionUser,userIcon
	} from "../../lib/store.js"


	let loading = false;

	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
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
				sessionUser.set(null)
				await invalidate('supabase:auth');
			} else {
				selectedChat.set(null);
				selectedUser.set(null);
				user.set(null);
				searchResults.set([]);
				owner.set(null);
				messages.set([]);
				uploadedImage.set([]);
				selectedMessageIndex.set(-1);
				timeStatus.set(null);
				await applyAction(result);
			}
			loading = false;
		};
	};
</script>

<svelte:head>
	<title>Сhat</title>
</svelte:head>

<main class="container is-max-desktop">
	<div class="navbar-menu my-4">
		<div class="navbar-end">
			{#if $page.data.session}
				<form action="/logout" method="post" use:enhance={handleLogout}>
					<button class="signOut" disabled={loading} type="submit">выйти</button>
				</form>
			{/if}
		</div>
	</div>

	<slot />
</main>

<style>
	.signOut{
		width: max-content;
		margin-left: 10px;
		border: none;
		border-radius: 5px;
		background: #333333;
		color: #949292;
	}
</style>