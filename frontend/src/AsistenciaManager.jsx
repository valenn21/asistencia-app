import { useState, useEffect, useCallback } from 'react';
import AsistenciaList from './AsistenciaList';

// Recibimos el userRole como una propiedad (prop)
function AsistenciaManager({ userRole }) {
  const [docentes, setDocentes] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de registro de asistencia
  const [formData, setFormData] = useState({
    DNI: '',
    IDEspacio: '',
    FechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual fija
    AsistenciDiaria: 'Presente'
  });

  // Nuevos estados para los filtros de búsqueda
  const [filterDNI, setFilterDNI] = useState('');
  const [filterIDEspacio, setFilterIDEspacio] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  // Datos de ejemplo para el menú desplegable de Espacios Curriculares
  const espaciosCurriculares = [
    { IDEspacio: 1, NombreCurso: 'Matemática' },
    { IDEspacio: 2, NombreCurso: 'Lengua' },
    { IDEspacio: 3, NombreCurso: 'Física' }
  ];

  // === MODIFICACIÓN: LISTA DE ARTÍCULOS PARA EL MENÚ DE ESTADO ===
  const articulosJustificacion = [
    { codigo: 'Pres', descripcion: 'Presente' },
    { codigo: 'S/A', descripcion: 'Ausente sin aviso' },
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
    { codigo: 'R/I', descripcion: 'Receso Invernal' },
    { codigo: 'Ret', descripcion: 'Retencion de actividades' },
  ];
  // === FIN DE LA MODIFICACIÓN ===

  // Función para obtener docentes y espacios al mismo tiempo
  const fetchData = useCallback(async () => {
    try {
      const [docentesResponse] = await Promise.all([
        fetch('http://localhost:3000/api/docentes')
      ]);

      const docentesData = await docentesResponse.json();

      if (!docentesResponse.ok) {
        throw new Error("Error al obtener los datos de docentes.");
      }
    
      setDocentes(docentesData.data);
      setEspacios(espaciosCurriculares); // Usamos los datos de ejemplo aquí
      setLoading(false);

      if (docentesData.data.length > 0) {
        setFormData(prev => ({ ...prev, DNI: docentesData.data[0].DNI }));
        setFilterDNI(docentesData.data[0].DNI);
      }
      if (espaciosCurriculares.length > 0) {
        setFormData(prev => ({ ...prev, IDEspacio: espaciosCurriculares[0].IDEspacio }));
        setFilterIDEspacio(espaciosCurriculares[0].IDEspacio);
      }
    
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Fetch error:', error);
    }
  }, []);
    
  // Función para obtener los registros de asistencia, ahora con filtros
  const fetchRegistros = useCallback(async () => {
    try {
      let url = 'http://localhost:3000/api/asistencias?';
      const params = new URLSearchParams();
      if (filterDNI) params.append('dni', filterDNI);
      if (filterIDEspacio) params.append('idespacio', filterIDEspacio);
      if (filterFecha) params.append('fecha', filterFecha);
      
      url += params.toString();

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRegistros(data.data);
    } catch (error) {
      console.error('Error fetching asistencias:', error);
    }
  }, [filterDNI, filterIDEspacio, filterFecha]);

  useEffect(() => {
    fetchData();
    fetchRegistros();
  }, [fetchData, fetchRegistros]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterDNI') setFilterDNI(value);
    if (name === 'filterIDEspacio') setFilterIDEspacio(value);
    if (name === 'filterFecha') setFilterFecha(value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRegistros();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar la asistencia');
      }
    
      const result = await response.json();
      alert(result.message);
      fetchRegistros(); // Recarga la lista de registros
    
    } catch (error) {
      console.error('Error al registrar la asistencia:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteRegistro = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de asistencia?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/asistencias/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el registro');
        }
        fetchRegistros();
        alert('Registro de asistencia eliminado con éxito.');
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Nueva función para justificar ausencias
  const handleJustifyRegistro = async (id, justificacion) => {
    try {
      const response = await fetch(`http://localhost:3000/api/asistencias/justificar/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ justificacion }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al justificar el registro');
      }
      fetchRegistros(); // Recarga la lista para ver el cambio
      alert('Registro de asistencia justificado con éxito.');
    } catch (error) {
      console.error('Error al justificar el registro:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading-message">Cargando datos...</div>;
  }
    
  if (error) {
    return <div className="error-message">Error al cargar los datos: {error}</div>;
  }

  return (
    <div className="main-content">
      <section className="form-section">
        <form onSubmit={handleSubmit} className="docente-form">
          <h2 className="form-title">Registrar Asistencia</h2>
          <div className="form-group">
            <label className="form-label">Docente:</label>
            <select name="DNI" value={formData.DNI} onChange={handleChange} required className="form-input">
              {docentes.map(docente => (
                <option key={docente.DNI} value={docente.DNI}>
                  {docente.Nombre} {docente.Apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Espacio Curricular:</label>
            <select name="IDEspacio" value={formData.IDEspacio} onChange={handleChange} required className="form-input">
              {espacios.map(espacio => (
                <option key={espacio.IDEspacio} value={espacio.IDEspacio}>
                  {espacio.NombreCurso}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha:</label>
            <input 
              type="date" 
              name="FechaRegistro" 
              value={formData.FechaRegistro} 
              onChange={handleChange} 
              required 
              className="form-input" 
              readOnly // ¡Este es el cambio para que sea de solo lectura!
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estado:</label>
            <select name="AsistenciDiaria" value={formData.AsistenciDiaria} onChange={handleChange} required className="form-input">
              {articulosJustificacion.map(articulo => (
                <option key={articulo.codigo} value={articulo.codigo}>
                  {articulo.descripcion}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="form-button">Registrar Asistencia</button>
        </form>
      </section>

      {userRole === 'admin' && (
        <section className="list-section">
          <h2>Registros de Asistencia</h2>
          {/* Nuevo botón para exportar */}
          <a href="http://localhost:3000/api/asistencias/exportar" download="asistencia.csv" className="export-button">
            Exportar a Excel
          </a>
          {/* Formulario de búsqueda y filtros */}
          <div className="filter-form">
            <h3 className="form-title">Filtrar Registros</h3>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label">Filtrar por Docente:</label>
                <select name="filterDNI" value={filterDNI} onChange={handleFilterChange} className="form-input">
                  <option value="">Todos los docentes</option>
                  {docentes.map(docente => (
                    <option key={docente.DNI} value={docente.DNI}>
                      {docente.Nombre} {docente.Apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Filtrar por Espacio:</label>
                <select name="filterIDEspacio" value={filterIDEspacio} onChange={handleFilterChange} className="form-input">
                  <option value="">Todos los espacios</option>
                  {espacios.map(espacio => (
                    <option key={espacio.IDEspacio} value={espacio.IDEspacio}>
                      {espacio.NombreCurso}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Filtrar por Fecha:</label>
                <input type="date" name="filterFecha" value={filterFecha} onChange={handleFilterChange} className="form-input" />
              </div>
              <button type="submit" className="form-button">Buscar</button>
            </form>
          </div>
          {/* Aquí va el componente de lista de asistencia */}
          <AsistenciaList 
            registros={registros} 
            onDelete={handleDeleteRegistro}
            onJustificar={handleJustifyRegistro}
          />
        </section>
      )}
    </div>
  );
}

export default AsistenciaManager;