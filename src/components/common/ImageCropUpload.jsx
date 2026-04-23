import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Crop as CropIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import cms from '../../services/cms';

const ImageCropUpload = ({
  value = null,
  onChange = () => {},
  onError = () => {},
  folder = 'images',
  altText = '',
  maxSize = 10,
  width = 300,
  height = 200,
  cropAspectRatio = null, // e.g., 1 for square, 16/9 for widescreen
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  label = 'Upload Image',
  allowDelete = true,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [src, setSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);

  // Update preview URL when value prop changes (for existing images)
  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file
      if (!acceptedTypes.includes(file.type)) {
        const errorMsg = `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `File size must be less than ${maxSize}MB`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }

      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSrc(reader.result?.toString() || '');
        setCropDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e) => {
    if (cropAspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, cropAspectRatio));
    }
  }, [cropAspectRatio]);

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return {
      unit: '%',
      width: 90,
      height: 90 / aspect,
      x: 5,
      y: 5,
    };
  };

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    try {
      setUploading(true);
      setError(null);

      const croppedImageBlob = await getCroppedImg();
      if (!croppedImageBlob) {
        throw new Error('Failed to crop image');
      }

      // Step 1: Get presigned upload URL
      const presignResponse = await cms.media.presignUpload({
        filename: `${folder}-${Date.now()}.jpg`,
        contentType: 'image/jpeg',
      });
      const { url: presignedUrl, key } = presignResponse.data;

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: croppedImageBlob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3');
      }

      // Step 3: Build the public URL from the key
      const bucket = 'your-s3-bucket-name';
      const region = 'ap-south-2';
      const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      if (imageUrl) {
        setPreviewUrl(imageUrl);
        onChange(imageUrl, null);
        setCropDialogOpen(false);
        setSrc(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const rawError = error.response?.data?.error;
      const errorMessage = typeof rawError === 'string' ? rawError : rawError?.message || error.message || 'Upload failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    setPreviewUrl(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    setSrc(null);
    setScale(1);
    setRotate(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={onSelectFile}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      <Card sx={{ width: width, height: height, position: 'relative' }}>
        {previewUrl ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <CardMedia
              component="img"
              height={height}
              image={previewUrl}
              alt={altText || 'Uploaded image'}
              sx={{ objectFit: 'cover' }}
            />
            {/* Overlay buttons */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
                zIndex: 2
              }}
            >
              <IconButton
                onClick={triggerFileSelect}
                disabled={disabled || uploading}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }
                }}
              >
                {uploading ? <CircularProgress size={16} /> : <EditIcon color="primary" />}
              </IconButton>
              {allowDelete && (
                <IconButton
                  onClick={handleDelete}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: error ? 'error.main' : 'grey.300',
              cursor: disabled ? 'default' : 'pointer',
              '&:hover': {
                borderColor: disabled ? 'grey.300' : 'primary.main'
              }
            }}
            onClick={triggerFileSelect}
          >
            {uploading ? (
              <CircularProgress size={40} />
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {label}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Card>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={handleCropCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CropIcon />
            Crop Image
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Adjust the crop area and image settings as needed
            </Typography>
          </Box>

          {src && (
            <Box sx={{ mb: 3 }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropAspectRatio}
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={src}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Scale: {scale.toFixed(1)}x
            </Typography>
            <Slider
              value={scale}
              onChange={(_, value) => setScale(value)}
              min={0.5}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Rotation: {rotate}°
            </Typography>
            <Slider
              value={rotate}
              onChange={(_, value) => setRotate(value)}
              min={-180}
              max={180}
              step={1}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>

          <canvas
            ref={previewCanvasRef}
            style={{
              display: 'none'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCropCancel}
            startIcon={<CloseIcon />}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            variant="contained"
            startIcon={uploading ? <CircularProgress size={16} /> : <CheckIcon />}
            disabled={uploading || !completedCrop}
          >
            {uploading ? 'Uploading...' : 'Crop & Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageCropUpload;