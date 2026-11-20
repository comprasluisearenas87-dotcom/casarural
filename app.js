import { CASA, PERSONAS, COMIDAS, MENU, DESAYUNOS, PICOTEO } from "./config.js";
import { iniciar, modo } from "./store.js";

const TABS = [["inicio", "Inicio"], ["gente", "Asistentes"], ["menu", "Menú"], ["cerveza", "Cerveza"], ["refrescos", "Refrescos"], ["actividades", "Actividades"]];
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let estado = { beers: {}, picks: {}, drinks: [], acts: [] };
let store = null;
let tab = (location.hash || "#inicio").slice(1);
if (!TABS.some(([id]) => id === tab)) tab = "inicio";
let abierta = -1;               // persona con la ventana de refrescos abierta
let formAct = false;            // formulario de actividades visible
const draft = { nuevoRefresco: "", an: "", am: "", ad: "" };

const vistas = {
  inicio() {
    const fondo = CASA.foto ? ` style="background-image:url('${esc(CASA.foto)}')"` : "";
    const mapa = CASA.mapaEmbed
      ? `<iframe title="Mapa de cómo llegar" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${esc(CASA.mapaEmbed)}"></iframe>`
      : "[Mapa de Google Maps con la ubicación]";
    return `<div class="hero"${fondo}><span class="chip">Viernes a domingo</span><h1>${esc(CASA.nombre)}</h1><div>${esc(CASA.fecha)}</div></div>
    <div class="inicio-cuerpo">
      ${CASA.enlace ? `<a class="btn" href="${esc(CASA.enlace)}" target="_blank" rel="noopener">Ver la casa</a>` : ""}
      <section><h2 style="font-size:22px;margin-bottom:8px">Cómo llegar</h2><div class="mapa">${mapa}</div></section>
      ${CASA.mapaEnlace ? `<a class="btn sec" href="${esc(CASA.mapaEnlace)}" target="_blank" rel="noopener">Abrir en Google Maps</a>` : ""}
    </div>`;
  },
  gente() {
    return `<div class="pad"><h1 class="h1">Asistentes</h1><ul class="lista">${PERSONAS.map((p) => `<li class="card">${esc(p)}</li>`).join("")}</ul></div>`;
  },
  menu() {
    const fila = (a, b, txt) => `<div class="card"><div class="etq">${esc(a)}</div><div style="font-size:17px;font-weight:700">${esc(b)}</div><div style="margin-top:4px;font-size:15px;${txt ? "" : "color:#6b7781"}">${esc(txt || "Por definir")}</div></div>`;
    const bloque = (t, txt) => `<div class="card azul"><div style="font-size:17px;font-weight:700">${t}</div><div class="gris">${esc(txt || "Por definir")}</div></div>`;
    return `<div class="pad" style="display:flex;flex-direction:column;gap:10px"><h1 class="h1" style="margin-bottom:2px">Menú</h1>
      ${COMIDAS.map(([d, c]) => fila(d, c, MENU[d + " " + c])).join("")}
      ${bloque("Desayunos", DESAYUNOS)}${bloque("Picoteo", PICOTEO)}</div>`;
  },
  cerveza() {
    const total = PERSONAS.reduce((a, _, i) => a + (estado.beers["p" + i] || 0), 0);
    return `<div class="pad"><h1 class="h1">Cerveza</h1>
      <div class="banda fila"><div style="font-size:16px;font-weight:700">Cervezas totales</div><div class="num" aria-live="polite">${total}</div></div>
      <ul class="lista">${PERSONAS.map((p, i) => `<li class="card fila" style="padding:8px 12px 8px 18px"><span>${esc(p)}</span>
        <span class="cont"><button class="redondo" data-act="beer" data-i="${i}" data-d="-1" aria-label="Quitar una cerveza a ${esc(p)}">−</button><b>${estado.beers["p" + i] || 0}</b><button class="redondo mas" data-act="beer" data-i="${i}" data-d="1" aria-label="Añadir una cerveza a ${esc(p)}">+</button></span></li>`).join("")}</ul></div>`;
  },
  refrescos() {
    return `<div class="pad"><h1 class="h1">Refrescos</h1><p class="sub">Toca tu nombre y marca lo que vas a beber.</p><ul class="lista">
      ${PERSONAS.map((p, i) => { const n = (estado.picks["p" + i] || []).length; return `<li><button class="card persona" data-act="abrir" data-i="${i}"><span>${esc(p)}</span><small>${n ? n + (n === 1 ? " bebida" : " bebidas") : "Sin elegir"}</small></button></li>`; }).join("")}</ul></div>`;
  },
  actividades() {
    const lista = estado.acts.map((a) => `<div class="card" style="margin-bottom:10px"><div style="font-family:'DM Serif Display',serif;font-size:21px">${esc(a.name)}</div><div class="etq" style="margin-top:6px">Material</div><div style="font-size:14px">${esc(a.material)}</div><div class="etq" style="margin-top:8px">Explicación</div><div style="font-size:14px">${esc(a.desc)}</div></div>`).join("");
    const form = formAct
      ? `<form class="form" data-act="guardarAct"><label class="campo">Nombre de la actividad<input type="text" id="an" required value="${esc(draft.an)}" autocomplete="off"></label>
        <label class="campo">Material necesario<input type="text" id="am" value="${esc(draft.am)}" autocomplete="off"></label>
        <label class="campo">Breve explicación<textarea id="ad" rows="3">${esc(draft.ad)}</textarea></label>
        <div class="botones"><button class="btn" type="submit">Guardar</button><button class="btn sec" type="button" data-act="cancelarAct">Cancelar</button></div></form>`
      : `<button class="btn" style="width:100%" data-act="nuevaAct">+ Añadir actividad</button>`;
    return `<div class="pad"><h1 class="h1">Actividades</h1>${estado.acts.length ? lista : '<div class="vacio">Aún no hay actividades. Añade la primera.</div>'}${form}</div>`;
  }
};

function render() {
  const foco = document.activeElement && document.activeElement.id;
  const pos = foco ? document.activeElement.selectionStart : null;
  const aviso = modo.compartido ? "" : `<p class="aviso">Modo local: los datos solo se guardan en este móvil.${modo.error ? `<br><small>Motivo: ${esc(modo.error)}</small>` : ""}</p>`;
  const main = $("#main");
  const y = main.scrollTop;
  main.innerHTML = aviso + vistas[tab]();
  main.scrollTop = y;
  $("#tabs").innerHTML = TABS.map(([id, t]) => `<button data-act="tab" data-id="${id}"${id === tab ? ' aria-current="page"' : ""}>${t}</button>`).join("");
  renderModal();
  if (foco) { const el = document.getElementById(foco); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) {} } }
}

function renderModal() {
  const m = $("#modal");
  if (abierta < 0) { m.hidden = true; m.innerHTML = ""; return; }
  const marcados = estado.picks["p" + abierta] || [];
  m.hidden = false;
  m.innerHTML = `<div class="hoja" role="dialog" aria-modal="true" aria-label="Refrescos de ${esc(PERSONAS[abierta])}">
    <div class="fila" style="margin-bottom:12px"><h2>${esc(PERSONAS[abierta])}</h2><button class="btn" style="min-height:44px" data-act="cerrar">Listo</button></div>
    <div class="lista" style="gap:6px">${estado.drinks.map((d) => `<label class="check"><input type="checkbox" data-act="pick" data-d="${esc(d)}"${marcados.includes(d) ? " checked" : ""}>${esc(d)}</label>`).join("")}</div>
    <form class="botones" style="margin-top:12px" data-act="nuevoRefresco"><input type="text" id="nr" aria-label="Nuevo refresco" placeholder="Añadir otro refresco" value="${esc(draft.nuevoRefresco)}" autocomplete="off" style="margin:0"><button class="btn" type="submit" style="flex:0 0 auto">Añadir</button></form></div>`;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]");
  if (!b || b.tagName === "FORM" || b.tagName === "INPUT") return;
  const a = b.dataset.act, i = Number(b.dataset.i);
  if (a === "tab") { tab = b.dataset.id; location.hash = tab; abierta = -1; render(); $("#main").scrollTop = 0; }
  else if (a === "beer") { const d = Number(b.dataset.d); if (d < 0 && !(estado.beers["p" + i] > 0)) return; store.incBeer(i, d); }
  else if (a === "abrir") { abierta = i; renderModal(); }
  else if (a === "cerrar") { abierta = -1; renderModal(); }
  else if (a === "nuevaAct") { formAct = true; render(); const f = document.getElementById("an"); if (f) f.focus(); }
  else if (a === "cancelarAct") { formAct = false; draft.an = draft.am = draft.ad = ""; render(); }
});

document.addEventListener("change", (e) => {
  const c = e.target;
  if (c.dataset && c.dataset.act === "pick") store.setPick(abierta, c.dataset.d, c.checked);
});

document.addEventListener("input", (e) => {
  const id = e.target.id;
  if (id === "an") draft.an = e.target.value;
  else if (id === "am") draft.am = e.target.value;
  else if (id === "ad") draft.ad = e.target.value;
  else if (id === "nr") draft.nuevoRefresco = e.target.value;
});

document.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-act]");
  if (!f) return;
  e.preventDefault();
  if (f.dataset.act === "nuevoRefresco") {
    const v = draft.nuevoRefresco.trim();
    if (!v) return;
    draft.nuevoRefresco = "";
    store.addDrink(v);
    if (abierta >= 0) store.setPick(abierta, v, true);
  } else if (f.dataset.act === "guardarAct") {
    const name = draft.an.trim();
    if (!name) return;
    store.addAct({ name, material: draft.am.trim() || "—", desc: draft.ad.trim() || "—" });
    formAct = false; draft.an = draft.am = draft.ad = "";
  }
});

window.addEventListener("hashchange", () => { const t = location.hash.slice(1); if (TABS.some(([id]) => id === t) && t !== tab) { tab = t; render(); } });

render();
iniciar((s) => { estado = s; render(); }).then((s) => { store = s; });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
