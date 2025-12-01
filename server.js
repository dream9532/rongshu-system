const express = require('express');
const OpenAI = require('openai');
const app = express();

const port = process.env.PORT || 3000;

// 初始化 OpenAI (使用剛剛設定的環境變數)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: '融數核心系統 - System Online' });
});

app.get('/diagnose', (req, res) => {
    res.render('diagnose', { title: '啟動運算引擎' });
});

app.post('/result', async (req, res) => {
    const income = Number(req.body.income);
    const debt = Number(req.body.debt);
    
    // 基礎運算
    let ratio = 0;
    if(income > 0) {
        ratio = (debt / (income * 12)) * 100;
        ratio = ratio.toFixed(1);
    }

    // AI 深度分析預設值
    let aiResult = {
        risk: ratio > 60 ? "高危險" : "中度風險",
        analysis: "正在建立神經網路連線...",
        scores: [50, 50, 50, 50, 50]
    };

    try {
        console.log("正在呼叫 GPT-4o...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "你是一位台灣頂尖的金融法律專家，精通《消費者債務清理條例》。請根據用戶數據進行風險評估。回傳純 JSON 格式，不要有 markdown 標記。" },
                { role: "user", content: `使用者月收入：${income} 萬元，總負債：${debt} 萬元。
                請嚴格依照此 JSON 格式回傳：
                {
                    "risk_level": "高危險" 或 "中度風險" 或 "健康",
                    "analysis": "請撰寫約 200-300 字的專業分析。針對此負債比，引用台灣相關法律（如消債條例、強制執行法），給出具體的『協商』、『更生』或『理債』建議。語氣要專業、冷靜、具權威感。",
                    "scores": [負債控制力, 信用評分預估, 現金流健康度, 資產成長性, 風險承受度] (請給出 5 個 0-100 的數字)
                }` }
            ],
            response_format: { type: "json_object" },
        });

        const gptData = JSON.parse(completion.choices[0].message.content);
        aiResult.risk = gptData.risk_level;
        aiResult.analysis = gptData.analysis;
        aiResult.scores = gptData.scores;

    } catch (error) {
        console.error("AI Error:", error);
        aiResult.analysis = "⚠️ AI 核心連線逾時，目前僅顯示基礎運算結果。請檢查 API Key 設定。";
    }

    res.render('result', { 
        title: '深度解析報告', 
        ratio: ratio, 
        risk: aiResult.risk, 
        income: income, 
        debt: debt,
        ai_analysis: aiResult.analysis, 
        ai_scores: JSON.stringify(aiResult.scores)
    });
});

app.listen(port, () => {
    console.log(`核心系統已啟動： Port ${port}`);
});
// (重新覆蓋聊天路由，確保它自稱專業顧問)
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "你是一位台灣資深律師與金融顧問。請以『數位法務顧問』的身份回答。回答問題時，語氣要專業、冷靜、有條理。嚴禁提及你是『AI』、『語言模型』或『機器人』。請直接針對使用者的法律問題提供具體策略，並盡可能引用台灣相關法條（如民法、刑法、消債條例）。" },
                { role: "user", content: userMessage }
            ],
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "系統連線繁忙，請稍後再試。" });
    }
});
// (重新覆蓋聊天路由，確保它自稱專業顧問)
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "你是一位台灣資深律師與金融顧問。請以『數位法務顧問』的身份回答。回答問題時，語氣要專業、冷靜、有條理。嚴禁提及你是『AI』、『語言模型』或『機器人』。請直接針對使用者的法律問題提供具體策略，並盡可能引用台灣相關法條（如民法、刑法、消債條例）。" },
                { role: "user", content: userMessage }
            ],
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "系統連線繁忙，請稍後再試。" });
    }
});
