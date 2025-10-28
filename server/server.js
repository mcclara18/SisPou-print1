const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const dbConfig = require('./dbconfig');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL Connection Pool Created');
} catch (error) {
    console.error('Failed to create MySQL pool:', error);
    process.exit(1);
}

// Rota para servir a página de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Rota para servir a página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});


// API: Registro de Funcionário
app.post('/api/register', async (req, res) => {
    const { nome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password } = req.body;

    if (!nome || !email || !password || !cargo_fun || !cpf) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
            'INSERT INTO Funcionario (nome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password_hash]
        );
        
        connection.release();
        res.status(201).json({ message: 'Funcionário cadastrado com sucesso!', userId: rows.insertId });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email ou CPF já cadastrado.' });
        }
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// API: Login de Funcionário
app.post('/api/login', async (req, res) => {
    const { email, password, cargo_fun } = req.body;

    if (!email || !password || !cargo_fun) {
        return res.status(400).json({ message: 'Email, senha e cargo são obrigatórios.' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM Funcionario WHERE email = ? AND cargo_fun = ?',
            [email, cargo_fun]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas ou cargo incorreto.' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Em um app real, aqui você geraria um token JWT
            res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id_funcionario, nome: user.nome, cargo: user.cargo_fun } });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
