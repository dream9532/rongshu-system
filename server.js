const express = require('express');
const app = express();
// 關鍵修改：讓雲端決定 Port
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: '融數核心系統 - System Online' });
});

app.get('/diagnose', (req, res) => {
    res.render('diagnose', { title: '啟動運算引擎' });
});

app.post('/result', (req, res) => {
    const income = Number(req.body.income);
    const debt = Number(req.body.debt);
    let ratio = 0;
    let risk = '低';

    if(income > 0) {
        ratio = (debt / (income * 12)) * 100;
        ratio = ratio.toFixed(1);
    }
    
    if(ratio > 60) risk = '高危險';
    else if(ratio > 30) risk = '中度風險';

    res.render('result', { title: '深度解析報告', ratio, risk, income, debt });
});

app.listen(port, () => {
    console.log(`系統已啟動： Port ${port}`);
});
