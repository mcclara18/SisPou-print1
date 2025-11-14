CREATE DATABASE IF NOT EXISTS sispou;
USE sispou;

CREATE TABLE IF NOT EXISTS Funcionario (
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

CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(50),
    telefone VARCHAR(11),
    email VARCHAR(100) UNIQUE,
    cpf VARCHAR(11) UNIQUE
);

CREATE TABLE IF NOT EXISTS Quarto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero INT UNIQUE,
    capacidade INT,
    status enum ('Disponível', 'Ocupado', 'Em manutenção') default 'Disponível',
    tipo enum('arcondicionado', 'ventilador')
);

INSERT INTO Quarto (numero, capacidade, status, tipo) VALUES (12, 4, 'Disponível', 'arcondicionado');

CREATE TABLE IF NOT EXISTS Realiza (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fk_funcionario_id INT,
    fk_quarto_id INT,
    tipo_operacao enum ('Create', 'Update', 'Delete'),
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    descricao text,
    FOREIGN KEY (fk_funcionario_id) REFERENCES Funcionario(id_funcionario) ON DELETE RESTRICT,
    FOREIGN KEY (fk_quarto_id) REFERENCES Quarto(id) ON DELETE RESTRICT
);

DROP PROCEDURE IF EXISTS realizar_log;
DELIMITER //
CREATE PROCEDURE realizar_log(IN id_funcionario INT, IN id_quarto INT, IN tipo_operacao VARCHAR(10), IN descricao TEXT)
BEGIN
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

-- Inserir um usuário admin padrão para teste
INSERT INTO Funcionario (nome, sobrenome, email, telefone, cpf, cargo_fun, senha) 
VALUES ('Admin', 'Sistema', 'admin@sispou.com', '11999999999', '00000000001', 'Administrador', '$2b$10$YOixf5Q0dN/E4wWDgR8He.kHHEOA8n7Z8O0Z0Z0Z0Z0Z0Z0Z0Z');
