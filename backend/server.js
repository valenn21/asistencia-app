const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración para usar CORS y JSON
app.use(cors());
app.use(express.json());

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('../baseindira.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado a la base de datos baseindira.db.');
});

// Middleware simple para verificar si el usuario es administrador
function isAdmin(req, res, next) {
  const userRole = req.headers['x-user-role'];
  if (userRole === 'admin') {
    next(); // El usuario es administrador, continúa con la ruta
  } else {
    res.status(403).send('Acceso denegado. Se requiere rol de administrador.'); // Acceso denegado
  }
}

// Ruta de bienvenida para la raíz
app.get('/', (req, res) => {
  res.send('Servidor de Asistencia a Docentes funcionando correctamente.');
});

// =================================================================
// RUTAS PARA LA GESTIÓN DE DOCENTES
// =================================================================

// Ruta para obtener todos los docentes (GET)
app.get('/api/docentes', (req, res) => {
  const sql = 'SELECT * FROM Docentes';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

// Ruta para agregar un nuevo docente (POST) - Protegida por isAdmin
app.post('/api/docentes', isAdmin, (req, res) => {
  const { DNI, Nombre, Apellido, Turno, Email, Telefono } = req.body;

  const sql = `INSERT INTO Docentes (DNI, Nombre, Apellido, Turno, Email, Telefono) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [DNI, Nombre, Apellido, Turno, Email, Telefono], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(409).json({ "error": "El DNI proporcionado ya existe." });
      } else {
        res.status(400).json({ "error": err.message });
      }
      return;
    }
    res.status(201).json({
      "message": "Docente agregado con éxito",
      "data": { DNI: DNI, Nombre: Nombre, Apellido: Apellido }
    });
  });
});

// Ruta para actualizar un docente existente (PUT) - Protegida por isAdmin
app.put('/api/docentes/:dni', isAdmin, (req, res) => {
  const { dni } = req.params;
  const { Nombre, Apellido, Turno, Email, Telefono } = req.body;

  const sql = `UPDATE Docentes SET Nombre = ?, Apellido = ?, Turno = ?, Email = ?, Telefono = ? WHERE DNI = ?`;

  db.run(sql, [Nombre, Apellido, Turno, Email, Telefono, dni], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Docente no encontrado" });
      return;
    }
    res.json({
      "message": "Docente actualizado con éxito",
      "changes": this.changes
    });
  });
});

// Ruta para eliminar un docente (DELETE) - Protegida por isAdmin
app.delete('/api/docentes/:dni', isAdmin, (req, res) => {
  const { dni } = req.params;

  const sql = `DELETE FROM Docentes WHERE DNI = ?`;

  db.run(sql, dni, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Docente no encontrado" });
      return;
    }
    res.json({
      "message": "Docente eliminado con éxito",
      "changes": this.changes
    });
  });
});

// =================================================================
// RUTAS PARA LA GESTIÓN DE ESPACIOS CURRICULARES
// =================================================================

// Ruta para obtener todos los espacios curriculares (GET)
app.get('/api/espacios', (req, res) => {
  const sql = 'SELECT * FROM EspacioCurricular';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

// Ruta para agregar un nuevo espacio curricular (POST) - Protegida por isAdmin
app.post('/api/espacios', isAdmin, (req, res) => {
  const { NombreCurso, HorasObligacion } = req.body;

  const sql = `INSERT INTO EspacioCurricular (NombreCurso, HorasObligacion) VALUES (?, ?)`;

  db.run(sql, [NombreCurso, HorasObligacion], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(409).json({ "error": "El nombre del espacio curricular ya existe." });
      } else {
        res.status(400).json({ "error": err.message });
      }
      return;
    }
    res.status(201).json({
      "message": "Espacio curricular agregado con éxito",
      "data": { IDEspacio: this.lastID, NombreCurso: NombreCurso }
    });
  });
});

// Ruta para actualizar un espacio curricular existente (PUT) - Protegida por isAdmin
app.put('/api/espacios/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { NombreCurso, HorasObligacion } = req.body;

  const sql = `UPDATE EspacioCurricular SET NombreCurso = ?, HorasObligacion = ? WHERE IDEspacio = ?`;

  db.run(sql, [NombreCurso, HorasObligacion, id], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Espacio curricular no encontrado" });
      return;
    }
    res.json({
      "message": "Espacio curricular actualizado con éxito",
      "changes": this.changes
    });
  });
});

// Ruta para eliminar un espacio curricular (DELETE) - Protegida por isAdmin
app.delete('/api/espacios/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM EspacioCurricular WHERE IDEspacio = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Espacio curricular no encontrado" });
      return;
    }
    res.json({
      "message": "Espacio curricular eliminado con éxito",
      "changes": this.changes
    });
  });
});

// =================================================================
// RUTAS PARA LA GESTIÓN DE REGISTRO DE ASISTENCIA
// =================================================================

// Ruta para obtener todos los registros de asistencia (GET), con filtros
app.get('/api/asistencias', (req, res) => {
  const { dni, idespacio, fecha } = req.query;
  let sql = `
    SELECT r.IDRegistro, d.DNI, d.Nombre AS DocenteNombre, d.Apellido AS DocenteApellido, e.IDEspacio, e.NombreCurso AS EspacioNombre, r.FechaRegistro, r.AsistenciDiaria, r.Justificacion
    FROM RegistroAsistencia r
    INNER JOIN Docentes d ON r.DNI = d.DNI
    INNER JOIN EspacioCurricular e ON r.IDEspacio = e.IDEspacio
  `;
  const params = [];
  const conditions = [];

  if (dni) {
    conditions.push(`r.DNI = ?`);
    params.push(dni);
  }
  if (idespacio) {
    conditions.push(`r.IDEspacio = ?`);
    params.push(idespacio);
  }
  if (fecha) {
    conditions.push(`r.FechaRegistro = ?`);
    params.push(fecha);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY r.FechaRegistro DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      data: rows
    });
  });
});

// Ruta para agregar un nuevo registro de asistencia (POST)
app.post('/api/asistencias', (req, res) => {
  const { DNI, IDEspacio, FechaRegistro, AsistenciDiaria } = req.body;
  const mes = new Date(FechaRegistro).getMonth() + 1;
  const mesRegistro = `Mes ${mes}`;

  const sql = `INSERT INTO RegistroAsistencia (DNI, IDEspacio, FechaRegistro, AsistenciDiaria, MesRegistro) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [parseInt(DNI), parseInt(IDEspacio), FechaRegistro, AsistenciDiaria, mesRegistro], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.status(201).json({
      "message": "Asistencia registrada con éxito",
      "data": { IDRegistro: this.lastID, DNI, IDEspacio, FechaRegistro, AsistenciDiaria }
    });
  });
});

// Ruta para eliminar un registro de asistencia (DELETE) - Protegida por isAdmin
app.delete('/api/asistencias/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM RegistroAsistencia WHERE IDRegistro = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Registro de asistencia no encontrado" });
      return;
    }
    res.json({
      "message": "Registro de asistencia eliminado con éxito",
      "changes": this.changes
    });
  });
});

// Ruta para actualizar un registro de asistencia con una justificación (PUT) - Protegida por isAdmin
app.put('/api/asistencias/justificar/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { justificacion } = req.body;

  if (!justificacion) {
    res.status(400).json({ "error": "El campo 'justificacion' es requerido." });
    return;
  }

  const sql = `UPDATE RegistroAsistencia SET Justificacion = ? WHERE IDRegistro = ? AND AsistenciDiaria = 'Ausente'`;

  db.run(sql, [justificacion, id], function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Registro de asistencia no encontrado, o el docente no estaba ausente." });
      return;
    }
    res.json({
      "message": "Registro de asistencia justificado con éxito",
      "changes": this.changes
    });
  });
});

// =================================================================
// RUTAS PARA LA GESTIÓN DE LLAVEROS
// =================================================================

// Ruta para obtener todos los llaveros y sus docentes asociados
app.get('/api/llaveros', (req, res) => {
  const sql = `
    SELECT l.ID_Llavero, l.DNI_Docente, d.Nombre AS DocenteNombre, d.Apellido AS DocenteApellido
    FROM Llaveros l
    INNER JOIN Docentes d ON l.DNI_Docente = d.DNI
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Ruta para asociar un llavero a un docente - Protegida por isAdmin
app.post('/api/llaveros', isAdmin, (req, res) => {
  const { ID_Llavero, DNI_Docente } = req.body;
  const sql = `INSERT INTO Llaveros (ID_Llavero, DNI_Docente) VALUES (?, ?)`;

  db.run(sql, [ID_Llavero, DNI_Docente], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(409).json({ "error": "El llavero o el docente ya está asociado." });
      } else {
        res.status(400).json({ "error": err.message });
      }
      return;
    }
    res.status(201).json({ "message": "Llavero asociado con éxito" });
  });
});

// Ruta para desvincular un llavero - Protegida por isAdmin
app.delete('/api/llaveros/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM Llaveros WHERE ID_Llavero = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Llavero no encontrado" });
      return;
    }
    res.json({ "message": "Llavero desvinculado con éxito" });
  });
});

// Ruta para registrar asistencia con un llavero (POST)
app.post('/api/asistencia/llavero', (req, res) => {
  const { ID_Llavero, IDEspacio, FechaRegistro, AsistenciDiaria } = req.body;
  const mes = new Date(FechaRegistro).getMonth() + 1;
  const mesRegistro = `Mes ${mes}`;

  // 1. Buscar el DNI del docente usando el ID del llavero
  const sqlFindDNI = `SELECT DNI_Docente FROM Llaveros WHERE ID_Llavero = ?`;
  db.get(sqlFindDNI, [ID_Llavero], (err, row) => {
    if (err || !row) {
      res.status(404).json({ "error": "Llavero no encontrado o error en la base de datos." });
      return;
    }

    const DNI_Docente = row.DNI_Docente;

    // 2. Insertar el registro de asistencia
    const sqlInsert = `INSERT INTO RegistroAsistencia (DNI, IDEspacio, FechaRegistro, AsistenciDiaria, MesRegistro) VALUES (?, ?, ?, ?, ?)`;
    db.run(sqlInsert, [DNI_Docente, parseInt(IDEspacio), FechaRegistro, AsistenciDiaria, mesRegistro], function(err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      res.status(201).json({
        "message": "Asistencia registrada con éxito usando el llavero.",
        "data": { IDRegistro: this.lastID, DNI: DNI_Docente, IDEspacio, FechaRegistro, AsistenciDiaria }
      });
    });
  });
});
// =================================================================
// RUTAS PARA LA GESTIÓN DE REPORTES
// =================================================================

// Ruta para generar un reporte de asistencia por docente y mes
app.get('/api/reporte/asistencia', (req, res) => {
  const { dni, mes } = req.query;

  if (!dni || !mes) {
    res.status(400).json({ error: "Faltan parámetros DNI y/o mes." });
    return;
  }

  // 1. Obtener el nombre del docente
  const sqlDocente = `SELECT Nombre, Apellido FROM Docentes WHERE DNI = ?`;
  db.get(sqlDocente, [dni], (err, docenteRow) => {
    if (err || !docenteRow) {
      res.status(404).json({ error: "Docente no encontrado." });
      return;
    }

    const nombreDocente = `${docenteRow.Nombre} ${docenteRow.Apellido}`;

    // 2. Obtener todos los registros de asistencia para ese docente y mes
    const sqlRegistros = `
      SELECT r.FechaRegistro, r.AsistenciDiaria, r.Justificacion, e.NombreCurso AS EspacioNombre
      FROM RegistroAsistencia r
      INNER JOIN EspacioCurricular e ON r.IDEspacio = e.IDEspacio
      WHERE r.DNI = ? AND r.MesRegistro = ?
      ORDER BY r.FechaRegistro ASC
    `;
    db.all(sqlRegistros, [dni, mes], (err, registros) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Contar presentes, ausentes y justificados para el resumen
      const diasPresentes = registros.filter(r => r.AsistenciDiaria === 'Presente').length;
      const ausenciasSinJustificar = registros.filter(r => r.AsistenciDiaria === 'Ausente' && !r.Justificacion).length;
      const ausenciasJustificadas = registros.filter(r => r.AsistenciDiaria === 'Ausente' && r.Justificacion).length;
      const totalDias = diasPresentes + ausenciasSinJustificar + ausenciasJustificadas;

      const reporte = {
        nombreDocente,
        dni,
        mes,
        totalDiasHabiles: totalDias,
        diasPresentes,
        ausenciasSinJustificar, // Ausencias sin justificación
        ausenciasJustificadas, // Ausencias con justificación
        detalle: registros
      };

      res.json({ data: reporte });
    });
  });
});
// =================================================================
// RUTAS PARA EXPORTACIÓN DE DATOS
// =================================================================

// Ruta para exportar todos los registros de asistencia a CSV
app.get('/api/asistencias/exportar', (req, res) => {
  const sql = `
    SELECT d.DNI, d.Nombre, d.Apellido, e.NombreCurso, r.FechaRegistro, r.AsistenciDiaria, r.Justificacion
    FROM RegistroAsistencia r
    INNER JOIN Docentes d ON r.DNI = d.DNI
    INNER JOIN EspacioCurricular e ON r.IDEspacio = e.IDEspacio
    ORDER BY r.FechaRegistro DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Encabezados del archivo CSV
    let csvContent = 'DNI,Nombre,Apellido,Espacio Curricular,Fecha,Estado de Asistencia,Justificacion\n';

    // Construir el contenido del CSV
    rows.forEach(row => {
      csvContent += `${row.DNI},"${row.Nombre}","${row.Apellido}","${row.NombreCurso}","${row.FechaRegistro}","${row.AsistenciDiaria}","${row.Justificacion || ''}"\n`;
    });

    // Configurar la respuesta para descargar el archivo
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="asistencia.csv"');
    res.send(csvContent);
  });
});
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});