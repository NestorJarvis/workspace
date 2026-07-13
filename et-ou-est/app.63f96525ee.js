(function () {
  "use strict";

  // --- Banques de mots (français simple, mobile) ---
  // Régénéré via ChatGPT (invité) le 2026-07-13 : phrases grammaticalement
  // correctes, accords masc/fem respectés, "c'est" uniquement devant un
  // article indéfini, coordinations "et" logiques.
  var BANKS = {
    nouns: [
      "chat", "chien", "livre", "vélo", "arbre", "stylo", "ballon", "oiseau"
    ],

    places: [
      "à la maison",
      "à l'école",
      "au parc",
      "au jardin",
      "à la bibliothèque",
      "au bureau"
    ],

    professions: [
      "médecin",
      "professeur",
      "boulanger",
      "artiste",
      "musicien",
      "cuisinier"
    ],

    subjPron: ["il", "elle"],

    verbs3: [
      "mange",
      "court",
      "dort",
      "chante",
      "travaille",
      "joue"
    ],

    subjMasc: [
      "le chat",
      "le chien",
      "le livre",
      "le vélo",
      "l'arbre",
      "le garçon",
      "le voisin"
    ],

    adjMasc: [
      "grand",
      "petit",
      "content",
      "fatigué",
      "rapide",
      "calme",
      "heureux",
      "gentil"
    ],

    subjFem: [
      "la fleur",
      "la maison",
      "la voiture",
      "la fille",
      "la voisine",
      "la porte"
    ],

    adjFem: [
      "grande",
      "petite",
      "contente",
      "fatiguée",
      "rapide",
      "calme",
      "heureuse",
      "gentille"
    ],

    detNounMasc: [
      "un chat",
      "un chien",
      "un livre",
      "un vélo",
      "un arbre",
      "un ballon",
      "un oiseau",
      "un garçon"
    ],

    detNounFem: [
      "une fleur",
      "une maison",
      "une voiture",
      "une fille",
      "une porte",
      "une voisine"
    ]
  };

  // --- Gabarits : chaque partie est
  //     {t:"texte"}  -> littéral
  //     {b:"banque"} -> mot tiré au sort
  //     {s:"est"|"et"} -> trou (réponse attendue)
  // Les combinaisons de gabarits donnent 1 à 3 trous par phrase.
  // Régénéré via ChatGPT (invité) le 2026-07-13.
  var TEMPLATES = [
    // 1 trou

    [
      { t: "Le chat " },
      { s: "est" },
      { t: " noir." }
    ],

    [
      { b: "subjMasc" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjMasc" },
      { t: "." }
    ],

    [
      { b: "subjFem" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjFem" },
      { t: "." }
    ],

    [
      { t: "C'" },
      { s: "est" },
      { t: " " },
      { b: "detNounMasc" },
      { t: "." }
    ],

    [
      { t: "C'" },
      { s: "est" },
      { t: " " },
      { b: "detNounFem" },
      { t: "." }
    ],

    [
      { b: "subjMasc" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "places" },
      { t: "." }
    ],

    [
      { b: "subjFem" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "places" },
      { t: "." }
    ],

    // 2 trous

    [
      { b: "subjMasc" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjMasc" },
      { t: " " },
      { s: "et" },
      { t: " gentil." }
    ],

    [
      { b: "subjFem" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjFem" },
      { t: " " },
      { s: "et" },
      { t: " calme." }
    ],

    [
      { b: "detNounMasc" },
      { t: " " },
      { s: "et" },
      { t: " " },
      { b: "detNounFem" },
      { t: " sont ici." }
    ],

    [
      { b: "subjPron" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "places" },
      { t: " " },
      { s: "et" },
      { t: " travaille." }
    ],

    [
      { b: "subjMasc" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "professions" },
      { t: " " },
      { s: "et" },
      { t: " travaille ici." }
    ],

    // 3 trous

    [
      { b: "subjMasc" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjMasc" },
      { t: " " },
      { s: "et" },
      { t: " " },
      { b: "adjMasc" },
      { t: " " },
      { s: "et" },
      { t: " sourit." }
    ],

    [
      { b: "subjFem" },
      { t: " " },
      { s: "est" },
      { t: " " },
      { b: "adjFem" },
      { t: " " },
      { s: "et" },
      { t: " " },
      { b: "adjFem" },
      { t: " " },
      { s: "et" },
      { t: " chante." }
    ],

    [
      { t: "C'" },
      { s: "est" },
      { t: " " },
      { b: "detNounMasc" },
      { t: " " },
      { s: "et" },
      { t: " " },
      { b: "detNounFem" },
      { t: " " },
      { s: "et" },
      { t: " ils sont prêts." }
    ]
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
    var parts = tpl.map(function (part) {
      if (typeof part === "string") return { text: part };
      if (part.s) {
        slots.push({ answer: part.s, chosen: null });
        return { slot: slots.length - 1 };
      }
      if (part.b) return { text: rand(BANKS[part.b]) };
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
