import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar subdiretório por tipo de arquivo
    const subDir = file.fieldname === 'image' ? 'images' : 'files';
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos - apenas imagens
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB
  },
  fileFilter: fileFilter
});

// Upload de imagem única
router.post('/image', authenticate, upload.single('image'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // URL relativa para acessar a imagem
    const fileUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da imagem', error: error.message });
  }
});

// Upload múltiplo de imagens
router.post('/images', authenticate, upload.array('images', 10), (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const files = (req.files as Express.Multer.File[]).map(file => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));

    res.json({
      success: true,
      files: files
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload das imagens', error: error.message });
  }
});

export default router;

