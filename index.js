// Framework web para facilitar na criação de servidores
const express = require('express');
// Instância do Express que representa a aplicação web/ API que está sendo criada
const app = express();
// Biblioteca que permite a comunicação entre o Node.js e o MySQL
const mysql = require('mysql');


// Middleware para aceitar requisições em JSON
// Middleware é uma função que tem acesso às requisições e respostas do servidor. Eles podem tanto executar códigos quanto modificar requisições e respostas
app.use(express.json());


/*Configurações para testar localmente*/
// Rota principal (opcional). Configuração usada para testar localmente
app.get('/', (req, res) => {
  res.send("Servidor está funcionando!");
});
// Define a Porta do servidor para testar localmente (o Render define automaticamente)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


/*Configurações do MySQL*/
// Carrega as variáveis com informações sensíveis para o código, informações essa que estão armazenadas no arquivo .env
require('dotenv').config();
// Cria uma conexão com o banco de dados
const connection = mysql.createConnection({
  // Configurações da conexão com o MySQL
  host: process.env.DB_HOST, // Endereço do servidor MySQL
  port: process.env.DB_PORT, // Porta do MySQL
  user: process.env.DB_USER, // Nome do usuário
  password: process.env.DB_PASSWORD, // Senha do banco de dados
  database: process.env.DB_NAME // Nome do banco de dados
});
// Testa a conexão com o banco de dados ao iniciar o servidor
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao banco de dados!');
  }
});


/*Configurações do webhook*/
// Define uma rota usada para receber os dados do Dialogflow
app.post('/webhook', (req, res) => {
  // Acessa o nome da intent enviada pelo Dialogflow no corpo da requisição
  const intentName = req.body.queryResult.intent.displayName;

  // Verifica se a intent é a que será utilizada
  if (intentName === 'Saudacao') {
    // Cria um comando sql para inserir os valores na coluna especificada e com o valor que será especificado abaixo
    const sql = 'INSERT INTO teste (nome) VALUES (?)';
    const userNome = req.body.queryResult.parameters.nome;
    // Define o valor que será adicionado ao banco de dados
    const valores = [userNome];

    // Executa o comando SQL
    connection.query(sql, valores, (err, results) => {
      // Caso dê erro, ele retorna uma mensagem de erro
      if (err) {
        console.error('Erro ao consultar o banco:', err);
        // Texto que será mostrado ao usuário
        res.json({ fulfillmentText: 'Desculpe, ocorreu um erro ao processar sua solicitação.' });
        return;
      }
      // Senão, retorna uma mensagem de sucesso
      res.json({ fulfillmentText: 'Valor inserido com sucesso ${nome}!'});
    });
    // Caso ele não tenha encontrado a intent especificada, ele retorna uma mensagem de erro
  } else {
    res.json({ fulfillmentText: 'Intent não reconhecida.' });
  }
});
