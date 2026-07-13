(function () {
  "use strict";

  // --- Banques de mots (français simple, mobile) ---
  // Corpus de PHRASES RÉELLES d'exercices "et/est" (Pass-Education, Lutinbazar,
  // Logicieleducatif, académie Orléans-Tours) collectées le 2026-07-13, + variantes
  // par substitution MÊME TYPE (personne↔personne, animal↔animal, chose↔chose).
  // Aucun "et/est" en fin de phrase. Qualité prioritaire.
  var BANKS = {
    prenomsMasc: ["Armand", "Rudy", "Antoine", "Lucas", "Thomas", "Martin", "Paul", "Jules", "Léo", "Hugo", "Noah", "Adam", "Tom", "Nathan", "le garçon", "le frère", "le père", "le roi", "le clown", "le boulanger"],
    prenomsFem:  ["Dominique", "Nelly", "Pauline", "Marina", "Lise", "Valentine", "Gabrielle", "Léa", "Emma", "Chloé", "Anna", "Elsa", "Hermione", "Julie", "Sophie", "la fille", "la soeur", "la mère", "la reine", "la maîtresse"],

    // CHOSES uniquement (jamais un être vivant)
    objetsMasc: ["le livre", "le ballon", "le citron", "le bonbon", "le cahier", "le gâteau", "le jouet", "le vélo", "le sac", "le train"],
    objetsFem:  ["la maison", "la table", "la voiture", "la tasse", "la poupée", "la tour", "la fleur", "la pomme", "la chaise", "la porte"],

    // ANIMAUX uniquement
    animauxMasc: ["le chien", "le chat", "le lapin", "le cheval", "le poisson", "l'ours", "le lion", "le hérisson"],
    animauxFem:  ["la chatte", "la lionne", "la souris", "la tortue", "la baleine", "la poule", "la brebis", "la vache"],

    // Adjectifs PERSONNES/ANIMAUX (jamais sur une chose)
    adjPersMasc: ["content", "heureux", "fatigué", "gentil", "mignon", "grand", "petit", "calme", "rapide", "brun", "jeune", "méchant"],
    adjPersFem:  ["contente", "heureuse", "fatiguée", "gentille", "mignonne", "grande", "petite", "calme", "rapide", "brune", "jeune", "méchante"],

    // Adjectifs CHOSES (jamais sur une personne)
    adjChoseMasc: ["grand", "petit", "bleu", "jaune", "rouge", "joli", "beau", "vide", "clair", "neuf", "propre", "lourd"],
    adjChoseFem:  ["grande", "petite", "bleue", "jaune", "rouge", "jolie", "belle", "vide", "claire", "neuve", "propre", "lourde"]
  };

  // --- Gabarits : {t} texte littéral, {b} banque, {s} trou (est|et). 1 à 3 trous. ---
  // Règle stricte : aucun "et/est" en position finale de phrase.
  var TEMPLATES = [
    // ===== PHRASES RÉELLES (corpus pédagogique) =====
    [ { t: "Armand " }, { s: "et" }, { t: " Dominique sont frères." } ],
    [ { t: "Les poissons nagent " }, { s: "et" }, { t: " mangent." } ],
    [ { t: "Rudy " }, { s: "est" }, { t: " brun." } ],
    [ { t: "Nelly " }, { s: "est" }, { t: " sérieuse " }, { s: "et" }, { t: " rigoureuse." } ],
    [ { t: "La table " }, { s: "est" }, { t: " cassée." } ],
    [ { t: "Dans la classe, il y a la maîtresse " }, { s: "et" }, { t: " les élèves." } ],
    [ { t: "Le médecin prend mon pouls " }, { s: "et" }, { t: " ma température." } ],
    [ { t: "Antoine " }, { s: "est" }, { t: " l'ainé de la famille." } ],
    [ { t: "Marina " }, { s: "est" }, { t: " arrivée à l'aéroport " }, { s: "et" }, { t: " elle a pris le bus pour rentrer chez elle." } ],
    [ { t: "Pauline " }, { s: "et" }, { t: " Lise ont une robe rouge " }, { s: "et" }, { t: " verte." } ],
    [ { t: "Cet arbre " }, { s: "est" }, { t: " immense " }, { s: "et" }, { t: " il fait de l'ombre dans notre jardin." } ],
    [ { t: "Ma sœur " }, { s: "et" }, { t: " mon cousin ont vu la Tour Eiffel qui " }, { s: "est" }, { t: " à Paris." } ],
    [ { t: "La baleine " }, { s: "est" }, { t: " un mammifère, comme le chien " }, { s: "et" }, { t: " l'ours." } ],
    [ { t: "Il n'" }, { s: "est" }, { t: " pas content parce que son frère " }, { s: "et" }, { t: " sa sœur sont partis sans lui." } ],
    [ { t: "Son pantalon " }, { s: "est" }, { t: " bleu " }, { s: "et" }, { t: " trop grand." } ],
    [ { t: "Ma poupée " }, { s: "est" }, { t: " belle." } ],
    [ { t: "Il y a des fraises " }, { s: "et" }, { t: " des groseilles." } ],
    [ { t: "Le citron " }, { s: "est" }, { t: " jaune." } ],
    [ { t: "Je voudrais du pain " }, { s: "et" }, { t: " du chocolat." } ],
    [ { t: "Sa coupe de cheveux " }, { s: "est" }, { t: " jolie." } ],
    [ { t: "Il a un cousin " }, { s: "et" }, { t: " une cousine." } ],
    [ { t: "Veux-tu un yaourt " }, { s: "et" }, { t: " un fruit ?" } ],
    [ { t: "Sa voiture " }, { s: "est" }, { t: " dans le garage." } ],
    [ { t: "Il " }, { s: "est" }, { t: " sur la table." } ],
    [ { t: "J'ai un bonbon jaune " }, { s: "et" }, { t: " un bonbon rouge." } ],
    [ { t: "Le hérisson " }, { s: "est" }, { t: " tout seul." } ],
    [ { t: "Elle joue du violon " }, { s: "et" }, { t: " du piano." } ],
    [ { t: "La maison " }, { s: "est" }, { t: " grande " }, { s: "et" }, { t: " belle." } ],
    [ { t: "Anna " }, { s: "et" }, { t: " Elsa jouent ensemble." } ],
    [ { t: "Je mange des légumes " }, { s: "et" }, { t: " des fruits." } ],
    [ { t: "Le soleil " }, { s: "est" }, { t: " revenu." } ],
    [ { t: "J'ai un poisson " }, { s: "et" }, { t: " une tortue." } ],
    [ { t: "Il " }, { s: "est" }, { t: " en retard." } ],
    [ { t: "Antoine a trois grandes soeurs " }, { s: "et" }, { t: " cinq petits frères." } ],
    [ { t: "La maison " }, { s: "est" }, { t: " fermée à clé." } ],
    [ { t: "Ma tasse à café " }, { s: "est" }, { t: " vide, peux-tu la remplir ?" } ],
    [ { t: "Cet accessoire " }, { s: "est" }, { t: " complètement gratuit !" } ],
    [ { t: "Combien de temps partent Thomas " }, { s: "et" }, { t: " Violette au Japon ?" } ],
    [ { t: "Martin écoute de la musique " }, { s: "et" }, { t: " mange en même temps." } ],
    [ { t: "Valentine " }, { s: "et" }, { t: " Gabrielle sont en train de jouer." } ],
    [ { t: "Hermione " }, { s: "est" }, { t: " la meilleure élève de sa classe." } ],
    [ { t: "Mon chien " }, { s: "est" }, { t: " jeune." } ],
    [ { t: "Laura " }, { s: "est" }, { t: " gentille." } ],
    [ { t: "Carole " }, { s: "est" }, { t: " belle." } ],
    [ { t: "Il " }, { s: "est" }, { t: " mon voisin." } ],
    [ { t: "Cendrillon " }, { s: "est" }, { t: " l'héroïne d'un conte merveilleux." } ],
    [ { t: "Sa mère " }, { s: "est" }, { t: " morte " }, { s: "et" }, { t: " la nouvelle femme de son père " }, { s: "est" }, { t: " très méchante." } ],
    [ { t: "Le chat " }, { s: "est" }, { t: " sur le canapé." } ],
    [ { t: "Mes parents " }, { s: "et" }, { t: " mes grands-parents viennent dîner." } ],
    [ { t: "Le facteur " }, { s: "est" }, { t: " passé ce matin." } ],
    [ { t: "Elle " }, { s: "est" }, { t: " partie à l'école." } ],

    // ===== VARIANTES par substitution MÊME TYPE =====
    // CHOSES : est + adjChose, et + chose même type
    [ { b: "objetsFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseFem" }, { t: "." } ],
    [ { b: "objetsMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseMasc" }, { t: "." } ],
    [ { b: "objetsMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "objetsMasc" }, { t: " sont sur la table." } ],
    [ { b: "objetsFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "objetsFem" }, { t: " sont dans le salon." } ],
    [ { b: "objetsFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseFem" }, { t: "." } ],
    [ { b: "objetsMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjChoseMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjChoseMasc" }, { t: "." } ],

    // PERSONNES : est + adjPers, et + personne même type
    [ { b: "prenomsMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "prenomsFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" }, { t: "." } ],
    [ { b: "prenomsMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "prenomsMasc" }, { t: " sont frères." } ],
    [ { b: "prenomsFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "prenomsFem" }, { t: " sont soeurs." } ],
    [ { b: "prenomsMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "prenomsFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersFem" }, { t: "." } ],

    // ANIMAUX : est + adjPers, et + animal même type
    [ { b: "animauxMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "animauxFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" }, { t: "." } ],
    [ { b: "animauxMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "animauxMasc" }, { t: " jouent ensemble." } ],
    [ { b: "animauxFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "animauxFem" }, { t: " jouent ensemble." } ],
    [ { b: "animauxMasc" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersMasc" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersMasc" }, { t: "." } ],
    [ { b: "animauxFem" }, { t: " " }, { s: "est" }, { t: " " }, { b: "adjPersFem" }, { t: " " }, { s: "et" }, { t: " " }, { b: "adjPersFem" }, { t: "." } ]
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
      if (part.t !== undefined) return { text: part.t };
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
    // Capitalise la 1re lettre alphabétique et garantit une ponctuation finale.
    var capitalized = false;
    parts.forEach(function (p) {
      if (p.text && !capitalized) {
        p.text = p.text.replace(/^[a-zà-ÿ]/, function (c) { return c.toUpperCase(); });
        capitalized = true;
      }
    });
    var lastText = null;
    parts.forEach(function (p) { if (p.text !== undefined && p.text !== "") lastText = p; });
    if (lastText) {
      var tail = lastText.text.replace(/\s+$/, "");
      if (!/[.?!]$/.test(tail)) lastText.text = tail + ".";
      else lastText.text = tail;
    }
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
