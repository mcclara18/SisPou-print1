const priceHandler = new FormHandler('priceForm', handleSubmit);
priceHandler.onReady = initializeForm;

function initializeForm() {
}

async function handleSubmit(handler) {
    try {
        const tipo = document.getElementById('room-type');
        const capacidade = document.getElementById('capacity');
        const valor_diaria = document.getElementById('daily-price');

        const tipoValue = tipo?.value?.trim();
        const capacidadeValue = parseInt(capacidade?.value || 0);
        const valorValue = parseFloat(valor_diaria?.value || 0);

        if (!tipoValue) {
            handler.showMessage('Selecione o tipo do quarto', 'error');
            return;
        }

        if (isNaN(capacidadeValue) || capacidadeValue < 1 || capacidadeValue > 3) {
            handler.showMessage('Capacidade deve ser entre 1 e 3', 'error');
            return;
        }

        if (isNaN(valorValue) || valorValue <= 0) {
            handler.showMessage('Valor da diária deve ser maior que zero', 'error');
            return;
        }

        handler.showMessage('⏳ Enviando dados...', 'info');

        const data = {
            tipo: tipoValue,
            capacidade: capacidadeValue,
            valor_diaria: valorValue
        };

        if (typeof APIService === 'undefined') {
            throw new Error('APIService não está definido!');
        }

        const result = await APIService.createPrice(data);

        if (result && result.ok) {
            handler.showMessage('Preço cadastrado com sucesso! Redirecionando em 2 segundos...', 'success');
            handler.redirectAfterSuccess('/dashboard', 2000);
        } else {
            const errorMsg = result?.error || 'Erro desconhecido';
            handler.showMessage('Erro: ' + errorMsg, 'error');
        }
    } catch (error) {
        priceHandler.showMessage('Erro: ' + (error.message || 'Erro desconhecido'), 'error');
    }
}
