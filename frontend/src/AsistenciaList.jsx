import { useState } from 'react';
import './AsistenciaList.css'; 

function AsistenciaList({ registros, onDelete, onJustificar }) {
  const [justificacionSeleccionada, setJustificacionSeleccionada] = useState('');

  // La lista de justificaciones que me proporcionaste
  const justificaciones = [
    { codigo: '1117', descripcion: 'Licencia 1117/89' },
    { codigo: 'A10', descripcion: 'Articulo 10 L10' },
    { codigo: 'A11', descripcion: 'Articulo 11 L11' },
    { codigo: 'A18', descripcion: 'Maternidad L18' },
    { codigo: 'A22', descripcion: 'Licencia Politica' },
    { codigo: 'A24', descripcion: 'Fallecimiento Familiar/nacimiento hijo/Lic. Matrimonio' },
    { codigo: 'A27', descripcion: 'Articulo 27 L27' },
    { codigo: 'A30', descripcion: 'articulo 30 L30' },
    { codigo: 'A8', descripcion: 'articulo 8 L8' },
    { codigo: 'AP', descripcion: 'Aislamiento Preventivo' },
    { codigo: 'C/A', descripcion: 'Ausente con aviso' },
    { codigo: 'C/S', descripcion: 'comision de servicio' },
    { codigo: 'E/C', descripcion: 'Enfermedad Cronica' },
    { codigo: 'Fer', descripcion: 'Feriado' },
    { codigo: 'L/D', descripcion: 'Licencia Deportiva' },
    { codigo: 'L1777', descripcion: 'Licencia especial' },
    { codigo: 'LAO', descripcion: 'Licencia Anual Ordinaria' },
    { codigo: 'LG', descripcion: 'Licencia Gremial' },
    { codigo: 'LicEs', descripcion: 'Licencia por estudio' },
    { codigo: 'LMJ', descripcion: 'Licencia cargo mayor jerarquia' },
    { codigo: 'N/A', descripcion: 'no aplica' },
    { codigo: 'NaH', descripcion: 'Nacimiento Hijo' },
    { codigo: 'Pnac', descripcion: 'paro nacional' },
    { codigo: 'Ppro', descripcion: 'Paro Provincial' },
    { codigo: 'Pres', descripcion: 'presente' },
    { codigo: 'R/I', descripcion: 'Receso Invernal' },
    { codigo: 'Ret', descripcion: 'Retencion de actividades' },
    { codigo: 'S/A', descripcion: 'Ausente sin aviso' },
  ];

  const handleJustificarClick = (registroId) => {
    if (justificacionSeleccionada) {
      onJustificar(registroId, justificacionSeleccionada);
    } else {
      alert('Por favor, selecciona un motivo de justificación.');
    }
  };

  return (
    <div className="asistencia-list-container">
      {registros.length > 0 ? (
        <ul className="asistencia-list">
          {registros.map(registro => (
            <li key={registro.IDRegistro} className="asistencia-item">
              <p><strong>Docente:</strong> {registro.DocenteNombre} {registro.DocenteApellido}</p>
              <p><strong>Espacio:</strong> {registro.EspacioNombre}</p>
              <p><strong>Fecha:</strong> {registro.FechaRegistro}</p>
              <p><strong>Estado:</strong> {registro.AsistenciDiaria}</p>
              
              {/* Opciones de justificación solo para ausencias */}
              {registro.AsistenciDiaria === 'Ausente' && !registro.Justificacion && (
                <div className="justificacion-actions">
                  <select
                    value={justificacionSeleccionada}
                    onChange={(e) => setJustificacionSeleccionada(e.target.value)}
                    className="justificacion-select"
                  >
                    <option value="">Selecciona Justificación</option>
                    {justificaciones.map(j => (
                      <option key={j.codigo} value={j.codigo}>
                        {j.codigo} - {j.descripcion}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleJustificarClick(registro.IDRegistro)} className="justificar-button">
                    Justificar
                  </button>
                </div>
              )}

              {/* Muestra la justificación si ya existe */}
              {registro.Justificacion && (
                <p className="justificacion-info"><strong>Justificado con:</strong> {registro.Justificacion}</p>
              )}

              <div className="asistencia-actions">
                <button onClick={() => onDelete(registro.IDRegistro)} className="delete-button">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay registros de asistencia para mostrar.</p>
      )}
    </div>
  );
}

export default AsistenciaList;