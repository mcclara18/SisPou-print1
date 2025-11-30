const Database = require('./Database');

class PrecoModel {
    static async create(tipo, capacidade, valor_diaria) {
        const connection = await Database.getConnection();
        try {
            const query = `
                INSERT INTO TabelaPrecoUnidade (tipo, capacidade, valor_diaria) 
                VALUES (?, ?, ?)
            `;
            
            const [result] = await connection.execute(query, [tipo, capacidade, valor_diaria]);
            return result;
        } finally {
            await connection.release();
        }
    }

    static async getAll() {
        const connection = await Database.getConnection();
        try {
            const query = 'SELECT * FROM TabelaPrecoUnidade';
            
            const [rows] = await connection.execute(query);
            return rows;
        } finally {
            await connection.release();
        }
    }

    static async getByTipoAndCapacidade(tipo, capacidade) {
        const connection = await Database.getConnection();
        try {
            const query = `
                SELECT * FROM TabelaPrecoUnidade 
                WHERE tipo = ? AND capacidade = ?
            `;
            
            const [rows] = await connection.execute(query, [tipo, capacidade]);
            return rows;
        } finally {
            await connection.release();
        }
    }
}

module.exports = PrecoModel;
