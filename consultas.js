const { Pool } = require("pg");

const pool = new Pool({
  user: "emily",
  host: "localhost",
  database: "bancosolar",
  password: "12345678",
  port: 5432,
});

const insertarUsuario = async (nombre, balance) => {
  try {
    const query = {
      text: "INSERT INTO usuarios(nombre, balance) VALUES($1, $2) RETURNING *",
      values: [nombre, balance],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al insertar el usuario");
  }
};

const consultarUsuarios = async () => {
  try {
    const { rows } = await pool.query({
      text: "SELECT * FROM usuarios ORDER BY id",
    });
    return rows;
  } catch (err) {
    console.log(err);
    throw new Error("Error al consultar los usuarios");
  }
};

const editarUsuario = async (id, nombre, balance) => {
  try {
    const query = {
      text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *",
      values: [nombre, balance, id],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al editar el usuario");
  }
};

const borrarUsuario = async (id) => {
  try {
    const query = {
      text: "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      values: [id],
    };
    const { rows } = await pool.query(query);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Error al borrar el usuario");
  }
};

const insertarTransferencia = async (emisor, receptor, monto, fecha) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat) || montoFloat < 0) {
      throw new Error("El monto debe ser un número positivo");
    }

    // Obtener el id del emisor
    const emisorQuery = {
      text: "SELECT id FROM usuarios WHERE nombre = $1",
      values: [emisor],
    };
    const emisorResult = await client.query(emisorQuery);
    if (emisorResult.rows.length === 0) {
      throw new Error("Emisor no encontrado");
    }
    const emisorId = emisorResult.rows[0].id;

    // Obtener el id del receptor
    const receptorQuery = {
      text: "SELECT id FROM usuarios WHERE nombre = $1",
      values: [receptor],
    };
    const receptorResult = await client.query(receptorQuery);
    if (receptorResult.rows.length === 0) {
      throw new Error("Receptor no encontrado");
    }
    const receptorId = receptorResult.rows[0].id;

    // Actualizar el balance del emisor
    const updateEmisorBalance = {
      text: "UPDATE usuarios SET balance = balance - $1 WHERE id = $2",
      values: [montoFloat, emisorId],
    };
    await client.query(updateEmisorBalance);

    // Actualizar el balance del receptor
    const updateReceptorBalance = {
      text: "UPDATE usuarios SET balance = balance + $1 WHERE id = $2",
      values: [montoFloat, receptorId],
    };
    await client.query(updateReceptorBalance);

    // Insertar la transferencia
    const insertTransferencia = {
      text: "INSERT INTO transferencias(emisor, receptor, monto, fecha) VALUES($1, $2, $3, $4) RETURNING *",
      values: [emisorId, receptorId, montoFloat, fecha ? fecha : new Date()],
    };
    const { rows } = await client.query(insertTransferencia);

    await client.query("COMMIT");

    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    throw new Error("Error al insertar la transferencia");
  } finally {
    client.release();
  }
};

const consultarTransferencias = async () => {
  try {
    const { rows } = await pool.query({
      text: `SELECT t.id, u1.nombre AS nombre_emisor, u2.nombre AS nombre_receptor, t.monto, t.fecha 
             FROM transferencias t 
             JOIN usuarios u1 ON t.emisor = u1.id 
             JOIN usuarios u2 ON t.receptor = u2.id 
             ORDER BY t.fecha DESC`,
      rowMode: "array",
    });
    return rows;
  } catch (err) {
    console.log(err);
    throw new Error("Error al consultar las transferencias");
  }
};

module.exports = {
  insertarUsuario,
  consultarUsuarios,
  editarUsuario,
  borrarUsuario,
  insertarTransferencia,
  consultarTransferencias,
};
