<script>
  import '../app.css';
  import { onMount , onDestroy} from 'svelte';
  import { createClient } from "@supabase/supabase-js";
  import { writable } from 'svelte/store';
  import {users, searchResults, selectedUser, selectedChat, owner, newName, newIcon,userIcon, sessionUser,showMenu} from "$lib/store.js";

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
    newIcon.set(''); // Очищаем значение новой ссылки на иконку

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
          searchResults.set([{ username: "Пользователь не найден" }]);
        }
      }
    };

    sessionUser.set(userus);

    searchButton.addEventListener("click", handleSearchButtonClick);

    await checkUserExists();

    await ownerAvatar()

    await loadUsers();
    console.log(userus);

  });

  console.log(userus);

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
          {#if user.user_icon != null}
            <img src={user.user_icon} class="fa-regular fa-user user" />
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
    <div id="user-sections">
      {#each $users as user}
        <section class="section__1" id={`user-section-${user.id}`} on:click={async () => {await startChat(user);}}>
            {#if user.user_icon != null}
              <img src={user.user_icon} class="fa-regular fa-user user" />
            {:else}
              <a href="#" class="fa-regular fa-user user"></a>
            {/if}
          <div class="block__1">
            <p class="User__Name_1" id={`UserName-${user.id}`}>{user.username}</p>
            <p class="User__Status_1" id={`UserStatus-${user.id}`}> last seen: {user.last_login_at.toString()}</p>
          </div>
        </section>
      {/each}

    </div>
  {:else}
    <div></div>
  {/if}

  <section class="footer">
    <div class="footer__content">
      {#each $userIcon as icon}
        {#if icon.user_icon != null}
            <img src={icon.user_icon} class="fa-regular fa-user user" />
          {:else}
            <a href="#" class="fa-regular fa-user user"></a>
        {/if}
      {/each}
      <h2 class="header__2 center">
        <span >Ч</span>
        <span >А</span>
        <span >Т</span>
      </h2>
      <button class="fa-solid fa-gear  rotate" style="color: #ffffff; background: none" on:click={toggleMenu}></button>
    </div>
  </section>


  {#if $showMenu}
    {#each $userIcon as user}
    <div class="menu">
      <form on:submit|preventDefault={updateUser}>
          <button class = "exit_btn" on:click={toggleClose}>X</button>

          <label> имя пользователя : <em>{user.username}</em></label>

          <input class = "new__name" type="text" id="newName" bind:value={$newName}>

          <img class="modal_image" src={user.user_icon} alt="ПУСТО"/>
          <button class="btn_delete_icon" type="button" on:click={clearIcon}>Удалить аватарку</button>

          <label for="newIcon">Ссылка на картинку:</label>
          <input class = "new__icon" type="text" id="newIcon" bind:value={$newIcon}>

        <label>Тема:</label>
        <select id="theme">
          <option value="dark">Темная</option>
          <option value="light">Светлая</option>
        </select>
        <button class="btn-toggle">поменять</button>
        <button class = "btn_save_form" type="submit" on:click={updateUser}  on:click={toggleClose}>Сохранить</button>
      </form>
    </div>
    {/each}
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
  section a {
    margin-right: 20px;
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
    font-size: 20px;
  }

  section img {
    margin-right: 20px;
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

  .btn-toggle{
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

  .btn-toggle:hover{
    background-color: #a1a1a1;
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