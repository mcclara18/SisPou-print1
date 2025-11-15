document.addEventListener('DOMContentLoaded', async () => {
const userData = JSON.parse(sessionStorage.getItem('user'));
if (!userData) {
    window.location.href = '/';
    return;
}

const registerRoomBtn = document.getElementById('registerRoomBtn');
if (userData.cargo === 'Administrador') {
    registerRoomBtn.style.display = 'block';
}

registerRoomBtn.addEventListener('click', () => {
    window.location.href = '/register-room';
});

const roomList = document.getElementById('roomList');
const modal = document.getElementById('statusModal');
const closeModalBtn = document.querySelector('.close-button');
const updateStatusForm = document.getElementById('updateStatusForm');
const modalRoomNumber = document.getElementById('modalRoomNumber');
const roomNumberInput = document.getElementById('roomNumberInput');
const newStatusSelect = document.getElementById('newStatus');

/** VAI RENDERIZAR TODOS OS QUARTOS NA TELA */
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

/** VAI BUSCAR TODOS OS DADOS JSON NA API */
const fetchRooms = async (filtro = "") => {
    try {

        console.log("URL FINAL:", `/api/rooms${filtro}`);

        const response = await fetch(`/api/rooms${filtro}`);

        if (!response.ok) {
            throw new Error("Resposta inválida do servidor");
        }

        const rooms = await response.json();
        renderRooms(rooms);

    } catch (error) {
        console.error("Falha ao carregar quartos:", error);
        roomList.innerHTML = '<p>Erro ao carregar os quartos.</p>';
    }
};


/** FILTRA PELO SELECT */
/*const filtroStatus = document.querySelector("#filtroStatus")

filtroStatus.addEventListener('change', ()=>{
    const status = document.getElementById("filtroStatus").value.trim();

    if (status !== "") {
        fetchRooms(`?status=${encodeURIComponent(status)}`);
    } else {
        fetchRooms("");
    }
})*/

/** APLICAR FILTRO */
document.getElementById("aplicarfiltro").addEventListener("click", () => {

    const status = document.getElementById("filtroStatus").value.trim();

    const tipoRadio = document.querySelector('input[name="tipo"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : "";

    const parametros = [];

    if (status) parametros.push(`status=${encodeURIComponent(status)}`);
    if (tipo) parametros.push(`tipo=${encodeURIComponent(tipo)}`);

    //junta os dois parâmetros
    const filtro = parametros.length > 0
        ? "?" + parametros.join("&")
        : "";

    fetchRooms(filtro);

    popup.style.display = "none";
});


/** LIMPAR FILTRO */

document.getElementById("limparFiltro").addEventListener("click", () => {

    // Limpa o select de status
    document.getElementById("filtroStatus").value = "";

    // Desmarca todos os radio buttons
    document.querySelectorAll('input[name="tipo"]').forEach(r => r.checked = false);

    // Busca todos os quartos sem filtro
    fetchRooms("");

    // Fecha o popup (opcional)
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

    try {
        const response = await fetch(`/api/rooms/${numero}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });

        if (response.ok) {
            modal.style.display = 'none';
            fetchRooms();
        } else {
            const result = await response.json();
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        alert('Erro de conexão ao atualizar o status.');
    }
});

fetchRooms();
});