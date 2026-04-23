import React, { useState, useEffect } from 'react';
import cms from '../../../services/cms';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewsIcon,
  People as PeopleIcon,
  Favorite as DonationsIcon,
  Event as EventsIcon,
  Article as BlogIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Language as WebsiteIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Computer as DesktopIcon,
  Facebook as FacebookIcon,
  Public as DirectIcon
} from '@mui/icons-material';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {}, donations: {}, content: {}, events: {}, traffic: {}
  });

  const fetchAnalyticsData = async (selectedTimeRange = timeRange) => {
    setLoading(true);
    try {
      const { data } = await cms.analytics.all({ timeRange: selectedTimeRange });
      setAnalyticsData(data || {});
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalyticsData(); }, [timeRange]);

  const fmt = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const fmtDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>{title}</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{value}</Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Box sx={{ color: change >= 0 ? '#10B981' : '#DC2626', display: 'flex', alignItems: 'center' }}>
                  {change >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, ml: 0.25 }}>{Math.abs(change)}%</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.6875rem', color: '#94A3B8' }}>vs last period</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ children }) => (
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', mb: 2 }}>{children}</Typography>
  );

  const { overview = {}, traffic = {}, donations = {}, content = {}, events = {} } = analyticsData || {};

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Analytics</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={() => fetchAnalyticsData()} size="small"
              sx={{ border: '1px solid #E2E8F0', bgcolor: '#fff', color: '#94A3B8', '&:hover': { bgcolor: '#F8FAFC', color: '#475569' } }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small"
            sx={{ color: '#475569', borderColor: '#E2E8F0', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' } }}>
            Export
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Row 1: Overview Stats — 4 equal columns, full width */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard title="Total Visitors" value={fmt(overview.totalVisitors)} change={overview.visitorsChange} icon={PeopleIcon} color="#2563EB" />
        <StatCard title="Page Views" value={fmt(overview.pageViews)} change={overview.pageViewsChange} icon={ViewsIcon} color="#10B981" />
        <StatCard title="Bounce Rate" value={`${overview.bounceRate || 0}%`} change={overview.bounceRateChange} icon={TrendingDownIcon} color="#F59E0B" />
        <StatCard title="Avg. Session" value={overview.avgSessionDuration || '0m 0s'} change={overview.sessionDurationChange} icon={TrendingUpIcon} color="#7C3AED" />
      </Box>

      {/* Row 2: Donations + Content Performance */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        {/* Donations */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
          <SectionTitle>Donations</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#DC2626', mb: 0.25 }}>Total Raised</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>₹{fmt(donations.totalAmount)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB', mb: 0.25 }}>Donations</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{fmt(donations.totalDonations)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#D97706', mb: 0.25 }}>Avg. Donation</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>₹{donations.avgDonation || 0}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', mb: 1.5 }}>Top Campaigns</Typography>
          {(donations.topCampaigns || []).map((c, i) => (
            <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: i < (donations.topCampaigns?.length || 0) - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: `hsl(${i * 80}, 65%, 55%)`, fontSize: 12 }}><DonationsIcon sx={{ fontSize: 14 }} /></Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>{c.name}</Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>{c.donors} donors</Typography>
              </Box>
              <Chip label={`₹${fmt(c.amount)}`} size="small" sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: `hsl(${i * 80}, 70%, 92%)`, color: `hsl(${i * 80}, 70%, 40%)` }} />
            </Box>
          ))}
        </Paper>

        {/* Content Performance */}
        <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
          <SectionTitle>Content Performance</SectionTitle>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#059669', mb: 0.25 }}>Posts</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{content.totalPosts || 0}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#D97706', mb: 0.25 }}>Total Views</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{fmt(content.totalViews)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB', mb: 0.25 }}>Avg/Post</Typography>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{fmt(content.avgViewsPerPost)}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', mb: 1.5 }}>Top Posts</Typography>
          {(content.topPosts || []).map((post, i) => (
            <Box key={post.title} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: i < (content.topPosts?.length || 0) - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: `hsl(${i * 90}, 65%, 55%)`, fontSize: 12 }}><BlogIcon sx={{ fontSize: 14 }} /></Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>{fmtDate(post.date)}</Typography>
              </Box>
              <Chip label={`${fmt(post.views)} views`} size="small" sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Row 4: Events */}
      <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
        <SectionTitle>Events</SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5, mb: 2.5 }}>
          <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: 1, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#2563EB', mb: 0.25 }}>Total Events</Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{events.totalEvents || 0}</Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#ECFDF5', borderRadius: 1, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#059669', mb: 0.25 }}>Total Attendees</Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{fmt(events.totalAttendees)}</Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: 1, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#D97706', mb: 0.25 }}>Avg. Attendance</Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{events.avgAttendeesPerEvent || 0}</Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#F5F3FF', borderRadius: 1, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#7C3AED', mb: 0.25 }}>Upcoming</Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>{events.upcomingEvents || 0}</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', mb: 1.5 }}>Top Attended Events</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
          {(events.topEvents || []).map((evt, i) => (
            <Box key={evt.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: `hsl(${i * 90}, 65%, 55%)` }}><EventsIcon sx={{ fontSize: 16 }} /></Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.name}</Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>{fmtDate(evt.date)}</Typography>
              </Box>
              <Chip label={`${evt.attendees}`} size="small" icon={<PeopleIcon sx={{ fontSize: 12 }} />} sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Row 5: Traffic Sources + Device Breakdown + Top Pages */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mt: 3 }}>
        <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
          <SectionTitle>Traffic Sources</SectionTitle>
          <Stack spacing={1.5}>
            {(traffic.sources || []).map((source, i) => (
              <Box key={source.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: `hsl(${i * 50}, 65%, 55%)` }}>
                  {source.name === 'Direct' ? <DirectIcon sx={{ fontSize: 14 }} /> :
                   source.name === 'Google' ? <WebsiteIcon sx={{ fontSize: 14 }} /> :
                   source.name === 'Facebook' ? <FacebookIcon sx={{ fontSize: 14 }} /> :
                   source.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>{source.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{fmt(source.visitors)} ({source.percentage}%)</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={source.percentage} sx={{ height: 3, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: `hsl(${i * 50}, 65%, 55%)` } }} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
          <SectionTitle>Device Breakdown</SectionTitle>
          <Stack spacing={1.5}>
            {(traffic.devices || []).map((device, i) => {
              const colors = ['#2563EB', '#10B981', '#F59E0B'];
              const icons = [<DesktopIcon sx={{ fontSize: 14 }} />, <PhoneAndroidIcon sx={{ fontSize: 14 }} />, <PhoneAndroidIcon sx={{ fontSize: 14 }} />];
              return (
                <Box key={device.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: colors[i] }}>{icons[i]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>{device.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{fmt(device.users)} ({device.percentage}%)</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={device.percentage} sx={{ height: 3, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: colors[i] } }} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#fff' }}>
          <SectionTitle>Top Pages</SectionTitle>
          {(traffic.topPages || []).map((page, i) => (
            <Box key={page.page} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: i < (traffic.topPages?.length || 0) - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1E293B', fontFamily: 'monospace' }}>{page.page}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>{page.bounceRate}%</Typography>
                <Chip label={`${fmt(page.views)}`} size="small" sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB', minWidth: 40 }} />
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default Analytics;
