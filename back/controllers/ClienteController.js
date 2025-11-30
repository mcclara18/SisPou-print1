const ClienteModel = require('../models/ClienteModel');
const Validator = require('../utils/Validator');

class ClienteController {
    static async create(req, res) {
        try {
            const { nome, cpf, telefone, email, endereco } = req.body;
            if (!nome || !email || !cpf || !endereco) {
                return res.status(400).json({ 
                    ok: false,
                    message: 'Todos os campos marcados como obrigatórios devem ser preenchidos.' 
                });
            }
            if (!Validator.isValidEmail(email)) {
                return res.status(400).json({ 
                    ok: false,
                    message: 'Email inválido. Verifique o email digitado.', 
                    field: 'email' 
                });
            }
            if (!Validator.isValidCPF(cpf)) {
                return res.status(400).json({ 
                    ok: false,
                    message: 'CPF inválido. Verifique o CPF digitado.', 
                    field: 'cpf' 
                });
            }
            if (!Validator.isValidTelefone(telefone)) {
                return res.status(400).json({ 
                    ok: false,
                    message: 'O telefone não pode ter mais que 11 dígitos.', 
                    field: 'telefone' 
                });
            }
            const existingCPF = await ClienteModel.findCPFInSystem(cpf);
            if (existingCPF) {
                return res.status(409).json({ 
                    ok: false,
                    message: 'Este CPF já está cadastrado.', 
                    field: 'cpf' 
                });
            }
            const existingEmail = await ClienteModel.findEmailInSystem(email);
            if (existingEmail) {
                return res.status(409).json({ 
                    ok: false,
                    message: 'Este email já está cadastrado.', 
                    field: 'email' 
                });
            }
            const clienteId = await ClienteModel.create({
                nome,
                cpf,
                telefone,
                email,
                endereco
            });
            res.status(201).json({ 
                ok: true,
                message: 'Cliente cadastrado com sucesso!', 
                data: {
                    id_cliente: clienteId,
                    nome,
                    cpf,
                    telefone,
                    email,
                    endereco
                }
            });
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            res.status(500).json({ 
                ok: false,
                message: 'Erro interno no servidor.',
                error: error.message
            });
        }
    }
    static async getAll(req, res) {
        try {
            const clientes = await ClienteModel.findAll();
            res.status(200).json({
                ok: true,
                data: clientes
            });
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ 
                ok: false,
                message: 'Erro interno no servidor.',
                error: error.message
            });
        }
    }
}

module.exports = ClienteController;
