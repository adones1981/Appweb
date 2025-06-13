async function getBusInfo() {
  const code = document.getElementById("stopCode").value;
  const resultDiv = document.getElementById("result");

  if (!code) {
    resultDiv.innerHTML = "<p>⚠️ Ingresa un código de paradero.</p>";
    return;
  }

  resultDiv.innerHTML = "<p>🔄 Consultando buses...</p>";

  try {
    const response = await fetch(`https://m.ibus.cl/index.jsp?codsimt=${code}`);
    const html = await response.text();

    // Simulación de scraping sencillo (real requiere proxy/cors)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const buses = [...doc.querySelectorAll("table tr")].slice(1);

    if (buses.length === 0) {
      resultDiv.innerHTML = "<p>❌ No se encontraron datos.</p>";
      return;
    }

    resultDiv.innerHTML = "";
    buses.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length > 1) {
        const servicio = cols[0].textContent.trim();
        const llegada = cols[1].textContent.trim();
        resultDiv.innerHTML += `
          <div class="bus">
            <strong>${servicio}</strong> llegará en <span style="color: orange;">${llegada}</span>
          </div>`;
      }
    });

  } catch (err) {
    resultDiv.innerHTML = "<p>❌ Error al consultar la API.</p>";
    console.error(err);
  }
}
