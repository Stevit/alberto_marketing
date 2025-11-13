document.addEventListener("DOMContentLoaded", () => {
  const searchResultsContainer = document.getElementById("search-results");
  const searchResultsTitle = document.getElementById("search-results-title");
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  // Mantieni il termine di ricerca nella casella di input (se presente)
  const searchInputElement = document.querySelector(".search-input");
  if (searchInputElement) {
    searchInputElement.value = query ? query : "";
  }

  // Gestisci il click del bottone di ricerca (no form submission)
  const searchButton = document.getElementById("search-button-submit");
  if (searchButton) {
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      const inputValue = searchInputElement.value.trim();
      if (inputValue) {
        window.location.href = `search.html?query=${encodeURIComponent(
          inputValue
        )}`;
      }
    });
    // Permetti il submit anche con Enter
    searchInputElement.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const inputValue = searchInputElement.value.trim();
        if (inputValue) {
          window.location.href = `search.html?query=${encodeURIComponent(
            inputValue
          )}`;
        }
      }
    });
  }

  // Monitora i cambiamenti dell'input in tempo reale
  if (searchInputElement) {
    searchInputElement.addEventListener("input", (e) => {
      const inputValue = e.target.value.trim();
      
      if (inputValue === "") {
        // Se l'input è vuoto, mostra i cataloghi della home
        searchResultsTitle.textContent = "Cataloghi disponibili";
        loadAndDisplayAllCatalogs();
      }
      // Altrimenti, mantieni i risultati della ricerca precedente
      // L'utente può cliccare sul bottone di ricerca per nuovi risultati
    });
  }

  if (!searchResultsContainer || !searchResultsTitle) {
    console.error("Elementi per i risultati della ricerca non trovati.");
    return;
  }

  if (!query || query.trim() === "") {
    searchResultsTitle.textContent = "Cataloghi disponibili";
    loadAndDisplayAllCatalogs();
    return;
  }

  searchResultsTitle.textContent = `Risultati per: "${query}"`;

  // Funzione per caricare e visualizzare tutti i cataloghi (quando l'input è vuoto)
  function loadAndDisplayAllCatalogs() {
    fetch("cataloghi.json")
      .then((r) => r.json())
      .then((cataloghiData) => {
        // Estrai tutti i cataloghi da tutte le categorie
        const allCatalogs = [];
        cataloghiData.forEach((category) => {
          category.cataloghi.forEach((catalogo) => {
            allCatalogs.push(catalogo);
          });
        });

        displayResults(allCatalogs);
      })
      .catch((error) => {
        console.error("Errore nel caricamento dei cataloghi:", error);
        searchResultsContainer.innerHTML =
          '<p style="text-align: center;">Si è verificato un errore durante il caricamento dei cataloghi.</p>';
      });
  }

  // Carica sia cataloghi.json che catalog_index.json
  Promise.all([
    fetch("cataloghi.json").then((r) => r.json()),
    fetch("catalog_index.json")
      .then((r) => r.json())
      .catch(() => []),
  ])
    .then(([cataloghiData, indexData]) => {
      // Funzioni di supporto per ricerca avanzata

      // Calcola distanza Levenshtein per fuzzy matching
      function levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }
        return matrix[b.length][a.length];
      }

      // Calcola score di similarità fuzzy (0-1)
      function fuzzyMatchScore(text, pattern) {
        text = text.toLowerCase();
        pattern = pattern.toLowerCase();
        if (!text || !pattern) return 0;
        const distance = levenshteinDistance(text, pattern);
        // SOGLIA COERENTE: distanza <= 3 = match affidabile
        // Converte distanza in score: 0 distanza = 1.0, 3 distanza = 0.6
        const maxLen = Math.max(text.length, pattern.length);

        // FILTRO DI QUALITÀ: distanza <= 40% della lunghezza massima AND <= 3
        // Esempio: "bicchiere" (9 lett) vs "bicchiare" (9 lett): maxDist=3, reale=2 ✅
        // Esempio: "vetri" (5 lett) vs "horeca" (6 lett): maxDist=2, reale=5 ❌
        const maxDistance = Math.ceil(maxLen * 0.4);

        if (distance <= maxDistance && distance <= 3) {
          return Math.max(0.5, 1 - distance / (maxDistance + 1));
        }
        return 0;
      }

      // Calcola score totale per un testo rispetto al query
      function calculateMatchScore(text, queryTerms) {
        if (!text) return 0;
        const lowerText = text.toLowerCase();
        let totalScore = 0;

        queryTerms.forEach((term) => {
          const lowerTerm = term.toLowerCase();
          let bestTermScore = 0;

          // 1. Match esatto del testo completo: +10
          if (lowerText === lowerTerm) {
            bestTermScore = 10;
          }
          // 2. Contiene esatto (substring): +8
          else if (lowerText.includes(lowerTerm)) {
            bestTermScore = 8;
          }
          // 3. Fuzzy match del testo completo: fino a +7
          else {
            const fuzzyScore = fuzzyMatchScore(lowerText, lowerTerm);
            if (fuzzyScore > 0) {
              bestTermScore = fuzzyScore * 7;
            }
          }

          // 4. Se non trovato, cerca dentro le singole parole del testo
          if (bestTermScore === 0) {
            const words = lowerText.split(/\s+|[^\w\u00C0-\u017F]+/);
            for (const word of words) {
              if (!word) continue;

              // Match esatto parola: +9
              if (word === lowerTerm) {
                bestTermScore = Math.max(bestTermScore, 9);
              }
              // Inizia con: +7
              else if (word.startsWith(lowerTerm)) {
                bestTermScore = Math.max(bestTermScore, 7);
              }
              // Contiene: +6
              else if (word.includes(lowerTerm)) {
                bestTermScore = Math.max(bestTermScore, 6);
              }
              // Fuzzy match parola singola: fino a +7
              else {
                const fuzzyWordScore = fuzzyMatchScore(word, lowerTerm);
                if (fuzzyWordScore > 0) {
                  bestTermScore = Math.max(bestTermScore, fuzzyWordScore * 7);
                }
              }
            }
          }

          totalScore += bestTermScore;
        });

        return totalScore;
      }

      const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const resultMap = new Map(); // Usa Map per tracciare score

      // Cerca nei cataloghi principali (titolo, descrizione, categoria)
      cataloghiData.forEach((category) => {
        category.cataloghi.forEach((catalogo) => {
          let score = 0;

          // Score da titolo (peso più alto)
          score += calculateMatchScore(catalogo.titolo, queryTerms) * 3;

          // Score da descrizione (peso medio)
          score += calculateMatchScore(catalogo.descrizione, queryTerms) * 2;

          // Score da categoria (peso medio)
          score += calculateMatchScore(category.categoria, queryTerms) * 2;

          if (score > 0) {
            resultMap.set(catalogo.titolo, {
              catalogo,
              score,
            });
          }
        });
      });

      // Cerca negli items dell'index
      indexData.forEach((indexItem) => {
        if (!indexItem.items) return;

        let itemScore = 0;
        indexItem.items.forEach((item) => {
          itemScore = Math.max(
            itemScore,
            calculateMatchScore(item, queryTerms)
          );
        });

        if (itemScore > 0) {
          // Trova il catalogo corrispondente
          const matchFromMain = cataloghiData.find((cat) =>
            cat.cataloghi.some((c) => c.titolo === indexItem.titolo)
          );

          if (matchFromMain) {
            const catalogoMatch = matchFromMain.cataloghi.find(
              (c) => c.titolo === indexItem.titolo
            );

            if (catalogoMatch) {
              const existing = resultMap.get(indexItem.titolo);
              // Aggiungi score dagli items (peso minore rispetto al titolo)
              const newScore = (existing?.score || 0) + itemScore * 1.5;
              resultMap.set(indexItem.titolo, {
                catalogo: catalogoMatch,
                score: newScore,
              });
            }
          }
        }
      });

      // Ordina per score decrescente
      const results = Array.from(resultMap.values())
        .sort((a, b) => b.score - a.score)
        .map((item) => item.catalogo);

      displayResults(results);
    })
    .catch((error) => {
      console.error(
        "Errore nel caricamento o nella ricerca dei cataloghi:",
        error
      );
      searchResultsContainer.innerHTML =
        '<p style="text-align: center;">Si è verificato un errore durante la ricerca. Riprova più tardi.</p>';
    });

  function displayResults(results) {
    searchResultsContainer.innerHTML = ""; // Pulisce i risultati precedenti

    if (results.length === 0) {
      searchResultsContainer.innerHTML =
        '<p style="text-align: center;">Nessun catalogo trovato per la tua ricerca.</p>';
      return;
    }

    // Creiamo risultati usando lo stesso markup della pagina principale (.catalogo)
    // così ereditiamo gli stili già definiti in styles/main.css
    const categoryContainer = document.createElement("div");
    categoryContainer.className = "categoria-container";

    // container principale (non necessariamente griglia, manteniamo flessibilità)
    const cataloghiWrapper = document.createElement("div");
    cataloghiWrapper.className = "cataloghi";

    results.forEach((catalogo) => {
      const catalogoEl = document.createElement("div");
      catalogoEl.className = "catalogo";

      // Controlla se il catalogo è già stato scaricato
      const isDownloaded = localStorage.getItem(catalogo.titolo) === "true";

      // Usa la struttura usata nella pagina principale: immagine + contenuto
      catalogoEl.innerHTML = `
        <img src="${catalogo.immagine}" alt="${
        catalogo.titolo
      }" loading="lazy" decoding="async" width="120" height="120">
        <div>
          <h3>${catalogo.titolo}</h3>
          <p>${catalogo.descrizione}</p>
          <div class="button-container">
            ${
              isDownloaded
                ? `<a href="${catalogo.linkScarica}" target="_blank" class="btn-download again">Scarica di nuovo</a>
                   <a href="${catalogo.linkVisualizza}" target="_blank" class="btn-view">Visualizza</a>`
                : `<a href="${catalogo.linkScarica}" target="_blank" class="btn-download">Scarica</a>`
            }
          </div>
        </div>
      `;

      const downloadButton = catalogoEl.querySelector(".btn-download");
      if (downloadButton) {
        downloadButton.addEventListener("click", () => {
          localStorage.setItem(catalogo.titolo, "true");

          const buttonContainer = catalogoEl.querySelector(".button-container");
          buttonContainer.innerHTML = `
            <a href="${catalogo.linkScarica}" target="_blank" class="btn-download again">Scarica di nuovo</a>
            <a href="${catalogo.linkVisualizza}" target="_blank" class="btn-view">Visualizza</a>
          `;
        });
      }

      cataloghiWrapper.appendChild(catalogoEl);
    });

    categoryContainer.appendChild(cataloghiWrapper);
    searchResultsContainer.appendChild(categoryContainer);
  }

  // Rendiamo l'header cliccabile: cliccando sulla casella "Le mie selezioni"
  // si torna alla pagina principale. Escludiamo click su form/input/button/links.
  const pageHeader = document.querySelector("header");
  if (pageHeader) {
    pageHeader.style.cursor = "pointer";
    pageHeader.addEventListener("click", (e) => {
      // se il click è su un elemento interattivo del form (o link) non navighiamo
      if (e.target.closest("form, input, button, a, label, select, textarea"))
        return;
      // naviga alla home
      window.location.href = "index.html";
    });
  }
});
