<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
	let loading = false;

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
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
			<p class="paragraph__header">регистрация</p>
		</div>
		{#if form?.error}
			<div class="block notification is-danger">{form.error}</div>
		{/if}
		{#if form?.message}
			<div class="block notification is-primary">{form.message}</div>
		{/if}
		<div class="block__fields">
		<form method="post" use:enhance={handleSubmit}>
			<div style="display: flex; flex-direction: row; margin-bottom: 10px;">
				<label for="email" class="label">Имя пользователя</label>
				<input id="email" name="email" value={form?.values?.email ?? ''} class="input" type="Почта" placeholder="Почта" required style="flex-grow: 1; margin-left: 10px;"/>
			</div>
			<div style="display: flex; flex-direction: row; margin-bottom: 10px;">
				<label for="password" class="label">Пароль</label>
				<input id="password" name="password" class="input" type="password" placeholder="Пароль" required style="flex-grow: 1; margin-left: 10px;"/>
			</div>
				<button disabled={loading} class="sbt_button">Зарегистрироваться</button>
		</form>
		</div>
		<div class="mt-6">
			<p class="block__register_fields">
				Уже есть аккаунт? <a href="/">Войти</a>
			</p>
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

	input{
		border: 2px solid #443d3d;
		border-radius: 3px ;
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

	.header_text_1,.header__text_2,.paragraph__header {
		margin: 0;
	}

	.sbt_button{
		width: max-content;
		background-color: rgba(133, 94, 119, 0.77);
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		padding-top: 10px;
		margin-left: 80px;
	}

	.block__fields{
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

	.block__register_fields a {
		background: #5E856D ;
		color: white;
		border: none;
		padding: 8px 12px;
		border-radius: 4px;
		cursor: pointer;
		margin-left: 10px;
		text-decoration: none;
		font-size: 10px;
	}

</style>