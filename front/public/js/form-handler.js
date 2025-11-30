class FormHandler {
    constructor(formId, submitCallback) {
        this.form = document.getElementById(formId);
        this.messageDiv = this.form?.closest('.form-container')?.querySelector('.message') || 
                         document.getElementById('message');
        this.submitCallback = submitCallback;
        this.init();
    }

    init() {
        if (!this.form) {
            console.error(`Formulário com ID "${this.form.id}" não encontrado`);
            return;
        }

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitCallback(this);
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady?.());
        } else {
            this.onReady?.();
        }
    }

    showMessage(message, type = 'error') {
        if (!this.messageDiv) return;
        
        this.messageDiv.textContent = message;
        this.messageDiv.className = `message ${type}`;
        
        if (type === 'success') {
            this.messageDiv.style.display = 'block';
        } else if (type === 'error') {
            this.messageDiv.style.display = 'block';
        } else if (type === 'info') {
            this.messageDiv.style.display = 'block';
        }
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    getFormData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }

    redirectAfterSuccess(url = '/dashboard', delay = 2000) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }
}
