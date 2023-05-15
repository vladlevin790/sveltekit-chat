<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { createClient } from "@supabase/supabase-js";
  import { writable } from 'svelte/store';
  import Chat from "./Chat.svelte";
  import {users,searchResults,user} from "$lib/store.js";

  const supabaseUrl = "https://vayakipdpailwnuozwvc.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWFraXBkcGFpbHdudW96d3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1Mzk1MzEsImV4cCI6MTk5NjExNTUzMX0.Ax_xuXTtaKDFNRO2TPMMb1aLJMU-f42ufwbeqGP27rA";
  const supabase = createClient(supabaseUrl, supabaseKey);

  let query = '';

  let searchInput;
  let showMenu = writable(false);

  function toggleMenu() {
    showMenu.update(value => !value);
  }

  async function startChat(user) {
    const existingUser = $users.find(u => u.id === user.id);
    if (!existingUser) {
      users.update(value => [...value, user]);
    }

    searchResults.update(value => value.filter(u => u.id !== user.id));
    showMenu.set(false);

    const chatName = `Chat with ${user.username}`;

    const { data: chatData, error: chatError } = await supabase
            .from("chat")
            .insert([{ name: chatName }])
            .single();

    if (chatError) {
      console.error(chatError);
      return;
    }

    const { data: lastChatData, error: lastChatError } = await supabase
            .from("chat")
            .select("id")
            .order("id", { ascending: false })
            .limit(1);

    if (lastChatError) {
      console.error(lastChatError);
      return;
    }

    const chatId = lastChatData[0].id; // Идентификатор последнего чата

    const { data: userChatData, error: userChatError } = await supabase
            .from("user_chat")
            .insert([{ id_user: user.id, id_chat: chatId }]);

    if (userChatError) {
      console.error(userChatError);
    } else {
      console.log("Chat created successfully!");
    }
  }



  async function loadUsers() {
    const { data: userChatDataLoad, error: userChatError } = await supabase
            .from("user_chat")
            .select("id_user")
            .eq("id_chat",8);

    if (userChatError) {
      console.error(userChatError);
      return;
    }

    const userIds = userChatDataLoad.map(row => row.id_user);

    const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("*")
            .in("id", userIds);

    if (usersError) {
      console.error(usersError);
      return;
    }

    users.set(usersData);
  }

  onMount(async () => {
    const searchButton = document.getElementById("search-button");
    searchInput = document.getElementById("search-input");

    const handleSearchButtonClick = async () => {
      query = searchInput.value.trim();

      if (query.length > 0) {
        const { data, error } = await supabase
                .from("users")
                .select("*")
                .ilike("username", `%${query}%`)
                .limit(10);

        if (error) {
          console.error(error);
          return;
        }

        if (data.length > 0) {
          searchResults.set(data);
        } else {
          searchResults.set([{ username: "Пользователь не найден"          }]);
        }
      }
    };

    searchButton.addEventListener("click", handleSearchButtonClick);

    const menu = document.querySelector('.menu');
    const settingsBtn = document.querySelector('.fa-solid.fa-gear');

    document.addEventListener('click', (event) => {
      if (event.target !== menu && event.target !== settingsBtn) {
        showMenu.set(false);
      }
    });

    const themeSelect = document.getElementById("theme");
    const body = document.querySelector("body");

    await loadUsers();
  });

  export let loggedIn;
  export let data;
</script>


<main class="main_sidebar">

  <section class="block__head">
    <div class="header__1">
      <button type="submit" class="fa-solid fa-magnifying-glass" id="search-button"></button>
      <input type="text" name="search" class="input__search" id="search-input" placeholder="Поиск" bind:value={query}>
    </div>
  </section>
  <div id="search-results">
    {#if $searchResults.length > 0}
      {#each $searchResults as user}
        <div class="search-result">
          <a href="#" class="fa-regular fa-user user" on:click={() => startChat(user)}></a>
          <div>{user.username}</div>
        </div>
      {/each}
    {:else}
      {#if $searchResults.length === 0}
        {#if query && query.trim().length > 0}
          <div>Пользователь не найден</div>
        {/if}
      {/if}
    {/if}
  </div>

  {#if $users.length > 0}
    <div id="user-sections">
      {#each $users as user}
        <section class="section__1" id={`user-section-${user.id}`}>
          <a href="#" class="fa-regular fa-user user" on:click={() => startChat(user)}></a>
          <div class="block__1">
            <p class="User__Name_1" id={`UserName-${user.id}`}>{user.username}</p>
            <p class="User__Status_1" id={`UserStatus-${user.id}`}>last seen {user.last_login_at}</p>
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <div></div>
  {/if}

  <section class="footer">
    <div class="footer__content">
      <a href="#" class="fa-regular fa-user user"></a>
      <h2 class="header__2 center">Chat</h2>
      <button class="fa-solid fa-gear" style="color: #ffffff; background: none" on:click={toggleMenu}></button>
    </div>
  </section>

  {#if $showMenu}
    <div class="menu">
      <form >
        <label>Тема:</label>
        <select id="theme">
          <option value="dark">Темная</option>
          <option value="light">Светлая</option>
        </select>
        <button class="btn-toggle">поменять</button>
        <button type="submit">Сохранить</button>
      </form>
    </div>
  {/if}

</main>


<style>
  main{
    border: 2px solid black;
    border-radius: 10px;
    height: 550px;
    display: flex;
    flex-direction: column;
  }

.header__1{
  border: 2px solid;
  border-radius: 10px;
  padding: 10px;
  width: max-content;
  display:flex ;
  margin-left: auto;
  margin-right: auto;
  background: #645656;
}

main{
  padding: 10px;
  padding-top: 10px;
}
.section__1{
  border: 2px solid black;
  border-radius: 10px;
  width: max-content;
  display: flex;
  height: 30px;
  align-items: center;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 20px;
  margin-left: auto;
  margin-right: auto;
  background: #645656;
}
section a {
  margin-right: 20px;
  border: 2px solid black;
  border-radius: 10px;
  padding: 10px;
  font-size: 20px;
}

.block__1{
  line-height: 0;
}

button{
        border:none;
        background-color: #645656 ;
        font-size: 15px;
        color:#C8C7C7;
}

input{
  border-radius:5px ;
  border: none;
  background: #645656;
  color: white;
}

.user{
  border-radius: 30px;
  text-align: center;
}

a:active {
  transform: scale(0.9);
}

button:active {
  transform: scale(0.9);
}

.section__1:active {
  transform: scale(0.95);
}

.footer{
  margin-top: auto;
}
  .footer__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .center {
    color: white;
    text-align: center;
  }
  .menu {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background: rgba(46, 42, 42, 0.76);
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    color: white;
  }

  .menu-content {
    width:max-content;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .menu form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .menu label {
    font-size: 16px;
    font-weight: bold;
  }

  .menu input[type="text"],
  .menu input[type="password"],
  .menu input[type="file"],
  .menu select {
    padding: 10px;
    border: none;
    border-radius: 5px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  }

  .menu button[type="submit"] {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #645656;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
  }

  .menu button[type="submit"]:hover {
    background-color: #a1a1a1;
  }

  .search-result{
    border: 2px solid black;
    border-radius: 10px;
    width: max-content;
    display: flex;
    height: 30px;
    align-items: center;
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 20px;
    margin-left: auto;
    margin-right: auto;
    background: #645656;
  }

  a {
    margin-right: 20px;
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    font-size: 20px;
  }

  main.dark {
    background-color: #333 !important;
    color: #fff !important;
  }

  main.light {
    background-color: #fff !important;
    color: #333 !important;
  }

</style>