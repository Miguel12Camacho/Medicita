create table if not exists pacientes (
  id               uuid primary key,
  nombre           text not null,
  apellido         text not null,
  cedula           text not null unique,
  fecha_nacimiento date not null,
  telefono         text,
  email            text,
  direccion        text,
  genero           text check (genero in ('masculino', 'femenino', 'otro')),
  created_at       timestamptz not null default now()
);

create table if not exists doctores (
  id              uuid primary key,
  nombre          text not null,
  apellido        text not null,
  especialidad    text not null,
  telefono        text,
  email           text,
  horario_inicio  time not null,
  horario_fin     time not null,
  created_at      timestamptz not null default now()
);

create table if not exists citas (
  id           uuid primary key,
  paciente_id  uuid not null references pacientes(id) on delete cascade,
  doctor_id    uuid not null references doctores(id)  on delete cascade,
  fecha        date not null,
  hora         time not null,
  motivo       text,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'completada', 'cancelada')),
  notas        text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_citas_paciente  on citas (paciente_id);
create index if not exists idx_citas_doctor    on citas (doctor_id);
create index if not exists idx_citas_fecha     on citas (fecha);

-- Habilita RLS en las tres tablas
alter table pacientes enable row level security;
alter table doctores   enable row level security;
alter table citas      enable row level security;

create policy "acceso_total_pacientes" on pacientes
  for all using (true) with check (true);

create policy "acceso_total_doctores" on doctores
  for all using (true) with check (true);

create policy "acceso_total_citas" on citas
  for all using (true) with check (true);
