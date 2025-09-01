import React, { useState, useEffect } from 'react';
import './ReporteAsistencia.css'; // Opcional: crea un archivo CSS para darle estilo

const ReporteAsistencia = ({ docentes }) => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDni, setSelectedDni] = useState('');
  const [selectedMes, setSelectedMes] = useState('');

  const meses = [
    { value: 'Mes 1', label: 'Enero' },
    { value: 'Mes 2', label: 'Febrero' },
    { value: 'Mes 3', label: 'Marzo' },
    { value: 'Mes 4', label: 'Abril' },
    { value: 'Mes 5', label: 'Mayo' },
    { value: 'Mes 6', label: 'Junio' },
    { value: 'Mes 7', label: 'Julio' },
    { value: 'Mes 8', label: 'Agosto' },
    { value: 'Mes 9', label: 'Septiembre' },
    { value: 'Mes 10', label: 'Octubre' },
    { value: 'Mes 11', label: 'Noviembre' },
    { value: 'Mes 12', label: 'Diciembre' }
  ];

  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    if (!selectedDni || !selectedMes) {
      alert('Por favor, seleccione un docente y un mes.');
      return;
    }
    setLoading(true);
    setReporte(null);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/reporte/asistencia?dni=${selectedDni}&mes=${selectedMes}`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de asistencia.');
      }
      const data = await response.json();
      setReporte(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching reporte:', err);
    }
  };

  return (
    <div className="reporte-container">
      <h2>Generar Reporte de Asistencia</h2>
      <form onSubmit={handleGenerarReporte} className="reporte-form">
        <div className="form-group">
          <label className="form-label">Seleccionar Docente:</label>
          <select value={selectedDni} onChange={(e) => setSelectedDni(e.target.value)} required className="form-input">
            <option value="">-- Seleccione --</option>
            {docentes && docentes.map((docente) => (
              <option key={docente.DNI} value={docente.DNI}>
                {docente.Nombre} {docente.Apellido}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Seleccionar Mes:</label>
          <select value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)} required className="form-input">
            <option value="">-- Seleccione --</option>
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="form-button">
          Generar Reporte
        </button>
      </form>

      {loading && <div className="loading-message">Generando reporte...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      {reporte && (
        <div className="reporte-info">
          <h3>Reporte para {reporte.nombreDocente} en {reporte.mes}</h3>
          <p><strong>Total de Días Hábiles:</strong> {reporte.totalDiasHabiles}</p>
          <p><strong>Días Presentes:</strong> {reporte.diasPresentes}</p>
          <p><strong>Ausencias sin justificar:</strong> {reporte.ausenciasSinJustificar}</p>
          <p><strong>Ausencias justificadas:</strong> {reporte.ausenciasJustificadas}</p>

          <div className="reporte-detalle-container">
            <h4>Detalle de Asistencia:</h4>
            <ul className="asistencia-detalle">
              {reporte.detalle.map((item, index) => (
                <li key={index} className="detalle-item">
                  <p><strong>Fecha:</strong> {item.FechaRegistro}</p>
                  <p><strong>Estado:</strong> {item.AsistenciDiaria}</p>
                  {item.Justificacion && (
                    <p className="justificacion-texto">
                      **Justificación:** {item.Justificacion}
                    </p>
                  )}
                  <p><strong>Espacio:</strong> {item.EspacioNombre}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteAsistencia;