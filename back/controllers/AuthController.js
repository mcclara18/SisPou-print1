const bcrypt = require('bcrypt');
const FuncionarioModel = require('../models/FuncionarioModel');
const Validator = require('../utils/Validator');

class AuthController {
    static async register(req, res) {
        try {
            const { nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun, password } = req.body;
            if (!nome || !email || !password || !cargo_fun || !cpf) {
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
            if (password.length < 4) {
                return res.status(400).json({ 
                    message: 'A senha deve ter no mínimo 4 caracteres.', 
                    field: 'password' 
                });
            }
            if (!Validator.isValidCargo(cargo_fun)) {
                return res.status(400).json({ 
                    message: 'Cargo inválido.', 
                    field: 'cargo_fun' 
                });
            }
            console.log(`[AuthController] Verificando CPF ${cpf} no sistema...`);
            const existingCPF = await FuncionarioModel.findCPFInSystem(cpf);
            if (existingCPF) {
                console.log(`[AuthController] CPF ${cpf} já existe! Rejeitando...`);
                return res.status(409).json({ 
                    message: 'Este CPF já está cadastrado.', 
                    field: 'cpf' 
                });
            }
            console.log(`[AuthController] Verificando email ${email} no sistema...`);
            const existingEmail = await FuncionarioModel.findEmailInSystem(email);
            if (existingEmail) {
                console.log(`[AuthController] Email ${email} já existe! Rejeitando...`);
                return res.status(409).json({ 
                    message: 'Este email já está cadastrado.', 
                    field: 'email' 
                });
            }
            const password_hash = await bcrypt.hash(password, 10);
            const userId = await FuncionarioModel.create({
                nome,
                sobrenome,
                email,
                telefone,
                cpf,
                rua,
                bairro,
                numero,
                cargo_fun,
                senha: password_hash
            });
            res.status(201).json({ 
                message: 'Funcionário cadastrado com sucesso!', 
                userId 
            });
        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email e senha são obrigatórios.' 
                });
            }
            const user = await FuncionarioModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({ 
                    message: 'Email ou senha inválidos.' 
                });
            }
            const passwordMatch = await bcrypt.compare(password, user.senha);
            if (!passwordMatch) {
                return res.status(401).json({ 
                    message: 'Credenciais inválidas.' 
                });
            }
            res.status(200).json({ 
                message: 'Login bem-sucedido!', 
                user: { 
                    id: user.id_funcionario, 
                    nome: user.nome, 
                    cargo: user.cargo_fun 
                } 
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ 
                message: 'Erro interno no servidor.' 
            });
        }
    }
}

module.exports = AuthController;
