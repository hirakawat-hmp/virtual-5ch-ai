import { supabase } from '../supabase.js';
import { format } from "date-fns";

async function getRectntlyUpdatedThreads(){
    const now = new Date(Date.now() - 5 * 60 * 1000);
    const fiveMinutesAgo = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const { data, error } = await supabase
        .from('threads')
        .select('*')
        .lt('updated_at', fiveMinutesAgo)
        .order('updated_at', { ascending: true })  // 古い順に並べ替え
        .limit(10);  // 最初の10件のみを取得;

    if (error) {
        return [];
    }
    return data;
}

async function getRecentPostsForThread(threads){
    const threadInfo = [];
    for (const thread of threads) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(25);

        if (error) {
            return [];
        }
        threadInfo.push({ thread_id: thread.id, title: thread.title, posts: data });
    }

    return threadInfo;
}

export async function getThreadInfo(){
    const threads = await getRectntlyUpdatedThreads();
    if (threads.length === 0) {
        return [];
    }

    return await getRecentPostsForThread(threads);
}