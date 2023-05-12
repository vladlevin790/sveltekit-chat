<!--<script>-->
<!--  import { onMount } from 'svelte';-->
<!--  import {writable} from "svelte/store";-->
<!--  import { createClient } from '@supabase/supabase-js';-->

<!--  const supabaseUrl = 'https://vayakipdpailwnuozwvc.supabase.co';-->
<!--  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWFraXBkcGFpbHdudW96d3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1Mzk1MzEsImV4cCI6MTk5NjExNTUzMX0.Ax_xuXTtaKDFNRO2TPMMb1aLJMU-f42ufwbeqGP27rA';-->
<!--  const supabase = createClient(supabaseUrl, supabaseKey);-->

<!--  let messages =writable([]);-->
<!--  let newMessageText = writable('');-->
<!--  let selectedMessageIndex = writable(-1);-->
<!--  let showModal = writable(false);-->
<!--  let uploadedImage = writable(null);-->

<!--  async function addMessage(event) {-->

<!--    if (newMessageText.trim() === '') {-->
<!--      return;-->
<!--    }-->

<!--    const words = newMessageText.trim().split(' ');-->
<!--    let newMessageTextFormatted = '';-->

<!--    let currentLineLength = 0;-->
<!--    for (let i = 0; i < words.length; i++) {-->
<!--      const word = words[i];-->
<!--      if (word.length > 20) {-->
<!--        const slicedWord = word.slice(0, 20);-->
<!--        newMessageTextFormatted += slicedWord + '\n';-->
<!--        currentLineLength = 0;-->
<!--        for (let j = 20; j < word.length; j += 20) {-->
<!--          const nextSlice = word.slice(j, j + 20);-->
<!--          newMessageTextFormatted += nextSlice + '\n';-->
<!--        }-->
<!--      } else if (currentLineLength + word.length > 20) {-->
<!--        newMessageTextFormatted += '\n';-->
<!--        currentLineLength = 0;-->
<!--        i&#45;&#45;;-->
<!--      } else {-->
<!--        newMessageTextFormatted += word + ' ';-->
<!--        currentLineLength += word.length + 1;-->
<!--      }-->
<!--    }-->
<!--    let messageText = newMessageTextFormatted.substring(0, 100);-->
<!--    if (newMessageTextFormatted.length > 100) {-->
<!--      messageText += '...';-->
<!--    }-->

<!--    const { data, error } = await supabase.from('message').insert({-->
<!--      message: messageText,-->
<!--      time: new Date()-->
<!--    });-->

<!--    if (error) {-->
<!--      console.error(error);-->
<!--    } else {-->
<!--      messages.push(data);-->
<!--    }-->

<!--    newMessageText = '';-->
<!--    uploadedImage = null;-->
<!--    event.preventDefault();-->
<!--  }-->

<!--  function selectMessage(event, index) {-->
<!--    event.preventDefault();-->
<!--    selectedMessageIndex = index;-->
<!--    newMessageText = messages[selectedMessageIndex].message;-->
<!--    showModal = true;-->
<!--  }-->

<!--  function handleFileUpload(event) {-->
<!--    const file = event.target.files[0];-->
<!--    const reader = new FileReader();-->

<!--    reader.onload = (event) => {-->
<!--      uploadedImage = event.target.result;-->
<!--    };-->

<!--    reader.readAsDataURL(file);-->
<!--  }-->

<!--  async function deleteMessage(index) {-->
<!--    const id = messages[index].id;-->
<!--    const { error } = await supabase.from('message').delete().eq('id', id);-->

<!--    if (error) {-->
<!--      console.error(error);-->
<!--    } else {-->
<!--      messages = messages.filter((_, i) => i !== index);-->
<!--    }-->
<!--  }-->

<!--  async function editMessage() {-->
<!--    if (selectedMessageIndex === -1 || newMessageText.trim() === '') {-->
<!--      return;-->
<!--    }-->

<!--    const id = messages[selectedMessageIndex].id-->
<!--    const { data, error } = await supabase-->
<!--            .from('message')-->
<!--            .update({-->
<!--              message: newMessageText,-->
<!--              time: new Date()-->
<!--            })-->
<!--            .eq('id', id);-->
<!--    if (error) {-->
<!--      console.error(error);-->
<!--    } else {-->
<!--      messages = messages.map((message, i) => {-->
<!--        if (i === selectedMessageIndex) {-->
<!--          return data;-->
<!--        }-->
<!--        return message;-->
<!--      });-->
<!--    }-->

<!--    selectedMessageIndex = -1;-->
<!--    newMessageText = '';-->
<!--    uploadedImage = null;-->
<!--    showModal = false;-->
<!--  }-->

<!--  function cancelEdit() {-->
<!--    selectedMessageIndex = -1;-->
<!--    newMessageText = '';-->
<!--    uploadedImage = null;-->
<!--    showModal = false;-->
<!--  }-->

<!--  onMount(async () => {-->
<!--    const { data, error } = await supabase.from('message').select('*').order('time', { ascending: false })-->
<!--    if (error) {-->
<!--      console.error(error);-->
<!--    } else {-->
<!--      messages = data;-->
<!--      console.log(messages);-->
<!--    }-->
<!--  });-->

<!--  const selectedMessage = writable(null);-->
<!--  $: $selectedMessage = selectedMessageIndex !== -1 ? messages[selectedMessageIndex] : null;-->

<!--</script>-->

<!--<main class="main_chat">-->
<!--  <section class="chat__header section__1">-->
<!--    <a href="#" class="fa-regular fa-user user"></a>-->
<!--    <div class="block__1">-->
<!--      <p class="User__Name_1" id="UserName1">No Name</p>-->
<!--      <p class="User__Status_1" id="UserStatus1">2 minutes ago</p>-->
<!--    </div>-->
<!--  </section>-->

<!--  <section class="section__2" id="chatId">-->
<!--    <div class="messages__1" id="messages1">-->
<!--      {#each messages as message, i}-->
<!--        <div class="message__1" on:contextmenu|preventDefault={(event) => selectMessage(event, i)}>-->
<!--          <p class="paragraph_1">{message.message}</p>-->
<!--        </div>-->
<!--      {/each}-->
<!--      {#each messages as message , i}-->
<!--        {#if showModal && selectedMessageIndex === i}-->
<!--          <div class="modal">-->
<!--            <div class="modal-content">-->
<!--              <h2>Изменить сообщение</h2>-->
<!--              <form on:submit|preventDefault={editMessage}>-->
<!--                <div class="buttons">-->
<!--                  <button type="submit">Save</button>-->
<!--                  <button type="button" on:click={() => showModal = false}>Cancel</button>-->
<!--                  <button on:click={() => deleteMessage(selectedMessageIndex)}>Delete</button>-->
<!--                </div>-->
<!--              </form>-->
<!--            </div>-->
<!--          </div>-->
<!--        {/if}-->
<!--      {/each}-->
<!--    </div>-->
<!--  </section>-->

<!--  <section class="section__3">-->
<!--    <div>-->
<!--      <form enctype="multipart/form-data" onsubmit="addMessage(event)">-->
<!--&lt;!&ndash;      <input class="fa-regular fa-paperclip" id="buttonClip" type="file" on:change={handleFileUpload}>&ndash;&gt;-->
<!--      <input class="input_message" id="message" type="text" placeholder="Введите сообщение" bind:value={newMessageText}>-->
<!--      <button type="submit" class="fa-sharp fa-regular fa-paper-plane" on:click={addMessage}></button>-->
<!--      </form>-->
<!--    </div>-->
<!--  </section>-->
<!--</main>-->

<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { createClient } from '@supabase/supabase-js';
  import { readable, derived } from 'svelte/store';

  const supabaseUrl = 'https://vayakipdpailwnuozwvc.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZheWFraXBkcGFpbHdudW96d3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1Mzk1MzEsImV4cCI6MTk5NjExNTUzMX0.Ax_xuXTtaKDFNRO2TPMMb1aLJMU-f42ufwbeqGP27rA';
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { subscribe, set, update } = writable(0);

  export const messages = writable([]);
  export const selectedMessageIndex = writable(-1);
  export const newMessageText = writable('');
  export const showModal = writable(false);
  export const uploadedImage = writable(null);

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

    const { data, error } = await supabase.from('message').insert({
      message: messageText,
      time: new Date()
    });

    if (error) {
      console.error(error);
    } else {
      messages.update(msgs => [...msgs, data]);
    }

    newMessageText.set('');
    uploadedImage.set(null);
    event.preventDefault();
  }

  export function selectMessage(event, index) {
    let messagesArray;
    messages.subscribe(value => {
      messagesArray = value;
    });

    newMessageText.set(messagesArray[index].message);
    showModal.set(true);
  }

  export function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      uploadedImage.set(event.target.result);
    };

    reader.readAsDataURL(file);
  }

  export async function deleteMessage(index) {
    const id = messages[index].id;
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

    const id = messages[$selectedMessageIndex].id;
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
      messages.update(msgs => {
        return msgs.map((message, i) => {
          if (i === $selectedMessageIndex) {
            return data;
          }
          return message;
        });
      });
    }

    selectedMessageIndex.set(-1);
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

  onMount(async () => {
    const { data, error } = await supabase.from('message').select('*').order('time', { ascending: false })
    if (error) {
      console.error(error);
    } else {
      messages.set(data);
      console.log($messages);
    }
  });

  const selectedMessage = derived(
          [messages, selectedMessageIndex],
          ([$messages, $selectedMessageIndex]) => $selectedMessageIndex !== -1 ? $messages[$selectedMessageIndex] : null
  );


</script>

<main class="main_chat">
  <section class="chat__header section__1">
    <a href="#" class="fa-regular fa-user user"></a>
    <div class="block__1">
      <p class="User__Name_1" id="UserName1">No Name</p>
      <p class="User__Status_1" id="UserStatus1">2 minutes ago</p>
    </div>
  </section>

  <section class="section__2" id="chatId">
    <div class="messages__1" id="messages1">
      {#each $messages as message, i}
        <div class="message__1" on:contextmenu|preventDefault={(event) => selectMessage(event, i)}>
          <p class="paragraph_1">{message.message}</p>
        </div>
      {/each}
      {#each $messages as message, i}
        {#if $showModal && $selectedMessageIndex === i}
          <div class="modal">
            <div class="modal-content">
              <h2>Изменить сообщение</h2>
              <form on:submit|preventDefault={editMessage}>
                <div class="buttons">
                  <button type="submit">Save</button>
                  <button type="button" on:click={() => cancelEdit()}>Cancel</button>
                  <button on:click={() => deleteMessage($selectedMessageIndex)}>Delete</button>
                </div>
              </form>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </section>

  <section class="section__3">
    <div>
      <form enctype="multipart/form-data" onsubmit={addMessage}>
        <!-- <input class="fa-regular fa-paperclip" id="buttonClip" type="file" on:change={handleFileUpload}> -->
        <input class="input_message" id="message" type="text" placeholder="Введите сообщение" bind:value={$newMessageText}>
        <button type="submit" class="fa-sharp fa-regular fa-paper-plane"></button>
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