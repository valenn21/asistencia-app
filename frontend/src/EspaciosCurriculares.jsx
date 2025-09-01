import { useState, useEffect, useCallback } from 'react';

function EspaciosCurriculares() {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEspacio, setEditingEspacio] = useState(null);
  const [formData, setFormData] = useState({
    NombreCurso: '',
    HorasObligacion: ''
  });

  const fetchEspacios = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/espacios');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEspacios(data.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    fetchEspacios();
  }, [fetchEspacios]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este espacio curricular?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/espacios/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el espacio curricular');
        }
        fetchEspacios();
        alert('Espacio curricular eliminado con éxito.');
      } catch (error) {
        console.error('Error al eliminar el espacio curricular:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingEspacio ? 'PUT' : 'POST';
      const url = editingEspacio ? `http://localhost:3000/api/espacios/${editingEspacio.IDEspacio}` : 'http://localhost:3000/api/espacios';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${editingEspacio ? 'actualizar' : 'agregar'} el espacio curricular`);
      }

      const result = await response.json();
      alert(result.message);
      fetchEspacios();
      setEditingEspacio(null);
      setFormData({ NombreCurso: '', HorasObligacion: '' });

    } catch (error) {
      console.error(`Error al ${editingEspacio ? 'actualizar' : 'agregar'} el espacio curricular:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (espacio) => {
    setEditingEspacio(espacio);
    setFormData({
      NombreCurso: espacio.NombreCurso,
      HorasObligacion: espacio.HorasObligacion
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading-message">Cargando espacios curriculares...</div>;
  }

  if (error) {
    return <div className="error-message">Error al cargar los datos: {error}</div>;
  }

  return (
    <div className="main-content">
      <section className="form-section">
        <form onSubmit={handleFormSubmit} className="docente-form">
          <h2 className="form-title">{editingEspacio ? 'Editar Espacio Curricular' : 'Agregar Nuevo Espacio'}</h2>
          
          {editingEspacio && (
            <div className="form-group">
              <label className="form-label">ID (no editable):</label>
              <input type="text" name="IDEspacio" value={editingEspacio.IDEspacio} disabled className="form-input" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nombre del Curso:</label>
            <input type="text" name="NombreCurso" value={formData.NombreCurso} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Horas de Obligación:</label>
            <input type="number" name="HorasObligacion" value={formData.HorasObligacion} onChange={handleChange} className="form-input" />
          </div>
          <button type="submit" className="form-button">{editingEspacio ? 'Guardar Cambios' : 'Agregar Espacio'}</button>
          {editingEspacio && (
            <button type="button" onClick={() => { setEditingEspacio(null); setFormData({ NombreCurso: '', HorasObligacion: '' }); }} className="cancel-button">Cancelar Edición</button>
          )}
        </form>
      </section>
      
      <section className="list-section">
        <h2>Lista de Espacios Curriculares</h2>
        {espacios.length > 0 ? (
          <ul className="docente-list">
            {espacios.map(espacio => (
              <li key={espacio.IDEspacio} className="docente-item">
                <p><strong>{espacio.NombreCurso}</strong> ({espacio.IDEspacio})</p>
                <p>Horas: {espacio.HorasObligacion}</p>
                <div className="docente-actions">
                  <button onClick={() => handleEditClick(espacio)} className="edit-button">Editar</button>
                  <button onClick={() => handleDelete(espacio.IDEspacio)} className="delete-button">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay espacios curriculares registrados.</p>
        )}
      </section>
    </div>
  );
}

export default EspaciosCurriculares;