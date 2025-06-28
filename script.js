fetch("cataloghi.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.querySelector(".cataloghi");

    data.forEach((categoria) => {
      // Crea il blocco della categoria
      const catBox = document.createElement("div");
      catBox.className = "categoria-box";

      const title = document.createElement("h2");
      title.textContent = categoria.categoria;
      title.className = "categoria-titolo";

      const cataloghiDiv = document.createElement("div");
      cataloghiDiv.className = "cataloghi-interni";
      cataloghiDiv.style.display = "none";

      categoria.cataloghi.forEach((cat) => {
        const div = document.createElement("div");
        div.className = "catalogo";
        div.innerHTML = `
          <h3>${cat.titolo}</h3>
          <p>${cat.descrizione}</p>
          <img src="${cat.immagine}" alt="${cat.titolo}">
          <a href="${cat.link}" target="_blank">Scarica PDF</a>
        `;
        cataloghiDiv.appendChild(div);
      });

      // Clic sulla categoria → toggle mostra/nascondi cataloghi
      title.addEventListener("click", () => {
        cataloghiDiv.style.display =
          cataloghiDiv.style.display === "none" ? "block" : "none";
      });

      catBox.appendChild(title);
      catBox.appendChild(cataloghiDiv);
      container.appendChild(catBox);
    });
  })
  .catch((err) => console.error("Errore caricamento cataloghi:", err));
