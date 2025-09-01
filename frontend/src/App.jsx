import { useState, useEffect, useCallback } from 'react';
import './App.css';
import AddDocenteForm from './AddDocenteForm';
import EditDocenteForm from './EditDocenteForm';
import EspaciosCurriculares from './EspaciosCurriculares';
import AsistenciaManager from './AsistenciaManager';
import Llaveros from './Llaveros';
import ReporteAsistencia from './ReporteAsistencia';

import escudo from './assets/escudo.jpg';

function App() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDocente, setEditingDocente] = useState(null);
  const [view, setView] = useState('login');
  const [userRole, setUserRole] = useState(null);

  const fetchDocentes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/docentes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocentes(data.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    if (view === 'docentes' || view === 'reportes') {
      fetchDocentes();
    }
  }, [view, fetchDocentes]);

  const handleDelete = async (dni) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este docente?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/docentes/${dni}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el docente');
        }
        fetchDocentes();
        alert('Docente eliminado con éxito.');
      } catch (error) {
        console.error('Error al eliminar el docente:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleAdminLogin = () => {
    setUserRole('admin');
    setView('asistencia');
  };

  const handleUserLogin = () => {
    setUserRole('usuario');
    setView('asistencia');
  };

  if (view === 'login') {
    return (
      <div className="login-container">
        <img src={escudo} alt="Escudo de la Escuela" className="school-logo-login" />
        <h1>Seleccione su rol</h1>
        <div className="login-buttons">
          <button className="login-button admin-button" onClick={handleAdminLogin}>
            Administrador
          </button>
          <button className="login-button user-button" onClick={handleUserLogin}>
            Usuario
          </button>
        </div>
      </div>
    );
  }

  if (view === 'docentes' && loading) {
    return <div className="loading-message">Cargando docentes...</div>;
  }

  if (view === 'docentes' && error) {
    return <div className="error-message">Error al cargar los datos: {error}</div>;
  }

  return (
    <>
      <img src={escudo} alt="Escudo de la Escuela" className="school-logo" />
      <div className="container">
        <header className="header">
          <h1>Gestión de Asistencia</h1>
          <nav className="nav-buttons">
            <button
              className={`nav-button ${view === 'asistencia' ? 'active' : ''}`}
              onClick={() => setView('asistencia')}
            >
              Registrar Asistencia
            </button>
            {userRole === 'admin' && (
              <>
                <button
                  className={`nav-button ${view === 'docentes' ? 'active' : ''}`}
                  onClick={() => setView('docentes')}
                >
                  Gestionar Docentes
                </button>
                <button
                  className={`nav-button ${view === 'espacios' ? 'active' : ''}`}
                  onClick={() => setView('espacios')}
                >
                  Gestionar Espacios Curriculares
                </button>
                <button
                  className={`nav-button ${view === 'llaveros' ? 'active' : ''}`}
                  onClick={() => setView('llaveros')}
                >
                  Gestionar Llaveros
                </button>
                <button
                  className={`nav-button ${view === 'reportes' ? 'active' : ''}`}
                  onClick={() => setView('reportes')}
                >
                  Reportes de Asistencia
                </button>
              </>
            )}
          </nav>
        </header>

        {userRole === 'admin' && view === 'docentes' && (
          <main className="main-content">
            <section className="form-section">
              {editingDocente ? (
                <EditDocenteForm
                  docente={editingDocente}
                  onDocenteUpdated={() => {
                    fetchDocentes();
                    setEditingDocente(null);
                  }}
                />
              ) : (
                <AddDocenteForm onDocenteAdded={fetchDocentes} />
              )}
            </section>
            <section className="list-section">
              <h2>Lista de Docentes</h2>
              {docentes.length > 0 ? (
                <ul className="docente-list">
                  {docentes.map(docente => (
                    <li key={docente.DNI} className="docente-item">
                      <p><strong>{docente.Nombre} {docente.Apellido}</strong></p>
                      <p>DNI: {docente.DNI}</p>
                      <p>Turno: {docente.Turno}</p>
                      <div className="docente-actions">
                        <button onClick={() => setEditingDocente(docente)} className="edit-button">Editar</button>
                        <button onClick={() => handleDelete(docente.DNI)} className="delete-button">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay docentes registrados.</p>
              )}
            </section>
          </main>
        )}

        {userRole === 'admin' && view === 'espacios' && <EspaciosCurriculares />}
        {userRole === 'admin' && view === 'llaveros' && <Llaveros />}
        {userRole === 'admin' && view === 'reportes' && <ReporteAsistencia docentes={docentes} />}

        {view === 'asistencia' && <AsistenciaManager userRole={userRole} />}
      </div>
    </>
  );
}

export default App;