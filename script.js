// script.js - Lógica de evaluación LOGICSALUD mejorada

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
      <p>Analizando tu descripción...</p>
    </div>
  `;
}

function evaluar() {
  const nombre = document.getElementById("nombre").value.trim();
  const codigo = document.getElementById("codigo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!nombre || !codigo || !descripcion) {
    alert("¡Completa todos los campos para continuar!");
    return;
  }

  mostrarAnimacionCarga();

  // Simulamos un retraso para el análisis
  setTimeout(() => {
    let riesgoMental = 0, riesgoFisico = 0, analisis = [];
    const desc = descripcion.toLowerCase();

    if (/triste|deprimido|desanimado/.test(desc)) {
      riesgoMental += 2;
      analisis.push("🔍 Posibles signos de depresión. Recomiendo consultar un especialista.");
    }
    if (/ansiedad|nervioso|estres/.test(desc)) {
      riesgoMental += 1;
      analisis.push("🧘 Síntomas de ansiedad detectados. Prueba técnicas de relajación.");
    }
    if (/dolor|me duele|molestia/.test(desc)) {
      riesgoFisico += 1;
      analisis.push("💊 Dolor físico reportado. Considera visitar a un médico si persiste.");
    }
    if (/cansado|agotado|sin energía/.test(desc)) {
      riesgoFisico += 1;
      analisis.push("⚡ Cansancio detectado. Considera descanso o ejercicio moderado.");
    }
    if (/feliz|bien|tranquilo|animado/.test(desc)) {
      analisis.push("😄 Estado de ánimo positivo detectado. ¡Sigue así!");
    }

    localStorage.setItem('lastEvaluation', JSON.stringify({ nombre, codigo, descripcion, riesgoMental, riesgoFisico, analisis }));

    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = `
      <div class="result-box animate__animated animate__fadeIn">
        <h3><i class="fas fa-file-medical"></i> Informe de Salud</h3>
        <div class="risk-meter">
          <div class="risk-level" style="width: ${riesgoMental * 10}%; background: ${getColorByRisk(riesgoMental)}">
            Riesgo Mental: ${riesgoMental}/10
          </div>
        </div>
        <div class="risk-meter">
          <div class="risk-level physical" style="width: ${riesgoFisico * 10}%; background: ${getColorByRisk(riesgoFisico)}">
            Riesgo Físico: ${riesgoFisico}/10
          </div>
        </div>
        <ul class="analysis-list">${analisis.map(a => `<li>${a}</li>`).join("")}</ul>
        <div class="actions">
          <button onclick="generarPDF('${nombre}', '${codigo}', \`${descripcion}\`, ${riesgoMental}, ${riesgoFisico}, ${JSON.stringify(analisis)})">
            <i class="fas fa-download"></i> Descargar PDF
          </button>
          <button onclick="location.reload()">
            <i class="fas fa-redo"></i> Nueva Evaluación
          </button>
        </div>
      </div>`;
  }, 1500);
}

function cargarUltimaEvaluacion() {
  const data = JSON.parse(localStorage.getItem("lastEvaluation"));
  if (data) {
    document.getElementById("nombre").value = data.nombre;
    document.getElementById("codigo").value = data.codigo;
    document.getElementById("descripcion").value = data.descripcion;
  } else {
    alert("No se encontró una evaluación anterior guardada.");
  }
}

function generarPDF(nombre, codigo, descripcion, riesgoMental, riesgoFisico, analisis) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Encabezado con logo y título
  doc.addImage("https://cdn-icons-png.flaticon.com/512/3774/3774299.png", "PNG", 10, 10, 15, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(46, 125, 123);
  doc.text("INFORME DE BIENESTAR LOGICSALUD", 105, 20, { align: "center" });
  
  // Línea decorativa
  doc.setDrawColor(46, 125, 123);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // Datos del paciente
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nombre: ${nombre}`, 20, 40);
  doc.text(`Código: ${codigo}`, 20, 50);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 60);
  
  // Gráficos de riesgo
  doc.setFontSize(14);
  doc.text("Niveles de Riesgo:", 20, 80);
  
  // Barra de riesgo mental
  doc.setFillColor(46, 125, 123);
  doc.rect(20, 85, riesgoMental * 16, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`Riesgo Mental: ${riesgoMental}/10`, 22, 92);
  
  // Barra de riesgo físico
  doc.setFillColor(78, 205, 196);
  doc.rect(20, 100, riesgoFisico * 16, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`Riesgo Físico: ${riesgoFisico}/10`, 22, 107);
  
  // Descripción
  doc.setTextColor(0, 0, 0);
  doc.text("Descripción del paciente:", 20, 125);
  doc.setFont("helvetica", "normal");
  const splitDesc = doc.splitTextToSize(descripcion, 170);
  doc.text(splitDesc, 20, 135);
  
  // Recomendaciones
  doc.setFont("helvetica", "bold");
  doc.text("Recomendaciones:", 20, 160);
  doc.setFont("helvetica", "normal");
  
  let y = 170;
  analisis.forEach(a => {
    const splitText = doc.splitTextToSize(`• ${a}`, 170);
    doc.text(splitText, 20, y);
    y += splitText.length * 7;
  });
  
  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("LOGICSALUD - Herramienta de bienestar emocional y físico | www.logicsalud.org", 105, 285, { align: "center" });
  
  // Guardar PDF
  doc.save(`Informe_${nombre.replace(/\s/g, '_')}_${codigo}.pdf`);
}