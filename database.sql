-- Script para crear la base de datos y la tabla usuarios

-- Crear la base de datos
CREATE DATABASE bancosolar;

-- Conectar a la base de datos creada
\c bancosolar;

-- Crear la tabla usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY, 
  nombre VARCHAR(50),
  balance FLOAT CHECK (balance >= 0)
);

-- Crear la tabla de transferencias
CREATE TABLE transferencias (
  id SERIAL PRIMARY KEY, 
  emisor INT, 
  receptor INT, 
  monto FLOAT, 
  fecha TIMESTAMP, 
  FOREIGN KEY (emisor) REFERENCES usuarios(id), 
  FOREIGN KEY (receptor) REFERENCES usuarios(id)
);
