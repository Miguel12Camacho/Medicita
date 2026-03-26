-- Script de datos de ejemplo para MediCitas
-- Ejecutar despues de 001-create-tables.sql

-- Insertar pacientes de ejemplo
INSERT INTO pacientes (id, nombre, apellido, cedula, fecha_nacimiento, telefono, email, direccion, genero) VALUES
('p1', 'Maria', 'Garcia', '001-1234567-8', '1985-03-15', '809-555-0101', 'maria.garcia@email.com', 'Calle Principal #123, Santo Domingo', 'femenino'),
('p2', 'Juan', 'Rodriguez', '001-2345678-9', '1990-07-22', '809-555-0102', 'juan.rodriguez@email.com', 'Av. Independencia #456, Santiago', 'masculino'),
('p3', 'Ana', 'Martinez', '001-3456789-0', '1978-11-08', '809-555-0103', 'ana.martinez@email.com', 'Calle 27 de Febrero #789, La Vega', 'femenino'),
('p4', 'Carlos', 'Lopez', '001-4567890-1', '1995-01-30', '809-555-0104', 'carlos.lopez@email.com', 'Av. Duarte #321, Puerto Plata', 'masculino'),
('p5', 'Laura', 'Sanchez', '001-5678901-2', '1988-06-12', '809-555-0105', 'laura.sanchez@email.com', 'Calle El Sol #654, San Cristobal', 'femenino'),
('p6', 'Pedro', 'Ramirez', '001-6789012-3', '1972-09-25', '809-555-0106', 'pedro.ramirez@email.com', 'Av. Maximo Gomez #987, Higuey', 'masculino'),
('p7', 'Carmen', 'Fernandez', '001-7890123-4', '1982-04-18', '809-555-0107', 'carmen.fernandez@email.com', 'Calle Las Flores #147, Moca', 'femenino'),
('p8', 'Miguel', 'Torres', '001-8901234-5', '1968-12-03', '809-555-0108', 'miguel.torres@email.com', 'Av. Luperon #258, Barahona', 'masculino'),
('p9', 'Sofia', 'Diaz', '001-9012345-6', '1999-08-20', '809-555-0109', 'sofia.diaz@email.com', 'Calle Central #369, Bonao', 'femenino'),
('p10', 'Roberto', 'Herrera', '001-0123456-7', '1975-02-14', '809-555-0110', 'roberto.herrera@email.com', 'Av. 27 de Febrero #741, Azua', 'masculino');

-- Insertar doctores de ejemplo
INSERT INTO doctores (id, nombre, apellido, especialidad, telefono, email, horario_inicio, horario_fin) VALUES
('d1', 'Dr. Luis', 'Mejia', 'Medicina General', '809-555-1001', 'luis.mejia@clinica.com', '08:00', '16:00'),
('d2', 'Dra. Patricia', 'Vega', 'Pediatria', '809-555-1002', 'patricia.vega@clinica.com', '09:00', '17:00'),
('d3', 'Dr. Fernando', 'Castro', 'Cardiologia', '809-555-1003', 'fernando.castro@clinica.com', '08:00', '14:00'),
('d4', 'Dra. Isabel', 'Morales', 'Dermatologia', '809-555-1004', 'isabel.morales@clinica.com', '10:00', '18:00'),
('d5', 'Dra. Rosa', 'Nunez', 'Ginecologia', '809-555-1005', 'rosa.nunez@clinica.com', '08:00', '15:00'),
('d6', 'Dr. Alberto', 'Reyes', 'Oftalmologia', '809-555-1006', 'alberto.reyes@clinica.com', '09:00', '16:00'),
('d7', 'Dr. Hector', 'Guzman', 'Traumatologia', '809-555-1007', 'hector.guzman@clinica.com', '08:00', '16:00'),
('d8', 'Dra. Elena', 'Pena', 'Neurologia', '809-555-1008', 'elena.pena@clinica.com', '10:00', '17:00');

-- Insertar citas de ejemplo
INSERT INTO citas (id, paciente_id, doctor_id, fecha, hora, motivo, estado, notas) VALUES
('c1', 'p1', 'd1', CURDATE() + INTERVAL 1 DAY, '09:00', 'Chequeo general anual', 'pendiente', ''),
('c2', 'p2', 'd2', CURDATE() + INTERVAL 2 DAY, '10:00', 'Vacunacion infantil', 'pendiente', ''),
('c3', 'p3', 'd3', CURDATE() + INTERVAL 1 DAY, '11:00', 'Control de presion arterial', 'pendiente', ''),
('c4', 'p4', 'd4', CURDATE() + INTERVAL 3 DAY, '14:00', 'Revision de lunares', 'pendiente', ''),
('c5', 'p5', 'd5', CURDATE() + INTERVAL 2 DAY, '09:30', 'Control prenatal', 'pendiente', ''),
('c6', 'p6', 'd6', CURDATE() - INTERVAL 5 DAY, '10:30', 'Examen de vista', 'completada', 'Se recetaron lentes nuevos'),
('c7', 'p7', 'd7', CURDATE() - INTERVAL 3 DAY, '08:30', 'Dolor en rodilla', 'completada', 'Se recomendo fisioterapia'),
('c8', 'p8', 'd8', CURDATE() - INTERVAL 7 DAY, '15:00', 'Dolores de cabeza frecuentes', 'completada', 'Se ordeno resonancia magnetica'),
('c9', 'p9', 'd1', CURDATE() - INTERVAL 2 DAY, '11:30', 'Gripe persistente', 'cancelada', 'Paciente cancelo por viaje'),
('c10', 'p10', 'd2', CURDATE() + INTERVAL 4 DAY, '14:30', 'Consulta pediatrica nieto', 'pendiente', ''),
('c11', 'p1', 'd3', CURDATE() + INTERVAL 5 DAY, '09:00', 'Seguimiento cardiologico', 'pendiente', ''),
('c12', 'p2', 'd4', CURDATE() - INTERVAL 10 DAY, '10:00', 'Tratamiento acne', 'completada', 'Tratamiento de 3 meses'),
('c13', 'p3', 'd5', CURDATE() + INTERVAL 7 DAY, '11:00', 'Revision ginecologica', 'pendiente', ''),
('c14', 'p4', 'd6', CURDATE() - INTERVAL 1 DAY, '08:00', 'Revisión ocular', 'completada', 'Vision estable'),
('c15', 'p5', 'd7', CURDATE() + INTERVAL 6 DAY, '15:30', 'Dolor de espalda', 'pendiente', ''),
('c16', 'p6', 'd8', CURDATE() - INTERVAL 4 DAY, '16:00', 'Mareos frecuentes', 'cancelada', 'Reagendado'),
('c17', 'p7', 'd1', CURDATE() + INTERVAL 8 DAY, '09:30', 'Chequeo anual', 'pendiente', ''),
('c18', 'p8', 'd2', CURDATE() - INTERVAL 6 DAY, '10:30', 'Vacunacion', 'completada', 'Vacuna antigripal aplicada'),
('c19', 'p9', 'd3', CURDATE() + INTERVAL 9 DAY, '14:00', 'Electrocardiograma', 'pendiente', ''),
('c20', 'p10', 'd4', CURDATE() + INTERVAL 10 DAY, '15:00', 'Consulta dermatologica', 'pendiente', '');
