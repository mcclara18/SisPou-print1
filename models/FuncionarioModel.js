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

    static async update(id, funcionarioData) {
        const connection = await Database.getConnection();
        try {
            const { nome, sobrenome, telefone, rua, bairro, numero, senha } = funcionarioData;
            
            const fields = [];
            const values = [];

            if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
            if (sobrenome !== undefined) { fields.push('sobrenome = ?'); values.push(sobrenome); }
            if (telefone !== undefined) { fields.push('telefone = ?'); values.push(telefone); }
            if (rua !== undefined) { fields.push('rua = ?'); values.push(rua); }
            if (bairro !== undefined) { fields.push('bairro = ?'); values.push(bairro); }
            if (numero !== undefined) { fields.push('numero = ?'); values.push(numero); }
            if (senha !== undefined) { fields.push('senha = ?'); values.push(senha); }

            if (fields.length === 0) {
                return false;
            }

            values.push(id);
            
            const query = `UPDATE Funcionario SET ${fields.join(', ')} WHERE id_funcionario = ?`;
            const [result] = await connection.execute(query, values);
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    static async delete(id) {
        const connection = await Database.getConnection();
        try {
            const [result] = await connection.execute(
                'DELETE FROM Funcionario WHERE id_funcionario = ?',
                [id]
            );
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }
}

module.exports = FuncionarioModel;
