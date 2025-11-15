const QuartoModel = require('../models/QuartoModel');
const Validator = require('../utils/Validator');

class QuartoController {
    static async create(req, res) {
        try {
            const { numero, capacidade, status, tipo } = req.body;

            if (!numero || !capacidade || !status || !tipo) {
                return res.status(400).json({ 
                    message: 'Número, capacidade, status e tipo são obrigatórios.' 
                });
            }

            if (!Validator.isValidCapacidade(capacidade)) {
                return res.status(400).json({ 
                    message: 'A capacidade deve estar entre 1 e 4 pessoas.' 
                });
            }

            if (!Validator.isValidStatus(status)) {
                return res.status(400).json({ 
                    message: 'O status do quarto tem que ser Disponível, Ocupado ou Em manutenção.' 
                });
            }

            if (!Validator.isValidTipo(tipo)) {
                return res.status(400).json({ 
                    message: 'Tipo de quarto inválido.' 
                });
            }

            const existingQuarto = await QuartoModel.findByNumero(numero);
            if (existingQuarto) {
                return res.status(409).json({ 
                    message: 'Já existe um quarto com este número.' 
                });
            }

            await QuartoModel.create({
                numero,
                capacidade,
                status,
                tipo
            });

            res.status(201).json({ 
                message: 'Quarto cadastrado com sucesso!'
            });

        } catch (error) {
            console.error('Erro ao cadastrar quarto:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }


  /** VAI LISTAR TODOS OS QUARTOS */
   static async getAll(req, res) {
        try {
            const { status } = req.query;

            let quartos;

            if (status) {
                quartos = await QuartoModel.findByStatus(status); /** VAI BUSCAR O QUARTO POR STATUS NO MODELO CASO VENHA O PARÂMETRO */
            } else {
                quartos = await QuartoModel.findAll(); /** VAI BUSCAR TODOS OS QUARTOS */
            }

            res.status(200).json(quartos);

        } catch (error) {
            console.error("Erro ao listar quartos:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }

    static async getFilterStatus(req, res){
        try {
            const { tipo } = req.params;
            const quartos = await QuartoModel.findByStatus(tipo);
            res.status(200).json(quartos);
        } catch (error) {
            console.error('Erro ao listar quartos:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }

  
    static async updateStatus(req, res) {
        try {
            const { numero } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ 
                    message: 'Status é obrigatório.' 
                });
            }

            if (!Validator.isValidStatus(status)) {
                return res.status(400).json({ 
                    message: 'Status inválido. Use Disponível, Ocupado ou Em manutenção.' 
                });
            }

            const updated = await QuartoModel.updateStatus(numero, status);
            
            if (!updated) {
                return res.status(404).json({ 
                    message: 'Quarto não encontrado.' 
                });
            }

            res.status(200).json({ 
                message: 'Status do quarto atualizado com sucesso!' 
            });

        } catch (error) {
            console.error('Erro ao atualizar status do quarto:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }
}

module.exports = QuartoController;
