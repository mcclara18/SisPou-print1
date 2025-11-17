document.addEventListener('DOMContentLoaded', () => {
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

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
        // Apenas formata e exibe feedback visual
        e.target.value = FrontendValidator.formatCPF(e.target.value);
        
        if (FrontendValidator.cleanCPF(e.target.value).length === 11) {
            const errorEl = cpfInput.parentElement.querySelector('.error-message');
            if (errorEl) {
                errorEl.remove();
            }
            
            if (!FrontendValidator.isValidCPF(e.target.value)) {
                const erro = document.createElement('div');
                erro.className = 'error-message';
                erro.textContent = 'CPF inválido. Verifique os dígitos.';
                cpfInput.parentElement.appendChild(erro);
            }
        }
    });

    telInput.addEventListener('input', (e) => {
        // Apenas formata
        e.target.value = FrontendValidator.formatTelefone(e.target.value);
    });


    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());  
        
        // Frontend: apenas feedback visual de formato inválido
        if (!FrontendValidator.isValidEmail(data.email)) {
            showMessage('Email inválido. Verifique o email digitado.', 'error', 'email');
            return;
        }    
        
        if (!FrontendValidator.isValidCPF(data.cpf)) {
            showMessage('CPF inválido. Verifique os dígitos.', 'error', 'cpf');
            return;
        }    
        
        const [rua, bairro, numero] = data.endereco ? data.endereco.split(',').map(s => s.trim()) : [null, null, null];
        data.rua = rua;
        data.bairro = bairro;
        data.numero = numero ? parseInt(numero, 10) : null;
        delete data.endereco;
        
        // Remove formatação antes de enviar ao backend
        data.cpf = FrontendValidator.cleanCPF(data.cpf);
        data.telefone = FrontendValidator.cleanTelefone(data.telefone);

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
                // Backend retorna validação detalhada
                showMessage(result.message, 'error', result.field);
            }
        } catch (error) {
            showMessage('Erro de conexão. Tente novamente.', 'error');
        }
    });
}
});