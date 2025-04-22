import multer from "multer";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/img")); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname); // Get file extension
        const uniqueFilename = `${uuidv4()}${fileExt}`; // Generate UUID filename
        cb(null, uniqueFilename);
    }
});

export const uploader = multer({ storage });
