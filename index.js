const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/whatsapp", (req, res) => {
  const msg = (req.body.Body || "").toLowerCase().trim();

  let respuesta =
    "Hola 👋 Bienvenido al Spa.\nEscribe:\n1️⃣ para agendar una cita\n2️⃣ para ver precios.";

  if (msg === "1") {
    respuesta =
      "Perfecto, ¿qué servicio deseas reservar? 💆‍♀️\nOpciones: Masaje / Facial / Uñas";
  } else if (msg === "2") {
    respuesta =
      "Precios 💲\n• Masaje: $80.000\n• Facial: $60.000\n• Uñas: $40.000";
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${respuesta}</Message>
    </Response>
  `);
});

app.listen(PORT, () => console.log(`Bot corriendo en puerto ${PORT}`));
