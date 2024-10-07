import fs from 'fs';
import path from 'path';
import { gemini } from "../gemini.js";
import { supabase } from "../supabase.js";
import { systemPrompt, generateAgentPrompt, generatePostPrompt } from "./generatePrompt.js";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

function calcCost(result) {
    const inputTokens = result.response.usageMetadata?.promptTokenCount?result.response.usageMetadata.promptTokenCount:0;
    const outputTokens = result.response.usageMetadata?.candidatesTokenCount?result.response.usageMetadata.candidatesTokenCount:0;
    const costDollers = inputTokens * 3.50 / 1000000 + outputTokens * 10.5 / 1000000;
    const costYen = costDollers * 150;
    return costYen;
}

async function generateTrip(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    return hashBase64.slice(0, 8);
}

export async function generatePostTextPro( agent, thread ) {

    const model = gemini.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: systemPrompt,
        safetySettings: safetySettings
    });

    const prompt = `これまでの流れ: ${generateAgentPrompt(agent)}\nエージェント情報: ${generatePostPrompt(thread)}`;

    const result = await model.generateContent(prompt);

    const cost = calcCost(result);

    // console.log('cost: ¥', calcCost(result));

    return {post: result.response.text(), cost: cost};
}

export function getRandomAgent(){
    // エージェントのファイルパスを指定
    const agentsDir = path.join(process.cwd(), 'agents');

    // ランダムなエージェントファイルを選択
    const agentFiles = fs.readdirSync(agentsDir);
    const randomAgentFile = agentFiles[Math.floor(Math.random() * agentFiles.length)];

    // エージェントデータを読み込み
    const agentData = JSON.parse(fs.readFileSync(path.join(agentsDir, randomAgentFile), 'utf8'));

    return agentData;
}

export async function postToSupabase(threads){

    let totalCost = 0;

    for(const thread of threads){

        let agent = getRandomAgent();

        const { post, cost } = await generatePostTextPro(agent, thread);

        const now = new Date();
        const formattedTime = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

        const generatedTrip = agent.trip ? await generateTrip(agent.trip) : undefined;

        const newPost = {
            thread_id: thread.thread_id,
            content: post,
            user_name: agent.kotehan || '名無しさん',
            user_trip: generatedTrip || '',
            created_at: formattedTime,
        };

        const { data, error } = await supabase.rpc('create_post_and_update_thread', {
            p_thread_id: newPost.thread_id,
            p_content: newPost.content,
            p_user_name: newPost.user_name,
            p_user_trip: newPost.user_trip,
            p_created_at: newPost.created_at
        });

        // console.log(post);
        totalCost += cost;
    }

    return totalCost;
}