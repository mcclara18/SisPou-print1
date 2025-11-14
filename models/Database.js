const mysql = require('mysql2/promise');
const dbConfig = require('../server/dbconfig');

let pool;

class Database {
    static async init() {
        try {
            pool = mysql.createPool(dbConfig);
            console.log('Conexão Realizada');
            return pool;
        } catch (error) {
            console.error('Falha ao conectar com o Banco de Dados:', error);
            process.exit(1);
        }
    }

    static async getConnection() {
        if (!pool) {
            await this.init();
        }
        return await pool.getConnection();
    }

    static getPool() {
        return pool;
    }
}

module.exports = Database;
