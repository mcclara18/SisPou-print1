const Database = require('./Database');

class ReservaModel {
    static async create(fk_funcionario_id, fk_cliente_id, fk_quarto_id, qtd_hospedes, qtd_diarias) {
        const connection = await Database.getConnection();
        try {
            const query = `
                INSERT INTO Reserva (fk_funcionario_id, fk_cliente_id, fk_quarto_id, qtd_hospedes, qtd_diarias) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const [result] = await connection.execute(query, [
                fk_funcionario_id, 
                fk_cliente_id, 
                fk_quarto_id, 
                qtd_hospedes, 
                qtd_diarias
            ]);
            
            return result;
        } finally {
            await connection.release();
        }
    }

    static async getAll() {
        const connection = await Database.getConnection();
        try {
            const query = `
                SELECT 
                    r.id_reserva,
                    r.fk_funcionario_id,
                    r.fk_cliente_id,
                    r.fk_quarto_id,
                    r.qtd_hospedes,
                    r.preco,
                    r.qtd_diarias,
                    r.data_operacao,
                    q.numero as quarto_numero,
                    q.status as quarto_status,
                    q.tipo as quarto_tipo,
                    c.nome as cliente_nome,
                    c.cpf as cliente_cpf
                FROM Reserva r
                LEFT JOIN Quarto q ON r.fk_quarto_id = q.id_quarto
                LEFT JOIN Cliente c ON r.fk_cliente_id = c.id_cliente
                ORDER BY r.data_operacao DESC
            `;
            
            const [rows] = await connection.execute(query);
            return rows;
        } catch (error) {
            console.error('Erro em getAll():', error);
            throw error;
        } finally {
            await connection.release();
        }
    }

    static async getByReservaId(id_reserva) {
        const connection = await Database.getConnection();
        try {
            const query = `
                SELECT 
                    r.id_reserva,
                    r.fk_funcionario_id,
                    r.fk_cliente_id,
                    r.fk_quarto_id,
                    r.qtd_hospedes,
                    r.preco,
                    r.qtd_diarias,
                    r.data_operacao,
                    q.numero as quarto_numero,
                    q.status as quarto_status,
                    q.tipo as quarto_tipo,
                    c.nome as cliente_nome,
                    c.cpf as cliente_cpf
                FROM Reserva r
                JOIN Quarto q ON r.fk_quarto_id = q.id_quarto
                JOIN Cliente c ON r.fk_cliente_id = c.id_cliente
                WHERE r.id_reserva = ?
            `;
            
            const [rows] = await connection.execute(query, [id_reserva]);
            return rows[0] || null;
        } finally {
            await connection.release();
        }
    }

    static async checkQuartoEmReserva(fk_quarto_id) {
        const connection = await Database.getConnection();
        try {
            const query = 'SELECT COUNT(*) as count FROM Reserva WHERE fk_quarto_id = ?';
            const [rows] = await connection.execute(query, [fk_quarto_id]);
            return rows[0].count > 0;
        } finally {
            await connection.release();
        }
    }

    static async checkClienteEmReserva(fk_cliente_id) {
        const connection = await Database.getConnection();
        try {
            const query = 'SELECT COUNT(*) as count FROM Reserva WHERE fk_cliente_id = ?';
            const [rows] = await connection.execute(query, [fk_cliente_id]);
            return rows[0].count > 0;
        } finally {
            await connection.release();
        }
    }
}

module.exports = ReservaModel;
