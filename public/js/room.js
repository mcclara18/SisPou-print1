document.addEventListener('DOMContentLoaded', () => {
    const registerRoomForm = document.getElementById('registerRoomForm');
    const messageDiv = document.getElementById('message');

    const showMessage = (message, type) => {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    };

    if (registerRoomForm) {
        registerRoomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerRoomForm);
            const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (response.ok) {
                    showMessage(result.message, 'success');
                    setTimeout(() => {
                        window.location.href = '/dashboard'; 
                    }, 1500);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('Erro de conexão. Tente novamente.', 'error');
            }
        });
    }
});