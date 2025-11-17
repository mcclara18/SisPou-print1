class FrontendValidator {

    static formatCPF(cpf) {
        let value = cpf.replace(/\D/g, '').slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return value;
    }

    static formatTelefone(telefone) {
        let value = telefone.replace(/\D/g, '').slice(0, 11);
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d*)/, '($1) $2');
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        return value;
    }

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

    static cleanCPF(cpf) {
        return cpf.replace(/\D/g, '');
    }

    static cleanTelefone(telefone) {
        return telefone.replace(/\D/g, '');
    }
}
