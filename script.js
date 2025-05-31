
let map;
let alertaActiva = false;

function iniciarMapa(lat, lon) {
    map = L.map('map').setView([lat, lon], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup("Estás aquí").openPopup();
}

function mostrarParaderos(lat, lon) {
    fetch(`/api/paraderos?lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(paraderos => {
            paraderos.forEach(p => {
                const marker = L.marker([p.lat, p.lon]).addTo(map);
                marker.bindPopup(`
                    <strong>${p.name}</strong><br>
                    <button onclick="verArribos('${p.id}')">Ver buses</button>
                    <button onclick='guardarFavorito(${JSON.stringify(p)})'>⭐ Guardar</button>
                `);
            });
        });
}

function verArribos(paraderoId) {
    fetch(`/api/arribos/${paraderoId}`)
        .then(res => res.json())
        .then(data => {
            let html = `<h4>🚌 Buses próximos al paradero ${paraderoId}</h4><ul>`;
            data.forEach(bus => {
                html += `<li>🚌 Línea <b>${bus.service_id}</b> - llega en ${Math.floor(bus.arrival_time / 60)} min 
                <button onclick="activarAlerta('${paraderoId}', '${bus.service_id}')">🔔 Alertar</button></li>`;
            });
            html += "</ul>";
            document.getElementById("info").innerHTML = html;
        });
}

function guardarFavorito(paradero) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    if (!favoritos.find(p => p.id === paradero.id)) {
        favoritos.push(paradero);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        alert(`✅ Paradero ${paradero.name} guardado como favorito`);
    }
}

function mostrarFavoritos() {
    const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
    let html = "<h3>⭐ Paraderos Favoritos</h3><ul>";
    if (favs.length === 0) {
        html += "<li>No tienes favoritos aún</li>";
    } else {
        favs.forEach(p => {
            html += `<li><b>${p.name}</b> - <button onclick="verArribos('${p.id}')">Ver buses</button></li>`;
        });
    }
    html += "</ul>";
    document.getElementById("info").innerHTML = html;
}

function activarAlerta(paraderoId, servicioId, minutosAlerta = 2) {
    if (alertaActiva) {
        alert("Ya hay una alerta activa.");
        return;
    }

    alertaActiva = true;
    const intervalo = setInterval(() => {
        fetch(`/api/arribos/${paraderoId}`)
            .then(res => res.json())
            .then(data => {
                const servicio = data.find(b => b.service_id === servicioId);
                if (servicio && servicio.arrival_time <= minutosAlerta * 60) {
                    alert(`🚌 Alerta: La micro ${servicioId} llega en ${Math.floor(servicio.arrival_time / 60)} minutos`);
                    clearInterval(intervalo);
                    alertaActiva = false;
                }
            });
    }, 30000); // cada 30 segundos
}

navigator.geolocation.getCurrentPosition(
    pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        iniciarMapa(lat, lon);
        mostrarParaderos(lat, lon);
    },
    err => alert("Error obteniendo ubicación: " + err.message)
);
