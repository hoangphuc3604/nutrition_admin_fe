import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';

interface ImageUploadProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number;
  error?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  placeholder = "Click to upload or drag and drop",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  error,
  className = ""
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    onChange(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5" /> {label}
        </Label>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : preview
            ? 'border-gray-300'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
        } ${error ? 'border-destructive' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {value?.name} ({(value.size / (1024 * 1024)).toFixed(1)}MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {placeholder}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, JPEG up to {maxSize / (1024 * 1024)}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
