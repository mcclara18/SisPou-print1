const Database = require('./Database');

class QuartoModel {
    static async findByNumero(numero) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM Quarto WHERE numero = ?',
                [numero]
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
                'SELECT * FROM Quarto WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT numero, capacidade, status, tipo FROM Quarto ORDER BY numero ASC'
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    static async create(quartoData) {
        const connection = await Database.getConnection();
        try {
            const { numero, capacidade, status, tipo } = quartoData;
            const [result] = await connection.execute(
                'INSERT INTO Quarto (numero, capacidade, status, tipo) VALUES (?, ?, ?, ?)',
                [numero, capacidade, status, tipo]
            );
            return result.insertId;
        } finally {
            connection.release();
        }
    }

    static async updateStatus(numero, status) {
        const connection = await Database.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE Quarto SET status = ? WHERE numero = ?',
                [status, numero]
            );
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    static async update(id, quartoData) {
        const connection = await Database.getConnection();
        try {
            const { numero, capacidade, status, tipo } = quartoData;
            
            // Construir query dinamicamente baseado nos campos fornecidos
            const fields = [];
            const values = [];

            if (numero !== undefined) { fields.push('numero = ?'); values.push(numero); }
            if (capacidade !== undefined) { fields.push('capacidade = ?'); values.push(capacidade); }
            if (status !== undefined) { fields.push('status = ?'); values.push(status); }
            if (tipo !== undefined) { fields.push('tipo = ?'); values.push(tipo); }

            if (fields.length === 0) {
                return false;
            }

            values.push(id);
            
            const query = `UPDATE Quarto SET ${fields.join(', ')} WHERE id = ?`;
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
                'DELETE FROM Quarto WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }
}

module.exports = QuartoModel;
