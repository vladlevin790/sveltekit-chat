<script lang="ts">
    import Chat from '../../../components/Chat.svelte'
    import Sidebar from '../../../components/Sidebar.svelte'
    import type { PageData } from './$types';

    export let data: PageData;
    $: ({ userChats, userus } = data);

</script>

<main>
    <Sidebar {userus} />
    <Chat {userus}/>
</main>

<style>
    main{
        display: flex;
    }
</style>

