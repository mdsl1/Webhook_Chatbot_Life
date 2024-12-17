const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Rota principal (opcional)
app.get('/', (req, res) => {
  res.send("Servidor está funcionando!");
});

// Middleware para aceitar requisições em JSON
app.use(express.json());

// Rota do webhook
app.post('/webhook', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  if (intentName === 'Saudacao') {
    res.json({
      fulfillmentText: "Olá! Como posso ajudar você hoje?"
    });
  } else {
    res.json({
      fulfillmentText: "Desculpe, não entendi a solicitação."
    });
  }
});

// Porta do servidor (Render define automaticamente)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
