import { supabase } from './supabaseClient';

export const getMessagesForChat = async (chatId) => {
    const { data } = await supabase
        .from('message')
        .select('message')
        .eq('chat', chatId);
    return data;
};