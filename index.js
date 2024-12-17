const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rota principal do webhook
app.post('/webhook', (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;

    let responseText = '';

    // Verifica a intent acionada
    if (intentName === 'Saudacao') {
        responseText = 'Olá! Como posso ajudar você hoje?';
    } else if (intentName === 'PrecoProduto') {
        const produto = req.body.queryResult.parameters.produto;
        responseText = `O valor do produto ${produto} é R$100,00.`;
    } else {
        responseText = 'Desculpe, não entendi. Pode repetir?';
    }

    // Resposta ao Dialogflow
    res.json({
        fulfillmentText: responseText,
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});