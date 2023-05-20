<script lang="ts">
    import Chat from '../../../components/Chat.svelte'
    import Sidebar from '../../../components/Sidebar.svelte'
    import type { PageData } from './$types';
    import {onMount} from "svelte";
    import {sessionUser} from "../../../lib/store.js"

    export let data: PageData;
    $: ({ userChats, userus } = data);

    onMount(async () => {
        sessionUser.set(userus);
    })


</script>

<main>
    <Sidebar {userus} {$sessionUser}/>
    <Chat {userus} {$sessionUser}/>
</main>

<style>
    main{
        display: flex;
    }
</style>

