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
		uploadedImage, selectedMessageIndex, timeStatus,newMessageText,users,sessionUser,userIcon,showMenu,newIcon,newName,showUser,messagesContainer
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
				newName.set(' ');
				newIcon.set(' ');
				showMenu.set(false)
				sessionUser.set(null);
				showModal.set(false);
				selectedMessageIndex.set(-1);
				messagesContainer.set([]);
				showUser.set(false);
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
				userIcon.set('');
				newName.set(' ');
				newIcon.set(' ');
				showMenu.set(false)
				sessionUser.set(null);
				showModal.set(false);
				selectedMessageIndex.set(-1)
				showUser.set(false);
				messagesContainer.set([]);
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
	<slot />
	<div class="navbar-menu my-4">
		<div class="navbar-end">
			{#if $page.data.session}
				<form action="/logout" method="post" use:enhance={handleLogout}>
					<button class="signOut" disabled={loading} type="submit">выйти</button>
				</form>
			{/if}
		</div>
	</div>

</main>

<style>
	.signOut{
		width: max-content;
		margin-left: 10px;
		border: none;
		border-radius: 5px;
		background: none;
		color: #949292;
	}
</style>