const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dbConfig = require('./dbconfig');

async function resetAdminPassword() {
    const email = process.argv[2]?.split('=')[1];
    const newPassword = process.argv[3]?.split('=')[1];

    if (!email || !newPassword) {
        console.error('Uso: node reset-admin-password.js email=<email> password=<nova_senha>');
        process.exit(1);
    }

    try {
        const password_hash = await bcrypt.hash(newPassword, 10);
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "UPDATE Funcionario SET password_hash = ? WHERE email = ? AND cargo_fun = 'Administrador'",
            [password_hash, email]
        );

        await connection.end();

        if (result.affectedRows > 0) {
            console.log(`Senha do administrador ${email} atualizada com sucesso.`);
        } else {
            console.log(`Nenhum administrador encontrado com o email ${email}.`);
        }
    } catch (error) {
        console.error('Erro ao resetar a senha:', error);
        process.exit(1);
    }
}

resetAdminPassword();
