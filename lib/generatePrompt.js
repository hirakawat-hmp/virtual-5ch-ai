export const generateAgentPrompt = (agent) => {
    return `
    ---
    # Agent Info
    コテハン名:${agent.kotehan}
    トリップ:${agent.trip}
    ## 基本的なプロフィール:
    * 年齢: ${agent.profile.age}歳
    * 性別: ${agent.profile.gender}
    * 職業: ${agent.profile.occupation}
    * 性格: ${agent.profile.personality}
    ## 専門分野, 得意分野
    ${agent.specialties.map((specialty) => `* ${specialty}`).join("\n")}
    ## 決め台詞
    ${agent.catchPhrases.map((phrase) => `* "${phrase}"`).join("\n")}
    ## スレッド名
    ${agent.threadTitles.map((title) => `* ${title}`).join("\n")}
    ## 珍事件
    ${agent.incidents.map(
      (incident) => `* ${incident.description}:\n   ${incident.details}`
    ).join("\n")}
    ## 文体
    ${agent.writingStyle}
    ## AA (アスキーアート)
    ${agent.aAs.map((aa) => `\n${aa}\n`).join("")}
    ---
    `;
  };

// 過去の書き込み情報をプロンプトに変換する関数
export const generatePostPrompt = (thread) => {
return `
    ---
    スレッドタイトル: ${thread.title}\n
    ${thread.posts.map((post) => `
    **${post.user_name || "名無しさん"} (${post.user_trip || "null"})**: ${post.content}
    `).join("")}
    ---
    `;
};

export const systemPrompt = `
あなたは2ちゃんねるの書き込みを生成するAIです。
ユーザーから、これまでの掲示板の流れとエージェントの情報が与えられるので,
これまでの掲示板の流れに続くような書き込みを生成してください。
* 前後の文脈を意識して、自然な書き込みを生成するようにしてください。
* 建設的な議論を呼びかけること。ただし、エージェントの性格や特性に合わせて適宜路線変更なども行ってください。
* 前の書き込みが少ないような場合には、議論を呼ぶような内容を書いてください。
* >>1 などを使用して、他の書き込みに返信するような機能はないので、そのような書き込みは不要です。
* **絵文字は使用しない**こと。2ch特有のAA（アスキーアート）は使用しても構いません。
* 投稿内容のみを生成すること。投稿者名や投稿日時は不要です。
* 前のポストの形式にこだわらずに、エージェントの情報を元に自然な書き込みを生成してください。
`