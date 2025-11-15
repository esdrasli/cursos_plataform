import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Client as FtpClient } from 'basic-ftp';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';
import { AppDataSource } from '../config/database.js';
import { Course } from '../entities/Course.js';

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

// Configurar storage para vídeos de aulas
// Estrutura: /home/ndx.sisaatech.com/storage/cursos/{userId}/{courseId}/aulas/aula_{lessonNumber}.mp4
// Os vídeos são sempre enviados diretamente para o servidor remoto via FTP

// Função para fazer upload via FTP para o servidor remoto
async function uploadToRemoteServer(localFilePath: string, remotePath: string): Promise<void> {
  const host = process.env.SFTP_HOST || '195.35.16.131';
  const port = parseInt(process.env.FTP_PORT || process.env.SFTP_PORT || '21');
  const username = (process.env.SFTP_USERNAME || '').replace(/^["']|["']$/g, ''); // Remover aspas se houver
  const password = (process.env.SFTP_PASSWORD || '').replace(/^["']|["']$/g, ''); // Remover aspas se houver
  
  // Validar que as credenciais FTP estão configuradas (obrigatório)
  if (!username || !password) {
    throw new Error('FTP não configurado. Configure SFTP_USERNAME e SFTP_PASSWORD no .env');
  }
  
  // Debug: verificar credenciais (sem mostrar senha completa)
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  console.log(`🔐 Credenciais: user="${trimmedUsername}", password_length=${trimmedPassword.length}`);
  console.log(`   Password contém caracteres especiais: ${/[#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmedPassword)}`);
  console.log(`   Password contém espaços: ${trimmedPassword.includes(' ')}`);
  console.log(`   Password codificado (primeiros 10 chars): ${Buffer.from(trimmedPassword).toString('hex').substring(0, 20)}...`);
  
  // Tentar diferentes formatos de usuário (alguns servidores FTP requerem formato específico)
  const usernameVariants = [
    trimmedUsername, // admin_user
    `${trimmedUsername}@ndx.sisaatech.com`, // admin_user@ndx.sisaatech.com
    `ndx.sisaatech.com:${trimmedUsername}`, // ndx.sisaatech.com:admin_user
  ];

  const client = new FtpClient();
  client.ftp.verbose = true; // Log detalhado para debug
  
  try {
    console.log(`📤 Conectando ao servidor FTP (${host}:${port})...`);
    console.log(`   Usuário: "${trimmedUsername}"`);
    
    // Tentar FTPS primeiro (mais seguro), depois FTP normal
    let connected = false;
    let lastError: any = null;
    
    // Tentar FTPS
    try {
      console.log('   Tentando FTPS...');
      await client.access({
        host: host,
        port: port,
        user: trimmedUsername,
        password: trimmedPassword,
        secure: true,
        secureOptions: { rejectUnauthorized: false },
      });
      connected = true;
      console.log('✅ Conectado ao servidor FTPS');
    } catch (ftpsError: any) {
      console.log(`   FTPS falhou: ${ftpsError.message}`);
      lastError = ftpsError;
      client.close();
      
      // Tentar FTP normal com diferentes formatos de usuário
      let ftpConnected = false;
      for (const userVariant of usernameVariants) {
        if (ftpConnected) break;
        
        const client2 = new FtpClient();
        client2.ftp.verbose = true;
        try {
          console.log(`   Tentando FTP normal com usuário: "${userVariant}"...`);
          await client2.access({
            host: host,
            port: port,
            user: userVariant,
            password: trimmedPassword,
            secure: false,
          });
          Object.assign(client, client2);
          connected = true;
          ftpConnected = true;
          console.log(`✅ Conectado ao servidor FTP com usuário: "${userVariant}"`);
        } catch (ftpError: any) {
          console.log(`   Falhou com "${userVariant}": ${ftpError.message}`);
          client2.close();
          
          // Se é o último formato e falhou, tentar encoding diferente
          if (userVariant === usernameVariants[usernameVariants.length - 1] && ftpError.message.includes('530') && /[#@$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmedPassword)) {
            console.log('   Tentando com senha usando encodeURIComponent...');
            const client3 = new FtpClient();
            client3.ftp.verbose = true;
            try {
              await client3.access({
                host: host,
                port: port,
                user: trimmedUsername,
                password: decodeURIComponent(encodeURIComponent(trimmedPassword)), // Normalizar encoding
                secure: false,
              });
              Object.assign(client, client3);
              connected = true;
              ftpConnected = true;
              console.log('✅ Conectado ao servidor FTP (com encoding normalizado)');
            } catch (encodeError: any) {
              console.log(`   Tentativa com encoding também falhou: ${encodeError.message}`);
              client3.close();
            }
          }
        }
      }
      
      if (!ftpConnected) {
        throw lastError || new Error('Não foi possível conectar com nenhum formato de usuário');
      }
    }
    
    if (!connected) {
      throw lastError || new Error('Não foi possível conectar');
    }

    // Verificar diretório atual (home do usuário FTP)
    const pwd = await client.pwd();
    console.log(`📂 Diretório atual (home) no servidor: ${pwd}`);
    
    // Listar conteúdo do diretório atual para debug
    try {
      const list = await client.list();
      console.log(`📁 Conteúdo do diretório atual (primeiros 5 itens):`, list.slice(0, 5).map((item: any) => item.name));
    } catch (listError: any) {
      console.log(`⚠️ Não foi possível listar diretório: ${listError.message}`);
    }
    
    // O caminho remoto pode precisar ser relativo ao diretório home do usuário
    // Se o caminho começa com /home/ndx.sisaatech.com, pode precisar ser relativo
    let remoteDir = path.dirname(remotePath);
    const remoteFilename = path.basename(remotePath);
    
    // O usuário FTP está em /home/ndx.sisaatech.com (conforme painel Hostinger)
    // Converter caminho absoluto para relativo ao diretório home do usuário
    if (remoteDir.startsWith('/home/ndx.sisaatech.com')) {
      // Remover /home/ndx.sisaatech.com do início
      remoteDir = remoteDir.replace(/^\/home\/ndx\.sisaatech\.com\/?/, '');
      // Se ficou vazio, usar diretório atual
      if (!remoteDir || remoteDir === '/') {
        remoteDir = '.';
      }
      // Remover barra inicial se houver
      if (remoteDir.startsWith('/')) {
        remoteDir = remoteDir.substring(1);
      }
      console.log(`🔄 Caminho convertido para relativo: ${remoteDir || '.'}`);
    } else if (remoteDir.startsWith('/')) {
      // Se começa com / mas não é /home/ndx.sisaatech.com, remover barra inicial
      remoteDir = remoteDir.substring(1);
    }
    
    console.log(`📁 Criando diretório remoto: ${remoteDir}`);
    try {
      await client.ensureDir(remoteDir);
      console.log(`✅ Diretório criado/verificado: ${remoteDir}`);
    } catch (mkdirError: any) {
      console.log('⚠️ Erro ao criar diretório (pode já existir):', mkdirError.message);
    }

    // Mudar para o diretório de destino
    try {
      await client.cd(remoteDir);
      const newPwd = await client.pwd();
      console.log(`📂 Mudou para diretório: ${newPwd}`);
    } catch (cdError: any) {
      console.log(`⚠️ Erro ao mudar diretório: ${cdError.message}`);
      // Tentar criar o diretório novamente
      try {
        await client.ensureDir(remoteDir);
        await client.cd(remoteDir);
        const newPwd = await client.pwd();
        console.log(`📂 Diretório criado e acessado: ${newPwd}`);
      } catch (retryError: any) {
        console.log(`❌ Erro ao criar/acessar diretório: ${retryError.message}`);
        throw retryError;
      }
    }

    // Fazer upload do arquivo
    console.log(`📤 Fazendo upload: ${localFilePath} -> ${remoteDir}/${remoteFilename}`);
    await client.uploadFrom(localFilePath, remoteFilename);
    console.log('✅ Upload concluído com sucesso');
    
    // Verificar se o arquivo foi enviado
    try {
      const files = await client.list();
      const uploadedFile = files.find((f: any) => f.name === remoteFilename);
      if (uploadedFile) {
        console.log(`✅ Arquivo confirmado no servidor: ${uploadedFile.name} (${uploadedFile.size} bytes)`);
      }
    } catch (verifyError: any) {
      console.log(`⚠️ Não foi possível verificar arquivo: ${verifyError.message}`);
    }

    client.close();
  } catch (error: any) {
    console.error('❌ Erro ao fazer upload via FTP:', error.message);
    client.close();
    throw error;
  }
}

// Usar diretório temporário - a validação e movimentação será feita no handler
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar diretório temporário para uploads
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome temporário único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `temp_${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivos - apenas vídeos
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|webm|ogg|mov|avi|wmv|flv|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de vídeo são permitidos (MP4, WebM, OGG, MOV, AVI, WMV, FLV, MKV)'));
  }
};

// Configurar multer para vídeos
const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: videoFileFilter
});

// Upload de vídeo de aula
router.post('/video', authenticate, uploadVideo.single('video'), async (req: AuthRequest, res: Response) => {
  let tempFilePath: string | null = null;
  
  try {
    console.log('📹 Upload de vídeo recebido (handler):', {
      hasFile: !!req.file,
      body: req.body,
      bodyKeys: Object.keys(req.body || {}),
      userId: req.user?.id,
      courseId: req.body?.courseId,
      lessonNumber: req.body?.lessonNumber
    });

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo de vídeo enviado' });
    }

    tempFilePath = req.file.path;

    const { courseId, lessonNumber } = req.body;

    // Validar que courseId e lessonNumber existem e não são vazios
    if (!courseId || (typeof courseId === 'string' && courseId.trim() === '')) {
      // Limpar arquivo temporário
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ message: 'courseId é obrigatório e não pode estar vazio' });
    }
    
    if (!lessonNumber || (typeof lessonNumber === 'string' && lessonNumber.trim() === '')) {
      // Limpar arquivo temporário
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ message: 'lessonNumber é obrigatório e não pode estar vazio' });
    }

    // Verificar se o curso existe e pertence ao usuário
    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ 
      where: { id: courseId, instructorId: req.user!.id } 
    });

    if (!course) {
      // Limpar arquivo temporário
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(403).json({ message: 'Curso não encontrado ou você não tem permissão para fazer upload neste curso' });
    }

    // Preparar informações do arquivo
    const userId = req.user!.id;
    const ext = path.extname(req.file.originalname).toLowerCase() || '.mp4';
    const finalFilename = `aula_${lessonNumber}${ext}`;
    
    // Fazer upload direto para o servidor remoto (sempre)
    // O caminho remoto é sempre o mesmo, independente do ambiente
    const remotePath = `/home/ndx.sisaatech.com/storage/cursos/${userId}/${courseId}/aulas/${finalFilename}`;
    
    try {
      await uploadToRemoteServer(tempFilePath, remotePath);
      console.log('✅ Arquivo enviado para o servidor remoto');
    } catch (uploadError: any) {
      // Se o upload falhar, limpar arquivo temporário e retornar erro
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      console.error('❌ Erro ao fazer upload para servidor remoto:', uploadError.message);
      return res.status(500).json({ 
        message: 'Erro ao fazer upload do vídeo para o servidor remoto. Verifique as configurações FTP.',
        error: uploadError.message 
      });
    }
    
    // Remover arquivo temporário após upload bem-sucedido
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    tempFilePath = null; // Marcar como processado para não deletar novamente

    // Construir URL relativa para acessar o vídeo no servidor remoto
    // A URL será: /storage/cursos/{userId}/{courseId}/aulas/aula_{lessonNumber}.mp4
    const videoUrl = `/storage/cursos/${userId}/${courseId}/aulas/${finalFilename}`;
    
    res.json({
      success: true,
      url: videoUrl,
      filename: finalFilename,
      originalName: req.file.originalname,
      size: req.file.size,
      courseId,
      lessonNumber: parseInt(lessonNumber)
    });
  } catch (error: any) {
    console.error('❌ Erro no upload de vídeo:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error('Erro ao remover arquivo temporário:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Erro ao fazer upload do vídeo', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

export default router;

