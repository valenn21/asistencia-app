import { useState, useEffect, useCallback } from 'react';

function Llaveros() {
  const [llaveros, setLlaveros] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    ID_Llavero: '',
    DNI_Docente: ''
  });

  const fetchLlaveros = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/llaveros');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLlaveros(data.data);
    } catch (error) {
      console.error('Error fetching llaveros:', error);
      setError('Error al cargar la lista de llaveros.');
    }
  }, []);

  const fetchDocentes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/docentes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocentes(data.data);
    } catch (error) {
      console.error('Error fetching docentes:', error);
      setError('Error al cargar la lista de docentes.');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLlaveros(), fetchDocentes()]);
      setLoading(false);
    };
    loadData();
  }, [fetchLlaveros, fetchDocentes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/llaveros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asociar el llavero.');
      }

      const result = await response.json();
      alert(result.message);
      fetchLlaveros();
      setFormData({ ID_Llavero: '', DNI_Docente: '' });
    } catch (error) {
      console.error('Error al asociar llavero:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desvincular este llavero?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/llaveros/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al desvincular el llavero');
        }
        fetchLlaveros();
        alert('Llavero desvinculado con éxito.');
      } catch (error) {
        console.error('Error al desvincular llavero:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="main-content">
      <section className="form-section">
        <form onSubmit={handleSubmit} className="docente-form">
          <h2 className="form-title">Asociar Llavero a Docente</h2>
          <div className="form-group">
            <label className="form-label">ID del Llavero:</label>
            <input type="text" name="ID_Llavero" value={formData.ID_Llavero} onChange={handleChange} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Docente:</label>
            <select name="DNI_Docente" value={formData.DNI_Docente} onChange={handleChange} required className="form-input">
              <option value="">Seleccione un docente...</option>
              {docentes.map(docente => (
                <option key={docente.DNI} value={docente.DNI}>
                  {docente.Nombre} {docente.Apellido} ({docente.DNI})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="form-button">Asociar Llavero</button>
        </form>
      </section>

      <section className="list-section">
        <h2>Llaveros Asociados</h2>
        <ul className="docente-list">
          {llaveros.map(llavero => (
            <li key={llavero.ID_Llavero} className="docente-item">
              <p><strong>ID Llavero:</strong> {llavero.ID_Llavero}</p>
              <p><strong>Docente:</strong> {llavero.DocenteNombre} {llavero.DocenteApellido}</p>
              <div className="docente-actions">
                <button onClick={() => handleDelete(llavero.ID_Llavero)} className="delete-button">Desvincular</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Llaveros;