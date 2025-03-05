import { io } from "../http";
// Quando a gente usa o io.emit nós enviamos para todos os usuário. Já com o socket a gente já têm um maior controle para quem estamos enviando
io.on("connect", (socket) => {
  socket.emit("chat_iniciado", {
    message: "Seu chat foi iniciado",
  });
});
