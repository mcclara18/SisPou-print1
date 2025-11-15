const popup = document.getElementById('popup');
const openBtn = document.getElementById('openPopupBtn');
const closeBtn = document.getElementById('closePopup');

openBtn.addEventListener('click', () => {
    popup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Fechar clicando fora do popup
window.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.style.display = 'none';
    }
});
