import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import cms from '../../services/cms';

const ImageUpload = ({
  value = null, // Current image URL
  onChange = () => {}, // Callback when image changes: (imageUrl, mediaId) => {}
  onError = () => {}, // Callback for errors: (error) => {}
  folder = 'images', // S3 folder (images, team, blog, events, etc.)
  altText = '', // Alt text for the image
  maxSize = 10, // Max file size in MB
  variant = 'button', // 'button', 'avatar', 'card', 'inline'
  width = 200, // Width for card/avatar variants
  height = 200, // Height for card variant
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  label = 'Upload Image',
  showPreview = true,
  allowDelete = true,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset previous errors
    setError(null);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
      setError(error);
      onError(error);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = `File size must be less than ${maxSize}MB`;
      setError(error);
      onError(error);
      return;
    }

    // Create preview
    if (showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }

    // Upload file
    setUploading(true);
    try {
      const response = await cms.media.register({
        file,
        folder,
        altText: altText || undefined
      });

      if (response && response.data) {
        const imageUrl = response.data.url;
        setPreviewUrl(imageUrl);
        onChange(imageUrl, response.data.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed';
      setError(errorMessage);
      onError(errorMessage);
      setPreviewUrl(value); // Revert preview
    } finally {
      setUploading(false);
      // Reset file input
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

  // Hidden file input
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={acceptedTypes.join(',')}
      onChange={handleFileSelect}
      style={{ display: 'none' }}
      disabled={disabled || uploading}
    />
  );

  // Button variant
  if (variant === 'button') {
    return (
      <Box>
        {fileInput}
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          onClick={triggerFileSelect}
          disabled={disabled || uploading}
          sx={{ mb: 1 }}
        >
          {uploading ? 'Uploading...' : label}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        {showPreview && previewUrl && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={previewUrl}
              sx={{ width: 60, height: 60 }}
            >
              <ImageIcon />
            </Avatar>
            {allowDelete && (
              <IconButton onClick={handleDelete} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Avatar variant
  if (variant === 'avatar') {
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        {fileInput}
        <Avatar
          src={previewUrl}
          sx={{
            width: width,
            height: width,
            cursor: disabled ? 'default' : 'pointer',
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'grey.300',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main'
            }
          }}
          onClick={triggerFileSelect}
        >
          {uploading ? (
            <CircularProgress size={width * 0.3} />
          ) : (
            <UploadIcon sx={{ fontSize: width * 0.3 }} />
          )}
        </Avatar>
        {allowDelete && previewUrl && !uploading && (
          <IconButton
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'error.dark'
              }
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 1, maxWidth: width }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card sx={{ width: width, height: height }}>
        {fileInput}
        {previewUrl ? (
          <>
            <CardMedia
              component="img"
              height={height - 60}
              image={previewUrl}
              alt={altText || 'Uploaded image'}
              sx={{ objectFit: 'cover' }}
            />
            <CardActions sx={{ justifyContent: 'center', p: 1 }}>
              <IconButton onClick={triggerFileSelect} disabled={disabled || uploading}>
                {uploading ? <CircularProgress size={20} /> : <EditIcon />}
              </IconButton>
              {allowDelete && (
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </CardActions>
          </>
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
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Card>
    );
  }

  // Inline variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {fileInput}
      {previewUrl && (
        <Avatar src={previewUrl} sx={{ width: 40, height: 40 }}>
          <ImageIcon />
        </Avatar>
      )}
      <Button
        variant="outlined"
        size="small"
        startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
        onClick={triggerFileSelect}
        disabled={disabled || uploading}
      >
        {uploading ? 'Uploading...' : (previewUrl ? 'Change' : 'Upload')}
      </Button>
      {allowDelete && previewUrl && (
        <IconButton onClick={handleDelete} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ImageUpload;