CREATE DATABASE sispou;
USE sispou;

CREATE TABLE Funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(100),
    telefone VARCHAR(11),
    cpf VARCHAR(11) UNIQUE,
    rua VARCHAR(100),
    bairro VARCHAR(100),
    numero INT,
    cargo_fun enum ('Administrador', 'Recepcionista')
);

CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    telefone VARCHAR(11),
    email VARCHAR(100) UNIQUE,
    cpf VARCHAR(11) UNIQUE,
    endereco VARCHAR(150)
);

CREATE TABLE Quarto (
    id_quarto INT PRIMARY KEY AUTO_INCREMENT,
    numero INT UNIQUE,
    capacidade INT,
    tipo enum("arcondicionado", "ventilador"),
    status enum ('Disponível', 'Ocupado', 'Em manutenção') default 'Disponível'
);

CREATE TABLE Reserva (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    fk_funcionario_id INT,
    fk_cliente_id INT,
    fk_quarto_id INT,
    qtd_hospedes INT,
    preco DOUBLE,
    qtd_diarias INT DEFAULT 1,
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_funcionario_id) REFERENCES Funcionario(id_funcionario) ON DELETE RESTRICT,
    FOREIGN KEY (fk_quarto_id) REFERENCES Quarto(id_quarto) ON DELETE RESTRICT,
    FOREIGN KEY (fk_cliente_id) REFERENCES Cliente(id_cliente) ON DELETE RESTRICT
);

CREATE TABLE TabelaPrecoUnidade(
	id_tabela INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM ("arcondicionado", "ventilador"),
    capacidade INT NOT NULL, #FOI ALTERADO PARA NOT NULL
	valor_diaria DOUBLE
);

#TABELA PRECO (NÃO É PADRÃO AINDA)

INSERT INTO TabelaPrecoUnidade (tipo, capacidade, valor_diaria) VALUES
("ventilador", 1, 70),
("ventilador", 2, 100),
("ventilador", 3, 130),

("arcondicionado", 1, 90),
("arcondicionado", 2, 125),
("arcondicionado", 3, 160);


INSERT INTO Funcionario (nome, sobrenome, email, senha, telefone, cpf, rua, bairro, numero, cargo_fun)
VALUES
("Ana", "Silva", "ana@gmail.com", "123", "85999999999", "12345678901", "Rua A", "Centro", 100, "Administrador");

INSERT INTO Cliente (nome, sobrenome, telefone, email, cpf)
VALUES
("João", "Pereira", "85988887777", "joao@gmail.com", "11122233344");

INSERT INTO Quarto (numero, capacidade, tipo)
VALUES
(101, 3, "arcondicionado"),
(102, 2, "ventilador");

DELIMITER //
CREATE TRIGGER tg_calcular_preco_reserva
BEFORE INSERT ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_tipo VARCHAR(50);
    DECLARE v_capacidade INT;
    DECLARE v_valor_diaria DOUBLE;

    SELECT tipo, capacidade INTO v_tipo, v_capacidade FROM Quarto
    WHERE id_quarto = NEW.fk_quarto_id;

    SELECT valor_diaria INTO v_valor_diaria FROM TabelaPrecoUnidade
    WHERE tipo = v_tipo AND capacidade = v_capacidade
    LIMIT 1;

    SET NEW.preco = v_valor_diaria * NEW.qtd_diarias;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tg_atualizar_preco_reserva
BEFORE UPDATE ON Reserva
FOR EACH ROW
BEGIN
    DECLARE v_tipo VARCHAR(50);
    DECLARE v_capacidade INT;
    DECLARE v_valor_diaria DOUBLE;

    SELECT tipo, capacidade INTO v_tipo, v_capacidade FROM Quarto
    WHERE id_quarto = NEW.fk_quarto_id;

    SELECT valor_diaria INTO v_valor_diaria FROM TabelaPrecoUnidade
    WHERE tipo = v_tipo AND capacidade = v_capacidade
    LIMIT 1;

    SET NEW.preco = v_valor_diaria * NEW.qtd_diarias;
END //
DELIMITER ;

