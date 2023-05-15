import {messages, newMessageText, selectedMessageIndex, showModal, uploadedImage} from "../lib/store.js";
import {supabase} from "$lib/supabaseClient.js";

export async function addMessage(event) {
    if (newMessageText.trim() === '') {
        return;
    }

    const words = newMessageText.trim().split(' ');
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
        messages.set([...messages, data]);
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
    if (selectedMessageIndex === -1 || newMessageText.trim() === '') {
        return;
    }

    const id = messages[selectedMessageIndex].id;
    const { data, error } = await supabase
        .from('message')
        .update({
            message: newMessageText,
            time: new Date()
        })
        .eq('id', id);

    if (error) {
        console.error(error);
    } else {
        messages.update(msgs => {
            return msgs.map((message, i) => {
                if (i === selectedMessageIndex) {
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