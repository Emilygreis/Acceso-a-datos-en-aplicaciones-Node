const express = require("express");
const path = require("path");
const consultas = require("./consultas");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/usuario", async (req, res) => {
  try {
    const { nombre, balance } = req.body;
    const usuario = await consultas.insertarUsuario(nombre, balance);
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await consultas.consultarUsuarios();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/usuario", async (req, res) => {
  try {
    const { id } = req.query;
    const { name, balance } = req.body;
    const usuario = await consultas.editarUsuario(id, name, balance);
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/usuario", async (req, res) => {
  try {
    const { id } = req.query;
    const usuario = await consultas.borrarUsuario(id);
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/transferencia", async (req, res) => {
  try {
    const { emisor, receptor, monto, fecha } = req.body;
    const transferencia = await consultas.insertarTransferencia(
      emisor,
      receptor,
      monto,
      fecha
    );
    res.json(transferencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/transferencias", async (req, res) => {
  try {
    const transferencias = await consultas.consultarTransferencias();
    res.json(transferencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const puerto = 3000;
app.listen(puerto, () => {
  console.log(`El servidor está corriendo en el puerto ${puerto}`);
});
