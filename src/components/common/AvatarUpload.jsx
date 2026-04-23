import React, { useState, useRef, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Slider, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, RotateRight, RotateLeft, ZoomIn, Close, Person } from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const AvatarUpload = ({ value, onChange, onUpload, initials, size = 96 }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setRotation(0);
      setZoom(1);
      setCrop({ unit: '%', width: 80, aspect: 1 });
      setCompletedCrop(null);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onImageLoad = useCallback((e) => {
    const img = e.currentTarget;
    imgRef.current = img;
    const aspect = img.width / img.height;
    let widthPct, heightPct;
    if (aspect >= 1) {
      heightPct = 80;
      widthPct = (heightPct / aspect);
    } else {
      widthPct = 80;
      heightPct = (widthPct * aspect);
    }
    const initialCrop = { unit: '%', x: (100 - widthPct) / 2, y: (100 - heightPct) / 2, width: widthPct, height: heightPct };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

  const getCroppedCanvas = useCallback(() => {
    if (!imgRef.current) return null;
    const activeCrop = completedCrop || crop;
    if (!activeCrop || !activeCrop.width || !activeCrop.height) return null;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropPx = activeCrop.unit === '%'
      ? { x: (activeCrop.x / 100) * image.width, y: (activeCrop.y / 100) * image.height, width: (activeCrop.width / 100) * image.width, height: (activeCrop.height / 100) * image.height }
      : activeCrop;
    const pixelCrop = {
      x: cropPx.x * scaleX,
      y: cropPx.y * scaleY,
      width: cropPx.width * scaleX,
      height: cropPx.height * scaleY,
    };

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-outputSize / 2, -outputSize / 2);

    const sx = pixelCrop.x;
    const sy = pixelCrop.y;
    const sw = pixelCrop.width;
    const sh = pixelCrop.height;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
    ctx.restore();

    return canvas;
  }, [completedCrop, crop, rotation, zoom]);

  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    const canvas = getCroppedCanvas();
    if (!canvas) {
      setError('Please select a crop area first');
      return;
    }

    setUploading(true);
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (onUpload) {
        const url = await onUpload(blob, 'profile.jpg', 'image/jpeg');
        onChange?.(url);
      } else {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onChange?.(dataUrl);
      }
      setDialogOpen(false);
      setImageSrc(null);
    } catch (err) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.error || err?.message || 'Upload failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const avatarInitials = initials || '?';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileSelect} />

      {/* Avatar Preview */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          width: size, height: size, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
          border: '3px solid #E2E8F0', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', '&:hover .overlay': { opacity: 1 },
        }}
      >
        {value ? (
          <img src={value} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Typography sx={{ fontSize: size * 0.35, fontWeight: 700, color: '#2563EB' }}>{avatarInitials}</Typography>
        )}
        <Box className="overlay" sx={{
          position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s',
        }}>
          <CloudUpload sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
      </Box>

      <Button size="small" startIcon={<CloudUpload sx={{ fontSize: 14 }} />} onClick={() => fileInputRef.current?.click()}
        sx={{ textTransform: 'none', fontSize: 12, color: '#2563EB', fontWeight: 600 }}>
        {value ? 'Change Photo' : 'Upload Photo'}
      </Button>

      {/* Crop Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Crop & Adjust Photo
          <IconButton size="small" onClick={() => setDialogOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {imageSrc && (
            <Box>
              <Box sx={{ maxHeight: 400, overflow: 'auto', display: 'flex', justifyContent: 'center', bgcolor: '#F1F5F9', borderRadius: 1.5, p: 1 }}>
                <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop} aspect={1} circularCrop>
                  <img onLoad={onImageLoad} src={imageSrc} alt="Crop" style={{
                    maxWidth: '100%', maxHeight: 380,
                    transform: `rotate(${rotation}deg) scale(${zoom})`, transformOrigin: 'center',
                  }} />
                </ReactCrop>
              </Box>

              {/* Controls */}
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Rotation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton size="small" onClick={() => setRotation(r => r - 90)} sx={{ border: '1px solid #E2E8F0' }}>
                    <RotateLeft fontSize="small" />
                  </IconButton>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>Rotation: {rotation}°</Typography>
                    <Slider value={rotation} onChange={(_, v) => setRotation(v)} min={-180} max={180} size="small"
                      sx={{ color: '#2563EB' }} />
                  </Box>
                  <IconButton size="small" onClick={() => setRotation(r => r + 90)} sx={{ border: '1px solid #E2E8F0' }}>
                    <RotateRight fontSize="small" />
                  </IconButton>
                </Box>

                {/* Zoom */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ZoomIn sx={{ color: '#475569', fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>Zoom: {zoom.toFixed(1)}x</Typography>
                    <Slider value={zoom} onChange={(_, v) => setZoom(v)} min={0.5} max={3} step={0.1} size="small"
                      sx={{ color: '#2563EB' }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        {error && <Alert severity="error" sx={{ mx: 3, mb: 1, borderRadius: 1 }}>{error}</Alert>}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={uploading}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {uploading ? <CircularProgress size={20} color="inherit" /> : 'Save Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvatarUpload;
