<template>
  <main class="page">
    <!-- ============ RÉSULTAT ============ -->
    <section class="card card-res" aria-live="polite">
      <div class="lab">Mensualité estimée</div>
      <div class="hero-num">
        <span>{{ fmt(mensualite) }}</span><span class="cur">MGA</span>
      </div>
      <div class="det">
        dont crédit {{ fmt(mensualite) }} MGA · sur {{ duree }} mois
      </div>

      <div class="pillsplit">
        <span>🏠 Habitat</span>
        <span>Apport {{ apportPct }} %</span>
        <span>Taux {{ tauxAnnuel }} %</span>
      </div>

      <div class="infos">
        <div class="ttl">Informations clients</div>
        <div class="irow"><span class="k">Montant du projet <i>*</i></span><span class="v">{{ fmt(montant) }} MGA</span></div>
        <div class="irow"><span class="k">Montant du prêt <i>**</i></span><span class="v">{{ fmt(pret) }} MGA</span></div>
        <div class="irow"><span class="k">Mensualités</span><span class="v">{{ fmt(mensualite) }} MGA</span></div>
        <div class="irow"><span class="k">Frais de dossier</span><span class="v">{{ fmt(frais) }} MGA</span></div>
        <div class="notes">
          <div>* Montant du projet à financer.</div>
          <div>** Montant du projet après déduction de l'apport personnel.</div>
        </div>
      </div>

      <div class="actions no-print">
        <button class="btn primary" type="button" @click="imprimer">🖨️ Imprimer / PDF</button>
        <button class="btn ghost" type="button" @click="recommencer">↺ Recommencer</button>
      </div>
    </section>

    <!-- ============ FORMULAIRE ============ -->
    <section class="card card-form">
      <h2><span class="ic">🧮</span> Mon projet</h2>

      <div class="field">
        <label for="montant">Montant du projet</label>
        <div class="big-in">
          <input
            id="montant"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :value="fmt(montant)"
            @input="onMontant"
          />
          <span class="u">MGA</span>
        </div>
        <div class="hint">Le montant total du bien ou du projet à financer.</div>
      </div>

      <!-- <div class="field">
        <label for="apport">Mon apport</label>
        <div class="slider">
          <input
            id="apport"
            type="range"
            min="0"
            max="50"
            step="1"
            v-model.number="apportPct"
            :style="{ '--p': (apportPct / 50) * 100 + '%' }"
          />
          <div class="pct">{{ apportPct }} %</div>
        </div>
        <div class="subline">
          soit <b>{{ fmt(apport) }} MGA</b> d'apport — il reste <b>{{ fmt(pret) }} MGA</b> à financer.
        </div>
      </div> -->

      <div class="field">
        <label for="taux">Taux d'intérêt annuel</label>
        <div class="big-in">
          <input id="taux" type="number" step="0.01" min="0" inputmode="decimal" v-model.number="tauxAnnuel" />
          <span class="u">% / an</span>
        </div>
      </div>

      <div class="field">
        <label for="duree">Nombre de mensualités</label>
        <div class="big-in">
          <input id="duree" type="number" step="1" min="1" max="360" inputmode="numeric" v-model.number="duree" />
          <span class="u">mois</span>
        </div>
        <div class="chips chips-top">
          <button
            v-for="m in durees"
            :key="m"
            type="button"
            class="chip"
            :class="{ on: duree === m }"
            @click="duree = m"
          >
            <b>{{ libelleDuree(m) }}</b> · <span>{{ m }} mo</span>
          </button>
        </div>
        <div class="subline">soit <b>{{ dureeN }} mois</b> ({{ (dureeN / 12).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) }} ans)</div>
      </div>

      <details class="opt" open>
        <summary>📊 Voir le détail du calcul</summary>
        <div class="body">
          <div class="kv"><span>Montant du prêt</span><b>{{ fmt(pret) }} MGA</b></div>
          <div class="kv"><span>Apport</span><b>{{ fmt(apport) }} MGA ({{ apportPct }} %)</b></div>
          <div class="kv"><span>Frais de dossier (1,5 % du prêt, plafond 5 000 000)</span><b>{{ fmt(frais) }} MGA</b></div>
          <div class="kv"><span>Intérêts totaux</span><b>{{ fmt(totalInterets) }} MGA</b></div>
          <div class="kv"><span>Coût total de l'opération</span><b>{{ fmt(coutTotal) }} MGA</b></div>
        </div>
      </details>

      <div class="hint foot">
        Simulation indicative, calculée sur votre appareil (aucune donnée envoyée). Elle ne constitue pas une offre de crédit.
      </div>
    </section>

    <!-- ============ TABLEAU D'AMORTISSEMENT COMPLET ============ -->
    <section v-if="tableauAmortissement.length > 0" class="card card-tbl">
      <h2><span class="ic">📅</span> Tableau d'amortissement</h2>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Échéance</th>
              <th>Mensualité hors assurance</th>
              <th>Intérêts</th>
              <th>Capital remboursé</th>
              <th>Capital restant dû</th>
              <th>Cumul des intérêts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in tableauAmortissement" :key="l.echeance">
              <td>{{ l.echeance }}</td>
              <td>{{ fmt2(l.colonneF_mensualiteHorsAssurance) }}</td>
              <td>{{ fmt2(l.colonneG_interets) }}</td>
              <td>{{ fmt2(l.colonneI_capitalRembourse) }}</td>
              <td>{{ fmt2(l.colonneJ_capitalRestantDu) }}</td>
              <td>{{ fmt2(l.colonneK_cumulInterets) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>{{ fmt2(mensualite * dureeN) }}</td>
              <td>{{ fmt2(totalInterets) }}</td>
              <td>{{ fmt2(pret) }}</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

const durees = [12, 24, 36, 48, 60, 72]

const montant = ref(150000000)
const apportPct = ref(20)
const duree = ref(48)
const tauxAnnuel = ref(17)

const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')
const fmt2 = (n) =>
  (Number(n) || 0)
    .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\u202f|\u00a0/g, ' ')

// Durée saisie, sécurisée (entier entre 1 et 360)
const dureeN = computed(() => Math.min(360, Math.max(1, Math.floor(Number(duree.value) || 0))))

function onMontant(e) {
  const v = parseInt(String(e.target.value).replace(/\D/g, ''), 10)
  montant.value = Number.isFinite(v) ? v : 0
  e.target.value = fmt(montant.value)
}

function libelleDuree(m) {
  const a = m / 12
  return a === 1 ? '1 an' : `${a} ans`
}

const apport = computed(() => Math.round((montant.value * apportPct.value) / 100))
const pret = computed(() => Math.max(0, montant.value - apport.value))
const frais = computed(() => Math.min(pret.value * 0.015, 5000000))

function calculerAmortissement(capital, tauxAnnuel, dureeMois) {
  const tauxMensuel = tauxAnnuel / 100 / 12

  // Colonne F — Mensualité hors assurance
  const mensualiteHorsAssurance =
    tauxMensuel === 0
      ? capital / dureeMois
      : (capital * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois))

  let capitalRestantDu = capital
  let cumulInterets = 0
  const tableau = []

  for (let echeance = 1; echeance <= dureeMois; echeance++) {
    const interets = capitalRestantDu * tauxMensuel // Colonne G
    const capitalRembourse = mensualiteHorsAssurance - interets // Colonne I
    capitalRestantDu = Math.max(0, capitalRestantDu - capitalRembourse) // Colonne J
    cumulInterets += interets // Colonne K

    tableau.push({
      echeance,
      colonneF_mensualiteHorsAssurance: mensualiteHorsAssurance,
      colonneG_interets: interets,
      colonneI_capitalRembourse: capitalRembourse,
      colonneJ_capitalRestantDu: capitalRestantDu,
      colonneK_cumulInterets: cumulInterets
    })
  }
  return tableau
}

const tableauAmortissement = computed(() =>
  pret.value > 0
    ? calculerAmortissement(pret.value, Number(tauxAnnuel.value) || 0, dureeN.value)
    : []
)

const mensualite = computed(() => tableauAmortissement.value[0]?.colonneF_mensualiteHorsAssurance ?? 0)
const totalInterets = computed(() => tableauAmortissement.value.at(-1)?.colonneK_cumulInterets ?? 0)
const coutTotal = computed(() => apport.value + pret.value + totalInterets.value + frais.value)

function imprimer() {
  window.print()
}

function recommencer() {
  montant.value = 150000000
  apportPct.value = 20
  duree.value = 48
  tauxAnnuel.value = 17
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.page {
  --green: #0e8143;
  --green-d: #0b6b36;
  --green-l: #e8f5ee;
  --line: #e7e5e4;
  --muted: #78716c;
  --ink: #1c1917;

  font-family: 'Poppins', system-ui, sans-serif;
  color: var(--ink);
  background: #f5f5f4;
  min-height: 100vh;
  max-width: 940px;
  margin: 0 auto;
  padding: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* ---------- Carte résultat ---------- */
.card-res {
  order: 2;
  position: relative;
  color: #fff;
  border: 0;
  background: linear-gradient(145deg, #1aa35a 0%, #0e8143 55%, #0a6a37 100%);
  box-shadow: 0 14px 30px rgba(14, 129, 67, 0.28);
  overflow: hidden;
}
.card-res::after {
  content: '';
  position: absolute;
  right: -60px;
  bottom: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.lab {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.85;
}
.hero-num {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.1;
  margin-top: 6px;
  letter-spacing: -0.01em;
}
.cur {
  font-size: 18px;
  font-weight: 700;
  margin-left: 4px;
}
.det {
  font-size: 11px;
  opacity: 0.92;
  margin-top: 4px;
}

.pillsplit {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.4);
}
.pillsplit span {
  font-size: 10px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.infos .ttl {
  display: inline-block;
  background: #e11d2e;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 999px;
  margin-bottom: 8px;
}
.irow {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 11px;
}
.irow .v {
  font-weight: 700;
  font-size: 12px;
}
.irow i {
  font-style: normal;
  color: #fecaca;
}
.notes {
  font-size: 9px;
  opacity: 0.88;
  margin-top: 8px;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}
.btn {
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
}
.btn:hover { transform: translateY(-1px); }
.btn.primary { background: rgba(255, 255, 255, 0.16); color: #fff; border: 1px solid rgba(255, 255, 255, 0.35); }
.btn.ghost { background: #fff; color: var(--green-d); }

/* ---------- Formulaire ---------- */
.card-form { order: 1; }
.card-form h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--green-d);
}
.field { margin-bottom: 18px; }
.field > label,
.opt label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #57534e;
}

.big-in {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 10px 14px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.big-in:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(14, 129, 67, 0.12);
}
.big-in input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  background: transparent;
}
.u {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  background: #f5f5f4;
  padding: 4px 8px;
  border-radius: 8px;
}
.hint,
.subline {
  font-size: 10px;
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.5;
}
.subline b { color: var(--ink); }

/* Slider */
.slider {
  display: flex;
  align-items: center;
  gap: 16px;
}
.slider input[type='range'] {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 5px;
  border-radius: 999px;
  outline: 0;
  background: linear-gradient(to right, var(--green) var(--p, 40%), #e7e5e4 var(--p, 40%));
}
.slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--green);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}
.slider input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--green);
  cursor: pointer;
}
.pct {
  min-width: 54px;
  text-align: right;
  font-size: 18px;
  font-weight: 800;
  color: var(--green-d);
}

/* Chips durée */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  font: inherit;
  font-size: 10px;
  color: var(--muted);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip b { color: var(--ink); }
.chip:hover { border-color: var(--green); }
.chip.on {
  background: var(--green-l);
  border-color: var(--green);
  color: var(--green-d);
}
.chip.on b { color: var(--green-d); }

/* Blocs dépliables */
.opt {
  border: 1px solid var(--line);
  border-radius: 14px;
  margin-top: 12px;
  background: #fff;
}
.opt summary {
  cursor: pointer;
  padding: 11px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--green-d);
  list-style: none;
  display: flex;
  justify-content: space-between;
}
.opt summary::-webkit-details-marker { display: none; }
.opt summary::after { content: '▾'; font-size: 9px; color: var(--muted); }
.opt[open] summary::after { content: '▴'; }
.opt .body { padding: 4px 14px 14px; }

.mini-in {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px 12px;
}
.mini-in:focus-within { border-color: var(--green); }
.mini-in input {
  flex: 1;
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  min-width: 0;
}

.kv {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 10px;
}
.kv b { white-space: nowrap; }

.chips-top { margin-top: 10px; }

/* Tableau d'amortissement complet (pleine largeur) */
.card-tbl {
  order: 3;
  grid-column: 1 / -1;
}
.card-tbl h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--green-d);
}
.tbl-wrap { overflow-x: auto; }
.tbl {
  width: 100%;
  min-width: 640px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
}
.tbl th {
  text-align: right;
  padding: 10px 12px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  background: var(--green-d);
  white-space: nowrap;
}
.tbl th:first-child { text-align: center; border-top-left-radius: 10px; }
.tbl th:last-child { border-top-right-radius: 10px; }
.tbl td {
  padding: 9px 12px;
  text-align: right;
  border-bottom: 1px solid #f0efee;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tbl td:first-child { text-align: center; font-weight: 700; color: var(--green-d); }
.tbl tbody tr:nth-child(even) td { background: #fafaf9; }
.tbl tbody tr:hover td { background: var(--green-l); }
.tbl tfoot td {
  font-weight: 800;
  background: var(--green-l);
  color: var(--green-d);
  border-top: 2px solid var(--green);
}
.foot { margin-top: 14px; }

/* ---------- Responsive ---------- */
.page *,
.page *::before,
.page *::after { box-sizing: border-box; }
.page { width: 100%; overflow-x: clip; }
.card { min-width: 0; max-width: 100%; }
.tbl-wrap { max-width: 100%; }
.hero-num { font-size: clamp(30px, 8vw, 44px); overflow-wrap: anywhere; }

/* Tablette */
@media (max-width: 900px) {
  .page { padding: 14px; gap: 18px; }
  .card { padding: 18px; }
}

/* Mobile : une seule colonne, résultat en premier */
@media (max-width: 760px) {
  .page { grid-template-columns: minmax(0, 1fr); padding: 12px; gap: 14px; }
  .card { border-radius: 18px; padding: 16px; }
  .card-res { order: 1; }
  .card-form { order: 2; }
  .card-tbl { order: 3; }

  /* 16px minimum : évite le zoom automatique d'iOS dans les champs */
  .big-in input { font-size: 18px; }
  .big-in { padding: 9px 12px; border-radius: 14px; }

  .irow { flex-wrap: wrap; row-gap: 2px; }
  .irow .v { margin-left: auto; }

  .actions .btn { flex: 1 1 calc(50% - 8px); text-align: center; }

  .kv { flex-wrap: wrap; row-gap: 2px; }
  .kv b { margin-left: auto; }

  /* Tableau : défilement horizontal fluide, bords à ras de la carte */
  .tbl-wrap {
    margin: 0 -16px;
    padding: 0 16px;
    -webkit-overflow-scrolling: touch;
  }
  .tbl { min-width: 600px; font-size: 10px; }
  .tbl th { padding: 9px 9px; font-size: 8px; }
  .tbl td { padding: 8px 9px; }
  /* 1re colonne figée pendant le défilement */
  .tbl th:first-child,
  .tbl td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    background: #fff;
  }
  .tbl th:first-child { background: var(--green-d); }
  .tbl tbody tr:nth-child(even) td:first-child { background: #fafaf9; }
  .tbl tfoot td:first-child { background: var(--green-l); }
}

/* Petits mobiles */
@media (max-width: 400px) {
  .page { padding: 8px; }
  .card { padding: 14px; border-radius: 16px; }
  .chip { padding: 7px 11px; }
  .pct { font-size: 16px; min-width: 46px; }
  .slider { gap: 10px; }
  .actions .btn { flex: 1 1 100%; }
  .cur { font-size: 15px; }
}

/* ---------- Impression ---------- */
@media print {
  .no-print { display: none !important; }
  .page { display: block; background: #fff; }
  .card { box-shadow: none; break-inside: avoid; margin-bottom: 12px; }
}
</style>