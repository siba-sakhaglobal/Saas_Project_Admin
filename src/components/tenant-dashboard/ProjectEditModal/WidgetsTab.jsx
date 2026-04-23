import React, { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, Chip, Button, CircularProgress, Skeleton } from '@mui/material';
import cms from '../../../services/cms';

const TYPE_CONFIG = {
  stat_card: { label: 'Stat', color: '#2563EB' },
  counter: { label: 'Counter', color: '#10B981' },
  chart_line: { label: 'Line Chart', color: '#8B5CF6' },
  chart_bar: { label: 'Bar Chart', color: '#F59E0B' },
  chart_donut: { label: 'Donut', color: '#EC4899' },
  activity_feed: { label: 'Activity', color: '#F97316' },
};

const WidgetsTab = ({ project, onSnackbar }) => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState([]);

  useEffect(() => {
    loadWidgets();
  }, [project]);

  const loadWidgets = async () => {
    setLoading(true);
    try {
      const { data } = await cms.raw().get(`/api/projects/${project.id}/widgets`);
      const widgets = Array.isArray(data) ? data : (data?.data || []);
      const selected = widgets.filter(w => w.selected).map(w => w.id);
      setWidgets(widgets);
      setSelectedIds(selected);
      setInitialSelectedIds([...selected]);
    } catch (err) {
      onSnackbar?.('Failed to load widgets', 'error');
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  };

  const formatModuleName = (key) => key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const grouped = widgets.reduce((acc, w) => {
    const group = w.moduleKey || 'Other';
    (acc[group] = acc[group] || []).push(w);
    return acc;
  }, {});

  const toggleWidget = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAllInGroup = (group, mods) => {
    const ids = mods.map(m => m.id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const hasChanges = JSON.stringify(selectedIds.sort()) !== JSON.stringify(initialSelectedIds.slice().sort());

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { widgets: widgets.filter(w => selectedIds.includes(w.id)).map((w, i) => ({ widgetId: w.id, enabled: true, sortOrder: i })) };
      await cms.raw().put(`/api/projects/${project.id}/widgets`, payload);
      onSnackbar?.('Widget configuration saved', 'success');
      setInitialSelectedIds([...selectedIds]);
    } catch (err) {
      onSnackbar?.(err.message || 'Failed to save widgets', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box>{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} height={200} sx={{ mb: 2, borderRadius: 1.5 }} />)}</Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>Dashboard Widgets</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>Select which widgets appear on the project dashboard</Typography>
        </Box>
        <Chip label={`${selectedIds.length} of ${widgets.length} selected`} size="small" sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
      </Box>

      {widgets.length === 0 ? (
        <Box sx={{ border: '2px dashed #E2E8F0', borderRadius: 1.5, p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>No widgets available</Typography>
          <Typography variant="caption" sx={{ color: '#CBD5E1' }}>Enable modules to add widgets to your dashboard</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(grouped).map(([group, mods]) => {
            const ids = mods.map(m => m.id);
            const allSelected = ids.every(id => selectedIds.includes(id));
            const someSelected = ids.some(id => selectedIds.includes(id));
            return (
              <Box key={group}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1.5, borderBottom: '1px solid #E2E8F0' }}>
                  <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={() => toggleAllInGroup(group, mods)} sx={{ color: '#E2E8F0', '&.Mui-checked': { color: '#2563EB' } }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                    {formatModuleName(group)} ({mods.length})
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 4.5 }}>
                  {mods.map(widget => {
                    const selected = selectedIds.includes(widget.id);
                    const type = TYPE_CONFIG[widget.type] || { label: widget.type, color: '#475569' };
                    return (
                      <Box key={widget.id} onClick={() => toggleWidget(widget.id)} sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 2, p: 2,
                        border: '1px solid', borderColor: selected ? '#BFDBFE' : '#E2E8F0', borderRadius: 1.5,
                        bgcolor: selected ? '#FAFBFF' : '#fff', cursor: 'pointer', transition: 'all 0.2s ease',
                        '&:hover': { borderColor: selected ? '#93C5FD' : '#CBD5E1', bgcolor: selected ? '#F0F6FF' : '#F8FAFC' },
                      }}>
                        <Checkbox checked={selected} onClick={(e) => e.stopPropagation()} onChange={() => toggleWidget(widget.id)} sx={{ color: '#E2E8F0', '&.Mui-checked': { color: '#2563EB' }, mt: 0.5 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            {widget.icon && <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0.75, bgcolor: type.color + '15', color: type.color, fontSize: 12 }}>{widget.icon}</Box>}
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>{widget.title}</Typography>
                          </Box>
                          {widget.description && <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>{widget.description}</Typography>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexShrink: 0 }}>
                          <Chip label={type.label} size="small" sx={{ fontWeight: 600, fontSize: 11, bgcolor: type.color + '15', color: type.color, height: 22 }} />
                          {widget.size && <Chip label={widget.size} size="small" sx={{ fontWeight: 500, fontSize: 11, bgcolor: '#F1F5F9', color: '#64748B', height: 22 }} />}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {hasChanges && (
        <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end' }}>
          <Button onClick={() => setSelectedIds([...initialSelectedIds])} sx={{ textTransform: 'none', color: '#64748B' }}>Discard</Button>
          <Button variant="contained" disabled={saving} onClick={handleSave} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default WidgetsTab;
