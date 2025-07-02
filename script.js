fetch("cataloghi.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".cataloghi");

    data.forEach((categoria) => {
      // Contenitore della categoria
      const catBox = document.createElement("div");
      catBox.className = "categoria-box";

      // Titolo cliccabile
      const title = document.createElement("h2");
      title.textContent = categoria.categoria;
      title.className = "categoria-titolo";

      // Contenitore cataloghi interni
      const cataloghiDiv = document.createElement("div");
      cataloghiDiv.className = "cataloghi-interni";

      // Popola cataloghi
      categoria.cataloghi.forEach((cat) => {
        const div = document.createElement("div");
        div.className = "catalogo";
        div.innerHTML = `
          <img src="${cat.immagine}" alt="${cat.titolo}">
          <div>
            <h3>${cat.titolo}</h3>
            <p>${cat.descrizione}</p>
            <a href="${cat.link}" target="_blank">Scarica PDF</a>
          </div>
        `;
        cataloghiDiv.appendChild(div);
      });

      // Toggle visibilità
      title.addEventListener("click", () => {
        if (cataloghiDiv.classList.contains("aperta")) {
          // Closing
          cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px"; // Set to actual height
          requestAnimationFrame(() => {
            cataloghiDiv.style.maxHeight = "0";
            cataloghiDiv.classList.remove("aperta"); // This will trigger opacity transition via CSS
          });

          cataloghiDiv.addEventListener('transitionend', function handler() {
            // Ensure max-height is 0 after transition for closed state
            if (!cataloghiDiv.classList.contains("aperta")) {
              cataloghiDiv.style.maxHeight = "0";
            }
            cataloghiDiv.removeEventListener('transitionend', handler);
          }, { once: true });
        } else {
          // Opening
          cataloghiDiv.style.maxHeight = cataloghiDiv.scrollHeight + "px";
          cataloghiDiv.classList.add("aperta");
          // After transition, remove max-height to allow content to grow/shrink naturally
          cataloghiDiv.addEventListener('transitionend', function handler() {
            cataloghiDiv.style.maxHeight = null;
            cataloghiDiv.removeEventListener('transitionend', handler);
          }, { once: true });
        }
      });

      // Immagine della categoria
      const catImage = document.createElement("img");
      catImage.src = categoria.immagine;
      catImage.alt = categoria.categoria;
      catImage.className = "categoria-immagine";
      title.prepend(catImage); // Prepend the image to the title

      catBox.appendChild(title);
      catBox.appendChild(cataloghiDiv);
      container.appendChild(catBox);
    });
  })
  .catch((err) => console.error("Errore caricamento cataloghi:", err));
