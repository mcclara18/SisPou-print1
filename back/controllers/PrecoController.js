const PrecoModel = require('../models/PrecoModel');
const Validator = require('../utils/Validator');

class PrecoController {
    static async create(req, res) {
        try {
            const { tipo, capacidade, valor_diaria } = req.body;

            if (!tipo || capacidade === undefined || !valor_diaria) {
                return res.status(400).json({
                    ok: false,
                    message: 'Tipo, capacidade e valor_diaria são obrigatórios'
                });
            }

            if (tipo !== 'arcondicionado' && tipo !== 'ventilador') {
                return res.status(400).json({
                    ok: false,
                    message: 'Tipo deve ser "arcondicionado" ou "ventilador"'
                });
            }

            const cap = parseInt(capacidade);
            if (isNaN(cap) || cap < 1 || cap > 3) {
                return res.status(400).json({
                    ok: false,
                    message: 'Capacidade deve ser um número entre 1 e 3'
                });
            }

            const preco = parseFloat(valor_diaria);
            if (isNaN(preco) || preco <= 0) {
                return res.status(400).json({
                    ok: false,
                    message: 'Valor da diária deve ser um número maior que zero'
                });
            }

            const existing = await PrecoModel.getByTipoAndCapacidade(tipo, cap);
            
            if (existing && existing.length > 0) {
                return res.status(400).json({
                    ok: false,
                    message: 'Já existe um preço cadastrado para este tipo e capacidade'
                });
            }

            const result = await PrecoModel.create(tipo, cap, preco);

            res.status(201).json({
                ok: true,
                message: 'Preço cadastrado com sucesso',
                data: {
                    id_tabela: result.insertId,
                    tipo,
                    capacidade: cap,
                    valor_diaria: preco
                }
            });

        } catch (error) {
            console.error('Erro ao cadastrar preço:', error);
            res.status(500).json({
                ok: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    static async getAll(req, res) {
        try {
            const precos = await PrecoModel.getAll();

            res.status(200).json({
                ok: true,
                data: precos
            });

        } catch (error) {
            console.error('Erro ao buscar preços:', error);
            res.status(500).json({
                ok: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
}

module.exports = PrecoController;
