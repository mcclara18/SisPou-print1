# SISPOU - Sistema de Gerenciamento Hoteleiro (Desktop)

O SISPOU é uma aplicação de desktop, construída com **Electron** e **Node.js**, para gerenciamento de um sistema hoteleiro. Ele permite o cadastro e login de funcionários (Administradores e Recepcionistas) e o gerenciamento de quartos, incluindo cadastro, listagem e atualização de status.

## Funcionalidades Implementadas

*   **Autenticação de Funcionários:**
    *   Tela de login segura com validação de email, senha e cargo.
    *   Tela de cadastro para novos funcionários (Administradores ou Recepcionistas).
    *   Senhas armazenadas de forma segura usando criptografia `bcrypt`.

*   **Dashboard Principal:**
    *   Exibe todos os quartos cadastrados em um layout de cards.
    *   Mostra informações visuais do status de cada quarto (Disponível, Ocupado, Em manutenção).

*   **Gerenciamento de Quartos:**
    *   **Cadastro de Quartos:** Administradores têm acesso a um botão para cadastrar novos quartos, definindo número, capacidade, preço e status inicial.
    *   **Listagem de Quartos:** Todos os quartos são exibidos no dashboard principal.
    *   **Atualização de Status:** Qualquer funcionário logado pode clicar em um ícone de edição para alterar o status de um quarto (Disponível, Ocupado, Em manutenção) através de um modal interativo.

## Tecnologias Utilizadas

*   **Desktop App:** Electron
*   **Backend:** Node.js com Express.js
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Banco de Dados:** MySQL
*   **Segurança:** `bcrypt` para hashing de senhas

---

## Pré-requisitos

Antes de começar, certifique-se de que você tem os seguintes softwares instalados:
*   [Node.js](https://nodejs.org/) (que inclui o npm)
*   Um servidor MySQL (por exemplo, via [XAMPP](https://www.apachefriends.org/index.html), [WAMP](https://www.wampserver.com/en/), ou [MySQL Community Server](https://dev.mysql.com/downloads/mysql/))

---

## Guia de Instalação e Execução

Siga os passos abaixo para configurar e rodar o projeto localmente.

### 1. Configure o Banco de Dados

1.  Inicie o seu servidor MySQL.
2.  Usando uma ferramenta como phpMyAdmin ou o terminal do MySQL, crie um novo banco de dados chamado `sispou`.
3.  Importe e execute o script **`sispou_spring1.sql`** (que está na raiz do projeto) dentro do banco de dados `sispou`. Isso criará todas as tabelas e inserirá alguns dados de exemplo.

### 2. Configure a Conexão

1.  Abra o arquivo `server/dbconfig.js`.
2.  Insira a senha do seu usuário `root` do MySQL no campo `password`.

    ```javascript
    // Exemplo em server/dbconfig.js
    module.exports = {
      host: 'localhost',
      user: 'root',
      password: 'sua-senha-aqui', // <-- COLOQUE SUA SENHA AQUI
      database: 'sispou'
    };
    ```

### 3. Instale as Dependências

O projeto tem duas pastas com dependências que precisam ser instaladas separadamente. Abra **dois terminais** na pasta raiz do projeto (`SISPOU`).

*   **No primeiro terminal (para o backend):**
    ```bash
    cd server
    npm install
    ```

*   **No segundo terminal (para o Electron):**
    ```bash
    npm install
    ```

### 4. Execute a Aplicação

Após instalar todas as dependências, no terminal que está na **pasta raiz (`SISPOU`)**, execute o comando de início:

```bash
npm start
```

Isso iniciará o servidor backend e, em seguida, abrirá a janela do aplicativo desktop.

### 5. Primeiro Acesso

*   O banco de dados já vem com alguns usuários cadastrados. Você pode usar as seguintes credenciais para fazer o primeiro login como **Administrador**:
    *   **Email:** `ana.souza@sispou.com`
    *   **Senha:** `123` (ou a senha que você definiu para este usuário)
*   Após o login, você será redirecionado para o dashboard, onde poderá ver e gerenciar os quartos.