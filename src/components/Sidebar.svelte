<script>
  import '../app.css';
  import { onMount , onDestroy} from 'svelte';
  import { createClient } from "@supabase/supabase-js";
  import { writable } from 'svelte/store';
  import {users, searchResults, selectedUser, selectedChat, owner, newName, newIcon,userIcon, sessionUser,showMenu,showUser,theme,selectedTheme} from "$lib/store.js";
  import { fade } from 'svelte/transition';


  const supabaseUrl = 'https://vayakipdpailwnuozwvc.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWFraXBkcGFpbHdudW96d3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1Mzk1MzEsImV4cCI6MTk5NjExNTUzMX0.Ax_xuXTtaKDFNRO2TPMMb1aLJMU-f42ufwbeqGP27rA';
  const supabase = createClient(supabaseUrl, supabaseKey);

  export let userus;

  let query = '';
  let searchInput;

  async function checkUserExists()  {
    const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', $sessionUser.id)
            .single();

    if(existingUser !== null){
      const moscowOffset = 3 * 60;
      console.log("пользователь существует")
      const { data: userusIns, error: userurInsError } = await supabase
              .from("users")
              .update({ last_login_at:new Date(Date.now() + moscowOffset * 60 * 1000)})
              .eq('id', $sessionUser.id);
    }else{
      let emailParts = userus.email.split("@");
      let username = emailParts[0];

      const { data: userusIns, error: userurInsError } = await supabase
              .from("users")
              .insert([
                {
                  id: userus.id,
                  username: username,
                  password: $sessionUser.aud,
                  last_login_at: new Date()
                }
              ])
              .single();

      if(userurInsError){
        console.log('ошибка');
      }

    };
  };


  function toggleMenu() {
    showMenu.update(value => !value);
  }

  function toggleClose(){
    showMenu.update(value => !value);
  }

  function toggleMenuUser(){
    showUser.update(value => !value)
  }

  function toggleUserClose(){
    showUser.update(value => !value)
  }

  async function startChat(user) {
    const existingUser = $users.find(u => u.id === user.id);
    if (!existingUser) {
      users.update(value => [...value, user]);
    }

    searchResults.update(value => value.filter(u => u.id !== user.id));
    showMenu.set(false);

    const chatName = `Chat between ${user.username} and ${userus.email}`;

    const { data: existingChatData, error: existingChatError } = await supabase
            .from("user_chat")
            .select("id_chat")
            .in("id_user", [$sessionUser.id, user.id])
            .in("id_owner", [$sessionUser.id, user.id])
            .single();

    if (existingChatData) {
      console.log("Chat with this user already exists!");
      selectedUser.set(user);
      const chatId = existingChatData.id_chat;
      selectedChat.set(chatId);

      const { data: userChatData, error: userChatError } = await supabase
              .from("user_chat")
              .select("*")
              .or(`id_user.eq.${$sessionUser.id},id_owner.eq.${$sessionUser.id}`)
              .limit(1)
              .single();

      if (userChatError) {
        console.error(userChatError);

    } else if (!userChatData) {
        const { data: userChatInsertData, error: userChatInsertError } = await supabase
                .from("user_chat")


        if (userChatInsertError) {
          console.error(userChatInsertError);
        }
      }

      await loadUsers();

      return;
    }

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

    const chatId = lastChatData[0].id;
    console.log(owner);
    const { data: userChatData, error: userChatError } = await supabase
            .from("user_chat")
            .insert([{ id_user: user.id, id_chat: chatId, id_owner: $sessionUser.id }])
            .single();

    if (userChatError) {
      console.error(userChatError);
    } else {
      console.log("Chat created successfully!");
      selectedUser.set(user);
      selectedChat.set(chatId);

      await loadUsers();
    }
  }

  async function loadUsers() {
    const { data: userChatDataLoad, error: userChatError } = await supabase
            .from("user_chat")
            .select("*")
            .or(`id_user.eq.${$sessionUser.id},id_owner.eq.${$sessionUser.id}`);

    if (userChatError) {
      console.error(userChatError);
      return;
    }

    const userIds = userChatDataLoad.map(row => {
      if ($sessionUser.id === row.id_owner) {
        return row.id_user;
      } else if ($sessionUser.id === row.id_user) {
        return row.id_owner;
      }
    });

    const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("*")
            .in("id", userIds);

    if (usersError) {
      console.error(usersError);
      return;
    }

    const updatedUsersData = usersData.map(user => {
      if (user.last_login_at) {
        user.last_login_at = new Date(user.last_login_at).getHours() + ' : ' + new Date(user.last_login_at).getMinutes();
      }
      return user;
    });

    users.set(updatedUsersData);
  }

  async function ownerAvatar(){
    const {data,error} = await supabase.from("users").select("*").eq("id",$sessionUser.id)

    if(data){
      userIcon.set(data)
    }

    if(error){
      console.log("не работает")
    }
  }



  const updateUser = async () => {
    const updatedData = {};

    if ($newName && $newName != ' ') {
      updatedData.username = $newName;
    }

    if ($newIcon && $newIcon != ' ') {
      updatedData.user_icon = $newIcon;
    }

    if (Object.keys(updatedData).length === 0) {
      console.log("No fields to update");
      return;
    }

    const { error } = await supabase
            .from("users")
            .update(updatedData)
            .eq("id", $sessionUser.id);

    if (error) {
      console.error("Error updating user data:", error);
      return;
    }

    await ownerAvatar();
  };



  const clearIcon = async () => {
    newIcon.set('');

    const { error } = await supabase
            .from('users')
            .update({ user_icon: null })
            .eq('id', $sessionUser.id);

    if (error) {
      console.error('Error clearing user icon:', error);
      return;
    }

    ownerAvatar();
  };

  const selectUser = (event, user) => {
    if ($selectedUser.id === user.id) {
      showUser.set(!showUser);
    } else {
      showUser.set(true);
    }
  };



  const deleteChat = async () => {
    const chatId = $selectedChat;
    if (!chatId) {
      console.log("No chat selected");
      return;
    }else if(chatId){
      const {error: chatMessageError} = await supabase.from("message").delete().eq("chat",chatId)
      if(chatMessageError){
        console.log("errorMessage")
      }else{
        const { error: deleteUserChatError } = await supabase
                .from("user_chat")
                .delete()
                .eq("id_chat", chatId);

        if (deleteUserChatError) {
          console.error("Error deleting user chat:", deleteUserChatError);
          return;
        }
        const { error: deleteChatError } = await supabase.from("chat").delete().eq("id", chatId);

        if (deleteChatError) {
          console.error("Error deleting chat:", deleteChatError);
          return;
        }
      }
    }
    selectedChat.set(null);
    selectedUser.set(null);
    showUser.set(false);
    await loadUsers();
  };

  const closeSelectUser = async () =>{
    showUser.set(false);
  }

  function toggleTheme() {
    theme.set($selectedTheme);
  }

  onMount(async () => {
    const searchButton = document.getElementById("search-button");
    searchInput = document.getElementById("search-input");

    selectedTheme.set($theme);

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
          searchResults.set([{ username: "Пользователь не найден" }]);
        }
      }
    };

    sessionUser.set(userus);

    searchButton.addEventListener("click", handleSearchButtonClick);

    await checkUserExists();

    await ownerAvatar()

    await loadUsers();

  });

</script>


<main class="main_sidebar" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
  <section class="block__head">
    <div class="header__1" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
      <button type="submit" class="fa-solid fa-magnifying-glass" id="search-button" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}></button>
      <input type="text" name="search" class="input__search" id="search-input" placeholder="Поиск" bind:value={query} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
    </div>
  </section>
  <div id="search-results" >
    {#if $searchResults.length > 0}
      {#each $searchResults as user}
        <div class="search-result" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
          {#if user.user_icon != null}
            <img src={user.user_icon} class="fa-regular fa-user user" on:click={async () => {await startChat(user);}} width="40" height="41"/>
          {:else}
            <a href="#" class="fa-regular fa-user user"></a>
          {/if}
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
    <div class="user_section" id="user-sections" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
      {#each $users as user , i}
        <section class="section__1" id={`user-section-${user.id}`} on:click={async () => {await startChat(user);}} on:contextmenu={e => selectUser(e, selectedUser)} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
            {#if user.user_icon != null}
              <img src={user.user_icon} class="fa-regular fa-user user" width="40" height="41"/>
            {:else}
              <a href="#" class="fa-regular fa-user user"></a>
            {/if}
          <div class="block__1" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
            <p class="User__Name_1" id={`UserName-${user.id}`} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>{user.username}</p>
            <p class="User__Status_1" id={`UserStatus-${user.id}`} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}> last seen: {user.last_login_at.toString()}</p>
          </div>
        </section>
        {#if $showUser && $selectedChat && $selectedUser.id === user.id}
          <div>
            <div class="delete_chat" transition:fade class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
              <h3 class="delete_chat_header" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Удаление чата</h3>
              <p class="delete_chat_paragraph" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Вы уверены, что хотите удалить чат с пользователем <b>{$selectedUser.username}</b>?</p>
              <div class="delete_chat_exit" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
                <button class="delete_chat_btn" on:click={deleteChat} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Удалить</button>
                <button class="delete_chat_exit_btn" on:click={closeSelectUser} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Отменить</button>
              </div>
            </div>
          </div>
        {/if}
      {/each}

    </div>
  {:else}
    <div></div>
  {/if}

  <section class="footer" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
    <div class="footer__content" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
      {#each $userIcon as icon}
        {#if icon.user_icon != null}
            <img src={icon.user_icon} class="fa-regular fa-user user" width="40" height="41" />
          {:else}
            <a href="#" class="fa-regular fa-user user"></a>
        {/if}
      {/each}
      <h2 class="header__2 center" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
        <span >Ч</span>
        <span >А</span>
        <span >Т</span>
      </h2>
      <button class="fa-solid fa-gear  rotate  gear_btn" on:click={toggleMenu} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}></button>
    </div>
  </section>



  {#if $showMenu}

    {#each $userIcon as user}

    <div class="menu" transition:fade class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>

      <form on:submit|preventDefault={updateUser} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>

          <button class = "exit_btn" on:click={toggleClose} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>X</button>

          <label class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}> имя пользователя : <em>{user.username}</em></label>

          <input class = "new__name" type="text" id="newName" bind:value={$newName} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>

          <img class="modal_image" src={user.user_icon} alt="Аватар не найден"/>

          <button class="btn_delete_icon" type="button" on:click={clearIcon} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Удалить аватарку</button>

          <label for="newIcon" class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Ссылка на картинку:</label>

          <input class = "new__icon" type="text" id="newIcon" bind:value={$newIcon} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}  placeholder="Вставьте ссылку на изображение">

        <label>Тема:</label>
        <select id="theme" bind:value={$selectedTheme} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>
          <option value="dark">Темная</option>
          <option value="light">Светлая</option>
        </select>
        <button class = "btn_save_form" type="submit" on:click={updateUser}  on:click={toggleClose} class:dark={$selectedTheme === 'dark'} class:light={$selectedTheme === 'light'}>Сохранить</button>
      </form>
    </div>
    {/each}
  {/if}

</main>

<style>
  main.light {
    border: white;
    background-color: #ffffff;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.35);
  }

  main{
    border: 2px solid black;
    border-radius: 10px;
    min-height: 550px;
    display: flex;
    flex-direction: column;
    transition: .3s all;
  }

  .header__1{
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    width: max-content;
    display:flex ;
    margin-left: auto;
    margin-right: auto;
    background: #645656;
    transition: .3s all;
  }

  .header__1.light{
    background: #646256;
    border: white;
  }

  input.light{
    color: white;
    background: #646256;
  }

  button.light{
    background: #646256;
  }
  main{
    padding: 10px;
    padding-top: 10px;
    transition: .3s all;
  }
  .section__1{
    border: 2px solid black;
    border-radius: 10px;
    max-width: 300px;
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
    transition: .3s all;
  }

  .section__1.light{
    background: #646256;
    color: white;
    border: white;
  }

  .section__1.light:hover{
    background: rgba(100, 98, 86, 0.93);
  }

  section a {
    margin-right: 20px;
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    font-size: 20px;
    transition: .3s all;
  }

  section img {
    margin-right: 20px;
    transition: .3s all;
  }

  .block__1{
    line-height: 0;
    transition: .3s all;
  }

  button{
    border:none;
    background-color: #645656 ;
    font-size: 15px;
    color:#C8C7C7;
    transition: .3s all;
  }

  input{
    border-radius:5px ;
    border: none;
    background: #645656;
    color: white;
    transition: .3s all;
  }

  .user{
    border-radius: 30px;
    text-align: center;
    transition: .3s all;
  }

  a:active {
    transform: scale(0.9);
  }

  img:active {
    transform: scale(0.9);
  }

  button:active {
    transform: scale(0.9);
  }

  .section__1:active {
    transform: scale(0.95);
  }

  .section__1:hover{
    background: #736868;
    box-shadow: 1px 2px 3px black;
  }

  .footer{
    margin-top: auto;
    transition: .3s all;
  }

  .footer.light{
    text-shadow: 1px 1px 1px #000;
  }


  .header__2.light{
    text-shadow: 0px 0px 0px #000;
    color: rgba(100, 98, 86, 0.93);

  }

  .gear_btn.light{
    color: rgba(100, 98, 86, 0.93);
    background: none;
  }

  .gear_btn{
    color: #ffffff;
    background: none;
  }

  .footer__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: .3s all;
  }


  .center {
    color: white;
    text-align: center;
    transition: .3s all;
  }

  .user_section{
    overflow-y: scroll;
    transition: .3s all;
  }

  .delete_chat{
    background: #645656;
    border: 2px solid black;
    border-radius: 10px;
    max-width: 150px;
    color: white;
    padding: 10px;
    margin-left: auto;
    margin-right: auto;
    transition: .3s all;
  }

  .delete_chat.light{
    background: #646256;
  }

  .delete_chat_exit{
    display: flex;
    transition: .3s all;
  }

  .delete_chat_btn{
    color: #ffffff;
    cursor: pointer;
    transition: .3s all;
  }

  .delete_chat_btn:hover{
    color: rgba(245, 245, 245, 0.75);
  }

  .delete_chat_exit_btn{
    color: #ffffff;
    cursor: pointer;
    transition: .3s all;
  }

  .delete_chat_exit_btn:hover{
    color: rgba(245, 245, 245, 0.75);
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
    transition: .3s all;
  }

  .menu-content {
    width:max-content;
    background-color: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    transition: .3s all;
  }

  .menu form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: .3s all;
  }

  .menu label {
    font-size: 16px;
    font-weight: bold;
    transition: .3s all;
  }

  .menu input[type="text"],
  .menu input[type="password"],
  .menu input[type="file"],
  .menu select {
    padding: 10px;
    border: none;
    border-radius: 5px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    transition: .3s all;
  }

  form button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #645656;
    color: #ffffff;
    font-size: 16px;
    cursor: pointer;
    transition: .3s all;
  }

  form button:hover {
    background-color: #a1a1a1;
    transition: .3s all;
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
    transition: .3s all;
  }

  a {
    margin-right: 20px;
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    font-size: 20px;
    transition: .3s all;
  }

  img{
    border: 2px solid black;
    border-radius: 10px;
    font-size: 20px;
    max-width: 40px;
    min-height: 41px;
    transition: .3s all;
  }

  .rotate {
    display: inline-block;
    transition: transform 0.5s ease;
  }

  .rotate:hover {
    transform: rotate(360deg);
    text-shadow: 1px 2px 3px rgba(220, 220, 253, 0.69);
  }

  .header__2 {
    display: inline-block;
    font-weight: bold;
    text-transform: uppercase;
    color: white;
    position: relative;
    transition: .3s all;
  }

  .header__2:hover span {
    animation: shuffle 1s ease-in-out;
    animation-fill-mode: forwards;
  }

  .modal_image{
    max-width: 200px;
    min-height: 150px;
    margin-left: 10px;
  }

  .exit_btn{
    background: none;
    margin-left: 200px;
    transition: .3s all;
  }

  .btn_delete_icon{
    border-radius: 6px;
    color: white;
    transition: .3s all;
  }

  .exit_btn:hover{
    color: #ff0a0a;
  }

  .btn_delete_icon:hover{
    background-color: #a1a1a1;
  }


  .exit_btn.light{
    background: none;
    font-size: larger;
  }

  form button.light{
    background: #646256;
    border: white;
  }

  form button.light:hover{
    background: #a2a097;
  }

  @keyframes shuffle {
    0% {
      transform: translateY(0) rotate(0);
    }
    25% {
      transform: translateY(-2rem) rotate(90deg);
    }
    50% {
      transform: translateY(-4rem) rotate(180deg);
    }
    75% {
      transform: translateY(-2rem) rotate(270deg);
    }
    100% {
      transform: translateY(0) rotate(360deg);
    }
  }

  .header__2 span {
    display: inline-block;
    position: relative;
    transition: all .3s ease;
  }

  .header__2 span:nth-child(1) {
    animation-delay: 0.05s;
  }

  .header__2 span:nth-child(2) {
    animation-delay: 0.1s;
  }

  .header__2 span:nth-child(3) {
    animation-delay: 0.15s;
  }

  .header__2 span:nth-child(4) {
    animation-delay: 0.2s;
  }


</style>