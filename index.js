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
    // Cria um comando SQL para verificar se o valor já existe no banco de dados
    const sqlCheck = 'SELECT COUNT(*) AS total FROM usuarios WHERE nome = ?';
    // Cria um comando SQL para inserir os valores na coluna especificada
    const sqlInsert = 'INSERT INTO usuarios (nome) VALUES (?)';
    // Obtém o valor do parâmetro 'nome' enviado pelo Dialogflow
    const userNome = req.body.queryResult.parameters.nome;

    // Verifica no banco de dados se o nome já existe
    connection.query(sqlCheck, [userNome], (err, results) => {
      if (err) {
        console.error('Erro ao consultar o banco:', err);
        return res.json({
          fulfillmentText: 'Desculpe, ocorreu um erro ao verificar o nome no banco de dados.',
        });
      }

      // Verifica o total de registros encontrados
      const total = results[0].total;

      if (total > 0) {
        // Se o nome já existe, retorna uma mensagem informando o usuário
        return res.json({
          fulfillmentText: `O nome "${userNome}" já está registrado no banco de dados.`,
        });
      } else {
        // Se o nome não existe, insere no banco de dados
        connection.query(sqlInsert, [userNome], (err, results) => {
          if (err) {
            console.error('Erro ao inserir no banco:', err);
            return res.json({
              fulfillmentText: 'Desculpe, ocorreu um erro ao registrar o nome no banco de dados.',
            });
          }

          // Retorna uma mensagem de sucesso ao usuário
          return res.json({
            fulfillmentText: `Obrigado, ${userNome}! Seu nome foi registrado com sucesso.`,
          });
        });
      }
    });
  } else {
    // Caso a intent não seja reconhecida
    return res.json({
      fulfillmentText: 'Intent não reconhecida.',
    });
  }
});