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

            const renderRooms = (rooms) => {
                roomList.innerHTML = ''; 
                if (rooms.length === 0) {
                    roomList.innerHTML = '<p>Nenhum quarto cadastrado.</p>';
                    room.list.appendChild(div);
                }

                rooms.forEach(room => {
                    const div = document.createElement('div');
                    div.className = 'room-item';
                    div.dataset.roomNumber = room.numero; 
                    const statusValue = room.status || 'Indefinido';
                    const statusClass = `status-${statusValue.toLowerCase().replace(/\s/g, '').replace('ê', 'e')}`;
                    const precoFormatado = (typeof room.preco === 'number') ? room.preco.toFixed(2).replace('.', ',') : '0,00';

                    div.innerHTML = `
                        <button class="edit-btn" data-numero="${room.numero}">
                            <svg viewBox="0 0 24 24"><path d="M17.29,3.29a1,1,0,0,0-1.41,0L13,6.17V10H6V4H9.83l-2.54-2.54a1,1,0,0,0-1.41,1.41L8.41,5.41,5,8.83V15a1,1,0,0,0,1,1h9.17l2.54,2.54a1,1,0,0,0,1.41-1.41L16.59,14.59,19.17,12,10,2.83V6h1.17l5.41-5.41A1,1,0,0,0,17.29,3.29Z"/></svg>
                        </button>
                        <div class="room-item-details">
                            <strong>Quarto ${room.numero}</strong>
                            <span>Capacidade: ${room.capacidade} pessoas</span><br>
                            <span>Preço: R$ ${precoFormatado}</span>
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

            const fetchRooms = async () => {
                try {
                    const response = await fetch('/api/rooms');
                    const rooms = await response.json();
                    renderRooms(rooms);
                } catch (error) {
                    console.error("Falha ao carregar quartos:", error);
                    roomList.innerHTML = '<p>Erro ao carregar os quartos.</p>';
                }
            };

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