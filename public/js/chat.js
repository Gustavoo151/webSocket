let socket_admin_id = null;
let emailUser = null;
let socket = null;

document.querySelector("#start_chat").addEventListener("click", (event) => {
  socket = io();

  const chat_help = document.getElementById("chat_help");
  chat_help.style.display = "none";

  const chat_in_support = document.getElementById("chat_in_support");
  chat_in_support.style.display = "block";

  const email = document.getElementById("email").value;
  emailUser = email;

  const text = document.getElementById("txt_help").value;

  socket.on("connect", () => {
    const params = {
      email,
      text,
    };
    socket.emit("client_first_access", params, (call, err) => {
      if (err) {
        console.err(err);
      } else {
        console.log(call);
      }
    });
  });

  socket.on("client_list_all_messages", (messages) => {
    var template_client = document.getElementById(
      "message-user-template"
    ).innerHTML;
    var template_admin = document.getElementById("admin-template").innerHTML;

    messages.forEach((message) => {
      if (message.admin_id === null) {
        const rendered = Mustache.render(template_client, {
          message: message.text,
          email,
        });

        document.getElementById("messages").innerHTML += rendered;
      } else {
        const rendered = Mustache.render(template_admin, {
          message_admin: message.text,
        });

        document.getElementById("messages").innerHTML += rendered;
      }
    });
  });

  socket.on("admin_send_to_client", (message) => {
    socket_admin_id = message.socket_id;

    const template_admin = document.getElementById("admin-template").innerHTML;

    const rendered = Mustache.render(template_admin, {
      message_admin: message.text,
    });

    document.getElementById("messages").innerHTML += rendered;
  });
});

// Manipulação de envio de mensagens de texto
document.getElementById("start_chat").addEventListener("click", (event) => {
  const chat_help = document.getElementById("chat_help");
  chat_help.style.display = "none";

  const chat_in_support = document.getElementById("chat_in_support");
  chat_in_support.style.display = "block";

  const email = document.getElementById("email").value;
  const text = document.getElementById("txt_help").value;

  emailUser = email;

  socket.emit("client_first_access", {
    text,
    email,
  });
});

document
  .querySelector("#send_message_button")
  .addEventListener("click", (event) => {
    const text = document.getElementById("message_user");

    const params = {
      text: text.value,
      socket_admin_id,
    };

    socket.emit("client_send_to_admin", params);

    const template_client = document.getElementById(
      "message-user-template"
    ).innerHTML;

    const rendered = Mustache.render(template_client, {
      message: text.value,
      email: emailUser,
    });

    document.getElementById("messages").innerHTML += rendered;

    document.getElementById("message_user").value = "";
  });

// ==================== FUNCIONALIDADES DE ARQUIVO ====================

// Configurar botão de anexar arquivo
document.getElementById("attach_file_btn").addEventListener("click", () => {
  document.getElementById("file_input").click();
});

// Manipular seleção de arquivo
document.getElementById("file_input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadFile(file);
  }
});

// Função para fazer upload do arquivo
function uploadFile(file) {
  // Validar tamanho do arquivo (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    alert("Arquivo muito grande! Tamanho máximo: 10MB");
    return;
  }

  // Mostrar progress bar
  const progressDiv = document.getElementById("upload_progress");
  const progressFill = document.getElementById("progress_fill");
  const progressText = document.getElementById("progress_text");

  progressDiv.style.display = "block";
  progressText.textContent = `Enviando ${file.name}...`;

  const reader = new FileReader();

  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      progressFill.style.width = percentComplete + "%";
    }
  };

  reader.onload = function (e) {
    const arrayBuffer = e.target.result;
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    socket.emit("client_send_file", {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileData: base64String,
      email: emailUser,
    });
  };

  reader.onerror = function () {
    alert("Erro ao ler o arquivo");
    progressDiv.style.display = "none";
  };

  reader.readAsArrayBuffer(file);
}

// Eventos de resposta do servidor para arquivos
socket.on("file_upload_success", (data) => {
  const progressDiv = document.getElementById("upload_progress");
  progressDiv.style.display = "none";

  // Adicionar mensagem de arquivo na conversa
  addFileMessage(data.fileName, data.fileId, data.message, true);

  // Limpar input de arquivo
  document.getElementById("file_input").value = "";
});

socket.on("file_upload_error", (data) => {
  const progressDiv = document.getElementById("upload_progress");
  progressDiv.style.display = "none";

  alert(`Erro ao enviar arquivo: ${data.message}`);

  // Limpar input de arquivo
  document.getElementById("file_input").value = "";
});
