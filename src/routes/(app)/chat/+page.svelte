<script lang="ts">
    import Chat from '../../../components/Chat.svelte'
    import Sidebar from '../../../components/Sidebar.svelte'
    import type { PageData } from './$types';

    export let data: PageData;
    $: ({ testTable, user, userChats } = data);
</script>

<main>
    <Sidebar />
    <Chat userChats={userChats} />
</main>

<style>
    main{
        display: flex;
    }
</style>
