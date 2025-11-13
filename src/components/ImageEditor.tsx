import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Crop, X, Check, RotateCw } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ImageEditorProps {
  value?: string;
  onChange: (config: ImageConfig) => void;
  placeholder?: string;
  maxSize?: number;
  recommendedSize?: string;
}

export interface ImageConfig {
  url: string;
  scale?: number; // 0.1 a 3.0
  position?: { x: number; y: number }; // -50 a 50 (percent)
  crop?: {
    x: number; // 0 a 100
    y: number; // 0 a 100
    width: number; // 0 a 100
    height: number; // 0 a 100
  };
  rotation?: number; // 0 a 360
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  value,
  onChange,
  placeholder,
  maxSize = 15,
  recommendedSize
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [config, setConfig] = useState<ImageConfig>({
    url: '',
    scale: 1,
    position: { x: 50, y: 50 },
    crop: { x: 0, y: 0, width: 100, height: 100 },
    rotation: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTool, setActiveTool] = useState<'move' | 'crop' | 'zoom'>('move');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (value) {
      try {
        let parsed: any;
        if (typeof value === 'string') {
          // Tentar parsear como JSON
          if (value.startsWith('{') || value.startsWith('[')) {
            parsed = JSON.parse(value);
          } else {
            // É uma URL simples
            parsed = { url: value };
          }
        } else {
          // Já é um objeto
          parsed = value;
        }
        
        const url = parsed.url || (typeof value === 'string' && !value.startsWith('{') ? value : '');
        if (url) {
          setConfig({
            url: url,
            scale: parsed.scale || 1,
            position: parsed.position || { x: 50, y: 50 },
            crop: parsed.crop || { x: 0, y: 0, width: 100, height: 100 },
            rotation: parsed.rotation || 0
          });
          setImageUrl(url);
        }
      } catch (e) {
        // Se falhar, tratar como URL simples
        if (typeof value === 'string' && !value.startsWith('{')) {
          setConfig({
            url: value,
            scale: 1,
            position: { x: 50, y: 50 },
            crop: { x: 0, y: 0, width: 100, height: 100 },
            rotation: 0
          });
          setImageUrl(value);
        }
      }
    } else {
      // Limpar quando não houver valor
      setImageUrl('');
      setConfig({
        url: '',
        scale: 1,
        position: { x: 50, y: 50 },
        crop: { x: 0, y: 0, width: 100, height: 100 },
        rotation: 0
      });
    }
  }, [value]);

  const handleImageUpload = (url: string) => {
    if (!url) {
      setImageUrl('');
      setConfig({
        url: '',
        scale: 1,
        position: { x: 50, y: 50 },
        crop: { x: 0, y: 0, width: 100, height: 100 },
        rotation: 0
      });
      onChange({ url: '', scale: 1, position: { x: 50, y: 50 }, crop: { x: 0, y: 0, width: 100, height: 100 }, rotation: 0 });
      return;
    }
    
    const newConfig: ImageConfig = {
      url,
      scale: 1,
      position: { x: 50, y: 50 },
      crop: { x: 0, y: 0, width: 100, height: 100 },
      rotation: 0
    };
    setConfig(newConfig);
    setImageUrl(url);
    onChange(newConfig);
    setIsEditing(false); // Não entrar em modo de edição automaticamente
  };

  const handleSave = () => {
    onChange(config);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Recarregar configuração do value original
    if (value) {
      try {
        let parsed: any;
        if (typeof value === 'string') {
          if (value.startsWith('{') || value.startsWith('[')) {
            parsed = JSON.parse(value);
          } else {
            parsed = { url: value };
          }
        } else {
          parsed = value;
        }
        
        const url = parsed.url || (typeof value === 'string' && !value.startsWith('{') ? value : '');
        if (url) {
          setConfig({
            url: url,
            scale: parsed.scale || 1,
            position: parsed.position || { x: 50, y: 50 },
            crop: parsed.crop || { x: 0, y: 0, width: 100, height: 100 },
            rotation: parsed.rotation || 0
          });
          setImageUrl(url);
        }
      } catch {
        if (typeof value === 'string' && !value.startsWith('{')) {
          setConfig({
            url: value,
            scale: 1,
            position: { x: 50, y: 50 },
            crop: { x: 0, y: 0, width: 100, height: 100 },
            rotation: 0
          });
          setImageUrl(value);
        }
      }
    }
    setIsEditing(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'move' && imageUrl) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - (config.position?.x || 50),
        y: e.clientY - (config.position?.y || 50)
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && activeTool === 'move' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setConfig(prev => ({
        ...prev,
        position: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    setConfig(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(3, (prev.scale || 1) + delta))
    }));
  };

  const handleRotation = () => {
    setConfig(prev => ({
      ...prev,
      rotation: ((prev.rotation || 0) + 90) % 360
    }));
  };

  const getImageStyle = (): React.CSSProperties => {
    const scale = config.scale || 1;
    const position = config.position || { x: 50, y: 50 };
    const crop = config.crop || { x: 0, y: 0, width: 100, height: 100 };
    const rotation = config.rotation || 0;

    return {
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transformOrigin: `${position.x}% ${position.y}%`,
      objectPosition: `${position.x}% ${position.y}%`,
      objectFit: 'cover',
      clipPath: `inset(${crop.y}% ${100 - crop.x - crop.width}% ${100 - crop.y - crop.height}% ${crop.x}%)`
    };
  };

  // Se não houver imagem, mostrar upload
  if (!imageUrl) {
    return (
      <ImageUpload
        value=""
        onChange={handleImageUpload}
        placeholder={placeholder}
        maxSize={maxSize}
        recommendedSize={recommendedSize}
      />
    );
  }

  return (
    <div className="space-y-4">
      {!isEditing && imageUrl && (
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
            style={getImageStyle()}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', imageUrl);
              setImageUrl('');
            }}
          />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Editar Imagem
          </button>
        </div>
      )}

      {isEditing && imageUrl && (
        <div className="space-y-4">
          {/* Preview Area */}
          <div
            ref={containerRef}
            className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Editor"
              className="w-full h-full object-cover"
              style={getImageStyle()}
              draggable={false}
            />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-gray-300 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-gray-300" />
                ))}
              </div>
            </div>

            {/* Position indicator */}
            {activeTool === 'move' && config.position && (
              <div
                className="absolute w-4 h-4 bg-purple-600 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${config.position.x}%`,
                  top: `${config.position.y}%`
                }}
              />
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTool('move')}
                className={`p-2 rounded ${activeTool === 'move' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                title="Mover"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool('zoom')}
                className={`p-2 rounded ${activeTool === 'zoom' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                title="Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotation}
                className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
                title="Rotacionar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {activeTool === 'zoom' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleScaleChange(-0.1)}
                  className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
                  title="Diminuir"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 min-w-[60px] text-center">
                  {Math.round((config.scale || 1) * 100)}%
                </span>
                <button
                  onClick={() => handleScaleChange(0.1)}
                  className="p-2 rounded bg-white text-gray-700 hover:bg-gray-100"
                  title="Aumentar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Zoom: {Math.round((config.scale || 1) * 100)}%
              </label>
              <input
                type="range"
                min="10"
                max="300"
                value={(config.scale || 1) * 100}
                onChange={(e) => setConfig(prev => ({ ...prev, scale: parseInt(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Posição X: {Math.round(config.position?.x || 50)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.position?.x || 50}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    position: { ...(prev.position || { x: 50, y: 50 }), x: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Posição Y: {Math.round(config.position?.y || 50)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.position?.y || 50}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    position: { ...(prev.position || { x: 50, y: 50 }), y: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Upload new image */}
          <div className="border-t pt-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">Trocar Imagem</label>
            <ImageUpload
              value=""
              onChange={handleImageUpload}
              placeholder="Selecione uma nova imagem"
              maxSize={maxSize}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;

