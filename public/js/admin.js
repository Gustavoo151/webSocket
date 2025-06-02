const socket = io();
let connectionsUsers = [];
let connectionInSupport = [];

socket.on("admin_list_all_users", (connections) => {
  connectionsUsers = connections;
  document.getElementById("list_users").innerHTML = "";

  let template = document.getElementById("template").innerHTML;

  connections.forEach((connection) => {
    const rendered = Mustache.render(template, {
      email: connection.user.email,
      id: connection.socket_id,
    });

    document.getElementById("list_users").innerHTML += rendered;
  });
});

function call(id) {
  const connection = connectionsUsers.find(
    (connection) => connection.socket_id === id
  );

  connectionInSupport.push(connection);

  const template = document.getElementById("admin_template").innerHTML;

  const rendered = Mustache.render(template, {
    email: connection.user.email,
    id: connection.user_id,
  });

  document.getElementById("supports").innerHTML += rendered;

  const params = {
    user_id: connection.user_id,
  };

  socket.emit("admin_user_in_support", params);

  socket.emit("admin_list_messages_by_user", params, (messages) => {
    const divMessages = document.getElementById(
      `allMessages${connection.user_id}`
    );

    messages.forEach((message) => {
      const createDiv = document.createElement("div");

      if (message.admin_id === null) {
        createDiv.className = "admin_message_client";

        const emailSpan = document.createElement("span");
        emailSpan.textContent = connection.user.email;

        const lineBreak = document.createElement("br");

        const messageSpan = document.createElement("span");
        messageSpan.textContent = message.text;

        const dateSpan = document.createElement("span");
        dateSpan.className = "admin_date";
        dateSpan.textContent = dayjs(message.created_at).format(
          "DD/MM/YYYY HH:mm:ss"
        );

        createDiv.appendChild(emailSpan);
        createDiv.appendChild(lineBreak);
        createDiv.appendChild(messageSpan);
        createDiv.appendChild(dateSpan);

        // Verificar se é uma mensagem de arquivo
        if (message.file_id) {
          addFileMessageToAdmin(
            createDiv,
            message.file_name,
            message.file_id,
            false
          );
        }
      } else {
        createDiv.className = "admin_message_admin";

        createDiv.innerHTML = `Atendente: <span>${message.text}</span>`;
        createDiv.innerHTML += `<span class="admin_date">${dayjs(
          message.created_at
        ).format("DD/MM/YYYY HH:mm:ss")}</span>`;

        // Verificar se é uma mensagem de arquivo
        if (message.file_id) {
          addFileMessageToAdmin(
            createDiv,
            message.file_name,
            message.file_id,
            true
          );
        }
      }

      divMessages.appendChild(createDiv);
    });
  });
}

function sendMessage(id) {
  const text = document.getElementById(`send_message_${id}`);

  const params = {
    text: text.value,
    user_id: id,
  };

  socket.emit("admin_send_message", params);

  const divMessages = document.getElementById(`allMessages${id}`);

  const createDiv = document.createElement("div");
  createDiv.className = "admin_message_admin";
  createDiv.innerHTML = `Atendente: <span>${params.text}</span>`;
  createDiv.innerHTML += `<span class="admin_date">${dayjs().format(
    "DD/MM/YYYY HH:mm:ss"
  )}</span>`;

  divMessages.appendChild(createDiv);

  text.value = "";
}

socket.on("admin_receive_message", (data) => {
  const connection = connectionInSupport.find(
    (connection) => connection.socket_id === data.socket_id
  );

  const divMessages = document.getElementById(
    `allMessages${connection.user_id}`
  );

  const createDiv = document.createElement("div");

  createDiv.className = "admin_message_client";
  createDiv.innerHTML = `<span>${connection.user.email}</span>`;
  createDiv.innerHTML += `<br />`;
  createDiv.innerHTML += `<span>${data.message.text}</span>`;
  createDiv.innerHTML += `<span class="admin_date">${dayjs(
    data.message.created_at
  ).format("DD/MM/YYYY HH:mm:ss")}</span>`;

  divMessages.appendChild(createDiv);
});

// ==================== FUNCIONALIDADES DE ARQUIVO ====================

// Função para anexar arquivo
function attachFile(userId) {
  document.getElementById(`file_input_${userId}`).click();
}

// Manipular seleção de arquivo
function handleFileSelect(userId, event) {
  const file = event.target.files[0];
  if (file) {
    uploadFileAsAdmin(userId, file);
  }
}

// Função para upload de arquivo pelo admin
function uploadFileAsAdmin(userId, file) {
  // Validar tamanho do arquivo (máximo 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    alert("Arquivo muito grande! Tamanho máximo: 10MB");
    return;
  }

  // Mostrar progress bar
  const progressDiv = document.getElementById(`file_progress_${userId}`);
  const progressFill = document.getElementById(`progress_${userId}`);
  const progressText = document.getElementById(`progress_text_${userId}`);

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

    socket.emit("admin_send_file", {
      user_id: userId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileData: base64String,
    });
  };

  reader.onerror = function () {
    alert("Erro ao ler o arquivo");
    progressDiv.style.display = "none";
  };

  reader.readAsArrayBuffer(file);
}

// Eventos de resposta do servidor para arquivos
socket.on("admin_file_send_error", (data) => {
  alert(`Erro ao enviar arquivo: ${data.message}`);

  // Esconder todas as progress bars
  document.querySelectorAll(".file-progress").forEach((div) => {
    div.style.display = "none";
  });
});

socket.on("admin_receive_file", (data) => {
  const connection = connectionInSupport.find(
    (connection) => connection.socket_id === data.socket_id
  );

  if (connection) {
    const divMessages = document.getElementById(
      `allMessages${connection.user_id}`
    );

    const createDiv = document.createElement("div");
    createDiv.className = "admin_message_client";

    createDiv.innerHTML = `
      <span>${connection.user.email}</span><br/>
      <span>${data.message.text}</span>
      <span class="admin_date">${dayjs(data.message.created_at).format(
        "DD/MM/YYYY HH:mm:ss"
      )}</span>
    `;

    addFileMessageToAdmin(
      createDiv,
      data.fileData.fileName,
      data.fileData.id,
      false
    );
    divMessages.appendChild(createDiv);
  }
});

// Função para adicionar mensagem de arquivo na interface do admin
function addFileMessageToAdmin(parentDiv, fileName, fileId, isFromAdmin) {
  const fileDiv = document.createElement("div");
  fileDiv.className = isFromAdmin
    ? "file-message-admin"
    : "file-message-client";

  const fileIcon = getFileIcon(fileName);

  fileDiv.innerHTML = `
    <span class="file-icon">${fileIcon}</span>
    <div class="file-info">
      <div class="file-name">${fileName}</div>
      <div class="file-size">Arquivo anexado</div>
    </div>
    <button class="file-download-btn" onclick="downloadFileAsAdmin('${fileId}', '${fileName}')">
      📥 Download
    </button>
  `;

  parentDiv.appendChild(fileDiv);
}

// Função para download de arquivo pelo admin
function downloadFileAsAdmin(fileId, fileName) {
  socket.emit("admin_download_file", { fileId });

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

socket.on("admin_file_download_success", (data) => {
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

    // Esconder progress bars
    document.querySelectorAll(".file-progress").forEach((div) => {
      div.style.display = "none";
    });
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    alert("Erro ao baixar arquivo");
  }
});

socket.on("admin_file_download_error", (data) => {
  alert(`Erro ao baixar arquivo: ${data.message}`);

  // Restaurar todos os botões de download
  document.querySelectorAll(".file-download-btn").forEach((btn) => {
    btn.textContent = "📥 Download";
    btn.disabled = false;
  });
});

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
