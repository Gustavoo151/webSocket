import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { FileService } from "../services/FileService";
import { MessagesService } from "../services/MessagesService";
import { UsersService } from "../services/usersService";
interface IParams {
  text: string;
  email: string;
}

interface IFileParams {
  fileName: string;
  mimeType: string;
  fileData: string; // Base64 encoded
  email: string;
}

interface IMessageCreate {
  text: string;
  user_id: string;
  file_id?: string; // Optional for file attachments
  file_name?: string; // Optional for file attachments
  file_type?: string; // Optional for file attachments
}

io.on("connect", (socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messagesService = new MessagesService();
  const fileService = new FileService();

  socket.on("client_first_access", async (params) => {
    const socket_id = socket.id;
    const { text, email } = params as IParams;
    let user_id = null;

    const userExists = await usersService.findByEmail(email);

    if (!userExists) {
      const user = await usersService.create(email);

      await connectionsService.create({
        socket_id,
        user_id: user.id,
      });

      user_id = user.id;
    } else {
      user_id = userExists.id;

      const connection = await connectionsService.findByUserId(userExists.id);

      if (!connection) {
        await connectionsService.create({
          socket_id,
          user_id: userExists.id,
        });
      } else {
        connection.socket_id = socket_id;

        await connectionsService.create(connection);
      }
    }

    await messagesService.create({
      text,
      user_id,
    });

    const allMessages = await messagesService.listByUser(user_id);

    socket.emit("client_list_all_messages", allMessages);

    const allUsers = await connectionsService.findAllWithoutAdmin();
    io.emit("admin_list_all_users", allUsers);
  });

  socket.on("client_send_to_admin", async (params) => {
    const { text, socket_admin_id } = params;

    const socket_id = socket.id;

    const { user_id } = await connectionsService.findBySocketID(socket_id);

    const message = await messagesService.create({
      text,
      user_id,
    });

    io.to(socket_admin_id).emit("admin_receive_message", {
      message,
      socket_id,
    });

    // Melhorias
  });

  socket.on("disconnect", async () => {
    console.log(socket.id);
    await connectionsService.deleteBySocketId(socket.id);
  });

  socket.on("client_send_file", async (params: IFileParams) => {
    try {
      console.log("Recebendo arquivo:", params.fileName);
      const { fileName, mimeType, fileData, email } = params;
      const socket_id = socket.id;

      // Converte base64 para buffer (ByteArrayInputStream concept)
      const fileBuffer = Buffer.from(fileData, "base64");
      console.log("Tamanho do buffer:", fileBuffer.length);

      // Busca o usuário
      const user = await usersService.findByEmail(email);
      if (!user) {
        console.log("Usuário não encontrado:", email);
        socket.emit("file_upload_error", { message: "Usuário não encontrado" });
        return;
      }

      // Salva o arquivo
      const savedFile = await fileService.saveFile(
        fileBuffer,
        fileName,
        mimeType,
        user.id
      );
      console.log("Arquivo salvo:", savedFile);

      // Cria mensagem com referência ao arquivo
      const message = await messagesService.create({
        text: `📎 Arquivo enviado: ${fileName}`,
        user_id: user.id,
        file_id: savedFile.id,
        file_name: fileName,
        file_type: mimeType,
      } as IMessageCreate);
      console.log("Mensagem criada:", message);

      // Emite confirmação para o cliente
      socket.emit("file_upload_success", {
        fileId: savedFile.id,
        fileName: savedFile.fileName,
        message,
      });

      // Busca conexão para enviar para admin
      const connection = await connectionsService.findByUserId(user.id);
      if (connection && connection.admin_id) {
        io.to(connection.admin_id).emit("admin_receive_file", {
          message,
          socket_id,
          fileData: {
            id: savedFile.id,
            fileName: savedFile.fileName,
            mimeType: savedFile.mimeType,
            size: savedFile.size,
          },
        });
      }

      // Atualiza lista de usuários para admin
      const allUsers = await connectionsService.findAllWithoutAdmin();
      io.emit("admin_list_all_users", allUsers);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      socket.emit("file_upload_error", {
        message: "Erro ao processar arquivo",
      });
    }
  });

  socket.on("client_download_file", async (params: { fileId: string }) => {
    try {
      console.log("Solicitação de download:", params.fileId);
      const { fileId } = params;
      const fileResult = await fileService.getFile(fileId);

      if (!fileResult) {
        console.log("Arquivo não encontrado para download:", fileId);
        socket.emit("file_download_error", {
          message: "Arquivo não encontrado",
        });
        return;
      }

      const { buffer, fileData } = fileResult;
      console.log("Arquivo encontrado para download:", fileData.fileName);

      // Converte buffer para base64 para envio
      const base64Data = buffer.toString("base64");

      socket.emit("file_download_success", {
        fileId: fileData.id,
        fileName: fileData.fileName,
        mimeType: fileData.mimeType,
        fileData: base64Data,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      socket.emit("file_download_error", { message: "Erro ao baixar arquivo" });
    }
  });
});
