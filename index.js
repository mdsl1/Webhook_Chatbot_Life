const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Rota principal (opcional)
app.get('/', (req, res) => {
  res.send("Servidor está funcionando!");
});

// Middleware para aceitar requisições em JSON
app.use(express.json());

// Configuração da conexão com o MySQL
require('dotenv').config();
const connection = mysql.createConnection({
  host: process.env.DB_HOST,       // ou o endereço do servidor MySQL
  port: process.env.DB_PORT, 
  user: process.env.DB_USER,            // seu usuário MySQL
  password: process.env.DB_PASSWORD,   // sua senha do MySQL
  database: process.env.DB_NAME // o banco de dados criado
});

// Testa a conexão ao iniciar o servidor
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao banco de dados!');
  }
});

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

  if (intentName === 'Saudacao') {
    const sql = 'INSERT INTO teste VALUES (?, ?)';
    const valores = [1, 'Teste'];

    // Exemplo: Insere um valor no banco
    connection.query(sql, valores, (err, results) => {
      if (err) {
        console.error('Erro ao consultar o banco:', err);
        res.json({ fulfillmentText: 'Desculpe, ocorreu um erro ao processar sua solicitação.' });
        return;
      }
      // Retorna a mensagem encontrada no banco
      res.json({ fulfillmentText: 'Valor inserido com sucesso'});
    });
  } else {
    res.json({ fulfillmentText: 'Intent não reconhecida.' });
  }
});

// Porta do servidor (Render define automaticamente)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
