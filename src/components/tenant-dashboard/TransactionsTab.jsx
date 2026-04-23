import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Chip,
  Skeleton
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import cms from '../../services/cms';

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await cms.raw().get('/api/tenant-dashboard/transactions?page=1&limit=20');
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError(err.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getStatusColor = (status) => {
    const statusMap = {
      processed: '#10B981',
      pending: '#F59E0B',
      failed: '#DC2626',
      refunded: '#8B5CF6'
    };
    return statusMap[status?.toLowerCase()] || '#64748B';
  };

  const formatCurrency = (amountCents) => {
    const dollars = (amountCents / 100).toFixed(2);
    return `$${dollars}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const capitalizeFirst = (str) => {
    if (!str) return '-';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (transactions.length === 0) {
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
        <Receipt sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1E293B', mb: 1 }}>
          No transactions yet
        </Typography>
        <Typography sx={{ color: '#64748B' }}>
          Payment transactions will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ overflowX: 'auto' }}>
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
                Amount
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Status
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Payment Method
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Reference
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Description
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Date
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                Refunded
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} style={{
                borderBottom: '1px solid #E2E8F0',
                '&:hover': { backgroundColor: '#F8FAFC' }
              }}>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  {formatCurrency(tx.amountCents || 0)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  fontSize: 14
                }}>
                  <Chip
                    label={capitalizeFirst(tx.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(tx.status),
                      color: '#fff',
                      fontWeight: 500
                    }}
                  />
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {capitalizeFirst(tx.paymentMethod)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14,
                  fontFamily: 'monospace'
                }}>
                  {tx.reference ? tx.reference.slice(0, 12) + '...' : '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#64748B',
                  fontSize: 14,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {tx.description || '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {formatDate(tx.date)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {tx.refundedAt ? formatDate(tx.refundedAt) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default TransactionsTab;
