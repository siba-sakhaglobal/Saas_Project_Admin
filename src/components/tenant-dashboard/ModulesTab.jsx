import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, Alert, Skeleton
} from '@mui/material';
import { Extension, Refresh } from '@mui/icons-material';
import cms from '../../services/cms';

const ModulesTab = () => {
  const [modulesData, setModulesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await cms.raw().get('/api/tenant-dashboard/modules');
      setModulesData(data || {});
    } catch (err) {
      console.error('Failed to load modules:', err);
      setError(err.message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const formatModuleName = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const ModuleCard = ({ name, enabled }) => (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        opacity: enabled ? 1 : 0.65,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: enabled ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)'
        }
      }}
      elevation={0}
    >
      <Box sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: enabled ? '#EFF6FF' : '#F1F5F9',
        color: enabled ? '#2563EB' : '#94A3B8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        fontSize: 32
      }}>
        <Extension sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', textAlign: 'center', mb: 1.5 }}>
        {formatModuleName(name)}
      </Typography>
      <Chip
        label={enabled ? 'Enabled' : 'Disabled'}
        size="small"
        sx={{
          borderRadius: 1.5,
          fontWeight: 600,
          fontSize: 11,
          bgcolor: enabled ? '#ECFDF5' : '#F1F5F9',
          color: enabled ? '#059669' : '#64748B'
        }}
      />
      {!enabled && (
        <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1.5, textAlign: 'center', fontSize: 11 }}>
          Upgrade to unlock
        </Typography>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            Modules
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Available features for your plan
          </Typography>
        </Box>
        {modulesData?.planName && (
          <Chip
            label={modulesData.planName}
            sx={{
              borderRadius: 1.5,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 600,
              fontSize: 12,
              height: 28
            }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Core Modules */}
      {modulesData?.coreModules && modulesData.coreModules.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B', mb: 2.5, fontSize: 14 }}>
            Core Modules
          </Typography>
          <Grid container spacing={2.5}>
            {modulesData.coreModules.map((mod) => (
              <Grid item xs={12} sm={6} md={4} key={mod.name}>
                <ModuleCard name={mod.name} enabled={mod.enabled} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Add-on Modules */}
      {modulesData?.addonModules && modulesData.addonModules.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B', mb: 2.5, fontSize: 14 }}>
            Add-on Modules
          </Typography>
          <Grid container spacing={2.5}>
            {modulesData.addonModules.map((mod) => (
              <Grid item xs={12} sm={6} md={4} key={mod.name}>
                <ModuleCard name={mod.name} enabled={mod.enabled} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {(!modulesData?.coreModules || modulesData.coreModules.length === 0) && (!modulesData?.addonModules || modulesData.addonModules.length === 0) && (
        <Card sx={{ borderRadius: 3, border: '2px dashed #CBD5E1', boxShadow: 'none', p: 6, textAlign: 'center' }} elevation={0}>
          <Extension sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
            No modules available
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Modules data could not be loaded
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default ModulesTab;
