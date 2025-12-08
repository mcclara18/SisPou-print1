const Database = require('./Database');

class ClienteModel {
    static async findByEmail(email) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM Cliente WHERE email = ?',
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
                'SELECT * FROM Cliente WHERE cpf = ?',
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
                'SELECT * FROM Cliente WHERE id_cliente = ?',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async create(clienteData) {
        const connection = await Database.getConnection();
        try {
            const { nome, cpf, telefone, email, endereco } = clienteData;
            const [result] = await connection.execute(
                'INSERT INTO Cliente (nome, cpf, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)',
                [nome, cpf, telefone, email, endereco]
            );
            return result.insertId;
        } finally {
            connection.release();
        }
    }
    static async findAll() {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id_cliente, nome, cpf, telefone, email, endereco FROM Cliente ORDER BY nome ASC'
            );
            return rows;
        } finally {
            connection.release();
        }
    }
    static async findCPFInSystem(cpf) {
        const connection = await Database.getConnection();
        try {
            const [clienteRows] = await connection.execute(
                'SELECT * FROM Cliente WHERE cpf = ?',
                [cpf]
            );
            if (clienteRows.length > 0) return clienteRows[0];
            const [funcionarioRows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE cpf = ?',
                [cpf]
            );
            return funcionarioRows.length > 0 ? funcionarioRows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async findEmailInSystem(email) {
        const connection = await Database.getConnection();
        try {
            const [clienteRows] = await connection.execute(
                'SELECT * FROM Cliente WHERE email = ?',
                [email]
            );
            if (clienteRows.length > 0) return clienteRows[0];
            const [funcionarioRows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE email = ?',
                [email]
            );
            return funcionarioRows.length > 0 ? funcionarioRows[0] : null;
        } finally {
            connection.release();
        }
    }
    static async findTelefoneInSystem(telefone) {
        const connection = await Database.getConnection();
        try {
            const [clienteRows] = await connection.execute(
                'SELECT * FROM Cliente WHERE telefone = ?',
                [telefone]
            );
            if (clienteRows.length > 0) return clienteRows[0];
            const [funcionarioRows] = await connection.execute(
                'SELECT * FROM Funcionario WHERE telefone = ?',
                [telefone]
            );
            return funcionarioRows.length > 0 ? funcionarioRows[0] : null;
        } finally {
            connection.release();
        }
    }
}

module.exports = ClienteModel;
