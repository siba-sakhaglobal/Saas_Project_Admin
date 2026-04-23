import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert, Button, Skeleton,
  LinearProgress
} from '@mui/material';
import {
  FolderOpen, People, Key, WorkspacePremium, Storage, Speed, ArrowForward,
  TrendingUp, Image, Description, MoreHoriz
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import cms from '../../services/cms';

const OverviewTab = ({ onActivityClick, onTabSwitch }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  // Generate placeholder chart data
  const generateChartData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calls: Math.floor(Math.random() * 450 + 50)
      });
    }
    return data;
  };

  const storageData = [
    { name: 'Media', value: 60, color: '#2563EB' },
    { name: 'Documents', value: 25, color: '#10B981' },
    { name: 'Other', value: 15, color: '#F59E0B' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch dashboard overview data
        try {
          const { data } = await cms.raw().get('/api/tenant-dashboard/overview');
          setStats(data || {});
        } catch (err) {
          console.warn('Failed to fetch overview stats:', err);
          setStats({});
        }

        // Fetch recent activity
        try {
          const { data: actData } = await cms.raw().get('/api/tenant-dashboard/activity?page=1&limit=5');
          setActivity(Array.isArray(actData) ? actData : []);
        } catch (err) {
          console.warn('Failed to fetch activity:', err);
          setActivity([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const chartData = generateChartData();

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Stats + Quick Actions — 2 column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 3, mb: 4 }}>
        {/* Left: Stat Cards — 3 per row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {[
            { icon: <FolderOpen />, bg: '#EFF6FF', color: '#2563EB', value: stats?.projectCount ?? 0, label: 'Projects', sub: `/ ${stats?.planLimits?.maxProjects ?? '∞'}` },
            { icon: <People />, bg: '#ECFDF5', color: '#10B981', value: stats?.memberCount ?? 0, label: 'Members', sub: 'active' },
            { icon: <Key />, bg: '#FEF3C7', color: '#D97706', value: stats?.activeApiKeyCount ?? 0, label: 'API Keys', sub: `${stats?.totalApiKeyCount ?? 0} total` },
            { icon: <WorkspacePremium />, bg: '#F5F3FF', color: '#8B5CF6', value: stats?.planDisplayName ?? 'Free', label: 'Plan', sub: stats?.planName === 'free' ? 'Upgrade →' : 'Active' },
            { icon: <Storage />, bg: '#EDE9FE', color: '#A78BFA', value: '0 MB', label: 'Storage', sub: `/ ${stats?.planLimits?.maxStorageMb ?? '—'} MB` },
            { icon: <Speed />, bg: '#DBEAFE', color: '#0284C7', value: '0', label: 'API Calls', sub: '/ month' },
          ].map((card) => (
            <Card key={card.label} sx={{ borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: 'none' }} elevation={0}>
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#1E293B', lineHeight: 1.2 }}>{card.value}</Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>{card.label} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>{card.sub}</Typography></Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Right: Quick Actions */}
        <Card sx={{ borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: 'none', alignSelf: 'start' }} elevation={0}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1E293B', mb: 2 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Create Project', color: '#2563EB', bg: '#EFF6FF', tab: 1 },
                { label: 'Invite Member', color: '#10B981', bg: '#ECFDF5', tab: 2 },
                { label: 'Generate API Key', color: '#D97706', bg: '#FEF3C7', tab: 4 },
                { label: 'View Orders', color: '#8B5CF6', bg: '#F5F3FF', tab: 5 },
                { label: 'Manage Designations', color: '#EC4899', bg: '#FDF2F8', tab: 3 },
              ].map((action) => (
                <Box key={action.label} onClick={() => onTabSwitch?.(action.tab)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1,
                  cursor: 'pointer', '&:hover': { bgcolor: action.bg },
                  transition: 'background-color 0.15s',
                }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: action.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>{action.label}</Typography>
                  <ArrowForward sx={{ fontSize: 14, color: '#CBD5E1', ml: 'auto' }} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts — 3 in a row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2.5,
        mb: 5,
      }}>
        {/* API Usage Chart */}
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} elevation={0}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B' }}>API Usage</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Last 30 days</Typography>
              </Box>
              <TrendingUp sx={{ color: '#10B981', fontSize: 18 }} />
            </Box>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: 10 }} tick={{ fontSize: 10 }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: 10 }} tick={{ fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="calls" stroke="#2563EB" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Storage Breakdown */}
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} elevation={0}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B' }}>Storage Breakdown</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>By file type</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={storageData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" isAnimationActive={false}>
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              {storageData.map((item) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: 11 }}>{item.name} {item.value}%</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Projects by Status */}
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} elevation={0}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B' }}>Projects Overview</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Active vs Archived</Typography>
            </Box>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: stats?.activeProjectCount || 1, color: '#10B981' },
                    { name: 'Archived', value: Math.max((stats?.projectCount ?? 0) - (stats?.activeProjectCount ?? 0), 0) || 0, color: '#94A3B8' },
                  ].filter(d => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" isAnimationActive={false}
                >
                  {[
                    { name: 'Active', value: stats?.activeProjectCount || 1, color: '#10B981' },
                    { name: 'Archived', value: Math.max((stats?.projectCount ?? 0) - (stats?.activeProjectCount ?? 0), 0) || 0, color: '#94A3B8' },
                  ].filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`proj-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: 11 }}>Active {stats?.activeProjectCount ?? 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: 11 }}>Archived {Math.max((stats?.projectCount ?? 0) - (stats?.activeProjectCount ?? 0), 0)}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            Recent Activity
          </Typography>
          {activity.length > 0 && (
            <Button
              onClick={onActivityClick}
              sx={{
                textTransform: 'none',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: 13,
                p: 0
              }}
            >
              View All
            </Button>
          )}
        </Box>

        {activity.length === 0 ? (
          <Card sx={{
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            p: 6,
            textAlign: 'center'
          }} elevation={0}>
            <MoreHoriz sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              No recent activity yet. Start by creating a project!
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {activity.map((item, idx) => (
              <Card
                key={item.id || idx}
                sx={{
                  borderRadius: 2.5,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  p: 2
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#2563EB',
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>
                      {item.action || 'Action'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      {item.description || 'Activity'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', flexShrink: 0 }}>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Just now'}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OverviewTab;
