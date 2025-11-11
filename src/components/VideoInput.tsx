import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, FileVideo, HardDrive } from 'lucide-react';

interface VideoInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const VideoInput: React.FC<VideoInputProps> = ({ value, onChange, placeholder = 'URL do vídeo, Google Drive ou faça upload' }) => {
  const [inputMode, setInputMode] = useState<'url' | 'drive' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione um arquivo de vídeo válido');
      return;
    }

    // Verificar tamanho do arquivo (máx 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB em bytes
    if (file.size > maxSize) {
      alert('O arquivo é muito grande. Tamanho máximo: 500MB');
      return;
    }

    setUploading(true);
    
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('video', file);
      
      // TODO: Substituir por endpoint real de upload
      // Por enquanto, vamos criar uma URL temporária para preview
      const videoUrl = URL.createObjectURL(file);
      
      // Em produção, você faria:
      // const response = await fetch('/api/upload/video', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // onChange(data.videoUrl);
      
      // Por enquanto, usar URL temporária (será perdida ao recarregar)
      // Em produção, o backend deve retornar uma URL permanente
      onChange(videoUrl);
      
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploading(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do vídeo. Tente novamente ou use uma URL de vídeo.');
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      // Verificar se é um arquivo de vídeo
      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const item = items[0];
        if (item.kind === 'file' && item.type.startsWith('video/')) {
          setDragActive(true);
        }
      } else {
        setDragActive(true);
      }
    } else if (e.type === 'dragleave') {
      // Só desativar se realmente saiu da área (não apenas de um elemento filho)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setDragActive(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validar se é vídeo antes de processar
      if (!file.type.startsWith('video/')) {
        alert('Por favor, arraste apenas arquivos de vídeo');
        return;
      }
      
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const isValidVideoUrl = (url: string) => {
    if (!url) return false;
    // Verificar se é URL do YouTube, Vimeo, Google Drive, ou URL direta de vídeo
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/;
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || driveRegex.test(url) || videoExtensions.test(url) || url.startsWith('http') || url.startsWith('blob:');
  };

  const isGoogleDriveUrl = (url: string) => {
    if (!url) return false;
    const driveRegex = /(?:drive\.google\.com|docs\.google\.com)/;
    return driveRegex.test(url);
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Extrair ID do arquivo do Google Drive
    const fileIdMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Converter para link de visualização do Google Drive
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return null;
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(?:.*\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Google Drive
    const driveEmbedUrl = getGoogleDriveEmbedUrl(url);
    if (driveEmbedUrl) {
      return driveEmbedUrl;
    }
    
    return null;
  };

  const embedUrl = value ? getVideoEmbedUrl(value) : null;
  const isUrl = inputMode === 'url';
  const isDrive = inputMode === 'drive';
  const isUpload = inputMode === 'upload';
  const showPreview = value && isValidVideoUrl(value);
  const isDriveUrl = value ? isGoogleDriveUrl(value) : false;

  return (
    <div className="space-y-3">
      {/* Tabs para escolher entre URL, Google Drive e Upload */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            isUrl
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          URL do Vídeo
        </button>
        <button
          type="button"
          onClick={() => setInputMode('drive')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            isDrive
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HardDrive className="w-4 h-4 inline mr-2" />
          Google Drive
        </button>
        <button
          type="button"
          onClick={() => setInputMode('upload')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            isUpload
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload de Arquivo
        </button>
      </div>

      {/* Input de URL */}
      {isUrl && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Preview do vídeo */}
          {showPreview && embedUrl && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-900">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            </div>
          )}

          {showPreview && !embedUrl && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <video
                  src={value}
                  controls
                  className="w-full h-full max-h-96"
                  onError={() => {
                    // Se não conseguir carregar, mostrar mensagem
                  }}
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            </div>
          )}

          {/* Dicas */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Formatos suportados:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>YouTube: Cole o link completo do vídeo</li>
              <li>Vimeo: Cole o link completo do vídeo</li>
              <li>URL direta: Links diretos para arquivos .mp4, .webm, etc.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Input de Google Drive */}
      {isDrive && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://drive.google.com/file/d/ID_DO_ARQUIVO/view ou https://drive.google.com/open?id=ID_DO_ARQUIVO"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Preview do Google Drive */}
          {showPreview && isDriveUrl && embedUrl && (
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-900">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                  title="Google Drive video preview"
                />
              </div>
            </div>
          )}

          {/* Dicas para Google Drive */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-medium mb-2 text-blue-800">Como usar Google Drive:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Faça upload do vídeo no seu Google Drive</li>
              <li>Clique com o botão direito no arquivo e selecione "Obter link"</li>
              <li>Configure o link para "Qualquer pessoa com o link pode ver"</li>
              <li>Cole o link completo aqui</li>
            </ol>
            <p className="mt-2 text-blue-600 font-medium">
              Formato do link: https://drive.google.com/file/d/ID_DO_ARQUIVO/view
            </p>
          </div>
        </div>
      )}

      {/* Upload de arquivo */}
      {isUpload && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50 scale-[1.02] shadow-lg'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
            id="video-upload"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 font-medium">Fazendo upload do vídeo...</p>
              <p className="text-xs text-gray-500">Por favor, aguarde...</p>
            </div>
          ) : dragActive ? (
            <>
              <div className="animate-bounce">
                <FileVideo className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              </div>
              <p className="text-primary-700 font-bold text-lg mb-2">
                Solte o vídeo aqui!
              </p>
              <p className="text-sm text-primary-600">
                O arquivo será processado automaticamente
              </p>
            </>
          ) : (
            <>
              <FileVideo className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-colors group-hover:text-primary-500" />
              <p className="text-gray-700 font-medium mb-2">
                Arraste e solte um vídeo aqui
              </p>
              <p className="text-sm text-gray-500 mb-2">
                ou
              </p>
              <label
                htmlFor="video-upload"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer shadow-md hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                <span>Selecionar Vídeo do Computador</span>
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Formatos suportados: MP4, WebM, MOV, AVI • Tamanho máximo: 500MB
              </p>
              {value && value.startsWith('blob:') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Este é um preview temporário. Para salvar permanentemente, você precisará fazer upload através de um servidor ou usar Google Drive/URL.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoInput;

