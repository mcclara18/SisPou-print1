document.addEventListener('DOMContentLoaded', () => {
    FrontendValidator.setupFormValidation('clientForm');

    document.getElementById('clientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.getElementById('message').textContent = '';

        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const email = document.getElementById('email').value.trim();
        const endereco = document.getElementById('endereco').value.trim();

        if (!FrontendValidator.isValidCPF(cpf)) {
            const errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.textContent = 'CPF inválido. Verifique os dígitos.';
            cpfInput.parentElement.appendChild(errorEl);
            return;
        }

        const result = await APIService.createClient({
            nome,
            cpf: FrontendValidator.cleanCPF(cpf),
            telefone: FrontendValidator.cleanTelefone(telefone),
            email,
            endereco
        });

        if (result.ok) {
            const messageEl = document.getElementById('message');
            messageEl.textContent = 'Cliente cadastrado com sucesso!';
            messageEl.classList.add('success');
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } else {
            if (result.data?.field) {
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = result.error;
                const field = document.getElementById(result.data.field);
                if (field) {
                    field.parentElement.appendChild(errorEl);
                }
            } else {
                const messageEl = document.getElementById('message');
                messageEl.textContent = result.error;
                messageEl.classList.add('error');
                messageEl.style.display = 'block';
            }
        }
    });
});

function goToDashboard() {
    window.location.href = '/dashboard';
}
