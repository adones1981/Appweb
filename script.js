// Coordenadas ejemplo de paraderos (lat, lng, códigoParadero)
const paraderos = [
  { id: "1001", name: "Paradero Plaza de Armas", lat: -33.4378, lng: -70.6505 },
  { id: "1002", name: "Paradero Alameda", lat: -33.442, lng: -70.656 },
  { id: "1003", name: "Paradero Estación Central", lat: -33.446, lng: -70.679 },
];

// Crear mapa centrado en Santiago
const map = L.map("map").setView([-33.44, -70.65], 13);

// Capa base con OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Icono personalizado para paradero
const iconParadero = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/61/61088.png", // icono de parada de bus
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -37],
});

// Añadir marcadores de paraderos
paraderos.forEach((p) => {
  const marker = L.marker([p.lat, p.lng], { icon: iconParadero }).addTo(map);
  marker.bindPopup(`<b>${p.name}</b><br>Código: ${p.id}<br>Cargando buses...`);

  marker.on("click", () => {
    fetchBuses(p.id, marker);
  });
});

function fetchBuses(paraderoId, marker) {
  const busInfoDiv = document.getElementById("busInfo");
  busInfoDiv.innerHTML = `<p>🔄 Consultando buses para paradero ${paraderoId}...</p>`;

  // Aquí usaríamos la API real, pero para demo simulo datos
  // Si tienes API, cambia la URL abajo
  fetch(`https://m.ibus.cl/index.jsp?codsimt=${paraderoId}`)
    .then((res) => res.text())
    .then((html) => {
      // Procesar el html para extraer buses (simulación)
      // Para evitar CORS en producción, usa proxy o backend

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const rows = [...doc.querySelectorAll("table tr")].slice(1);

      if (rows.length === 0) {
        busInfoDiv.innerHTML = `<p>❌ No se encontraron buses para paradero ${paraderoId}</p>`;
        marker.setPopupContent(`<b>${marker.getPopup().getContent()}</b><br>No hay buses.`);
        marker.openPopup();
        return;
      }

      let content = `<h3>Buses para paradero ${paraderoId}:</h3>`;
      rows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        if (cols.length > 1) {
          const servicio = cols[0].textContent.trim();
          const llegada = cols[1].textContent.trim();
          content += `<div><strong>${servicio}</strong> llegará en <span style="color: orange;">${llegada}</span></div>`;
        }
      });

      busInfoDiv.innerHTML = content;
      marker.setPopupContent(`<b>${marker.getPopup().getContent()}</b><br>Click para ver buses en el panel.`);
      marker.openPopup();
    })
    .catch((e) => {
      busInfoDiv.innerHTML = `<p>❌ Error al consultar la API para paradero ${paraderoId}</p>`;
      console.error(e);
      marker.setPopupContent(`<b>${marker.getPopup().getContent()}</b><br>Error en API.`);
      marker.openPopup();
    });
}

// Opcional: centrar mapa en ubicación actual del usuario
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 14);
    },
    (err) => {
      console.warn("No se pudo obtener ubicación: ", err.message);
    }
  );
}
