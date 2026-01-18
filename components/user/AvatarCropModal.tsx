'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui';

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

async function cropImageToSquareWebp(imageSrc: string, crop: Area): Promise<File> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error('Failed to create image blob'));
        else resolve(b);
      },
      'image/webp',
      0.92
    );
  });

  return new File([blob], 'avatar.webp', { type: 'image/webp' });
}

export function AvatarCropModal(props: {
  open: boolean;
  imageUrl: string | null;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const { open, imageUrl, onCancel, onConfirm } = props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSaving(false);
  }, [open, imageUrl]);

  const canSave = !!imageUrl && !!croppedAreaPixels && !saving;

  const zoomPercent = useMemo(() => Math.round(zoom * 100), [zoom]);

  const handleCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const file = await cropImageToSquareWebp(imageUrl, croppedAreaPixels);
      onConfirm(file);
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageUrl, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          if (!saving) onCancel();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Crop profile picture
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Choose the square area you want to use.
            </p>
          </div>

          <div className="p-4 space-y-4">
            <div className="relative w-full h-[360px] bg-gray-100 dark:bg-gray-950 rounded-md overflow-hidden">
              {imageUrl && (
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  showGrid={false}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
                disabled={saving}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 w-14 text-right tabular-nums">
                {zoomPercent}%
              </span>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} loading={saving} disabled={!canSave}>
              Use this crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

