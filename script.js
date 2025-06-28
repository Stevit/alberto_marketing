fetch("cataloghi.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Errore nel caricamento dei cataloghi.");
    }
    return response.json();
  })
  .then((cataloghi) => {
    const container = document.querySelector(".cataloghi");

    cataloghi.forEach((cat) => {
      const div = document.createElement("div");
      div.className = "catalogo";
      div.innerHTML = `
        <h2>${cat.titolo}</h2>
        <p>${cat.descrizione}</p>
        <img src="${cat.immagine}" alt="${cat.titolo}">
        <a href="${cat.link}" target="_blank">Scarica PDF</a>
      `;
      container.appendChild(div);
    });
  })
  .catch((error) => {
    console.error("Errore:", error);
  });
