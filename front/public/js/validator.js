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

    static cleanCPF(cpf) {
        return cpf.replace(/\D/g, '');
    }

    static cleanTelefone(telefone) {
        return telefone.replace(/\D/g, '');
    }

    static setupCPFInput(inputElement) {
        inputElement.addEventListener('input', (e) => {
            e.target.value = this.formatCPF(e.target.value);
        });
    }

    static setupTelefoneInput(inputElement) {
        inputElement.addEventListener('input', (e) => {
            e.target.value = this.formatTelefone(e.target.value);
        });
    }

    static setupFormValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const cpfInputs = form.querySelectorAll('input[name="cpf"]');
        const telInputs = form.querySelectorAll('input[name="telefone"]');

        cpfInputs.forEach(input => this.setupCPFInput(input));
        telInputs.forEach(input => this.setupTelefoneInput(input));
    }
}
