(function () {
  "use strict";

  // --- Banques de mots (français simple, mobile) ---
  // Réécrit le 2026-07-13 : sens garanti.
  // - Animé/inanimé strictement séparés.
  // - Adjectifs "personnes seules" (content, heureux, gentil...) vs
  //   "choses seules" (rouge, neuf, clair...) vs "partagés" (grand, calme...).
  // - Accords masc/fem. "et" lie même nature. AUCUN "et/est" en fin de phrase.
  var BANKS = {
    // Sujets ANIMÉS (personnes, animaux)
    subjAnimMasc: [
      "le chat", "le chien", "le garçon", "le père", "le voisin", "le frère",
      "un chat", "un chien", "un garçon", "un père"
    ],
    subjAnimFem: [
      "la fille", "la mère", "la voisine", "la soeur",
      "une fille", "une mère", "une voisine"
    ],
    subjPronMasc: ["il"],
    subjPronFem: ["elle"],

    // Sujets INANIMÉS (objets, lieux)
    subjInanimMasc: [
      "le livre", "le vélo", "l'arbre", "le ballon",
      "un livre", "un vélo", "un arbre"
    ],
    subjInanimFem: [
      "la maison", "la voiture", "la fleur", "la table", "la porte",
      "une maison", "une fleur", "une voiture"
    ],

    // Adjectifs PERSONNES UNIQUEMENT (jamais sur une chose)
    adjPersMasc: ["content", "heureux", "fatigué", "gentil", "mignon", "grand", "petit", "calme", "rapide", "joli", "propre", "vieux"],
    adjPersFem:  ["contente", "heureuse", "fatiguée", "gentille", "mignonne", "grande", "petite", "calme", "rapide", "jolie", "propre", "vieille"],

    // Adjectifs CHOSES UNIQUEMENT (jamais sur une personne)
    adjChoseMasc: ["rouge", "bleu", "noir", "clair", "neuf", "grand", "petit", "calme", "rapide", "joli", "propre", "vieux"],
    adjChoseFem:  ["rouge", "bleue", "noire", "claire", "neuve", "grande", "petite", "calme", "rapide", "jolie", "propre", "vieille"],

    // Verbes d'action (êtres vivants uniquement) -> jamais précédés de "est"
    verbsAnim: ["chante", "sourit", "rit", "dort", "mange", "court", "travaille", "joue"],

    // Lieux (avec "est")
    places: ["à la maison", "à l'école", "au parc", "au jardin", "à la bibliothèque", "au bureau", "dehors"],

    // Professions (avec "est", animés uniquement)
    professions: ["médecin", "professeur", "boulanger", "artiste", "musicien", "cuisinier", "pompier"]
  };

  // --- Gabarits : {t} littéral, {b} banque, {s} trou (est|et). 1 à 3 trous. ---
  // Règle stricte : aucun "et/est" en position finale de phrase.
  var TEMPLATES = [
    // --- ANIMÉS ---
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" },  { t: "." } ],
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: "." } ],
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "professions" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "professions" }, { t: "." } ],
    // 2 trous : est + adjPers ET adjPers
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersFem" },  { t: "." } ],
    // 2 trous : est + adjPers ET verbe
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "verbsAnim" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "verbsAnim" }, { t: "." } ],
    // 2 trous : nom ET nom
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjAnimMasc" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "subjAnimFem" },  { t: "." } ],
    // 3 trous : est + lieu ET il/elle verbe
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjPronMasc" }, { t: " " }, { b: "verbsAnim" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjPronFem" },  { t: " " }, { b: "verbsAnim" }, { t: "." } ],
    // 3 trous : est + profession ET il/elle verbe
    [ { b: "subjAnimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "professions" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjPronMasc" }, { t: " " }, { b: "verbsAnim" }, { t: "." } ],
    [ { b: "subjAnimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "professions" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjPronFem" },  { t: " " }, { b: "verbsAnim" }, { t: "." } ],

    // --- INANIMÉS ---
    [ { b: "subjInanimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseMasc" }, { t: "." } ],
    [ { b: "subjInanimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseFem" },  { t: "." } ],
    [ { b: "subjInanimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: "." } ],
    [ { b: "subjInanimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: "." } ],
    // 2 trous : est + adjChose ET adjChose
    [ { b: "subjInanimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseMasc" }, { t: "." } ],
    [ { b: "subjInanimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseFem" },  { t: "." } ],
    // 2 trous : nom ET nom
    [ { b: "subjInanimMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "subjInanimMasc" }, { t: "." } ],
    [ { b: "subjInanimFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "subjInanimFem" },  { t: "." } ],
    // 3 trous : est + adjChose ET adjChose ET adjChose
    [ { b: "subjInanimMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseMasc" }, { t: "." } ],
    [ { b: "subjInanimFem" },  { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseFem" },  { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseFem" },  { t: "." } ]
  ];
  var state = {
    exercise: null,
    locked: false,
    stats: { ok: 0, total: 0, streak: 0, best: 0 }
  };

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function buildExercise() {
    var tpl = rand(TEMPLATES);
    var slots = [];
    var used = {}; // évite de répéter un même mot dans un exercice
    var parts = tpl.map(function (part) {
      if (typeof part === "string") return { text: part };
      if (part.s) {
        slots.push({ answer: part.s, chosen: null });
        return { slot: slots.length - 1 };
      }
      if (part.b) {
        var pool = BANKS[part.b].filter(function (w) { return !used[w]; });
        if (pool.length === 0) pool = BANKS[part.b];
        var w = rand(pool);
        used[w] = true;
        return { text: w };
      }
      return { text: "" };
    });
    return { parts: parts, slots: slots };
  }

  var sentenceEl = document.getElementById("sentence");
  var feedbackEl = document.getElementById("feedback");
  var checkBtn = document.getElementById("check");
  var nextBtn = document.getElementById("next");
  var statsEl = document.getElementById("stats");

  function render() {
    sentenceEl.innerHTML = "";
    state.exercise.parts.forEach(function (p) {
      if (p.text !== undefined) {
        var span = document.createElement("span");
        span.className = "word";
        span.textContent = p.text;
        sentenceEl.appendChild(span);
      } else if (p.slot !== undefined) {
        var wrap = document.createElement("span");
        wrap.className = "slot";
        wrap.dataset.slot = String(p.slot);
        ["et", "est"].forEach(function (word) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "choice";
          b.textContent = word;
          b.dataset.word = word;
          b.addEventListener("click", function () { choose(p.slot, word); });
          wrap.appendChild(b);
        });
        sentenceEl.appendChild(wrap);
      }
    });
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    checkBtn.disabled = true;
    nextBtn.hidden = true;
    updateStats();
  }

  function choose(slotIndex, word) {
    if (state.locked) return;
    state.exercise.slots[slotIndex].chosen = word;
    var wrap = sentenceEl.querySelector('.slot[data-slot="' + slotIndex + '"]');
    wrap.querySelectorAll(".choice").forEach(function (b) {
      b.classList.toggle("selected", b.dataset.word === word);
    });
    var allChosen = state.exercise.slots.every(function (s) { return s.chosen !== null; });
    checkBtn.disabled = !allChosen;
  }

  function check() {
    if (state.locked) return;
    state.locked = true;
    var allCorrect = true;
    state.exercise.slots.forEach(function (s, i) {
      var wrap = sentenceEl.querySelector('.slot[data-slot="' + i + '"]');
      var correct = s.chosen === s.answer;
      if (correct) {
        state.stats.ok++;
      } else {
        allCorrect = false;
        wrap.querySelectorAll(".choice").forEach(function (b) {
          if (b.dataset.word === s.answer) b.classList.add("correct");
          if (b.dataset.word === s.chosen) b.classList.add("wrong");
        });
      }
      state.stats.total++;
    });
    state.stats.streak = allCorrect ? state.stats.streak + 1 : 0;
    state.stats.best = Math.max(state.stats.best, state.stats.streak);
    feedbackEl.textContent = allCorrect
      ? "Bravo ! Tout est correct."
      : "Réponse(s) fausse(s) en rouge, la bonne en vert.";
    feedbackEl.className = "feedback " + (allCorrect ? "ok" : "bad");
    checkBtn.disabled = true;
    nextBtn.hidden = false;
    nextBtn.focus();
    updateStats();
  }

  function updateStats() {
    statsEl.textContent = "Score " + state.stats.ok + "/" + state.stats.total +
      "  ·  série " + state.stats.streak + "  ·  meilleure " + state.stats.best;
  }

  function next() {
    state.locked = false;
    state.exercise = buildExercise();
    render();
  }

  checkBtn.addEventListener("click", check);
  nextBtn.addEventListener("click", next);

  state.exercise = buildExercise();
  render();

  // --- Affichage de la version (source de vérité : version.json, jamais en cache) ---
  fetch('./version.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      var vEl = document.getElementById('appver');
      if (vEl && j && j.version) vEl.textContent = 'v' + j.version;
    })
    .catch(function () { /* fallback : data-version statique déjà affiché dans le footer */ });
})();
