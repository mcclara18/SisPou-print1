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
    password VARCHAR(100),
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
    status enum ('Disponível', 'Ocupado', 'Em manutenção') default 'Disponível',
    preco DOUBLE
);

INSERT INTO quarto (numero, capacidade, status, preco) VALUES (12, 4, 'Disponível', 325.20);

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


DROP PROCEDURE realizar_log;
DELIMITER //
CREATE PROCEDURE realizar_log(IN id_funcionario INT, IN id_quarto INT, IN tipo_operacao VARCHAR(10), IN descricao TEXT)
BEGIN
   #declare id_funcionario INT;
   declare cargo_fun VARCHAR(50);
   declare quarto INT;
   
   SELECT fun.cargo_fun INTO cargo_fun FROM funcionario fun WHERE id_funcionario = fun.id_funcionario;
   SELECT count(qt.id) into quarto FROM quarto qt WHERE qt.id = id_quarto;
   
   
   if cargo_fun = 'Administrador' then
		if quarto > 0 then
			INSERT INTO realiza (fk_funcionario_id, fk_quarto_id, tipo_operacao, data_operacao, descricao)
			VALUES (id_funcionario, id_quarto, tipo_operacao, now(), descricao);
		else
			select "Quarto indisponível";
		end if;
   else	
		select "Só o administrador que pode modificar o quarto";
   end if;
   
   
END //

DELIMITER ;


call realizar_log(1, 1, 'UPDATE', 'Adicionando ar condicionado')



