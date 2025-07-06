fetch("cataloghi.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".cataloghi");
    const categoryImagePromises = [];
    const catalogImagesToLoad = [];

    data.forEach((categoria) => {
      const catBox = document.createElement("div");
      catBox.className = "categoria-box";

      const title = document.createElement("h2");
      title.textContent = categoria.categoria;
      title.className = "categoria-titolo";

      const cataloghiDiv = document.createElement("div");
      cataloghiDiv.className = "cataloghi-interni";
      
      const catalogItems = [];
      categoria.cataloghi.forEach((cat) => {
        const div = document.createElement("div");
        div.className = "catalogo";
        div.dataset.id = cat.titolo; // Unique ID for the catalog

        const isDownloaded = localStorage.getItem(cat.titolo) === "true";

        // Mettiamo l'URL dell'immagine in data-src per caricarla dopo
        div.innerHTML = `
          <img data-src="${cat.immagine}" alt="${cat.titolo}" src="">
          <div>
            <h3>${cat.titolo}</h3>
            <p>${cat.descrizione}</p>
            <div class="button-container">
              ${
                isDownloaded
                  ? `<a href="${cat.linkScarica}" target="_blank" class="btn-download again">Scarica di nuovo</a>
                     <a href="${cat.linkVisualizza}" target="_blank" class="btn-view">Visualizza</a>`
                  : `<a href="${cat.linkScarica}" target="_blank" class="btn-download">Scarica</a>`
              }
            </div>
          </div>
        `;
        
        // Aggiungiamo l'immagine alla lista di quelle da caricare dopo
        catalogImagesToLoad.push(div.querySelector("img"));

        const downloadButton = div.querySelector(".btn-download");
        if (downloadButton) {
          downloadButton.addEventListener("click", () => {
            localStorage.setItem(cat.titolo, "true");
            
            const buttonContainer = div.querySelector(".button-container");
            buttonContainer.innerHTML = `
              <a href="${cat.linkScarica}" target="_blank" class="btn-download again">Scarica di nuovo</a>
              <a href="${cat.linkVisualizza}" target="_blank" class="btn-view">Visualizza</a>
            `;
          });
        }

        cataloghiDiv.appendChild(div);
        catalogItems.push(div);
      });

      title.addEventListener("click", () => {
        const isOpening = !cataloghiDiv.classList.contains("aperta");

        if (isOpening) {
          cataloghiDiv.classList.add("aperta");
          cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px";
          catalogItems.forEach((item, i) => {
            setTimeout(() => item.classList.add("visible"), i * 50);
          });
          cataloghiDiv.addEventListener("transitionend", function openEnd(e) {
            if (e.propertyName === "max-height") {
              cataloghiDiv.style.maxHeight = "none"; // Usa 'none' per consentire l'espansione
              cataloghiDiv.removeEventListener("transitionend", openEnd);
            }
          });

        } else {
          [...catalogItems].reverse().forEach((item, i) => {
            setTimeout(() => item.classList.remove("visible"), i * 50);
          });
          const delay = catalogItems.length * 50 + 50;
          setTimeout(() => {
            cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px";
            void cataloghiDiv.offsetHeight;
            cataloghiDiv.classList.remove("aperta");
            cataloghiDiv.style.maxHeight = "0";
            cataloghiDiv.addEventListener("transitionend", function closeEnd(e) {
              if (e.propertyName === "max-height") {
                cataloghiDiv.style.maxHeight = "";
                cataloghiDiv.removeEventListener("transitionend", closeEnd);
              }
            });
          }, delay);
        }
      });

      // Carichiamo subito l'immagine della categoria
      const catImage = document.createElement("img");
      catImage.alt = categoria.categoria;
      catImage.className = "categoria-immagine";
      
      // Creiamo una Promise per sapere quando ha finito di caricare
      const imagePromise = new Promise((resolve, reject) => {
        catImage.onload = resolve;
        catImage.onerror = reject;
      });
      categoryImagePromises.push(imagePromise);
      
      catImage.src = categoria.immagine; // Avvia il download
      title.prepend(catImage);

      catBox.appendChild(title);
      catBox.appendChild(cataloghiDiv);
      container.appendChild(catBox);
    });

    // Quando tutte le immagini delle categorie sono state caricate...
    Promise.all(categoryImagePromises)
      .then(() => {
        console.log("Immagini delle categorie caricate. Inizio caricamento immagini cataloghi in background.");
        // ...inizia a caricare le immagini dei cataloghi una alla volta
        catalogImagesToLoad.forEach((img, index) => {
          setTimeout(() => {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
          }, index * 100); // Aggiungo un piccolo ritardo per non sovraccaricare il browser
        });
      })
      .catch((error) => {
        console.error("Errore nel caricamento di un'immagine di categoria.", error);
      });
  })
  .catch((err) => console.error("Errore caricamento cataloghi:", err));