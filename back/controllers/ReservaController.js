const ReservaModel = require('../models/ReservaModel');
const QuartoModel = require('../models/QuartoModel');
const ClienteModel = require('../models/ClienteModel');

class ReservaController {
    static async create(req, res) {
        try {
            const { fk_cliente_id, fk_quarto_id, qtd_hospedes, qtd_diarias, fk_funcionario_id } = req.body;

            if (!fk_cliente_id || !fk_quarto_id || !qtd_hospedes || !qtd_diarias) {
                return res.status(400).json({
                    ok: false,
                    message: 'Cliente, quarto, quantidade de hóspedes e dias são obrigatórios'
                });
            }

            if (!fk_funcionario_id) {
                return res.status(400).json({
                    ok: false,
                    message: 'ID do funcionário é obrigatório'
                });
            }

            const qtd = parseInt(qtd_hospedes);
            if (isNaN(qtd) || qtd < 1 || qtd > 4) {
                return res.status(400).json({
                    ok: false,
                    message: 'Quantidade de hóspedes deve ser entre 1 e 4'
                });
            }

            const dias = parseInt(qtd_diarias);
            if (isNaN(dias) || dias < 1) {
                return res.status(400).json({
                    ok: false,
                    message: 'Quantidade de dias deve ser maior que zero'
                });
            }

            const clientes = await ClienteModel.findAll();
            const clienteExiste = clientes.some(c => c.id_cliente === parseInt(fk_cliente_id));
            
            if (!clienteExiste) {
                return res.status(400).json({
                    ok: false,
                    message: 'Cliente não encontrado'
                });
            }

            const quartos = await QuartoModel.findAll();
            const quarto = quartos.find(q => q.id_quarto === parseInt(fk_quarto_id));
            
            if (!quarto) {
                return res.status(400).json({
                    ok: false,
                    message: 'Quarto não encontrado'
                });
            }

            if (quarto.status !== 'Disponível') {
                return res.status(400).json({
                    ok: false,
                    message: 'Quarto não está disponível'
                });
            }

            const reservaDuplicada = await ReservaModel.checkQuartoEmReserva(fk_quarto_id);
            
            if (reservaDuplicada) {
                return res.status(400).json({
                    ok: false,
                    message: 'Este quarto já possui uma reserva ativa'
                });
            }

            const clienteComReserva = await ReservaModel.checkClienteEmReserva(fk_cliente_id);
            
            if (clienteComReserva) {
                return res.status(400).json({
                    ok: false,
                    message: 'Este cliente já possui uma reserva ativa. Não é permitido mais de uma reserva por cliente'
                });
            }

            if (qtd > quarto.capacidade) {
                return res.status(400).json({
                    ok: false,
                    message: `Quarto pode comportar no máximo ${quarto.capacidade} hóspede(s)`
                });
            }

            if (!fk_funcionario_id) {
                return res.status(400).json({
                    ok: false,
                    message: 'ID do funcionário é obrigatório'
                });
            }

            const result = await ReservaModel.create(fk_funcionario_id, fk_cliente_id, fk_quarto_id, qtd, dias);

            await QuartoModel.updateStatus(fk_quarto_id, 'Ocupado');

            const reservaCriada = await ReservaModel.getByReservaId(result.insertId);

            res.status(201).json({
                ok: true,
                message: 'Reserva cadastrada com sucesso',
                data: reservaCriada
            });

        } catch (error) {
            console.error('Erro ao cadastrar reserva:', error);
            res.status(500).json({
                ok: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    static async getAll(req, res) {
        try {
            const reservas = await ReservaModel.getAll();

            res.status(200).json({
                ok: true,
                data: reservas
            });

        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({
                ok: false,
                message: 'Erro interno no servidor.',
                error: error.message
            });
        }
    }
}

module.exports = ReservaController;
