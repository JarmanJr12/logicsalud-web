function getColorByRisk(score) {
  if (score <= 2) return '#4caf50';
  if (score <= 5) return '#ffc107';
  return '#f44336';
}

function mostrarAnimacionCarga() {
  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = `
    <div class="loading-animation">
      <div class="spinner"></div>
      <p>Analizando tu evaluación...</p>
    </div>
  `;
}

function evaluar() {
  const nombre = document.getElementById("nombre").value.trim();
  const documento = document.getElementById("documento").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const preg1 = parseInt(document.getElementById("preg1").value);
  const preg2 = parseInt(document.getElementById("preg2").value);

  if (!nombre || !documento || descripcion === "") {
    alert("Completa todos los campos antes de continuar.");
    return;
  }

  mostrarAnimacionCarga();

  setTimeout(() => {
    let riesgoMental = 0, riesgoFisico = 0, analisis = [];

    const desc = descripcion.toLowerCase();
    if (/triste|deprimido|desanimado/.test(desc)) {
      riesgoMental += 2;
      analisis.push("🔍 Posibles signos de depresión detectados.");
    }
    if (/ansiedad|nervioso|estres/.test(desc)) {
      riesgoMental += 2;
      analisis.push("🧘 Síntomas de ansiedad frecuentes.");
    }
    if (/dolor|me duele|molestia/.test(desc)) {
      riesgoFisico += 2;
      analisis.push("💊 Dolor físico reportado.");
    }
    if (/cansado|agotado|sin energía/.test(desc)) {
      riesgoFisico += 1;
      analisis.push("⚡ Cansancio detectado.");
    }
    if (/feliz|bien|tranquilo|animado/.test(desc)) {
      analisis.push("😄 Estado de ánimo positivo detectado. ¡Sigue así!");
    }

    // Análisis de preguntas cerradas
    if (preg1 === 1) {
      riesgoFisico += 1;
      analisis.push("🛌 Problemas de sueño detectados.");
    }
    if (preg2 === 1) {
      riesgoMental += 1;
      analisis.push("⚠️ Ansiedad leve reportada.");
    }
    if (preg2 === 2) {
      riesgoMental += 2;
      analisis.push("🚨 Ansiedad frecuente detectada.");
    }

    const evaluacion = {
      fecha: new Date().toLocaleString(),
      nombre, documento, descripcion, riesgoMental, riesgoFisico, analisis
    };

    guardarEvaluacion(documento, evaluacion);

    mostrarResultado(evaluacion);
  }, 1200);
}

function guardarEvaluacion(documento, evaluacion) {
  const data = JSON.parse(localStorage.getItem("historialPacientes") || "{}");
  if (!data[documento]) data[documento] = [];
  data[documento].push(evaluacion);
  localStorage.setItem("historialPacientes", JSON.stringify(data));
  localStorage.setItem("ultimaEvaluacion", JSON.stringify(evaluacion));
}

function mostrarResultado(data) {
  const resultadoDiv = document.getElementById("resultado");

  let emoticono = "😊";
  if (data.riesgoMental + data.riesgoFisico >= 6) emoticono = "😟";
  else if (data.riesgoMental + data.riesgoFisico >= 3) emoticono = "😐";

  resultadoDiv.innerHTML = `
    <div class="result-box animate__animated animate__fadeIn">
      <h3><i class="fas fa-file-medical"></i> Informe de Salud ${emoticono}</h3>
      <div class="risk-meter">
        <div class="risk-level" style="width: ${data.riesgoMental * 10}%; background: ${getColorByRisk(data.riesgoMental)}">
          Riesgo Mental: ${data.riesgoMental}/10
        </div>
      </div>
      <div class="risk-meter">
        <div class="risk-level physical" style="width: ${data.riesgoFisico * 10}%; background: ${getColorByRisk(data.riesgoFisico)}">
          Riesgo Físico: ${data.riesgoFisico}/10
        </div>
      </div>
      <ul class="analysis-list">
        ${data.analisis.map(a => `<li>${a}</li>`).join("")}
      </ul>
      <div class="actions">
        <button onclick='generarPDF(${JSON.stringify(data)})'>
          <i class="fas fa-download"></i> Descargar PDF
        </button>
        <button onclick="location.reload()">
          <i class="fas fa-redo"></i> Nueva Evaluación
        </button>
      </div>
    </div>
  `;

  mostrarConsejoDala(resultadoDiv);
}

function mostrarConsejoDala(container) {
  const consejos = [
    "Recuerda que hablar con alguien de confianza siempre ayuda 💬.",
    "Dormir bien y respirar profundo puede marcar la diferencia 🛌.",
    "Hidratarte y moverte un poco mejora tu bienestar 💧.",
    "No estás solo. Pide ayuda si la necesitas 💙.",
    "Haz algo que te guste hoy, tu mente te lo agradecerá 🌱."
  ];
  const consejo = consejos[Math.floor(Math.random() * consejos.length)];

  const bloque = document.createElement("div");
  bloque.className = "result-box animate__animated animate__fadeInUp";
  bloque.style.marginTop = "20px";
  bloque.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Dala" style="width: 40px; height: 40px; border-radius: 50%;">
      <div><strong>Dala dice:</strong><br><em>"${consejo}"</em></div>
    </div>
  `;
  container.appendChild(bloque);
}

function cargarUltimaEvaluacion() {
  const data = JSON.parse(localStorage.getItem("ultimaEvaluacion"));
  if (data) {
    document.getElementById("nombre").value = data.nombre;
    document.getElementById("documento").value = data.documento;
    document.getElementById("descripcion").value = data.descripcion;
  } else {
    alert("No hay evaluaciones previas guardadas.");
  }
}

function verHistorialPaciente() {
  const doc = document.getElementById("documento").value.trim();
  if (!doc) {
    alert("Ingresa el número de documento para ver el historial.");
    return;
  }

  const data = JSON.parse(localStorage.getItem("historialPacientes") || "{}");
  const historial = data[doc];
  if (!historial || historial.length === 0) {
    alert("No hay historial registrado para este paciente.");
    return;
  }

  let html = `<div class="result-box"><h3><i class="fas fa-folder-open"></i> Historial del Paciente</h3><ul>`;
  historial.forEach((item, index) => {
    html += `<li><strong>${item.fecha}:</strong> Mental ${item.riesgoMental}/10, Físico ${item.riesgoFisico}/10
      <br><button onclick='generarPDF(${JSON.stringify(item)})'>📄 Exportar PDF</button></li><br>`;
  });
  html += `</ul></div>`;
  document.getElementById("resultado").innerHTML = html;
}

function generarPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 123);
  doc.text("INFORME CLÍNICO DE BIENESTAR – LOGICSALUD", 105, 20, { align: "center" });

  doc.setDrawColor(46, 125, 123);
  doc.line(20, 25, 190, 25);

  // Información del paciente
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre completo: ${data.nombre}`, 20, 35);
  doc.text(`Número de documento: ${data.documento}`, 20, 42);
  doc.text(`Fecha de evaluación: ${data.fecha}`, 20, 49);

  // Resultados visuales
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 90, 89);
  doc.text("Resultados de riesgo:", 20, 65);

  doc.setFont("helvetica", "normal");
  doc.setFillColor(getColorByRisk(data.riesgoMental));
  doc.rect(20, 70, data.riesgoMental * 10, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(`Riesgo Mental: ${data.riesgoMental}/10`, 22, 76);

  doc.setFillColor(getColorByRisk(data.riesgoFisico));
  doc.rect(20, 85, data.riesgoFisico * 10, 8, "F");
  doc.text(`Riesgo Físico: ${data.riesgoFisico}/10`, 22, 91);

  // Análisis
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Análisis clínico:", 20, 110);
  doc.setFont("helvetica", "normal");
  const analisisTexto = data.analisis.map((a, i) => `${i + 1}. ${a.replace(/[^\x00-\x7F]/g, "")}`);
  const wrapped = doc.splitTextToSize(analisisTexto.join("\n"), 170);
  doc.text(wrapped, 20, 118);

  // Firma profesional
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text("Atentamente,", 20, 260);
  doc.text("Doctora Dala – Asistente Virtual de Bienestar", 20, 267);

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("LOGICSALUD – Plataforma de evaluación emocional y física | www.logicsalud.org", 105, 285, { align: "center" });

  doc.save(`Informe_${data.nombre.replace(/\s/g, "_")}_${data.documento}.pdf`);
}
function mostrarTablaHistorial() {
  const documento = document.getElementById("documento").value.trim();
  if (!documento) {
    alert("Debes ingresar el número de documento para ver el historial.");
    return;
  }

  const data = JSON.parse(localStorage.getItem("historialPacientes") || "{}")[documento];
  if (!data || data.length === 0) {
    document.getElementById("tablaHistorial").innerHTML = "<p>No hay registros disponibles para este paciente.</p>";
    return;
  }

  let tabla = `<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background-color:#2e7d7b; color:white;">
        <th style="padding:8px; border:1px solid #ccc;">Fecha</th>
        <th style="padding:8px; border:1px solid #ccc;">R. Mental</th>
        <th style="padding:8px; border:1px solid #ccc;">R. Físico</th>
        <th style="padding:8px; border:1px solid #ccc;">Informe</th>
      </tr>
    </thead><tbody>`;

  data.forEach(ev => {
    tabla += `<tr style="background-color:#f9f9f9;">
      <td style="padding:6px; border:1px solid #ccc;">${ev.fecha}</td>
      <td style="padding:6px; border:1px solid #ccc;">${ev.riesgoMental}/10</td>
      <td style="padding:6px; border:1px solid #ccc;">${ev.riesgoFisico}/10</td>
      <td style="padding:6px; border:1px solid #ccc;"><button onclick='generarPDF(${JSON.stringify(ev)})'>📄 PDF</button></td>
    </tr>`;
  });

  tabla += `</tbody></table>`;
  document.getElementById("tablaHistorial").innerHTML = tabla;
}
// ======= VOZ DE DALA (mejorada para voz femenina) =======
let vozActiva = true;
let vozDala = null;

function cargarVozFemenina() {
  const voces = window.speechSynthesis.getVoices();

  // Lista de nombres específicos de voz femenina recomendados
  const nombresDeseados = [
    "Google español de Estados Unidos",
    "Google español",
    "Google Español", 
    "Microsoft Sabina - Spanish (Mexico)",
    "Microsoft Helena - Spanish (Spain)"
  ];

  // Buscar alguna de las voces deseadas
  for (let nombre of nombresDeseados) {
    vozDala = voces.find(v => v.name.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (vozDala) break;
  }

  // Si no encuentra ninguna, usar la primera voz en español disponible
  if (!vozDala) {
    vozDala = voces.find(v => v.lang.startsWith("es"));
  }
}

speechSynthesis.onvoiceschanged = cargarVozFemenina;

function hablarDala(texto) {
  if (!vozActiva || !texto) return;
  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = 'es-ES';
  if (vozDala) mensaje.voice = vozDala;
  speechSynthesis.speak(mensaje);
}

function toggleVozDala() {
  vozActiva = !vozActiva;
  const icon = document.getElementById("iconoVoz");
  if (icon) {
    icon.className = vozActiva ? "fas fa-volume-up" : "fas fa-volume-mute";
  }
}
