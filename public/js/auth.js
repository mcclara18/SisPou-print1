document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    const showMessage = (message, type) => {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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
                    showMessage(result.message, 'success');
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
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
            e.target.value = value;
        });

        telInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }

            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d*)/, '($1) $2');
            } else {
                value = value.replace(/(\d*)/, '($1');
            }
            e.target.value = value;
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            const [rua, bairro, numero] = data.endereco ? data.endereco.split(',').map(s => s.trim()) : [null, null, null];
            data.rua = rua;
            data.bairro = bairro;
            data.numero = numero ? parseInt(numero, 10) : null;
            delete data.endereco;

            if (data.cpf) data.cpf = data.cpf.replace(/\D/g, '');
            if (data.telefone) {
                let tel = data.telefone.replace(/\D/g, '');
                if (tel.length === 11) {
                    data.telefone = tel;
                } else {
                    // Tratar erro de telefone inválido se necessário
                }
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('Cadastro realizado com sucesso! Redirecionando para login...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('Erro de conexão. Tente novamente.', 'error');
            }
        });
    }
});
