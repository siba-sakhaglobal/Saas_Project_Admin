import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, IconButton, Tooltip, Tabs, Tab,
  Select, MenuItem, FormControl, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, ViewCarousel as BannerIcon,
  Edit as EditIcon, Delete as DeleteIcon, ContentCopy as DuplicateIcon,
  CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, EventBusy as EventBusyIcon,
  OpenInNew as LinkIcon, Visibility as ViewIcon, MouseOutlined as ClickIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import cms from '../../../services/cms';

const STATUS_COLORS = { active: '#16A34A', inactive: '#94A3B8', scheduled: '#2563EB', expired: '#D97706' };
const PLACEMENT_COLORS = { homepage: '#2563EB', sidebar: '#7C3AED', footer: '#475569', popup: '#EC4899' };
const PLACEMENT_LABELS = { homepage: 'Homepage', sidebar: 'Sidebar', footer: 'Footer', popup: 'Popup' };

const BannersManager = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, scheduled: 0, inactive: 0, expired: 0, byPlacement: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [placementFilter, setPlacementFilter] = useState('');

  const tabFilters = [null, 'active', 'scheduled', 'inactive', 'expired'];
  const tabLabels = ['All', 'Active', 'Scheduled', 'Inactive', 'Expired'];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, bannersRes] = await Promise.all([
        cms.banners.stats(),
        cms.banners.list({ page: 1, limit: 50 })
      ]);
      setStats(statsRes.data || statsRes);
      const data = bannersRes.data;
      setBanners(Array.isArray(data) ? data : data?.banners || []);
    } catch (err) {
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try { await cms.banners.delete(id); loadData(); }
    catch { setError('Failed to delete'); }
  };

  const handleDuplicate = async (banner) => {
    try {
      await cms.banners.create({
        title: `${banner.title} (Copy)`, subtitle: banner.subtitle,
        placement: banner.placement, bgColor: banner.bgColor, textColor: banner.textColor,
        linkUrl: banner.linkUrl, linkTarget: banner.linkTarget, status: 'inactive', sortOrder: banner.sortOrder + 1,
      });
      loadData();
    } catch { setError('Failed to duplicate'); }
  };

  const filtered = (banners || []).filter(b => {
    const matchSearch = !searchTerm || b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = !tabFilters[tabValue] || b.status === tabFilters[tabValue];
    const matchPlacement = !placementFilter || b.placement === placementFilter;
    return matchSearch && matchTab && matchPlacement;
  });

  return (
    <Box sx={{ pb: 4 }}>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 1.5 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Banners</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Manage website banners, sliders, and promotional content</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('new')}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Create Banner
        </Button>
      </Box>

      <StatCardsGrid>
        <StatCard label="Total Banners" value={stats.total || 0} color="#2563EB" icon={BannerIcon} />
        <StatCard label="Active" value={stats.active || 0} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Scheduled" value={stats.scheduled || 0} color="#2563EB" icon={ScheduleIcon} />
        <StatCard label="Expired" value={stats.expired || 0} color="#D97706" icon={EventBusyIcon} />
      </StatCardsGrid>

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
          sx={{ px: 2, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}>
          {tabLabels.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search banners..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)} displayEmpty
              sx={{ borderRadius: 1.5 }}>
              <MenuItem value="">All Placements</MenuItem>
              {Object.entries(PLACEMENT_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: PLACEMENT_COLORS[k] }} />
                    {v}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <BannerIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No banners found</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('new')} sx={{ mt: 2, bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
              Create First Banner
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5, p: 2.5 }}>
            {filtered.map((b) => (
              <Box key={b.id} sx={{
                border: '1px solid #E2E8F0', borderRadius: 3, overflow: 'hidden', bgcolor: '#fff',
                transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: '#CBD5E1' },
              }}>
                {/* Banner Preview */}
                <Box sx={{
                  p: 3, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  bgcolor: b.bgColor || '#1E293B', color: b.textColor || '#fff',
                  backgroundImage: b.imageUrl ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${b.imageUrl})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }}>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, mb: 0.5, textShadow: b.imageUrl ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>
                    {b.title}
                  </Typography>
                  {b.subtitle && (
                    <Typography sx={{ fontSize: '0.8125rem', opacity: 0.9, textShadow: b.imageUrl ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}>
                      {b.subtitle}
                    </Typography>
                  )}
                </Box>

                {/* Info Section */}
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label={PLACEMENT_LABELS[b.placement] || b.placement} size="small"
                      sx={{ fontSize: '0.6875rem', fontWeight: 700, bgcolor: `${PLACEMENT_COLORS[b.placement] || '#999'}15`, color: PLACEMENT_COLORS[b.placement] || '#999', borderRadius: 1 }} />
                    <Chip label={b.status} size="small"
                      sx={{ fontSize: '0.6875rem', fontWeight: 700, bgcolor: `${STATUS_COLORS[b.status]}15`, color: STATUS_COLORS[b.status], borderRadius: 1, textTransform: 'capitalize' }} />
                    {b.linkUrl && (
                      <Chip icon={<LinkIcon sx={{ fontSize: 12 }} />} label="Has Link" size="small"
                        sx={{ fontSize: '0.625rem', height: 20, bgcolor: '#F1F5F9', color: '#64748B' }} />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ClickIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{b.clickCount || 0} clicks</Typography>
                      </Box>
                      {b.startDate && (
                        <Typography sx={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                          {dayjs(b.startDate).format('MMM D')} — {b.endDate ? dayjs(b.endDate).format('MMM D, YYYY') : 'Ongoing'}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: '0.6875rem', color: '#CBD5E1' }}>#{b.sortOrder}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => navigate(`edit/${b.id}`)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicate(b)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#7C3AED', bgcolor: '#F3E8FF' } }}>
                          <DuplicateIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(b.id)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BannersManager;
