<script lang="ts">
    import Chat from '../../../components/Chat.svelte'
    import Sidebar from '../../../components/Sidebar.svelte'
    import type { PageData } from './$types';
    import { onMount } from "svelte";
    import { sessionUser } from "../../../lib/store.js"

    export let data: PageData;
    $: ({ userChats, userus } = data);

    onMount(async () => {
        sessionUser.set(userus);
    })
</script>

<main class="main-container">
    <div class="center-container">
        <Sidebar {userus} {$sessionUser}/>
        <Chat {userus} {$sessionUser}/>
    </div>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .main-container {
        height: 100vh;
    }

    .center-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
