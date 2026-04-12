import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './dialog';
import getCroppedImg from '../../utils/cropImage';

export function ImageCropperModal({ title = 'Adjust Image', open, imageSrc, onCropComplete, onClose, aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-neutral-900 border-neutral-800">
        <DialogHeader className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 z-10 relative">
          <DialogTitle className="text-white text-lg font-bold tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-[400px] bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={handleCropComplete}
              onZoomChange={onZoomChange}
              cropShape={aspect === 1 ? 'round' : 'rect'}
              showGrid={true}
            />
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-4 w-1/2">
            <span className="text-sm font-medium text-neutral-400">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#e6e6e6]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-white hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-sm bg-white hover:bg-neutral-200 text-black rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              {loading ? 'Processing...' : 'Apply'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
