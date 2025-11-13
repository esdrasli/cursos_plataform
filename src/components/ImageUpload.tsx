import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { api } from '../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  maxSize?: number; // em MB (padrão: 15MB)
  recommendedSize?: string;
  accept?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = 'Selecione do computador ou arraste/solte aqui',
  maxSize = 15,
  recommendedSize,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setError('Apenas arquivos de imagem são permitidos (JPEG, JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`O arquivo é muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.url) {
        // Construir URL completa
        // Se a URL já começa com http, usar direto
        // Se começa com /uploads, construir URL completa baseada na API
        let fullUrl = response.data.url;
        
        if (!fullUrl.startsWith('http')) {
          // Em desenvolvimento, usar localhost:3001 diretamente
          // Em produção, usar VITE_API_URL
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
        }
        
        onChange(fullUrl);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.response?.data?.message || 'Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="relative">
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-contain rounded"
                onError={() => setError('Erro ao carregar imagem')}
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="URL da imagem"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 animate-spin text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-500 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-400">
                JPEG, JPG, PNG, WEBP até {maxSize}MB
              </p>
              {recommendedSize && (
                <div className="flex items-center justify-center mt-2 text-yellow-600">
                  <span className="text-xs">💡 Tamanho recomendado: {recommendedSize}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

