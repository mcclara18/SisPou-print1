class Validator {
    static isValidCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            return false;
        }
        
        if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        
        let digit1 = 11 - (sum % 11);
        digit1 = digit1 >= 10 ? 0 : digit1;
        
        if (parseInt(cpf.charAt(9)) !== digit1) {
            return false;
        }
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        
        let digit2 = 11 - (sum % 11);
        digit2 = digit2 >= 10 ? 0 : digit2;
        
        if (parseInt(cpf.charAt(10)) !== digit2) {
            return false;
        }
        
        return true;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidTelefone(telefone) {
        if (!telefone) return true;
        const digitos = telefone.replace(/\D/g, '');
        return digitos.length === 10 || digitos.length === 11;
    }

    static isValidCapacidade(capacidade) {
        const cap = parseInt(capacidade);
        return cap >= 1 && cap <= 4;
    }

    static isValidStatus(status) {
        const validStatuses = ['Disponível', 'Ocupado', 'Em manutenção'];
        return validStatuses.includes(status);
    }

    static isValidTipo(tipo) {
        const validTipos = ['arcondicionado', 'ventilador'];
        return validTipos.includes(tipo);
    }

    static isValidCargo(cargo) {
        const validCargos = ['Administrador', 'Recepcionista'];
        return validCargos.includes(cargo);
    }
}

module.exports = Validator;
