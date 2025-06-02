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
        // Verificar se é uma mensagem com arquivo
        if (message.file_id) {
          addFileMessage(message.file_name, message.file_id, message, true);
        } else {
          const rendered = Mustache.render(template_client, {
            message: message.text,
            email,
          });
          document.getElementById("messages").innerHTML += rendered;
        }
      } else {
        // Verificar se é uma mensagem com arquivo do admin
        if (message.file_id) {
          addFileMessage(message.file_name, message.file_id, message, false);
        } else {
          const rendered = Mustache.render(template_admin, {
            message_admin: message.text,
          });
          document.getElementById("messages").innerHTML += rendered;
        }
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

  socket.on("admin_send_file_to_client", (data) => {
    addFileMessage(
      data.fileData.fileName,
      data.fileData.id,
      data.message,
      false
    );
  });

  socket.on("file_download_success", (data) => {
    const { fileName, mimeType, fileData } = data;

    try {
      // Converte base64 de volta para blob
      const byteCharacters = atob(fileData);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Restaurar todos os botões de download
      document.querySelectorAll(".file-download-btn").forEach((btn) => {
        btn.textContent = "📥 Download";
        btn.disabled = false;
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      alert("Erro ao baixar arquivo");
    }
  });

  socket.on("file_download_error", (data) => {
    alert(`Erro ao baixar arquivo: ${data.message}`);

    // Restaurar todos os botões de download
    document.querySelectorAll(".file-download-btn").forEach((btn) => {
      btn.textContent = "📥 Download";
      btn.disabled = false;
    });
  });
});

// Manipulação de envio de mensagens de texto
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

// Função para adicionar mensagem de arquivo na conversa
function addFileMessage(fileName, fileId, message, isFromUser) {
  const messagesDiv = document.getElementById("messages");

  const fileDiv = document.createElement("div");
  fileDiv.className = isFromUser ? "client clearfix" : "admin clearfix";

  const fileIcon = getFileIcon(fileName);
  const fileSize = formatFileSize(message.size || 0);

  fileDiv.innerHTML = `
    <div class="message-header">
      <span class="${isFromUser ? "name" : "admin_name"}">
        ${isFromUser ? emailUser : "Agente de suporte"}
      </span>
      <span class="message-time">${new Date(
        message.created_at || new Date()
      ).toLocaleString()}</span>
    </div>
    <div class="message-bubble">
      <div class="file-message">
        <span class="file-icon">${fileIcon}</span>
        <div class="file-info">
          <div class="file-name">${fileName}</div>
          <div class="file-size">${fileSize}</div>
        </div>
        <button class="file-download-btn" onclick="downloadFile('${fileId}', '${fileName}')">
          📥 Download
        </button>
      </div>
    </div>
  `;

  messagesDiv.appendChild(fileDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Função para download de arquivo
function downloadFile(fileId, fileName) {
  socket.emit("client_download_file", { fileId });

  // Mostrar loading
  const button = event.target;
  const originalText = button.textContent;
  button.textContent = "⏳ Baixando...";
  button.disabled = true;

  // Restaurar botão após um tempo (em caso de erro)
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 10000);
}

// Funções auxiliares
function getFileIcon(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();

  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return "🖼️";
    case "mp4":
    case "avi":
    case "mov":
      return "🎥";
    case "mp3":
    case "wav":
    case "flac":
      return "🎵";
    case "zip":
    case "rar":
    case "7z":
      return "📦";
    default:
      return "📎";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Permitir envio com Enter
document
  .getElementById("message_user")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      document.getElementById("send_message_button").click();
    }
  });
