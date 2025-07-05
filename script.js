fetch("cataloghi.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".cataloghi");

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

        const downloadButton = div.querySelector(".btn-download");
        if (downloadButton) {
          downloadButton.addEventListener("click", () => {
            localStorage.setItem(cat.titolo, "true");
            
            // Update the button container immediately
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

      let imagesLoaded = false;
      title.addEventListener("click", () => {
        const isOpening = !cataloghiDiv.classList.contains("aperta");

        if (isOpening) {
          if (!imagesLoaded) {
            const images = cataloghiDiv.querySelectorAll("img[data-src]");
            images.forEach(img => {
              img.src = img.dataset.src;
            });
            imagesLoaded = true;
          }

          cataloghiDiv.classList.add("aperta");
          cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px";
          catalogItems.forEach((item, i) => {
            setTimeout(() => item.classList.add("visible"), i * 50);
          });
          cataloghiDiv.addEventListener("transitionend", function openEnd(e) {
            if (e.propertyName === "max-height") {
              cataloghiDiv.style.maxHeight = null;
              cataloghiDiv.removeEventListener("transitionend", openEnd);
            }
          });

        } else {
          // → chiusura
          // step 1: anima via gli item
          [...catalogItems].reverse().forEach((item, i) => {
            setTimeout(() => item.classList.remove("visible"), i * 50);
          });
          // step 2: dopo che tutti gli item hanno iniziato a scomparire…
          const delay = catalogItems.length * 50 + 50;
          setTimeout(() => {
            // imposti partenza, forzi reflow, togli classe, e imposti 0
            cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px";
            void cataloghiDiv.offsetHeight;
            cataloghiDiv.classList.remove("aperta");
            cataloghiDiv.style.maxHeight = "0";
            // pulisci lo style al termine della transizione
            cataloghiDiv.addEventListener("transitionend", function closeEnd(e) {
              if (e.propertyName === "max-height") {
                cataloghiDiv.style.maxHeight = ""; // Rimuovi lo stile inline
                cataloghiDiv.removeEventListener("transitionend", closeEnd);
              }
            });
          }, delay);
        }
      });

      const catImage = document.createElement("img");
      catImage.src = categoria.immagine;
      catImage.alt = categoria.categoria;
      catImage.className = "categoria-immagine";
      title.prepend(catImage);

      catBox.appendChild(title);
      catBox.appendChild(cataloghiDiv);
      container.appendChild(catBox);
    });
  })
  .catch((err) => console.error("Errore caricamento cataloghi:", err));