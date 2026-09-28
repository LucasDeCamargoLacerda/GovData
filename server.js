import express from 'express' //importando o framework Express (API)
import mysql from 'mysql2' //Importando banco de dados permitindo js conversar, fazer queries e salvar dados
import 'dotenv/config' // Segurança do password

const app = express() //Variável que vai armazenar a aplicação que vai executar a função Express()
app.use(express.json()) //Isso permite que o Express entenda JSON no corpo das requisições
app.use(express.static('public'))

const db = mysql.createConnection({ //Conectando banco de dados
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'govdata'
})
//Conferindo se a API esta rodando junto com o mysql
db.connect((erro) => {
    if(erro) {
        console.log('Erro na conexão:', erro.message)
    } else {
        console.log('MySQL connect!')
    }
})

//Dados Brutos

//Rota — listar cidadãos
app.get('/cidadaos', (req, res) => {
    db.query('SELECT *FROM cidadaos;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message})
        }
        res.json(resultados)
    })
})
//Rota — listar orgaos
app.get('/orgaos', (req, res) => {
    db.query('SELECT *FROM orgaos;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: erro.message})
        }
        res.json(resultados)
    })
})
//Rota — listar funcionarios
app.get('/funcionarios', (req, res) => {
    db.query('SELECT *FROM funcionarios;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultados)
    })
})
//Rota — listar servicos
app.get('/servicos', (req, res) => {
    db.query('SELECT *FROM servicos;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultados)
    })
})
//Rota — listar solicitações
app.get('/solicitacoes', (req, res) => {
    db.query('SELECT *FROM solicitacoes;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultados)
    })
})
//Rota — listar atendimentos
app.get('/atendimentos', (req, res) => {
    db.query('SELECT *FROM atendimentos;', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultados)
    })
})

//Consultas SQL / Relatórios

//Rota - Agrupando cidadãos por cidade
app.get('/relatorios/demanda-cidade', (req, res) => {
    db.query('SELECT cidade, COUNT(*) AS total FROM cidadaos GROUP BY cidade;', (erro, resultado) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultado)
    })
})
//Rota - Agrupando demanda de solicitações e id dos requerentes 
app.get('/relatorios/demanda-solicitacoes', (req, res) => {
    db.query('SELECT data_solicitacao, cidadao_id, COUNT(*) AS total FROM solicitacoes GROUP BY data_solicitacao, cidadao_id;', (erro, resultado) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultado)
    })
})
//Rota - Agrupando status das solicitações 
app.get('/relatorios/status-solicitacoes', (req, res) => {
    db.query('SELECT status, COUNT(*) AS total FROM solicitacoes GROUP BY status;', (erro, resultado) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultado)
    })
})
//Rota - Agrupando categoria de serviços solicitados
app.get('/relatorios/pedidos-servicos', (req, res) => {
    db.query('SELECT categoria, COUNT(*) AS total FROM servicos GROUP BY categoria;', (erro, resultado) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultado)
    })
})
//Rota - Calculando tempo médio de atendimento
app.get('/relatorios/tempo-medio-atendimentos', (req, res) => {
    db.query('SELECT ROUND(AVG(DATEDIFF(data_conclusao, data_solicitacao)), 2) AS tempo_medio FROM solicitacoes;', (erro, resultado) => {
        if (erro) {
            return res.status(500).json({erro: erro.message})
        }
        res.json(resultado)
    })
})

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
}) //É a porta lógica do computador onde o servidor vai rodar