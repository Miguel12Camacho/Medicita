# MediCitas 🏥

Sistema de gestión de citas médicas con arquitectura N-Capas. Permite administrar pacientes, doctores y citas, con sincronización en tiempo real entre dispositivos a través de Supabase.

---

## Tecnologías

- **Next.js 15** — Framework React con App Router
- **TypeScript** — Tipado estático
- **Supabase** — Base de datos PostgreSQL en la nube
- **localStorage** — Caché local con sincronización offline
- **Tailwind CSS** — Estilos
- **shadcn/ui** — Componentes de UI
- **Sonner** — Notificaciones toast

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior
- Cuenta en [Supabase](https://supabase.com) (gratuita)

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/Miguel12Camacho/Medicita.git 
cd medicitas
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Configurar Supabase

### 3.1 Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **New project**
3. Asigna un nombre (ej. `medicitas`), una contraseña y elige una región
4. Espera ~2 minutos a que el proyecto esté listo

### 3.2 Crear las tablas

1. En el dashboard de Supabase ve a **SQL Editor**
2. Copia y ejecuta el contenido del archivo `schema.sql` que está en la raíz del proyecto


## 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

El caché local (localStorage) garantiza que la app funcione aunque el dispositivo pierda conexión momentáneamente.

## Mejora realizada

Se realizó una actualización en la documentación del sistema con el fin de mejorar la comprensión de la estructura del proyecto. Se detallaron los componentes principales y la organización general del sistema para facilitar su mantenimiento y futura escalabilidad.

Estas mejoras permiten que nuevos desarrolladores puedan entender más fácilmente el funcionamiento del sistema.
