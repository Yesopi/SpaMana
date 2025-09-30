const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Estados en memoria (solo pruebas, no persistente)
let userState = {};

// Mapas de planes
const planesIndividuales = {
  "1": "Día de Spa – $300.000",
  "2": "Elixir de Chocolate – $250.000",
  "3": "Soy Especial – $200.000",
  "4": "Bendición – $120.000",
};

const planesGrupales = {
  "1": "Relax – desde $260.000 (3 personas)",
  "2": "Junito – desde $290.000 (3 personas)",
  "3": "Verona – desde $350.000 (3 personas)",
  "4": "Todo o Nada – desde $440.000 (3 personas)",
};

app.post("/whatsapp", (req, res) => {
  const from = req.body.From;
  const msg = (req.body.Body || "").toLowerCase().trim();

  console.log(`📩 Mensaje recibido de ${from}: "${msg}"`);

  // Reinicio si escribe "hola"
  if (msg === "hola") {
    userState[from] = { step: "start" };
    console.log(`🔄 Usuario ${from} reinició la conversación con "hola"`);
  }

  if (!userState[from]) {
    userState[from] = { step: "start" };
    console.log(`🆕 Nuevo usuario ${from}, inicializando estado.`);
  }

  let response = "";
  let media = null;

  switch (userState[from].step) {
    case "start":
      response =
        "Hola 👋 Bienvenido a El Mana Spa.\n¿Qué deseas hacer?\n1️⃣ Plan individual\n2️⃣ Plan grupal\n3️⃣ Hablar con un asesor";
      userState[from].step = "mainMenu";
      break;

    case "mainMenu":
      if (msg === "1") {
        response =
          "Has elegido Plan Individual ✅\n\nAquí tienes nuestro catálogo en PDF. Luego elige tu plan:\n1️⃣ Día de Spa – $300.000\n2️⃣ Elixir de Chocolate – $250.000\n3️⃣ Soy Especial – $200.000\n4️⃣ Bendición – $120.000";
        media =
          "https://drive.google.com/uc?export=download&id=11J6hvr6Da8MYmb9mXT6tuktfxUndVTV6";
        userState[from].step = "chooseIndividual";
      } else if (msg === "2") {
        response =
          "Has elegido Plan Grupal ✅\n\nAquí tienes nuestro catálogo en PDF. Luego elige tu plan:\n1️⃣ Relax – desde $260.000\n2️⃣ Junito – desde $290.000\n3️⃣ Verona – desde $350.000\n4️⃣ Todo o Nada – desde $440.000";
        media =
          "https://drive.google.com/uc?export=download&id=1sdYBtLxdWijL0Re-30Gh9g_Mxy0hfNQY";
        userState[from].step = "chooseGroup";
      } else if (msg === "3") {
        response = "Un asesor te contactará pronto 💬";
        userState[from].step = "end";
      } else {
        response =
          "Por favor elige una opción válida:\n1️⃣ Plan individual\n2️⃣ Plan grupal\n3️⃣ Hablar con un asesor";
      }
      break;

    case "chooseIndividual":
      if (planesIndividuales[msg]) {
        userState[from].plan = planesIndividuales[msg];
        response =
          "Perfecto ✅\n¿Qué día quieres reservar? (ejemplo: 15 de octubre)";
        userState[from].step = "askDate";
      } else {
        response = "Elige una opción válida (1 a 4).";
      }
      break;

    case "chooseGroup":
      if (planesGrupales[msg]) {
        userState[from].plan = planesGrupales[msg];
        response =
          "Perfecto ✅\n¿Qué día quieres reservar? (ejemplo: 15 de octubre)";
        userState[from].step = "askDate";
      } else {
        response = "Elige una opción válida (1 a 4).";
      }
      break;

    case "askDate":
      userState[from].date = msg;
      response = "¿A qué hora prefieres tu cita? (ejemplo: 3:00 pm)";
      userState[from].step = "askTime";
      break;

    case "askTime":
      userState[from].time = msg;
      response =
        "Por favor confirma tu nombre y número de contacto 📞 para la reserva.";
      userState[from].step = "askContact";
      break;

    case "askContact":
      userState[from].contact = msg;
      response = `Genial 🎉 Tu reserva quedó así:\n📌 Plan: ${userState[from].plan}\n📅 Fecha: ${userState[from].date}\n⏰ Hora: ${userState[from].time}\n👤 Cliente: ${userState[from].contact}\n\n¡Gracias por elegir El Mana Spa ✨!`;
      userState[from].step = "end";
      break;

    case "end":
      response = "Si deseas hacer otra reserva, escribe 'hola'.";
      break;

    default:
      response = "Escribe 'hola' para empezar.";
      userState[from].step = "start";
  }

  // Construcción de TwiML
  res.set("Content-Type", "text/xml");
  let twiml = "<Response><Message>";
  if (response) twiml += response;
  if (media) twiml += `<Media>${media}</Media>`;
  twiml += "</Message></Response>";

  console.log(`📤 Respuesta enviada a ${from}: ${response} ${media ? `(con PDF)` : ""}`);
  res.send(twiml);
});

app.listen(PORT, () => console.log(`🚀 Bot corriendo en puerto ${PORT}`));
