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
        const result = await APIService.login(data.email, data.password);

        if (result.ok) {
            sessionStorage.setItem('user', JSON.stringify(result.data.user));
            showMessage(result.data.message, 'success');
            setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
        } else {
            showMessage(result.error, 'error');
        }
    });
}

if (registerForm) {
    const cpfInput = document.getElementById('cpf');
    const telInput = document.getElementById('telefone');

    cpfInput.addEventListener('input', (e) => {
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
        e.target.value = FrontendValidator.formatTelefone(e.target.value);
    });


    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());  
        
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
        
        data.cpf = FrontendValidator.cleanCPF(data.cpf);
        data.telefone = FrontendValidator.cleanTelefone(data.telefone);

        const result = await APIService.register(data);
        
        if (result.ok) {
            showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
            setTimeout(() => { window.location.href = '/'; }, 2000);
        } else {
            showMessage(result.error, 'error', result.data?.field);
        }
    });
}
});