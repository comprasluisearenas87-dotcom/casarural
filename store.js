import { supabaseConfig } from "./supabase-config.js";
import { REFRESCOS_INICIALES } from "./config.js";

// Estado compartido: beers {p0:n}, picks {p0:[refrescos]}, drinks [refrescos], acts [{name,material,desc}]
const vacio = () => ({ beers: {}, picks: {}, drinks: REFRESCOS_INICIALES.slice(), acts: [] });

export const modo = { compartido: false, error: "" };

export async function iniciar(onChange) {
  if (supabaseConfig && supabaseConfig.anonKey) {
    try { return await iniciarSupabase(onChange); }
    catch (e) { console.warn("Supabase no disponible, uso modo local", e); modo.error = (e && (e.message || e.details || e.code)) || String(e); }
  }
  return iniciarLocal(onChange);
}

function iniciarLocal(onChange) {
  const KEY = "casa-rural-estado";
  let s = vacio();
  try { s = Object.assign(vacio(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const emit = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} onChange(s); };
  emit();
  return {
    incBeer(i, d) { s.beers["p" + i] = Math.max(0, (s.beers["p" + i] || 0) + d); emit(); },
    setPick(i, drink, on) {
      const a = (s.picks["p" + i] || []).filter((x) => x !== drink);
      if (on) a.push(drink);
      s.picks["p" + i] = a; emit();
    },
    addDrink(n) { if (!s.drinks.includes(n)) s.drinks.push(n); emit(); },
    addAct(a) { s.acts.push(a); emit(); }
  };
}

async function iniciarSupabase(onChange) {
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  const sb = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  const ok = (r) => { if (r.error) throw r.error; return r.data; };
  async function leer() {
    const [b, p, d, a] = await Promise.all([
      sb.from("beers").select("*"), sb.from("picks").select("*"),
      sb.from("drinks").select("name"), sb.from("acts").select("*").order("id")
    ]);
    const s = vacio();
    ok(b).forEach((r) => { s.beers["p" + r.persona] = r.n; });
    ok(p).forEach((r) => { (s.picks["p" + r.persona] = s.picks["p" + r.persona] || []).push(r.drink); });
    const dr = ok(d).map((r) => r.name);
    if (dr.length) s.drinks = dr;
    s.acts = ok(a).map((r) => ({ name: r.name, material: r.material, desc: r.descr }));
    onChange(s);
  }
  await leer();
  let t = null;
  const refrescar = () => { clearTimeout(t); t = setTimeout(() => leer().catch(() => {}), 150); };
  sb.channel("casa").on("postgres_changes", { event: "*", schema: "public" }, refrescar).subscribe();
  modo.compartido = true;
  const run = async (q) => { ok(await q); refrescar(); };
  return {
    incBeer: (i, d) => run(sb.rpc("inc_beer", { p: i, d })),
    setPick: (i, drink, on) => run(on
      ? sb.from("picks").upsert({ persona: i, drink })
      : sb.from("picks").delete().eq("persona", i).eq("drink", drink)),
    addDrink: (n) => run(sb.from("drinks").upsert({ name: n })),
    addAct: (a) => run(sb.from("acts").insert({ name: a.name, material: a.material, descr: a.desc }))
  };
}
