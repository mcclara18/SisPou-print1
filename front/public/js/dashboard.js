document.addEventListener('DOMContentLoaded', async () => {
const userData = JSON.parse(sessionStorage.getItem('user'));

if (!userData) {
    window.location.href = '/';
    return;
}

const registerRoomBtn = document.getElementById('registerRoomBtn');
const registerClientBtn = document.getElementById('registerClientBtn');

if (userData.cargo === 'Administrador') {
    registerRoomBtn.style.display = 'block';
}

registerRoomBtn.addEventListener('click', () => {
    window.location.href = '/register-room';
});

registerClientBtn.addEventListener('click', () => {
    window.location.href = '/register-client';
});

const roomList = document.getElementById('roomList');
const modal = document.getElementById('statusModal');
const closeModalBtn = document.querySelector('.close-button');
const updateStatusForm = document.getElementById('updateStatusForm');
const modalRoomNumber = document.getElementById('modalRoomNumber');
const roomNumberInput = document.getElementById('roomNumberInput');
const newStatusSelect = document.getElementById('newStatus');

const renderRooms = (rooms) => {
    roomList.innerHTML = ''; 

    if (!rooms || rooms.length === 0) {
        roomList.innerHTML = '<p>Nenhum quarto encontrado.</p>';
        return;
    }

    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.dataset.roomNumber = room.numero;
        const statusValue = room.status || 'Em Manutenção';
        const statusClass = `status-${statusValue.toLowerCase().replace(/\s/g, '').replace('ê', 'e')}`;
        const tipoFormatado = room.tipo === 'arcondicionado' ? 'Ar-Condicionado' : 'Ventilador';
        div.innerHTML = `
            <button class="edit-btn" data-numero="${room.numero}">
                <svg viewBox="0 0 24 24"><path d="M17.29,3.29a1,1,0,0,0-1.41,0L13,6.17V10H6V4H9.83l-2.54-2.54a1,1,0,0,0-1.41,1.41L8.41,5.41,5,8.83V15a1,1,0,0,0,1,1h9.17l2.54,2.54a1,1,0,0,0,1.41-1.41L16.59,14.59,19.17,12,10,2.83V6h1.17l5.41-5.41A1,1,0,0,0,17.29,3.29Z"/></svg>
            </button>
            <div class="room-item-details">
                <strong>Quarto ${room.numero}</strong>
                <span>Capacidade: ${room.capacidade} pessoas</span><br>
                <span>Tipo: ${tipoFormatado}</span>
            </div>
            <div class="room-item-status ${statusClass}">
                ${statusValue}
            </div>
        `;
        roomList.appendChild(div);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        if (userData) {
            button.style.display = 'block';
        }
        button.addEventListener('click', (e) => {
            const roomNumber = e.currentTarget.dataset.numero;
            modalRoomNumber.textContent = roomNumber;
            roomNumberInput.value = roomNumber;
            modal.style.display = 'flex';
        });
    });
};

const fetchRooms = async (filtro = "") => {
    try {
        let result;
        
        if (filtro) {
            const params = new URLSearchParams(filtro.substring(1)); // Remove '?'
            const status = params.get('status') || '';
            const tipo = params.get('tipo') || '';
            result = await APIService.getRoomsByFilter(status, tipo);
        } else {
            result = await APIService.getAllRooms();
        }

        if (result.ok) {
            renderRooms(result.data);
        } else {
            console.error("Falha ao carregar quartos:", result.error);
            roomList.innerHTML = '<p>Erro ao carregar os quartos.</p>';
        }
    } catch (error) {
        console.error("Falha ao carregar quartos:", error);
        roomList.innerHTML = '<p>Erro ao carregar os quartos.</p>';
    }
};

document.getElementById("aplicarfiltro").addEventListener("click", () => {
    const status = document.getElementById("filtroStatus").value.trim();
    const tipoRadio = document.querySelector('input[name="tipo"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : "";
    const parametros = [];
    if (status) parametros.push(`status=${encodeURIComponent(status)}`);
    if (tipo) parametros.push(`tipo=${encodeURIComponent(tipo)}`);
    const filtro = parametros.length > 0
        ? "?" + parametros.join("&")
        : "";
    fetchRooms(filtro);
    popup.style.display = "none";
});

document.getElementById("limparFiltro").addEventListener("click", () => {
    document.getElementById("filtroStatus").value = "";
    document.querySelectorAll('input[name="tipo"]').forEach(r => r.checked = false);
    fetchRooms("");
    popup.style.display = "none";
});


closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

updateStatusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const numero = roomNumberInput.value;
    const status = newStatusSelect.value;

    const result = await APIService.updateRoomStatus(numero, status);

    if (result.ok) {
        modal.style.display = 'none';
        fetchRooms();
    } else {
        alert(`Erro: ${result.error}`);
    }
});

fetchRooms();
});