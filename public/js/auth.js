document.addEventListener('DOMContentLoaded', () => {
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

function isValidCPF(cpf) {
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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const clearErrors = () => {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    messageDiv.className = 'message';
    messageDiv.textContent = '';
};

const showMessage = (message, type, field = null) => {
    clearErrors();
    if (field) {
        const input = document.getElementById(field);
        if (input) {
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.textContent = message;
            input.parentElement.appendChild(errorEl);
        }
    } else {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
};

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                sessionStorage.setItem('user', JSON.stringify(result.user));
                showMessage(result.message, 'Login realizado');
                setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
            } else {
                showMessage(result.message, 'error');
            }
        } catch (error) {
            showMessage('Erro de conexão. Tente novamente.', 'error');
        }
    });
}

if (registerForm) {
    const cpfInput = document.getElementById('cpf');
    const telInput = document.getElementById('telefone');

    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
        
        if (value.replace(/\D/g, '').length === 11) {
            const errorEl = cpfInput.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.remove();
            }
            
            if (!isValidCPF(value)) {
                const erro = document.createElement('div');
                erro.className = 'error-message';
                erro.textContent = 'CPF inválido. Verifique os dígitos.';
                cpfInput.parentElement.appendChild(erro);
            }
        }
    });

    telInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d*)/, '($1) $2');
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        e.target.value = value;
    });


    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());
        
        if (!isValidEmail(data.email)) {
            showMessage('Email inválido. Verifique o email digitado.', 'error', 'email');
            return;
        }
        
        if (!isValidCPF(data.cpf)) {
            showMessage('CPF inválido. Verifique os dígitos.', 'error', 'cpf');
            return;
        }
        
        const [rua, bairro, numero] = data.endereco ? data.endereco.split(',').map(s => s.trim()) : [null, null, null];
        data.rua = rua;
        data.bairro = bairro;
        data.numero = numero ? parseInt(numero, 10) : null;
        delete data.endereco;

        if (data.cpf) data.cpf = data.cpf.replace(/\D/g, '');
        if (data.telefone) data.telefone = data.telefone.replace(/\D/g, '');

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
                setTimeout(() => { window.location.href = '/'; }, 2000);
            } else {
                showMessage(result.message, 'error', result.field);
            }
        } catch (error) {
            showMessage('Erro de conexão. Tente novamente.', 'error');
        }
    });
}
});