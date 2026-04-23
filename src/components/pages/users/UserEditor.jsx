import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery } from '@tanstack/react-query';
import cms from '../../../services/cms';

const UserEditor = ({ user, open, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!user;

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await cms.raw().get('/user-management/roles');
      return data;
    }
  });

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    full_name: Yup.string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters')
      .required('Full name is required'),
    role_id: Yup.number()
      .required('Role is required'),
    password: isEdit
      ? Yup.string().min(6, 'Password must be at least 6 characters')
      : Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    status: Yup.string().required('Status is required')
  });

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      full_name: user?.full_name || '',
      role_id: user?.role_id || '',
      status: user?.status || 'active',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const submitData = { ...values };

        // Remove empty password for edit mode
        if (isEdit && !submitData.password) {
          delete submitData.password;
        }

        if (isEdit) {
          await updateUserMutation.mutateAsync({ id: user.id, data: submitData });
        } else {
          await createUserMutation.mutateAsync(submitData);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await cms.raw().post('/user-management/users', userData);
      return response;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Create user error:', error);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await cms.raw().put(`/user-management/users/${id}`, data);
      return response;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Update user error:', error);
    }
  });

  const isLoading = createUserMutation.isLoading || updateUserMutation.isLoading;
  const error = createUserMutation.error || updateUserMutation.error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEdit ? 'Edit User' : 'Create New User'}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.response?.data?.error || 'An error occurred'}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="full_name"
                label="Full Name"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                helperText={formik.touched.full_name && formik.errors.full_name}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.role_id && Boolean(formik.errors.role_id)}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role_id"
                  value={formik.values.role_id}
                  label="Role"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <div>
                        <Typography variant="subtitle2">
                          {role.display_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {role.description}
                        </Typography>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.role_id && formik.errors.role_id && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {formik.errors.role_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isLoading}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {formik.errors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {isEdit && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    User Information
                  </Typography>
                  <Typography variant="body2">
                    Created: {new Date(user.created_at).toLocaleString()}
                  </Typography>
                  {user.last_login && (
                    <Typography variant="body2">
                      Last Login: {new Date(user.last_login).toLocaleString()}
                    </Typography>
                  )}
                  {user.login_attempts > 0 && (
                    <Typography variant="body2" color="warning.main">
                      Login Attempts: {user.login_attempts}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserEditor;