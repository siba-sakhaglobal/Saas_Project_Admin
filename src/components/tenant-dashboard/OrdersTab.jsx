import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Chip, Card, CardContent,
  Skeleton
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import cms from '../../services/cms';

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await cms.raw().get('/api/tenant-dashboard/orders?page=1&limit=20');
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    const statusMap = {
      active: '#10B981',
      cancelled: '#DC2626',
      expired: '#94A3B8'
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

  if (orders.length === 0) {
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
        <ShoppingCart sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1E293B', mb: 1 }}>
          No orders yet
        </Typography>
        <Typography sx={{ color: '#64748B' }}>
          Your subscription orders will appear here
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
                Plan
              </th>
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
                Billing Cycle
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
                Start Date
              </th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#1E293B',
                fontSize: 14
              }}>
                End Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{
                borderBottom: '1px solid #E2E8F0',
                '&:hover': { backgroundColor: '#F8FAFC' }
              }}>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {order.plan?.displayName || '-'}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  {formatCurrency(order.amountCents || 0)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {capitalizeFirst(order.billingCycle)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  fontSize: 14
                }}>
                  <Chip
                    label={capitalizeFirst(order.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(order.status),
                      color: '#fff',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  />
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {formatDate(order.startDate)}
                </td>
                <td style={{
                  padding: '12px 16px',
                  color: '#1E293B',
                  fontSize: 14
                }}>
                  {formatDate(order.endDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default OrdersTab;
