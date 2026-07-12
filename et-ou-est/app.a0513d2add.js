(function () {
  "use strict";

  // --- Banques de mots (français simple, mobile) ---
  var BANKS = {
    nouns: ["un chat", "un chien", "un livre", "une fleur", "une maison",
            "un oiseau", "une mère", "un père", "la lune", "le soleil",
            "un arbre", "une table", "un roi", "une reine", "un ami",
            "une amie", "un bébé", "le vent"],
    places: ["dans la maison", "sur la table", "devant la porte", "sous l'arbre",
             "dans le jardin", "près du fleuve", "derrière le mur", "sur le toit"],
    professions: ["médecin", "professeur", "élève", "pompier", "cuisinier",
                  "chanteur", "écrivain", "peintre", "jardinier", "musicien"],
    subjPron: ["il", "elle"],
    verbs3: ["court", "saute", "chante", "pleure", "rit", "dort", "mange",
             "boit", "pense", "écoute", "parle", "travaille"],
    subjMasc: ["le chat", "le chien", "le livre", "mon père", "le roi",
               "il", "le cheval", "le poisson"],
    adjMasc: ["grand", "petit", "rouge", "bleu", "noir", "clair", "propre",
              "vieux", "content", "gentil", "rapide"],
    subjFem: ["la maison", "la fleur", "ma mère", "elle", "la lune",
              "la table", "la porte", "la rivière"],
    adjFem: ["grande", "petite", "rouge", "bleue", "noire", "claire", "propre",
             "vieille", "contente", "gentille", "rapide"]
  };

  // --- Gabarits : chaque partie est
  //     {t:"texte"}  -> littéral
  //     {b:"banque"} -> mot tiré au sort
  //     {s:"est"|"et"} -> trou (réponse attendue)
  // Les combinaisons de gabarits donnent 1 à 3 trous par phrase.
  var TEMPLATES = [
    // 1 trou : est  (c'est + nom)
    [{ t: "C'est " }, { s: "est" }, { b: "nouns" }, { t: "." }],
    // 1 trou : et   (nom et nom)
    [{ b: "nouns" }, { t: " " }, { s: "et" }, { t: " " }, { b: "nouns" }, { t: "." }],
    // 1 trou : est  (sujet est + lieu)
    [{ b: "nouns" }, { t: " " }, { s: "est" }, { t: " " }, { b: "places" }, { t: "." }],
    // 1 trou : est  (pronom est + métier)
    [{ b: "subjPron" }, { t: " " }, { s: "est" }, { t: " " }, { b: "professions" }, { t: "." }],
    // 2 trous : est, et  (sujet masc est adj et adj)
    [{ b: "subjMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjMasc" }, { t: " et " }, { b: "adjMasc" }, { t: "." }],
    // 2 trous : est, et  (sujet fem est adj et adj)
    [{ b: "subjFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjFem" }, { t: " et " }, { b: "adjFem" }, { t: "." }],
    // 3 trous : est, et, est  (c'est X et c'est Y)
    [{ t: "C'est " }, { s: "est" }, { b: "nouns" }, { t: " " }, { s: "et" }, { t: " c'est " }, { s: "est" }, { b: "nouns" }, { t: "." }],
    // 2 trous : est, et  (pron est adj et pron verbe)
    [{ b: "subjPron" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjMasc" }, { t: " et " }, { b: "subjPron" }, { t: " " }, { b: "verbs3" }, { t: "." }]
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
})();
