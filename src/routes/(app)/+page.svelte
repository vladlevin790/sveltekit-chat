<script lang="ts">
	import "../../app.css";
	import { goto } from "$app/navigation";
	import type { ActionData } from './$types';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';

	export let form: ActionData;
	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidate('supabase:auth');
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};
</script>

<main>
	<section class="columns mt-6 pt-6">
		<div class="column is-half is-offset-one-quarter">
			<div class="header_login">
				<h1 class="header_text_1">Communique</h1>
				<h1 class="header__text_2">APP</h1>
				<p class="paragraph__header">вход</p>
			</div>
			{#if form?.error}
				<div class="block notification is-danger">{form.error}</div>
			{/if}
			<div class="block__fields">
				<form method="post" use:enhance={handleSubmit} style="display: flex; flex-direction: column;">
					<div class="input__container">
						<label for="email" class="label">Имя пользователя</label>
						<div class="input__wrapper">
							<input id="email" name="email" value={form?.values?.email ?? ''} class="input" type="email" placeholder="Email" required />
						</div>
					</div>
					<div class="input__container">
						<label for="password" class="label">Пароль</label>
						<div class="input__wrapper">
							<input id="password" name="password" class="input" type="password" placeholder="Пароль" required />
						</div>
					</div>
					<button disabled={loading} class="sbt_button">Войти</button>
				</form>
			</div>
			<div class="block__register_fields">
				<p>Нет учетной записи?</p>
				<button on:click={() => goto('/signup')}>Зарегистрироваться</button>
			</div>
		</div>
	</section>
</main>

<style>
	body {
		margin: auto;
	}

	main {
		margin-top: 200px;
		border: 2px solid black;
		border-radius: 10px;
		width: max-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		align-self: center;
		padding: 10px;
		background: #645656;
		box-shadow: 4px 4px 8px #3771B6;
	}

	input {
		width: 100%;
		border: 2px solid #443d3d;
		border-radius: 3px;
		padding: 5px;
		background: #645656;
		color: white;
	}

	.header_login {
		display: block;
		text-shadow: 1px 2px 4px rgba(255, 6, 6, 0.82);
		font-size: 20px;
		font-style: italic;
		margin: 0;
		text-align: center;
	}

	.header_text_1,
	.header__text_2,
	.paragraph__header {
		margin: 0;
	}

	.sbt_button {
		width: max-content;
		background: #5e856d;
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		align-self: end;
		padding-top: 10px;
	}

	.block__fields {
		padding-top: 30px;
		color: white;
	}

	.block__register_fields {
		padding-top: 20px;
		display: flex;
		align-items: center;
	}

	.block__register_fields p {
		margin-right: 10px;
	}

	.block__register_fields button {
		background-color: rgba(133, 94, 119, 0.77);
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
	}

	.input__container {
		display: flex;
		flex-direction: row;
		margin-bottom: 10px;
	}

	.input__container .label {
		width: 150px;
		text-align: right;
	}

	.input__wrapper {
		display: flex;
		flex-grow: 1;
		margin-left: 10px;
		max-width: 200px;
	}
</style>
