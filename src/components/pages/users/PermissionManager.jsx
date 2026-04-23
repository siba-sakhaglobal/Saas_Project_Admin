import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import cms from '../../../services/cms';

const PermissionManager = ({ user, open, onClose, onSuccess }) => {
  const [userPermissions, setUserPermissions] = useState({});

  // Fetch user details with permissions
  const {
    data: userDetails,
    isLoading: loadingUser
  } = useQuery({
    queryKey: ['user-details', user.id],
    queryFn: async () => {
      const { data } = await cms.raw().get(`/user-management/users/${user.id}`);
      return data;
    },
    enabled: open && !!user.id
  });

  // Fetch all permissions grouped by module
  const {
    data: permissions = {},
    isLoading: loadingPermissions
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await cms.raw().get('/user-management/permissions');
      return data;
    }
  });

  // Update user permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissionsData) => {
      await cms.raw().put(`/user-management/users/${user.id}/permissions`, {
        permissions: permissionsData
      });
    },
    onSuccess: () => {
      onSuccess();
    }
  });

  useEffect(() => {
    if (userDetails) {
      // Initialize user permissions state
      const initialPermissions = {};

      // Add individual user permissions (overrides)
      userDetails.user_permissions.forEach(perm => {
        initialPermissions[perm.id] = perm.granted;
      });

      setUserPermissions(initialPermissions);
    }
  }, [userDetails]);

  const handlePermissionChange = (permissionId, granted) => {
    setUserPermissions(prev => ({
      ...prev,
      [permissionId]: granted
    }));
  };

  const handleSave = () => {
    const permissionsArray = Object.entries(userPermissions).map(([permissionId, granted]) => ({
      permission_id: parseInt(permissionId),
      granted
    }));

    updatePermissionsMutation.mutate(permissionsArray);
  };

  const hasRolePermission = (permissionId) => {
    return userDetails?.role_permissions?.some(perm => perm.id === permissionId);
  };

  const getPermissionStatus = (permissionId) => {
    const hasRole = hasRolePermission(permissionId);
    const userOverride = userPermissions[permissionId];

    if (userOverride !== undefined) {
      return {
        granted: userOverride,
        source: 'user',
        color: userOverride ? 'success' : 'error'
      };
    }

    if (hasRole) {
      return {
        granted: true,
        source: 'role',
        color: 'primary'
      };
    }

    return {
      granted: false,
      source: 'none',
      color: 'default'
    };
  };

  const getModuleIcon = (moduleName) => {
    // You can customize icons per module
    return <SecurityIcon />;
  };

  if (loadingUser || loadingPermissions) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography>Loading...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SecurityIcon sx={{ mr: 2 }} />
          Manage Permissions for {user.full_name}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* User Role Info */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Role: {userDetails?.role_display_name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Role Level: {userDetails?.role_level}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Permission Priority:</strong> Individual user permissions override role permissions.
              Green badges indicate permissions granted by role, blue badges indicate user-specific overrides.
            </Typography>
          </Alert>
        </Paper>

        {/* Permission Legend */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Permission Status Legend:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              size="small"
              icon={<CheckIcon />}
              label="Granted by Role"
              color="primary"
              variant="outlined"
            />
            <Chip
              size="small"
              icon={<CheckIcon />}
              label="Granted by User Override"
              color="success"
              variant="outlined"
            />
            <Chip
              size="small"
              icon={<CloseIcon />}
              label="Denied by User Override"
              color="error"
              variant="outlined"
            />
            <Chip
              size="small"
              label="Not Granted"
              color="default"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Permissions by Module */}
        {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
          <Accordion key={moduleName} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                {getModuleIcon(moduleName)}
                <Typography variant="h6" sx={{ ml: 2, textTransform: 'capitalize' }}>
                  {moduleName} Module
                </Typography>
                <Box ml="auto" mr={2}>
                  <Chip
                    size="small"
                    label={`${modulePermissions.length} permissions`}
                    color="default"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {modulePermissions.map((permission) => {
                  const status = getPermissionStatus(permission.id);
                  return (
                    <Grid item xs={12} md={6} key={permission.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          border: status.granted ? `1px solid ${status.color === 'success' ? '#4caf50' : '#2196f3'}` : undefined
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="subtitle2" gutterBottom>
                              {permission.display_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {permission.description}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              <Chip
                                size="small"
                                label={permission.action}
                                color="default"
                                variant="outlined"
                              />
                              {status.source === 'role' && (
                                <Chip
                                  size="small"
                                  icon={<CheckIcon />}
                                  label="Role"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {status.source === 'user' && (
                                <Chip
                                  size="small"
                                  icon={status.granted ? <CheckIcon /> : <CloseIcon />}
                                  label="User Override"
                                  color={status.color}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <Box>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={userPermissions[permission.id] ?? false}
                                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={userPermissions[permission.id] ? 'Grant' : 'Deny'}
                              labelPlacement="top"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {updatePermissionsMutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to update permissions: {updatePermissionsMutation.error.message}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={updatePermissionsMutation.isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={updatePermissionsMutation.isLoading}
        >
          {updatePermissionsMutation.isLoading ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionManager;