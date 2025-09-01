import { useState, useEffect } from 'react';

function EditDocenteForm({ docente, onDocenteUpdated }) {
  const [formData, setFormData] = useState(docente);

  // Sincroniza el estado local del formulario con el docente que se está editando
  useEffect(() => {
    setFormData(docente);
  }, [docente]);

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
      const response = await fetch(`http://localhost:3000/api/docentes/${formData.DNI}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el docente');
      }

      const result = await response.json();
      alert(result.message);
      onDocenteUpdated(); // Llama a la función para recargar la lista

    } catch (error) {
      console.error('Error al actualizar el docente:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="docente-form">
      <h2 className="form-title">Editar Docente: {formData.Nombre}</h2>
      <div className="form-group">
        <label className="form-label">DNI (no editable):</label>
        <input type="text" name="DNI" value={formData.DNI} disabled className="form-input" />
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
      <button type="submit" className="form-button">Guardar Cambios</button>
    </form>
  );
}

export default EditDocenteForm;