-- Script de creacion de tablas para MediCitas
-- Ejecutar este script en tu base de datos MySQL

-- Crear tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  genero ENUM('masculino', 'femenino', 'otro') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de doctores
CREATE TABLE IF NOT EXISTS doctores (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fin TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de citas
CREATE TABLE IF NOT EXISTS citas (
  id VARCHAR(36) PRIMARY KEY,
  paciente_id VARCHAR(36) NOT NULL,
  doctor_id VARCHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo TEXT NOT NULL,
  estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (doctor_id) REFERENCES doctores(id) ON DELETE RESTRICT,
  INDEX idx_citas_fecha (fecha),
  INDEX idx_citas_estado (estado),
  INDEX idx_citas_doctor_fecha (doctor_id, fecha, hora)
);

-- Crear indices adicionales para busquedas
CREATE INDEX idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido);
CREATE INDEX idx_doctores_especialidad ON doctores(especialidad);
