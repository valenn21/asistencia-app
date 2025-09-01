import { useState } from 'react';

// Ahora el componente recibe 'onDocenteAdded' como una propiedad (prop)
function AddDocenteForm({ onDocenteAdded }) {
  const [formData, setFormData] = useState({
    DNI: '',
    Nombre: '',
    Apellido: '',
    Turno: '',
    Email: '',
    Telefono: ''
  });

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
      const response = await fetch('http://localhost:3000/api/docentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar el docente');
      }

      const result = await response.json();
      alert(result.message);

      // Llama a la función que le pasamos desde App.jsx para recargar la lista
      onDocenteAdded();

      // Limpia el formulario
      setFormData({
        DNI: '',
        Nombre: '',
        Apellido: '',
        Turno: '',
        Email: '',
        Telefono: ''
      });

    } catch (error) {
      console.error('Error al agregar el docente:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="docente-form">
      <h2 className="form-title">Agregar Nuevo Docente</h2>
      <div className="form-group">
        <label className="form-label">DNI:</label>
        <input type="text" name="DNI" value={formData.DNI} onChange={handleChange} required className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Nombre:</label>
        <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} required className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Apellido:</label>
        <input type="text" name="Apellido" value={formData.Apellido} onChange={handleChange} required className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Turno:</label>
        <input type="text" name="Turno" value={formData.Turno} onChange={handleChange} className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Email:</label>
        <input type="email" name="Email" value={formData.Email} onChange={handleChange} className="form-input" />
      </div>
      <div className="form-group">
        <label className="form-label">Teléfono:</label>
        <input type="tel" name="Telefono" value={formData.Telefono} onChange={handleChange} className="form-input" />
      </div>
      <button type="submit" className="form-button">Agregar Docente</button>
    </form>
  );
}

export default AddDocenteForm;