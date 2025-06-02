import fs from "fs";
import path from "path";

interface IFileData {
  id: string;
  filename: string;
  mimetype: string; // e.g., "image/png"
  size: number;
  uploadedAt: Date;
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
}
