import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Button, Chip,
  Skeleton
} from '@mui/material';
import { History, Refresh } from '@mui/icons-material';
import cms from '../../services/cms';

const ActivityTab = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadActivity = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await cms.raw().get(`/api/tenant-dashboard/activity?page=${pageNum}&limit=20`);
      setActivity(Array.isArray(data) ? data : []);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load activity:', err);
      setError(err.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity(1);
  }, []);

  const handleRetry = () => {
    loadActivity(page);
  };

  const handlePrevious = () => {
    if (page > 1) {
      loadActivity(page - 1);
    }
  };

  const handleNext = () => {
    loadActivity(page + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const capitalizeFirst = (str) => {
    if (!str) return '-';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading && activity.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  if (error && activity.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (activity.length === 0) {
    return (
      <Box sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        backgroundColor: '#F8FAFC',
        borderRadius: '3px',
        border: '1px solid #E2E8F0'
      }}>
        <History sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1E293B', mb: 1 }}>
          No activity recorded yet
        </Typography>
        <Typography sx={{ color: '#64748B' }}>
          Actions performed in your tenant will appear here as an audit trail
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#fff'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Timestamp
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Action
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Resource
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {activity.map((entry) => (
              <tr key={entry.id} style={{
                borderBottom: '1px solid #E2E8F0'
              }}>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14,
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate(entry.timestamp)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  fontSize: 14
                }}>
                  <Chip
                    label={capitalizeFirst(entry.action)}
                    size="small"
                    sx={{
                      backgroundColor: '#2563EB',
                      color: '#fff',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  />
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  {entry.resource || '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#64748B',
                  fontSize: 14,
                  maxWidth: 300,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {entry.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 3
      }}>
        <Button
          variant="outlined"
          disabled={page === 1 || loading}
          onClick={handlePrevious}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '2px'
          }}
        >
          Previous
        </Button>

        <Typography sx={{
          color: '#64748B',
          fontSize: 14
        }}>
          Page {page}
        </Typography>

        <Button
          variant="outlined"
          disabled={activity.length < 20 || loading}
          onClick={handleNext}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '2px'
          }}
        >
          Next
        </Button>
      </Box>

      {error && activity.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Retry
            </Button>
          }
          sx={{ mt: 3 }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ActivityTab;
