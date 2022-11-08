const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });

app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

app.set("view engine", "ejs");

const bcryptjs = require("bcryptjs");

const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

const connection = require("./db/database");

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const nombre = req.body.nombre;
  const apellido = req.body.apellido;
  const edad = req.body.edad;
  const salario = req.body.salario;
  const usuario = req.body.usuario;
  const contraseña = req.body.contraseña;
  const rol = req.body.rol;
  let passwordHaash = await bcryptjs.hash(contraseña, 8);
  if (
    nombre != "" &&
    apellido != "" &&
    edad != "" &&
    salario != "" &&
    contraseña != "" &&
    rol != ""
  ) {
    connection.query(
      "INSERT INTO usuarios SET ?",
      {
        nombre: nombre,
        apellido: apellido,
        edad: edad,
        salario: salario,
        usuario: usuario,
        contraseña: passwordHaash,
        rol: rol,
      },
      async (error, result) => {
        if (error) {
          console.log(error);
        } else {
          res.render("register", {
            alert: true,
            alertTitle: "Registration",
            alertMessage: "Registro correcto",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    );
  } else {
    res.render("register", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Todos los campos son necesarios",
      alertIcon: "warning",
      showConfirmButton: false,
      timer: 1500,
    });
  }
});

app.post("/auth", async (req, res) => {
  const rol = req.body.rol;
  const contraseña = req.body.contraseña;
  //   let passwordHaash = await bcryptjs.hash(contraseña, 8);
  if (rol && contraseña) {
    connection.query(
      "SELECT * FROM usuarios WHERE rol = ?",
      [rol],
      async (error, results) => {
        if (
          results.length == 0 ||
          !(await bcryptjs.compare(contraseña, results[0].contraseña))
        ) {
          res.render("login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Usuario y/o password incorrecto",
            alertIcon: "error",
            showConfirmButton: true,
            timer: 1500,
          });
        } else {
          req.session.loggedin = true;
          req.session.rol = results[0].rol;
          res.render("login", {
            alert: true,
            alertTitle: "Conexión Exitosa",
            alertMessage: "¡LOGIN CORRECTO!",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          console.log("SALTA AL SEGUNDO IF");
        }
      }
    );
  } else {
    res.render("login", {
      alert: true,
      alertTitle: "Advertencia",
      alertMessage: "¡Por favor ingrese un usuario y/o password!",
      alertIcon: "warning",
      showConfirmButton: true,
      timer: 1500,
    });
  }
});
app.listen(3000, (req, res) => {
  console.log("Mierda está corriendo aquí http://localhost:3000");
});
