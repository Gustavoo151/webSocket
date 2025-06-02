import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
interface IFileData {
  id: string;
  fileName: string;
  mimeType: string; // e.g., "image/png"
  size: number;
  uploadDate: Date;
  user_id: string; // ID of the user who uploaded the file
  filePath: string; // Path to the file on the server
}

class FileService {
  private uploadDir = path.join(__dirname, "../../uploads");

  constructir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    user_id: string
  ): Promise<IFileData> {
    const fileId = uuidv4();
    const fileExtension = path.extname(fileName);
    const safeName = `${fileId}${fileExtension}`;
    const filePath = path.join(this.uploadDir, safeName);

    // Salva o arquivo usando FileInputStream concept
    const writeStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      writeStream.write(fileBuffer, (error) => {
        if (error) {
          reject(error);
          return;
        }

        writeStream.end();

        const fileData: IFileData = {
          id: fileId,
          fileName,
          mimeType,
          size: fileBuffer.length,
          uploadDate: new Date(),
          user_id,
          filePath,
        };

        resolve(fileData);
      });
    });
  }

  async getFile(
    fileId: string
  ): Promise<{ buffer: Buffer; fileData: IFileData } | null> {
    try {
      // Aqui você buscaria os dados do arquivo no banco de dados
      const filePath = path.join(this.uploadDir, `${fileId}.pdf`); // Exemplo para PDF, ajuste conforme necessário

      if (!fs.existsSync(filePath)) {
        return null;
      }

      // Lê o arquivo usando conceito similar ao FileInputStream
      const readStream = fs.createReadStream(filePath);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        readStream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        readStream.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const fileData: IFileData = {
            id: fileId,
            fileName: `file_${fileId}.pdf`,
            mimeType: "application/pdf",
            size: buffer.length,
            uploadDate: new Date(),
            user_id: "",
            filePath,
          };

          resolve({ buffer, fileData });
        });

        readStream.on("error", reject);
      });
    } catch (error) {
      console.error("Error retrieving file:", error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, `${fileId}.pdf`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Converte buffer para ByteArrayInputStream concept
  createByteArrayInputStream(buffer: Buffer): NodeJS.ReadableStream {
    const { Readable } = require("stream");

    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    return readable;
  }
}

export { FileService, IFileData };
