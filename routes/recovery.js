const express = require('express');
const router = express.Router();

// Tipos de arquivo disponíveis
const FILE_TYPES = {
  todos: ['image', 'video', 'audio', 'document', 'archive'],
  imagens: ['image'],
  videos: ['video'],
  audio: ['audio'],
  docs: ['document']
};

// Limites por plano
const PLAN_LIMITS = {
  free: { maxFiles: 5, maxSizeMB: 300, maxScans: 1, maxDays: 10 },
  pro: { maxFiles: 50, maxSizeMB: 5120, maxScans: 50, maxDays: 30 }
};

// Função para gerar tamanho aleatório de dispositivo
function generateRandomSize(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para gerar dispositivos com tamanhos aleatórios
function generateDevices() {
  return [
    {
      id: 'device-c',
      name: 'Disco Local',
      type: 'hdd',
      sizeInBytes: generateRandomSize(250 * 1024 * 1024 * 1024, 2000 * 1024 * 1024 * 1024), // 250GB - 2TB
      health: 'good',
      icon: 'hdd'
    },
    {
      id: 'device-usb',
      name: 'HD Externo',
      type: 'external',
      sizeInBytes: generateRandomSize(500 * 1024 * 1024 * 1024, 4000 * 1024 * 1024 * 1024), // 500GB - 4TB
      health: 'good',
      icon: 'external'
    },
    {
      id: 'device-pendrive',
      name: 'Pendrive',
      type: 'usb',
      sizeInBytes: generateRandomSize(8 * 1024 * 1024 * 1024, 128 * 1024 * 1024 * 1024), // 8GB - 128GB
      health: 'good',
      icon: 'usb'
    }
  ];
}

// Limites por plano
const ALL_FILES = [
  { id: 1, name: 'Foto_Férias_2024.jpg', size: '4.2MB', sizeInMB: 4.2, type: 'image' },
  { id: 2, name: 'Vídeo_Aniversário.mp4', size: '512MB', sizeInMB: 512, type: 'video' },
  { id: 3, name: 'Documento_Importante.pdf', size: '2.1MB', sizeInMB: 2.1, type: 'document' },
  { id: 4, name: 'Planilha_2024.xlsx', size: '1.5MB', sizeInMB: 1.5, type: 'document' },
  { id: 5, name: 'Música_Favorita.mp3', size: '8.5MB', sizeInMB: 8.5, type: 'audio' },
  { id: 6, name: 'Apresentação.pptx', size: '15.3MB', sizeInMB: 15.3, type: 'document' },
  { id: 7, name: 'Código_Projeto.zip', size: '52.1MB', sizeInMB: 52.1, type: 'archive' },
  { id: 8, name: 'Backup_Database.sql', size: '128.5MB', sizeInMB: 128.5, type: 'document' },
  { id: 9, name: 'Vídeo_Completo.mkv', size: '256MB', sizeInMB: 256, type: 'video' },
  { id: 10, name: 'Arquivo_Grande.iso', size: '450MB', sizeInMB: 450, type: 'archive' }
];

// Função auxiliar para extrair userPlan do JWT
function extractUserPlanFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'free';
  }

  const token = authHeader.substring(7);
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta-aqui');
    return (decoded.plan || 'free').toLowerCase();
  } catch (error) {
    return 'free';
  }
}

// GET /api/recovery/devices - Lista dispositivos
router.get('/devices', async (req, res) => {
  try {
    const devices = generateDevices();
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/recovery/scan - Inicia varredura
router.post('/scan', async (req, res) => {
  try {
    const { deviceId, fileType } = req.body;
    const plan = extractUserPlanFromToken(req.headers.authorization);

    if (!deviceId) {
      return res.status(400).json({ error: 'ID do dispositivo é obrigatório' });
    }

    const selectedFileType = fileType || 'todos';
    const allowedTypes = FILE_TYPES[selectedFileType] || FILE_TYPES.todos;
    const limits = PLAN_LIMITS[plan];

    // Filtrar arquivos por tipo
    let filteredResults = ALL_FILES.filter(file => allowedTypes.includes(file.type));

    // Aplicar limites do plano
    let scanResults = [];
    let totalSizeMB = 0;
    let fileCount = 0;

    filteredResults.forEach(file => {
      const wouldExceedFileLimit = fileCount >= limits.maxFiles;
      const wouldExceedSizeLimit = (totalSizeMB + file.sizeInMB) > limits.maxSizeMB;
      const canRecover = !wouldExceedFileLimit && !wouldExceedSizeLimit;

      scanResults.push({
        ...file,
        canRecover,
        blockedReason: wouldExceedFileLimit ? 'Limite de arquivos atingido' : 
                       wouldExceedSizeLimit ? 'Limite de tamanho atingido' : null
      });

      if (canRecover) {
        totalSizeMB += file.sizeInMB;
        fileCount++;
      }
    });

    const scanId = 'scan-' + Date.now();

    res.json({
      scanId,
      deviceId,
      fileType: selectedFileType,
      plan,
      status: 'completed',
      progress: 100,
      filesFound: scanResults.length,
      filesRecoverable: scanResults.filter(f => f.canRecover).length,
      results: scanResults,
      limits: {
        maxFiles: limits.maxFiles,
        maxSizeMB: limits.maxSizeMB
      },
      startTime: new Date(),
      completedTime: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recovery/scan/:scanId - Status da varredura
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    res.json({
      scanId,
      status: 'completed',
      progress: 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/recovery/recover - Recupera arquivos
router.post('/recover', async (req, res) => {
  try {
    const { files, destination } = req.body;
    const plan = extractUserPlanFromToken(req.headers.authorization);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo selecionado' });
    }

    if (!destination) {
      return res.status(400).json({ error: 'Destino não especificado' });
    }

    const limits = PLAN_LIMITS[plan];
    
    if (files.length > limits.maxFiles) {
      return res.status(400).json({ 
        error: `Plano ${plan.toUpperCase()} permite máximo ${limits.maxFiles} arquivos por varredura` 
      });
    }

    const recoveryId = 'recovery-' + Date.now();
    const totalSize = files.reduce((sum, f) => sum + (f.sizeInMB || 0), 0);

    if (totalSize > limits.maxSizeMB) {
      return res.status(400).json({ 
        error: `Tamanho total (${totalSize}MB) excede limite de ${limits.maxSizeMB}MB para plano ${plan.toUpperCase()}` 
      });
    }

    res.json({
      recoveryId,
      filesCount: files.length,
      totalSize: `${totalSize.toFixed(2)}MB`,
      destination,
      status: 'completed',
      progress: 100,
      startTime: new Date(),
      completedTime: new Date(),
      message: `${files.length} arquivo(s) recuperado(s) com sucesso para ${destination}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

