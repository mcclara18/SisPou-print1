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

function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
        return false;
    }
    
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let digit1 = 11 - (sum % 11);
    digit1 = digit1 >= 10 ? 0 : digit1;
    
    if (parseInt(cpf.charAt(9)) !== digit1) {
        return false;
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    let digit2 = 11 - (sum % 11);
    digit2 = digit2 >= 10 ? 0 : digit2;
    
    if (parseInt(cpf.charAt(10)) !== digit2) {
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL Connection Pool Created');
} catch (error) {
    console.error('Failed to create MySQL pool:', error);
    process.exit(1);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register.html'));
});

app.post('/api/register', async (req, res) => {
    const { nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password } = req.body;

    if (!nome || !email || !password || !cargo_fun || !cpf) {
        return res.status(400).json({ message: 'Todos os campos marcados como obrigatórios devem ser preenchidos.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Email inválido. Verifique o email digitado.', field: 'email' });
    }
    if (!isValidCPF(cpf)) {
        return res.status(400).json({ message: 'CPF inválido. Verifique o CPF digitado.', field: 'cpf' });
    }
    if (telefone && telefone.replace(/\D/g, '').length > 11) {
        return res.status(400).json({ message: 'O telefone não pode ter mais que 11 dígitos.', field: 'telefone' });
    }
    if (password.length < 4) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 4 caracteres.', field: 'password' });
    }

    try {
        const connection = await pool.getConnection();
        const [existingEmail] = await connection.execute(
            'SELECT email FROM Funcionario WHERE email = ?',
            [email]
        );
        
        if (existingEmail.length > 0) {
            connection.release();
            return res.status(409).json({ message: 'Este email já está cadastrado.', field: 'email' });
        }

        const [existingCPF] = await connection.execute(
            'SELECT cpf FROM Funcionario WHERE cpf = ?',
            [cpf]
        );
        
        if (existingCPF.length > 0) {
            connection.release();
            return res.status(409).json({ message: 'Este CPF já está cadastrado.', field: 'cpf' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const [rows] = await connection.execute(
            'INSERT INTO Funcionario (nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM Funcionario WHERE email = ?',
            [email]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.senha);

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
    const { numero, capacidade, status, tipo } = req.body;

    if (!numero || !capacidade || !status || !tipo) {
        return res.status(400).json({ message: 'Número, capacidade, status e tipo são obrigatórios.' });
    }

    if (capacidade < 1 || capacidade > 4) {
        return res.status(400).json({ message: 'A capacidade deve estar entre 1 e 4 pessoas.' });
    }

    const allowedStatus = ['Disponível', 'Ocupado', 'Em manutenção'];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'O status do quarto tem que ser Disponível, Ocupado ou Em manutenção.' });
    }

    const allowedTipos = ['arcondicionado', 'ventilador'];
    if (!allowedTipos.includes(tipo)) {
        return res.status(400).json({ message: 'Tipo de quarto inválido.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO Quarto (numero, capacidade, status, tipo) VALUES (?, ?, ?, ?)',
            [numero, capacidade, status, tipo]
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
        const [rows] = await connection.execute('SELECT numero, capacidade, status, tipo FROM Quarto ORDER BY numero ASC');
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
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register-room.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
