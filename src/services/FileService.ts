import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface IFileData {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadDate: Date;
  user_id: string;
  filePath: string;
}

// Simular um banco de dados de metadados de arquivos em memória
class FileMetadataStore {
  private static files: Map<string, IFileData> = new Map();

  static save(fileData: IFileData): void {
    this.files.set(fileData.id, fileData);
  }

  static get(fileId: string): IFileData | undefined {
    return this.files.get(fileId);
  }

  static delete(fileId: string): boolean {
    return this.files.delete(fileId);
  }
}

class FileService {
  private uploadDir = path.join(__dirname, "../../uploads");

  constructor() {
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
          filePath: safeName, // Salvar apenas o nome do arquivo
        };

        // Salvar metadados no store
        FileMetadataStore.save(fileData);
        resolve(fileData);
      });
    });
  }

  async getFile(
    fileId: string
  ): Promise<{ buffer: Buffer; fileData: IFileData } | null> {
    try {
      // Buscar metadados do arquivo
      const fileData = FileMetadataStore.get(fileId);

      if (!fileData) {
        console.log(`Arquivo não encontrado nos metadados: ${fileId}`);
        return null;
      }

      const filePath = path.join(this.uploadDir, fileData.filePath);

      if (!fs.existsSync(filePath)) {
        console.log(`Arquivo físico não encontrado: ${filePath}`);
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
          resolve({ buffer, fileData });
        });

        readStream.on("error", (error) => {
          console.error("Erro ao ler arquivo:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("Error retrieving file:", error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const fileData = FileMetadataStore.get(fileId);

      if (!fileData) {
        return false;
      }

      const filePath = path.join(this.uploadDir, fileData.filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        FileMetadataStore.delete(fileId);
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
