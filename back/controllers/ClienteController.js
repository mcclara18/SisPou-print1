const ClienteModel = require('../models/ClienteModel');
const Validator = require('../utils/Validator');

class ClienteController {
    static async create(req, res) {
        try {
            const { nome, cpf, telefone, email, endereco } = req.body;
            if (!nome || !email || !cpf || !endereco) {
                return res.status(400).json({ 
                    message: 'Todos os campos marcados como obrigatórios devem ser preenchidos.' 
                });
            }
            if (!Validator.isValidEmail(email)) {
                return res.status(400).json({ 
                    message: 'Email inválido. Verifique o email digitado.', 
                    field: 'email' 
                });
            }
            if (!Validator.isValidCPF(cpf)) {
                return res.status(400).json({ 
                    message: 'CPF inválido. Verifique o CPF digitado.', 
                    field: 'cpf' 
                });
            }
            if (!Validator.isValidTelefone(telefone)) {
                return res.status(400).json({ 
                    message: 'O telefone não pode ter mais que 11 dígitos.', 
                    field: 'telefone' 
                });
            }
            console.log(`[ClienteController] Verificando CPF ${cpf} no sistema...`);
            const existingCPF = await ClienteModel.findCPFInSystem(cpf);
            if (existingCPF) {
                console.log(`[ClienteController] CPF ${cpf} já existe! Rejeitando...`);
                return res.status(409).json({ 
                    message: 'Este CPF já está cadastrado.', 
                    field: 'cpf' 
                });
            }
            console.log(`[ClienteController] Verificando email ${email} no sistema...`);
            const existingEmail = await ClienteModel.findEmailInSystem(email);
            if (existingEmail) {
                console.log(`[ClienteController] Email ${email} já existe! Rejeitando...`);
                return res.status(409).json({ 
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
                message: 'Cliente cadastrado com sucesso!', 
                clienteId 
            });
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }
    static async getAll(req, res) {
        try {
            const clientes = await ClienteModel.findAll();
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }
}

module.exports = ClienteController;
