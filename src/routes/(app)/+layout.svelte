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
		uploadedImage, selectedMessageIndex, timeStatus,newMessageText,users,sessionUser,userIcon,showMenu,newIcon,newName,showUser,messagesContainer,selectedTheme,theme
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
				showModal.set(false);
				selectedMessageIndex.set(-1);
				messagesContainer.set([]);
				showUser.set(false);
				theme.set('');
				selectedTheme.set('');
				sessionUser.set(null);
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
				showModal.set(false);
				selectedMessageIndex.set(-1)
				showUser.set(false);
				messagesContainer.set([]);
				theme.set('');
				selectedTheme.set('');
				sessionUser.set(null);
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


{#if $selectedTheme === 'dark'}
	<style>
		body {
			background-color: #000000;
			color: #ffffff;
		}
	</style>
{:else if $selectedTheme === 'light'}
	<style>
		body {
			background-color: #64727C;
			color: #000000;
		}
	</style>
{/if}

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