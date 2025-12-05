const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta_segura_aqui_2024';

class AuthMiddleware {
    static generateToken(userData) {
        return jwt.sign(
            {
                id_funcionario: userData.id_funcionario,
                email: userData.email,
                cargo: userData.cargo_fun
            },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
    }

    static verifyToken(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    ok: false,
                    message: 'Token de autenticação não fornecido.'
                });
            }

            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    ok: false,
                    message: 'Token expirado. Faça login novamente.'
                });
            }
            return res.status(403).json({
                ok: false,
                message: 'Token inválido.'
            });
        }
    }

    static verifyAdminRole(req, res, next) {
        if (req.user.cargo !== 'Administrador') {
            return res.status(403).json({
                ok: false,
                message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
            });
        }
        next();
    }
}

module.exports = AuthMiddleware;
