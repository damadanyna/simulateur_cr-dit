<template>
  <header class="top" :class="{ hidden: cache }">
    <div class="bar">
      <img src="../assets/logo.webp" class="logo" alt="SIPEM Banque" />
      <div class="t">
        <h1>Simulateur de prêt</h1>
        <div class="sub">SIPEM Banque · calculez vos mensualités et votre tableau d'amortissement</div>
      </div>
      <span class="tag">Mode client</span>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderView',
  data() {
    return {
      cache: false
    }
  },
  created() {
    // valeurs non réactives (pas de re-rendu à chaque scroll)
    this.dernierY = 0
    this.cumul = 0 // distance cumulée dans le sens courant
    this.sens = 0 // 1 = bas, -1 = haut
    this.ticking = false
  },
  mounted() {
    this.dernierY = window.scrollY
    window.addEventListener('scroll', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      if (this.ticking) return
      this.ticking = true
      window.requestAnimationFrame(() => {
        const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        // on ignore l'effet "rebond" (iOS / trackpad) hors limites
        const y = Math.min(max, Math.max(0, window.scrollY))
        const delta = y - this.dernierY
        this.dernierY = y

        if (y <= 20) {
          // tout en haut : toujours visible
          this.cache = false
          this.cumul = 0
          this.sens = 0
        } else if (delta !== 0) {
          const sens = delta > 0 ? 1 : -1
          // changement de sens : on repart de zéro
          if (sens !== this.sens) {
            this.sens = sens
            this.cumul = 0
          }
          this.cumul += Math.abs(delta)

          if (sens === 1 && this.cumul > 60 && !this.cache) {
            this.cache = true // assez de défilement vers le bas
          } else if (sens === -1 && this.cumul > 30 && this.cache) {
            this.cache = false // assez de défilement vers le haut
          }
        }

        this.ticking = false
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.top {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-top: 3px solid #1f2937;
  border-bottom: 1px solid #e7e5e4;
  font-family: 'Poppins', system-ui, sans-serif;
  transition: transform 0.3s ease;
  will-change: transform;
  overflow-anchor: none;
}

.top.hidden {
  transform: translateY(-100%);
}

.bar {
  max-width: 940px;
  margin: 0 auto;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.t {
  min-width: 0;
  flex: 1;
}

.t h1 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0e8143;
  line-height: 1.25;
}

.sub {
  font-size: 10px;
  color: #78716c;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag {
  background: #0b6b36;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .bar { padding: 8px 12px; gap: 10px; }
  .logo { height: 32px; }
  .sub { display: none; }
}

@media (max-width: 380px) {
  .t h1 { font-size: 12px; }
  .tag { padding: 4px 8px; font-size: 9px; }
}

@media print {
  .top { display: none; }
}
</style>