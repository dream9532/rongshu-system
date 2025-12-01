const express = require('express');
const OpenAI = require('openai');
const app = express();

const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: '融數核心系統 - System Online' });
});

app.get('/plan', (req, res) => {
    res.render('plan', { title: '專案白皮書 - 法務理債策略研究室' });
});

app.get('/diagnose', (req, res) => {
    res.render('diagnose', { title: '啟動運算引擎' });
});

app.get('/rag', (req, res) => {
    res.render('rag', { title: '法務策略中樞' });
});

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "你是一位台灣資深律師與金融顧問。請以『數位法務顧問 (System Advisor)』的身份回答。回答時語氣要冷靜、專業、精簡。嚴禁提及『AI』、『模型』或『機器人』。請直接針對法律問題提供策略，並引用相關法條。" },
                { role: "user", content: userMessage }
            ],
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "系統連線繁忙，請稍後再試。" });
    }
});

app.post('/result', async (req, res) => {
    const income = Number(req.body.income);
    const debt = Number(req.body.debt);
    let ratio = 0;
    if(income > 0) {
        ratio = (debt / (income * 12)) * 100;
        ratio = ratio.toFixed(1);
    }

    let aiResult = {
        risk: ratio > 60 ? "高危險" : "中度風險",
        analysis: "正在連線神經網路...",
        scores: [50, 50, 50, 50, 50]
    };

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "你是一位台灣頂尖金融法律專家。請根據數據回傳 JSON 風險評估。" },
                { role: "user", content: `月收${income}萬，負債${debt}萬。回傳 JSON: { "risk_level": "...", "analysis": "...", "scores": [...] }` }
            ],
            response_format: { type: "json_object" },
        });
        const gptData = JSON.parse(completion.choices[0].message.content);
        aiResult = gptData;
    } catch (error) {
        console.error("AI Error:", error);
    }

    res.render('result', { 
        title: '深度解析報告', 
        ratio, risk: aiResult.risk, income, debt,
        ai_analysis: aiResult.analysis, 
        ai_scores: JSON.stringify(aiResult.scores)
    });
});

app.listen(port, () => {
    console.log(`System Online: Port ${port}`);
});
