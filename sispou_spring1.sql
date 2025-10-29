/* ===========================
   BANCO DE DADOS SISPou
   =========================== */

CREATE DATABASE sispou;
USE sispou;

/* ===========================
   TABELA: Funcionario
   =========================== */
CREATE TABLE Funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(11),
    cpf VARCHAR(11) UNIQUE,
    rua VARCHAR(100),
    bairro VARCHAR(100),
    numero INT,
    cargo_fun enum ('Administrador', 'Recepcionista')
);

/* ===========================
   TABELA: Usuario
   =========================== */
CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    telefone VARCHAR(11),
    email VARCHAR(100) UNIQUE,
    cpf VARCHAR(11) UNIQUE
);

/* ===========================
   TABELA: Quarto
   =========================== */
CREATE TABLE Quarto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero INT UNIQUE,
    capacidade INT,
    status enum ('Disponível', 'Ocupado', 'Em manutenção'),
    preco DOUBLE
);

/*Adicionar isso é uma procedure ou trigger*/

CREATE TABLE Realiza (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_funcionario_id INT,
    fk_quarto_id INT,
    tipo_operacao enum ('Create', 'Update', 'Delete'),
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    descricao text,
    FOREIGN KEY (fk_funcionario_id) REFERENCES Funcionario(id_funcionario) ON DELETE RESTRICT,
    FOREIGN KEY (fk_quarto_id) REFERENCES Quarto(id) ON DELETE RESTRICT
);

/* ===========================
   INSERINDO DADOS: Funcionario
   =========================== */
INSERT INTO Funcionario (nome, sobrenome, email, telefone, cpf, rua, bairro, numero, cargo_fun) VALUES
('Ana', 'Souza', 'ana.souza@sispou.com', '11987654321', '12345678901', 'Rua das Flores', 'Centro', 101, 'Administrador'),
('Bruno', 'Silva', 'bruno.silva@sispou.com', '11999998888', '23456789012', 'Av. Paulista', 'Bela Vista', 202, 'Recepcionista'),
('Carla', 'Mendes', 'carla.mendes@sispou.com', '11876543210', '34567890123', 'Rua Rio Branco', 'Jardins', 303, 'Recepcionista'),
('Diego', 'Oliveira', 'diego.oliveira@sispou.com', '11765432109', '45678901234', 'Rua das Acácias', 'Pinheiros', 404, 'Administrador'),
('Elaine', 'Pereira', 'elaine.pereira@sispou.com', '11654321098', '56789012345', 'Rua do Sol', 'Liberdade', 505, 'Recepcionista');


/* ===========================
   INSERINDO DADOS: Cliente
   =========================== */
INSERT INTO Cliente (nome, sobrenome, telefone, email, cpf) VALUES
('Fábio', 'Ramos', '11988887777', 'fabio.ramos@email.com', '11122233344'),
('Gisele', 'Ferreira', '11899998888', 'gisele.ferreira@email.com', '22233344455'),
('Henrique', 'Costa', '11777776666', 'henrique.costa@email.com', '33344455566'),
('Isabela', 'Martins', '11666665555', 'isabela.martins@email.com', '44455566677'),
('João', 'Lima', '11555554444', 'joao.lima@email.com', '55566677788');


/* ===========================
   INSERINDO DADOS: Quarto
   =========================== */
INSERT INTO Quarto (numero, capacidade, status, preco) VALUES
(101, 2, 'Disponível', 250.00),
(102, 3, 'Ocupado', 350.00),
(103, 1, 'Em manutenção', 150.00),
(104, 2, 'Disponível', 270.00),
(105, 4, 'Ocupado', 400.00);


/* ===========================
   INSERINDO DADOS: Realiza
   =========================== */
INSERT INTO Realiza (fk_funcionario_id, fk_quarto_id, tipo_operacao, descricao) VALUES
(1, 1, 'Create', 'Criando uma nova acomodaçao de verão'),
(2, 2, 'Update', 'Adicionando ventiladores'),
(3, 3, 'Delete', 'Quarto com defeitos'),
(4, 4, 'Update', 'Adiconando nova mobilida'),
(5, 5, 'Create', 'Adicionando novo quarto no 3° andar');


/*Aqui está um tipo de modificação que mostra o log de alterações de quarto*/
SELECT 
    f.nome AS nome_funcionario,
    f.cargo_fun,
    q.numero AS numero_quarto,
    q.status,
    r.tipo_operacao,
    r.data_operacao,
    r.descricao
FROM Realiza r
JOIN Funcionario f ON r.fk_funcionario_id = f.id_funcionario
JOIN Quarto q ON r.fk_quarto_id = q.id;




