const Database = require('./Database');

class FuncionarioModel {
    static async findByEmail(email) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE email = ?',
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async findByCPF(cpf) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE cpf = ?',
                [cpf]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async findById(id) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE id_funcionario = ?',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async create(funcionarioData) {
        const connection = await Database.getConnection();
        try {
            const { nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, senha } = funcionarioData;
            const [result] = await connection.execute(
                'INSERT INTO Funcionario (nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, senha]
            );
            return result.insertId;
        } finally {
            connection.release();
        }
    }
    static async findAll() {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute('SELECT id_funcionario, nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun FROM Funcionario');
            return rows;
        } finally {
            connection.release();
        }
    }

    static async findCPFInSystem(cpf) {
        const connection = await Database.getConnection();
        try {
            const [funcionarioRows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE cpf = ?',
                [cpf]
            );
            if (funcionarioRows.length > 0) return funcionarioRows[0];
            const [clienteRows] = await connection.execute(
                'SELECT * FROM Cliente WHERE cpf = ?',
                [cpf]
            );
            return clienteRows.length > 0 ? clienteRows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async findEmailInSystem(email) {
        const connection = await Database.getConnection();
        try {
            const [funcionarioRows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE email = ?',
                [email]
            );
            if (funcionarioRows.length > 0) return funcionarioRows[0];
            const [clienteRows] = await connection.execute(
                'SELECT * FROM Cliente WHERE email = ?',
                [email]
            );
            return clienteRows.length > 0 ? clienteRows[0] : null;
        } finally {
            connection.release();
        }
    }
}

module.exports = FuncionarioModel;
