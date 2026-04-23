import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Switch,
  FormControlLabel, Tooltip, CircularProgress, Skeleton, Alert
} from '@mui/material';
import { Add, Edit, Delete, DragIndicator, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import cms from '../../../services/cms';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
  { value: 'integer', label: 'Integer' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'file', label: 'File Upload' },
  { value: 'rating', label: 'Rating' },
  { value: 'address', label: 'Address' },
];

const TYPE_COLORS = {
  text: '#2563EB', textarea: '#2563EB', email: '#8B5CF6', phone: '#10B981',
  url: '#0EA5E9', number: '#F59E0B', integer: '#F59E0B', date: '#EC4899',
  datetime: '#EC4899', select: '#6366F1', multiselect: '#6366F1', checkbox: '#10B981',
  radio: '#6366F1', file: '#D97706', rating: '#F97316', address: '#475569',
};

const emptyField = { key: '', label: '', type: 'text', required: false, placeholder: '', helpText: '', options: [] };

const SignupFieldsTab = ({ project, onSnackbar }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({ ...emptyField });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => { loadFields(); }, [project]);

  const loadFields = async () => {
    setLoading(true);
    try {
      const { data } = await cms.raw().get('/api/signup-fields', {
        headers: { 'X-Project-Id': project.id }
      });
      const fields = Array.isArray(data) ? data : (data?.data || []);
      setFields(fields.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingField(null);
    setForm({ ...emptyField, sortOrder: fields.length });
    setOptionInput('');
    setDialogOpen(true);
  };

  const openEdit = (field) => {
    setEditingField(field);
    setForm({
      key: field.key, label: field.label, type: field.type,
      required: field.required, placeholder: field.placeholder || '',
      helpText: field.helpText || '', options: field.options || [],
    });
    setOptionInput('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) { onSnackbar?.('Label is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        key: form.key || form.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        label: form.label,
        type: form.type,
        required: form.required,
        sortOrder: form.sortOrder ?? fields.length,
        placeholder: form.placeholder || undefined,
        helpText: form.helpText || undefined,
        options: ['select', 'multiselect', 'radio'].includes(form.type) ? form.options : undefined,
      };
      if (editingField) {
        await cms.raw().patch(`/api/signup-fields/${editingField.id}`, payload, {
          headers: { 'X-Project-Id': project.id }
        });
        onSnackbar?.('Field updated', 'success');
      } else {
        await cms.raw().post('/api/signup-fields', payload, {
          headers: { 'X-Project-Id': project.id }
        });
        onSnackbar?.('Field added', 'success');
      }
      setDialogOpen(false);
      loadFields();
    } catch (err) {
      onSnackbar?.(err.message || 'Failed to save field', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await cms.raw().delete(`/api/signup-fields/${deleteId}`, {
        headers: { 'X-Project-Id': project.id }
      });
      onSnackbar?.('Field removed', 'success');
      setDeleteId(null);
      loadFields();
    } catch (err) {
      onSnackbar?.(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setForm(prev => ({
      ...prev,
      options: [...(prev.options || []), { value: optionInput.trim().toLowerCase().replace(/\s+/g, '_'), label: optionInput.trim() }]
    }));
    setOptionInput('');
  };

  const removeOption = (idx) => {
    setForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };

  const toggleActive = async (field) => {
    try {
      await cms.raw().patch(`/api/signup-fields/${field.id}`, { active: !field.active }, {
        headers: { 'X-Project-Id': project.id }
      });
      loadFields();
    } catch { /* silent */ }
  };

  if (loading) {
    return <Box>{[1,2,3].map(i => <Skeleton key={i} height={56} sx={{ mb: 1, borderRadius: 1.5 }} />)}</Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>Signup Form Fields</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>Configure what end users fill in when registering</Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" size="small" onClick={openCreate}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
          Add Field
        </Button>
      </Box>

      {fields.length === 0 ? (
        <Box sx={{ border: '2px dashed #E2E8F0', borderRadius: 1.5, p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>No signup fields configured</Typography>
          <Typography variant="caption" sx={{ color: '#CBD5E1' }}>End users will only need email and password to register</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {fields.map((field, idx) => (
            <Box key={field.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2, p: 2,
              border: '1px solid #E2E8F0', borderRadius: 1.5, bgcolor: field.active ? '#fff' : '#F8FAFC',
              opacity: field.active ? 1 : 0.6,
              '&:hover': { borderColor: '#CBD5E1' }
            }}>
              <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 700, width: 20 }}>{idx + 1}</Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>{field.label}</Typography>
                  {field.required && <Chip label="Required" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: '#FEF2F2', color: '#DC2626' }} />}
                  {!field.active && <Chip label="Inactive" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: '#F1F5F9', color: '#94A3B8' }} />}
                </Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>{field.key}</Typography>
              </Box>
              <Chip label={FIELD_TYPES.find(t => t.value === field.type)?.label || field.type} size="small"
                sx={{ fontWeight: 600, fontSize: 11, bgcolor: (TYPE_COLORS[field.type] || '#475569') + '15', color: TYPE_COLORS[field.type] || '#475569' }} />
              <Tooltip title={field.active ? 'Deactivate' : 'Activate'}>
                <Switch size="small" checked={field.active !== false} onChange={() => toggleActive(field)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }} />
              </Tooltip>
              <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(field)} sx={{ color: '#94A3B8' }}><Edit fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteId(field.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626' } }}><Delete fontSize="small" /></IconButton></Tooltip>
            </Box>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{editingField ? 'Edit Field' : 'Add Signup Field'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Field Label" value={form.label} margin="normal" autoFocus
            onChange={(e) => setForm(prev => ({
              ...prev, label: e.target.value,
              key: editingField ? prev.key : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
            }))} />
          <TextField fullWidth label="Field Key" value={form.key} margin="normal" disabled={!!editingField}
            InputProps={{ sx: { fontFamily: 'monospace' } }}
            helperText="Auto-generated, stored in user metadata" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Field Type</InputLabel>
            <Select value={form.type} label="Field Type" onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}>
              {FIELD_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Placeholder" value={form.placeholder} margin="normal"
            onChange={(e) => setForm(prev => ({ ...prev, placeholder: e.target.value }))} />
          <TextField fullWidth label="Help Text" value={form.helpText} margin="normal"
            onChange={(e) => setForm(prev => ({ ...prev, helpText: e.target.value }))} />
          <FormControlLabel sx={{ mt: 1 }}
            control={<Switch checked={form.required} onChange={(e) => setForm(prev => ({ ...prev, required: e.target.checked }))}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }} />}
            label={<Typography variant="body2" sx={{ color: '#475569' }}>Required field</Typography>} />

          {['select', 'multiselect', 'radio'].includes(form.type) && (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #E2E8F0', borderRadius: 1.5, bgcolor: '#F8FAFC' }}>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#1E293B', mb: 1, display: 'block' }}>Options</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField size="small" fullWidth placeholder="Add option..." value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }} />
                <Button size="small" variant="outlined" onClick={addOption} sx={{ textTransform: 'none', minWidth: 60 }}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(form.options || []).map((opt, i) => (
                  <Chip key={i} label={opt.label} size="small" onDelete={() => removeOption(i)}
                    sx={{ bgcolor: '#EFF6FF', color: '#2563EB', '& .MuiChip-deleteIcon': { color: '#94A3B8' } }} />
                ))}
              </Box>
              {(form.options || []).length === 0 && (
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Add at least one option</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.label.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : editingField ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Remove Field</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569' }}>This will permanently remove this signup field. Existing user data in metadata won't be affected.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1, bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignupFieldsTab;
