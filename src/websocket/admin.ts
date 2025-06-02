import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { FileService } from "../services/FileService";
import { MessagesService } from "../services/MessagesService";

interface IMessageCreate {
  text: string;
  user_id: string;
  file_id?: string; // Optional for file attachments
  file_name?: string; // Optional for file attachments
  file_type?: string; // Optional for file attachments
}

io.on("connect", async (socket) => {
  const connectionsService = new ConnectionsService();
  const messageService = new MessagesService();
  const fileService = new FileService();

  const allConnectionsWithoutAdmin =
    await connectionsService.findAllWithoutAdmin();

  io.emit("admin_list_all_users", allConnectionsWithoutAdmin);

  socket.on("admin_list_messages_by_user", async (params, callback) => {
    const { user_id } = params;

    const allMessages = await messageService.listByUser(user_id);

    callback(allMessages);
  });

  socket.on("admin_send_message", async (params) => {
    const { user_id, text } = params;

    await messageService.create({
      text,
      user_id,
      admin_id: socket.id, // Esse socket id vem de dentro do proprio socket
    });

    const { socket_id } = await connectionsService.findByUserId(user_id);

    io.to(socket_id).emit("admin_send_to_client", {
      text,
      socket_id: socket.id,
    });
  });

  socket.on("admin_user_in_support", async (params) => {
    const { user_id } = params;
    await connectionsService.updateAdminID(user_id, socket.id);

    const allConnectionsWithoutAdmin =
      await connectionsService.findAllWithoutAdmin();

    io.emit("admin_list_all_users", allConnectionsWithoutAdmin);
  });

  socket.on("admin_send_file", async (params) => {
    try {
      const { user_id, fileName, mimeType, fileData } = params;

      // Converte base64 para buffer
      const fileBuffer = Buffer.from(fileData, "base64");

      // Salva o arquivo
      const savedFile = await fileService.saveFile(
        fileBuffer,
        fileName,
        mimeType,
        user_id
      );

      // Cria mensagem com arquivo
      const message = await messageService.create({
        text: `📎 Arquivo do suporte: ${fileName}`,
        user_id,
        admin_id: socket.id,
        file_id: savedFile.id,
        file_name: fileName,
        file_type: mimeType,
      } as );

      // Envia para o cliente
      const { socket_id } = await connectionsService.findByUserId(user_id);
      io.to(socket_id).emit("admin_send_file_to_client", {
        message,
        fileData: {
          id: savedFile.id,
          fileName: savedFile.fileName,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
        },
      });
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      socket.emit("admin_file_send_error", {
        message: "Erro ao enviar arquivo",
      });
    }
  });

  socket.on("admin_download_file", async (params: { fileId: string }) => {
    try {
      const { fileId } = params;
      const fileResult = await fileService.getFile(fileId);

      if (!fileResult) {
        socket.emit("admin_file_download_error", {
          message: "Arquivo não encontrado",
        });
        return;
      }

      const { buffer, fileData } = fileResult;
      const base64Data = buffer.toString("base64");

      socket.emit("admin_file_download_success", {
        fileId: fileData.id,
        fileName: fileData.fileName,
        mimeType: fileData.mimeType,
        fileData: base64Data,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      socket.emit("admin_file_download_error", {
        message: "Erro ao baixar arquivo",
      });
    }
  });
});
