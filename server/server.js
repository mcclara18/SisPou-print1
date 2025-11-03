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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.post('/api/register', async (req, res) => {
    const { nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password } = req.body;

    if (!nome || !email || !password || !cargo_fun || !cpf) {
        return res.status(400).json({ message: 'Todos os campos marcados como obrigatórios devem ser preenchidos.' });
    }
    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
        return res.status(400).json({ message: 'O CPF deve conter exatamente 11 dígitos.', field: 'cpf' });
    }
    if (telefone && telefone.replace(/\D/g, '').length > 11) {
        return res.status(400).json({ message: 'O telefone não pode ter mais que 11 dígitos.', field: 'telefone' });
    }
    if (password.length < 4) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 4 caracteres.', field: 'password' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const connection = await pool.getConnection();
        
        const [rows] = await connection.execute(
            'INSERT INTO Funcionario (nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password_hash]
        );
        
        connection.release();
        res.status(201).json({ message: 'Funcionário cadastrado com sucesso!', userId: rows.insertId });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('cpf')) {
                return res.status(409).json({ message: 'Este CPF já está cadastrado.', field: 'cpf' });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: 'Este email já está cadastrado.', field: 'email' });
            }
        }
        
        console.error('Erro detalhado no registro:', error); 
        
        res.status(500).json({ message: `Erro no servidor: ${error.code || 'Verifique os dados e tente novamente.'}` });
    }
});

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
            res.status(200).json({ message: 'Login bem-sucedido!', user: { id: user.id_funcionario, nome: user.nome, cargo: user.cargo_fun } });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas.' });
        }

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.post('/api/rooms', async (req, res) => {
    const { numero, capacidade, preco, status } = req.body;

    if (!numero || !capacidade || !preco || !status) {
        return res.status(400).json({ message: 'Número, capacidade, preço e status são obrigatórios.' });
    }

    const allowedStatus = ['Disponível', 'Ocupado', 'Em manutenção'];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'O status do quarto tem que ser Disponível, Ocupado ou Em manutenção.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO Quarto (numero, capacidade, preco, status) VALUES (?, ?, ?, ?)',
            [numero, capacidade, parseFloat(preco), status]
        );
        connection.release();
        res.status(201).json({ message: 'Quarto cadastrado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Já existe um quarto com este número.' });
        }
        console.error('Erro ao cadastrar quarto:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.get('/api/rooms', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT numero, capacidade, preco, status FROM Quarto ORDER BY numero ASC');
        connection.release();
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar quartos:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.put('/api/rooms/:numero', async (req, res) => {
    const { numero } = req.params;
    const { status } = req.body;

    const allowedStatus = ['Disponível', 'Ocupado', 'Em manutenção'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status inválido. Use Disponível, Ocupado ou Em manutenção.' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE Quarto SET status = ? WHERE numero = ?',
            [status, numero]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Quarto não encontrado.' });
        }

        res.status(200).json({ message: 'Status do quarto atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status do quarto:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.get('/register-room', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register-room.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
