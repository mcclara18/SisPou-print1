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

            const result = await APIService.createRoom(data);

            if (result.ok) {
                showMessage(result.data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard'; 
                }, 1500);
            } else {
                showMessage(result.error, 'error');
            }
        });
    }
});