import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Skeleton, Button, CircularProgress, Tooltip } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Lock } from '@mui/icons-material';
import cms from '../../../services/cms';

const CORE_ALWAYS_ON = ['health', 'auth', 'admin', 'projects', 'api-keys', 'members', 'tenant-dashboard', 'tenant-designations'];

const ModulesTab = ({ project, onSnackbar }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [initialModules, setInitialModules] = useState([]);

  useEffect(() => {
    loadModules();
  }, [project]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const [availableRes, projectRes] = await Promise.allSettled([
        cms.raw().get('/api/tenant-designations/available-modules'),
        cms.raw().get(`/api/projects/${project.id}/modules`),
      ]);

      let available = [];
      if (availableRes.status === 'fulfilled') {
        const raw = availableRes.value?.data;
        available = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
      }

      let projectModules = [];
      if (projectRes.status === 'fulfilled') {
        const raw = projectRes.value?.data;
        projectModules = raw?.enabled || raw?.data?.enabled || [];
      }

      setModules(available);
      const enabled = projectModules.length > 0 ? projectModules : available.map(m => m.name);
      setSelectedModules(enabled);
      setInitialModules([...enabled]);
    } catch {
      // optional
    } finally {
      setLoading(false);
    }
  };

  const formatName = (name) => name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const isCoreAlwaysOn = (name) => CORE_ALWAYS_ON.includes(name);

  const grouped = modules.reduce((acc, mod) => {
    const group = mod.type === 'core' ? 'Core' : 'Addon';
    if (!acc[group]) acc[group] = [];
    acc[group].push(mod);
    return acc;
  }, {});

  const toggleModule = (name) => {
    if (isCoreAlwaysOn(name)) return;
    setSelectedModules(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const hasChanges = JSON.stringify(selectedModules.slice().sort()) !== JSON.stringify(initialModules.slice().sort());

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>
        Project Modules ({modules.length} available from plan)
      </Typography>
      <Typography variant="caption" sx={{ color: '#94A3B8', mb: 3, display: 'block' }}>
        Core modules are always on. Toggle addon modules per project.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} width={120} height={36} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : (
        <Box>
          {Object.entries(grouped).map(([group, mods]) => (
            <Box key={group} sx={{ mb: 3 }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: '#1E293B', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                {group} Modules ({mods.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {mods.map(mod => {
                  const locked = isCoreAlwaysOn(mod.name);
                  const selected = locked || selectedModules.includes(mod.name);
                  return (
                    <Tooltip key={mod.name} title={locked ? 'Core module — always enabled' : ''} arrow>
                      <Chip
                        label={formatName(mod.name)}
                        onClick={() => toggleModule(mod.name)}
                        icon={locked
                          ? <Lock sx={{ fontSize: 14 }} />
                          : selected
                            ? <CheckBox sx={{ fontSize: 16 }} />
                            : <CheckBoxOutlineBlank sx={{ fontSize: 16 }} />
                        }
                        sx={{
                          fontWeight: 500, fontSize: 12,
                          cursor: locked ? 'default' : 'pointer',
                          opacity: locked ? 0.7 : 1,
                          bgcolor: locked ? '#F1F5F9' : selected ? '#EFF6FF' : '#FAFAFA',
                          color: locked ? '#64748B' : selected ? '#2563EB' : '#94A3B8',
                          border: '1px solid',
                          borderColor: locked ? '#CBD5E1' : selected ? '#BFDBFE' : '#E2E8F0',
                          '& .MuiChip-icon': { color: locked ? '#94A3B8' : selected ? '#2563EB' : '#CBD5E1' },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {hasChanges && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 3, borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
          <Button onClick={() => setSelectedModules([...initialModules])}
            sx={{ textTransform: 'none', color: '#64748B' }}>
            Discard
          </Button>
          <Button variant="contained" disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const allEnabled = [...new Set([...CORE_ALWAYS_ON, ...selectedModules])];
                await cms.raw().patch(`/api/projects/${project.id}/modules`, { enabled: allEnabled });
                onSnackbar?.('Module configuration saved', 'success');
                setInitialModules([...selectedModules]);
              } catch { onSnackbar?.('Failed to save modules', 'error'); }
              finally { setSaving(false); }
            }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ModulesTab;
