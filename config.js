// Datos de la casa y de los asistentes. Edita este archivo y listo.
export const CASA = {
  nombre: "Casa Rural La Gran Familia",
  fecha: "12-14 de marzo de 2027",
  dias: "12–14 marzo",   // fecha grande de la portada
  anio: "2027",
  inicio: "2027-03-12T00:00:00+01:00",   // arranque de la cuenta atrás (cámbialo a la hora de llegada, p. ej. 18:00)
  fin: "2027-03-14T23:59:59+01:00",
  enlace: "https://www.escapadarural.com/casa-rural/soria/la-puerta-del-rio-lobos?capacity=20",        // URL de la casa (anuncio, web...). Vacío = el botón se oculta
  foto: "https://webp.er2.co/es/soria/5b7a991ee32e4/750/5b7ac3565fb8d.webp",          // URL o ruta de la foto de fondo, p. ej. "foto.jpg". Vacío = degradado
  mapaEmbed: "https://maps.google.com/maps?q=41.8288136,-3.0651936&z=14&output=embed",     // URL "embed" de Google Maps. Vacío = recuadro de ejemplo
  mapaEnlace: "https://www.google.com/maps?q=41.8288136,-3.0651936"     // Enlace normal de Google Maps (abre la app de mapas)
};

export const PERSONAS = ["Alberto", "Alejandro", "Angela", "Blanca", "Celia", "Cuqui", "David", "Edu Embid", "Eduardo", "Jessica", "Jesús", "Josemari", "Luise", "María A.", "María E.", "Marivi", "Martín", "Miguel", "Mónica", "Nuri", "Paco", "Paula", "Pili", "Piluca", "Silvia", "Víctor"];

// Menores de edad: en la pestaña Cerveza salen bloqueados en gris, sin poder añadir.
export const MENORES = ["Paula", "Celia", "Angela", "Martín", "Blanca"];

export const REFRESCOS_INICIALES = [
  "Coca-Cola original",
  "Coca-Cola Zero",
  "Fanta/Kas Naranja",
  "Fanta/Kas Limón",
  "Tónica",
  "Sprite/7up"
];

export const COMIDAS = [
  ["Viernes", "Comida"], ["Viernes", "Cena"], ["Viernes", "Recena"],
  ["Sábado", "Comida"], ["Sábado", "Cena"], ["Sábado", "Recena"],
  ["Domingo", "Comida"]
];

// Texto de cada comida (clave "Día Comida"); lo que no esté pone "Por definir".
export const MENU = {
  "Viernes Cena": "Pizzas, tortilla de patata, empanada y rosca",
  "Sábado Comida": "Barbacoa: chuletas, chorizo, longaniza, papada y morcilla",
  "Sábado Cena": "Hamburguesa completa"
};
export const DESAYUNOS = "";
export const PICOTEO = "";
