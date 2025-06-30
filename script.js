fetch("cataloghi.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".cataloghi");

    data.forEach((categoria) => {
      // Contenitore della categoria
      const catBox = document.createElement("div");
      catBox.className = "categoria-box";

      // Intestazione categoria con immagine e titolo
      const title = document.createElement("h2");
      title.className = "categoria-titolo";

      const catImg = document.createElement("img");
      catImg.src = categoria.immagine;
      catImg.alt = categoria.categoria;
      title.appendChild(catImg);

      const titleText = document.createElement("span");
      titleText.textContent = categoria.categoria;
      title.appendChild(titleText);

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
      let aperta = false;
      title.addEventListener("click", () => {
        aperta = !aperta;
        cataloghiDiv.classList.toggle("aperta", aperta);
        catBox.classList.toggle("aperta", aperta);
      });

      catBox.appendChild(title);
      catBox.appendChild(cataloghiDiv);
      container.appendChild(catBox);
    });
  })
  .catch((err) => console.error("Errore caricamento cataloghi:", err));
