const reservationHandler = new FormHandler('reservationForm', handleSubmit);
reservationHandler.onReady = initializeForm;

function initializeForm() {
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    const qtdDias = document.getElementById('qtdDias');
    const hospedes = document.getElementById('hospedes');

    const atualizarDias = () => {
        if (dataInicio.value && dataFim.value) {
            const inicio = new Date(dataInicio.value);
            const fim = new Date(dataFim.value);
            const dias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

            if (dias <= 0) {
                qtdDias.value = '';
            } else {
                qtdDias.value = dias;
            }
        }
    };

    dataInicio.addEventListener('change', atualizarDias);
    dataFim.addEventListener('change', atualizarDias);
    hospedes.addEventListener('change', validarCapacidade);
    document.getElementById('quarto').addEventListener('change', validarCapacidade);

    carregarClientes();
    carregarQuartos();
}

async function carregarClientes() {
    try {
        const result = await APIService.getAllClients();

        if (result.ok && result.data) {
            const selectCliente = document.getElementById('cliente');
            selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';

            const clientes = Array.isArray(result.data) ? result.data : [];

            if (clientes.length > 0) {
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id_cliente;
                    option.textContent = `${cliente.nome} - CPF: ${cliente.cpf}`;
                    selectCliente.appendChild(option);
                });
            } else {
                selectCliente.innerHTML += '<option disabled>Nenhum cliente cadastrado</option>';
            }
        } else {
            const selectCliente = document.getElementById('cliente');
            selectCliente.innerHTML = '<option disabled>Erro ao carregar clientes</option>';
        }
    } catch (error) {
        const selectCliente = document.getElementById('cliente');
        selectCliente.innerHTML = '<option disabled>Erro ao carregar clientes</option>';
    }
}

async function carregarQuartos() {
    try {
        const result = await APIService.getAllRooms();

        if (result.ok && result.data) {
            const selectQuarto = document.getElementById('quarto');
            selectQuarto.innerHTML = '<option value="">Selecione um quarto</option>';

            const quartos = Array.isArray(result.data) ? result.data : [];
            const quartosDisponiveis = quartos.filter(q => q.status === 'Disponível');

            if (quartosDisponiveis.length > 0) {
                quartosDisponiveis.forEach(quarto => {
                    const option = document.createElement('option');
                    option.value = quarto.id_quarto;
                    option.dataset.capacidade = quarto.capacidade;
                    option.dataset.tipo = quarto.tipo;
                    option.textContent = `Quarto ${quarto.numero} - ${quarto.tipo} (${quarto.capacidade} pessoa${quarto.capacidade > 1 ? 's' : ''})`;
                    selectQuarto.appendChild(option);
                });
            } else {
                selectQuarto.innerHTML += '<option disabled>Nenhum quarto disponível</option>';
            }
        } else {
            const selectQuarto = document.getElementById('quarto');
            selectQuarto.innerHTML = '<option disabled>Erro ao carregar quartos</option>';
        }
    } catch (error) {
        const selectQuarto = document.getElementById('quarto');
        selectQuarto.innerHTML = '<option disabled>Erro ao carregar quartos</option>';
    }
}

function validarCapacidade() {
    const selectQuarto = document.getElementById('quarto');
    const hospedes = document.getElementById('hospedes');
    const messageDiv = document.getElementById('message');
    
    if (selectQuarto.value && hospedes.value) {
        const opcaoSelecionada = selectQuarto.options[selectQuarto.selectedIndex];
        const capacidade = parseInt(opcaoSelecionada.dataset.capacidade);
        const hospedesQtd = parseInt(hospedes.value);
        
        if (hospedesQtd > capacidade) {
            messageDiv.textContent = `Este quarto comporta apenas ${capacidade} hóspede(s)`;
            messageDiv.style.color = 'orange';
            console.warn(`Capacidade do quarto excedida`);
        } else {
            messageDiv.textContent = '';
        }
    }
}

async function handleSubmit(handler) {
    try {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        const funcionarioId = userData?.id_funcionario || userData?.id;

        if (!userData || !funcionarioId) {
            handler.showMessage('Usuário não identificado. Faça login novamente.', 'error');
            return;
        }

        const cliente = document.getElementById('cliente');
        const quarto = document.getElementById('quarto');
        const hospedes = document.getElementById('hospedes');
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');
        const qtdDias = document.getElementById('qtdDias');

        const clienteId = cliente?.value || '';
        const quartoId = quarto?.value || '';
        const hospedesQtd = parseInt(hospedes?.value || 0);
        const dias = parseInt(qtdDias?.value || 0);

        if (!clienteId) {
            handler.showMessage('Selecione um cliente', 'error');
            return;
        }

        if (!quartoId) {
            handler.showMessage('Selecione um quarto', 'error');
            return;
        }

        if (isNaN(hospedesQtd) || hospedesQtd < 1 || hospedesQtd > 3) {
            handler.showMessage('Quantidade de hóspedes deve ser entre 1 e 3', 'error');
            return;
        }

        if (!dataInicio.value || !dataFim.value) {
            handler.showMessage('Selecione as datas de início e fim', 'error');
            return;
        }

        if (isNaN(dias) || dias < 1) {
            handler.showMessage('Período inválido', 'error');
            return;
        }

        const opcaoSelecionada = quarto.options[quarto.selectedIndex];
        const capacidade = parseInt(opcaoSelecionada.dataset.capacidade);

        if (hospedesQtd > capacidade) {
            handler.showMessage(`Este quarto comporta apenas ${capacidade} hóspede(s)`, 'error');
            return;
        }

        handler.showMessage('Enviando reserva...', 'info');

        const data = {
            fk_funcionario_id: funcionarioId,
            fk_cliente_id: parseInt(clienteId),
            fk_quarto_id: parseInt(quartoId),
            qtd_hospedes: hospedesQtd,
            qtd_diarias: dias
        };

        const result = await APIService.createReservation(data);

        if (result && result.ok) {
            handler.showMessage('Reserva cadastrada com sucesso! Redirecionando em 2 segundos...', 'success');
            handler.redirectAfterSuccess('/dashboard', 2000);
        } else {
            const errorMsg = result?.error || 'Erro desconhecido';
            handler.showMessage('Erro: ' + errorMsg, 'error');
        }
    } catch (error) {
        reservationHandler.showMessage('Erro: ' + (error.message || 'Erro desconhecido'), 'error');
    }
}
