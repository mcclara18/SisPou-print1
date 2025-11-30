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
                'SELECT id_quarto, numero, capacidade, status, tipo FROM Quarto ORDER BY numero ASC'
            );
            return rows;
        } finally {
            connection.release();
        }
    }
    static async findByStatus(status) {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id_quarto, numero, capacidade, status, tipo FROM Quarto WHERE status = ? ORDER BY numero ASC',
                [status]
            );
            return rows;
        } finally {
            connection.release();
        }
    }
    static async findByTipo(tipo){
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id_quarto, numero, capacidade, status, tipo FROM Quarto WHERE tipo = ? ORDER BY numero ASC',
                [tipo]
            );
            return rows;
        } finally {
            connection.release();
        }
    }
    static async findByStatusAndTipo(status, tipo){
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT id_quarto, numero, capacidade, status, tipo FROM Quarto WHERE status = ? AND tipo = ? ORDER BY numero ASC',
                [status, tipo]
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
    static async updateStatus(id_or_numero, status) {
        const connection = await Database.getConnection();
        try {
            const value = parseInt(id_or_numero);
            
            let [result] = await connection.execute(
                `UPDATE Quarto SET status = ? WHERE id_quarto = ?`,
                [status, value]
            );
            
            if (result.affectedRows === 0 && value > 100) {
                [result] = await connection.execute(
                    `UPDATE Quarto SET status = ? WHERE numero = ?`,
                    [status, value]
                );
            }
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro em updateStatus:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = QuartoModel;
