# Casa Rural La Gran Familia: app instalable (PWA)

Archivos: `index.html`, `styles.css`, `app.js`, `store.js`, `config.js`, `supabase-config.js`, `supabase.sql`, `manifest.webmanifest`, `sw.js` e `icons/`.

## 1. Datos de la casa
Todo está en `config.js` (nombre, fechas, enlace, foto, mapa, asistentes, menú). Faltan los nombres de los asistentes.

## 2. Datos compartidos (Supabase)
1. Crea un proyecto en https://supabase.com.
2. SQL Editor > New query: pega `supabase.sql` y pulsa Run.
3. Project Settings > API: copia la URL y la clave `anon public` en `supabase-config.js`.
Sin eso la app va en modo local (cada móvil guarda lo suyo) y muestra un aviso amarillo.

## 3. Código en GitHub y publicación en Vercel
1. Crea un repositorio en GitHub y sube esta carpeta.
2. En https://vercel.com: Add New > Project > importa el repositorio. Framework: "Other", sin comando de build, directorio de salida la raíz. Deploy.
3. Cada cambio que subas a GitHub se publica solo.

## 4. Instalar
- Android (Chrome): menú ⋮ > "Instalar app".
- iPhone (Safari): Compartir > "Añadir a pantalla de inicio".
