<script>
  import "../app.css"
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { createClient } from '@supabase/supabase-js';
  import { readable, derived } from 'svelte/store';
  import { messages,selectedMessageIndex,newMessageText,showModal,uploadedImage,user,users,selectedUser,selectedChat} from '../lib/store.js'
  import { onDestroy } from "svelte";
  import { invalidate } from "$app/navigation";

  const supabaseUrl = 'https://vayakipdpailwnuozwvc.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWFraXBkcGFpbHdudW96d3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1Mzk1MzEsImV4cCI6MTk5NjExNTUzMX0.Ax_xuXTtaKDFNRO2TPMMb1aLJMU-f42ufwbeqGP27rA';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { subscribe, set, update } = writable(0);

  // export async function addMessage(event) {
  //   if ($newMessageText.trim() === '') {
  //     return;
  //   }
  //
  //   const words = $newMessageText.trim().split(' ');
  //   let newMessageTextFormatted = '';
  //
  //   let currentLineLength = 0;
  //   for (let i = 0; i < words.length; i++) {
  //     const word = words[i];
  //     if (word.length > 20) {
  //       const slicedWord = word.slice(0, 20);
  //       newMessageTextFormatted += slicedWord + '\n';
  //       currentLineLength = 0;
  //       for (let j = 20; j < word.length; j += 20) {
  //         const nextSlice = word.slice(j, j + 20);
  //         newMessageTextFormatted += nextSlice + '\n';
  //       }
  //     } else if (currentLineLength + word.length > 20) {
  //       newMessageTextFormatted += '\n';
  //       currentLineLength = 0;
  //       i--;
  //     } else {
  //       newMessageTextFormatted += word + ' ';
  //       currentLineLength += word.length + 1;
  //     }
  //   }
  //
  //   let messageText = newMessageTextFormatted.substring(0, 100);
  //
  //   console.log(123);
  //
  //   if (newMessageTextFormatted.length > 100) {
  //     messageText += '...';
  //   }
  //
  //   const { data, error } = await supabase.from('message').insert({
  //     message: messageText,
  //     time: new Date()
  //   });
  //
  //   if (error) {
  //     console.error(error);
  //   } else {
  //     messages.set([...$messages, data]);
  //   }
  //
  //   newMessageText.set('');
  //   uploadedImage.set(null);
  //   event.preventDefault();
  // }

  export async function addMessage(event) {
    if ($newMessageText.trim() === '') {
      return;
    }

    const words = $newMessageText.trim().split(' ');
    let newMessageTextFormatted = '';

    let currentLineLength = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.length > 20) {
        const slicedWord = word.slice(0, 20);
        newMessageTextFormatted += slicedWord + '\n';
        currentLineLength = 0;
        for (let j = 20; j < word.length; j += 20) {
          const nextSlice = word.slice(j, j + 20);
          newMessageTextFormatted += nextSlice + '\n';
        }
      } else if (currentLineLength + word.length > 20) {
        newMessageTextFormatted += '\n';
        currentLineLength = 0;
        i--;
      } else {
        newMessageTextFormatted += word + ' ';
        currentLineLength += word.length + 1;
      }
    }

    let messageText = newMessageTextFormatted.substring(0, 100);

    console.log(123);

    if (newMessageTextFormatted.length > 100) {
      messageText += '...';
    }

    const { data: chatData, error: chatError } = await supabase
            .from('chat')
            .select('id')
            .eq('id', $selectedChat)
            .single();

    if (chatError) {
      console.error(chatError);
      return;
    }

    const chatId = chatData.id;

    const { data, error } = await supabase.from('message').insert({
      message: messageText,
      time: new Date(),
      user_id: $selectedUser.id,
      chat: chatId
    });

    if (error) {
      console.error(error);
    } else {
      messages.set([...$messages, data]);

    }

    newMessageText.set('');
    uploadedImage.set(null);
    event.preventDefault();
  }



  export function selectMessage(event, index) {
    const messagesArray = $messages;
    newMessageText.set(messagesArray[index].message);
    selectedMessageIndex.set(index);
    showModal.set(true);
    loadChat();
  }



  export async function deleteMessage(index) {
    const id = $messages[index].id;
    const { error } = await supabase.from('message').delete().eq('id', id);

    if (error) {
      console.error(error);
    } else {
      messages.update(msgs => msgs.filter((_, i) => i !== index));
    }
  }

  export async function editMessage() {
    if ($selectedMessageIndex === -1 || $newMessageText.trim() === '') {
      return;
    }

    const id = $messages[$selectedMessageIndex].id;
    const { data, error } = await supabase
            .from('message')
            .update({
              message: $newMessageText,
              time: new Date()
            })
            .eq('id', id);

    if (error) {
      console.error(error);
    } else {
      selectedMessageIndex.set(-1);
      messages.update(msgs => {
        return msgs.map((message, i) => {
          if (i === $selectedMessageIndex) {
            return data;
          }
          return message;
        });
      });
    }

    newMessageText.set('');
    uploadedImage.set(null);
    showModal.set(false);
  }



  export function cancelEdit() {
    selectedMessageIndex.set(-1);
    newMessageText.set('');
    uploadedImage.set(null);
    showModal.set(false);
  }

  async function fetchMessages() {
    const { data: messagesData, error: messagesError } = await supabase.from('message').select('*').order('time', { ascending: false });
    const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);

    if (messagesError) {
      console.error(messagesError);
    } else {
      messages.set(messagesData);
    }

    if (userError) {
      console.error(userError);
    } else if (userData.length > 0) {
      user.set(userData[0]);
    }
  }


  onMount(async () => {

    await fetchMessages();

    const { data, error } = await supabase.from('message').select('*').order('time', { ascending: false });
    const buttonSend = document.getElementById('button_send');

    if (error) {
      console.error(error);
    } else {
      messages.set(data);
      console.log($messages);
    }


    const pollInterval = setInterval(fetchMessages, 5);

    onDestroy(() => {
      clearInterval(pollInterval);
    });
  });

  const selectedMessage = derived(
          [messages, selectedMessageIndex],
          ([$messages, $selectedMessageIndex]) => $selectedMessageIndex !== -1 ? $messages[$selectedMessageIndex] : null
  );

  function handleUserClick(user) {
    $users.set([user]);
  }


  export const loadChat = async () => {
    const { data, error } = await supabase
            .from('message')
            .select()
            .eq('chat', $selectedChat)
            .order('id', { ascending: true });

    if (error) {
      console.error(error);
    } else {
      messages.set(data);
    }

    const mySubscription = supabase
            .from('message')
            .eq('chat', $selectedChat)
            .on('INSERT', (payload) => {
              if (payload.new.chat === $selectedChat) {
                messages.set([...$messages, payload.new]);
                messages.update((msgs) => msgs.filter((m) => m.chat === $selectedChat));
              }
            })
            .subscribe();

    return mySubscription;
  };

</script>

<main class="main_chat">
  <section class="chat__header section__1">
    {#if $selectedUser}
      <a href="#" class="fa-regular fa-user user"></a>
      <div class="block__1">
        <p class="User__Name_1" id="UserName1">{$selectedUser.username}</p>
        <p class="User__Status_1" id="UserStatus1">last seen {$selectedUser.last_login_at}</p>
      </div>
    {:else}
      <p class="welcome-message">Привет!)</p>
    {/if}
  </section>


  {#if $selectedUser && $selectedChat}
  <section class="section__2" id="chatId">
    <div class="messages__1" id="messages1">

      {#each $messages as message, i}
        {#if message && message.chat === $selectedChat}
          <div class="message__1" on:contextmenu|preventDefault={(event) => selectMessage(event, i)}>
            {#if message && message.message}
              <p class="paragraph_1">{message.message}</p>
            {/if}
          </div>
        {/if}


      {#if $showModal && $selectedMessageIndex === i}
          <div class="modal">
            <div class="modal-content">
              <h2>Изменить сообщение</h2>
              <form on:submit|preventDefault={editMessage}>
                <div class="buttons">
                  <button type="submit">сохранить</button>
                  <button type="button" on:click={() => cancelEdit()}>отменить</button>
                  <button on:click={() => deleteMessage($selectedMessageIndex)}>удалить</button>
                </div>
              </form>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </section>
  {:else}
    <section class="section__2">
     <p class="recomendation_message">Активных чатов пока нет, перейдите на окно слева и начните новый чат.</p>
    </section>
  {/if}

  <section class="section__3">
    <div>
      <form enctype="multipart/form-data" on:submit="{addMessage}">
        <!-- <input class="fa-regular fa-paperclip" id="buttonClip" type="file" on:change="{handleFileUpload}"> -->
        <input class="input_message" id="message" type="text" placeholder="Введите сообщение" bind:value="{$newMessageText}">
        <button id="button_send" type="submit" class="fa-sharp fa-regular fa-paper-plane"></button>
      </form>
    </div>
  </section>
</main>

<style>
    main{
        margin-top: 10px;
        border: 2px solid black;
        border-radius: 10px;
        max-height: 570px;
    }

    .chat__header{
        border: 2px solid black;
        border-radius: 10px;
        width: max-content;
        display: flex;
        max-height: 25px;
        align-items: center;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 20px;
        margin-left: auto;
        margin-right: auto;
        background: #645656;
    }

    a:active {
        transform: scale(0.9);
    }

    .section__1:active {
        transform: scale(0.95);
    }

    .recomendation_message{
      width: max-content;
      border: 2px solid black;
      border-radius: 10px;
      padding: 10px;
      margin-top: 200px;
      margin-left: auto;
      margin-right: auto;
      background: #A636FE;
      white-space: pre-wrap;
    }
    section a {
        margin-right: 20px;
        border: 2px solid black;
        border-radius: 30px;
        padding: 10px;
        font-size: 20px;
    }

    .block__1{
        line-height: 0;
    }

    .section__2 {
        background-image: url("../routes/(app)/images/blacktheme.jpg");
        background-repeat: no-repeat;
        background-size: 100%;
        border: 2px solid black;
        border-radius: 1px;
        height: 440px;
        overflow-y: auto;
        backdrop-filter: blur(5px);
        box-shadow: 1px 1px 1px black;
    }

    .messages__1{
        display: grid;
    }

    .message__1{
        width: max-content;
        border: 2px solid black;
        border-radius: 10px;
        padding: 10px;
        margin-top: 10px;
        margin-right: 10px;
        justify-self: end;
        background: #A636FE;
        white-space: pre-wrap;
    }

    .modal{
        display: flex;
        border:2px solid black;
        background: #A636FE;
        width: max-content;
        border-radius: 10px;
        padding: 10px;
        margin-top: 10px;
        margin-right: 10px;
        justify-self: end;
        color: white;
    }

    .paragraph_1{
        margin: 0;
    }

    .section__3{
        display: grid;
        padding: 10px;
        border: 2px solid black;
        width:max-content;
        border-radius: 10px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 7px;
        background: #645656;
    }

    input{
        border: none;
        background: #645656;
        color: white;
    }

    button{
        border:none;
        background-color: #645656 ;
        font-size: 15px;
        color:#C8C7C7;
    }

    button:active {
        transform: scale(0.9);

    }
</style>