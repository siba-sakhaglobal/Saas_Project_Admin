import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ label, value, color, icon: Icon }) => (
  <Paper sx={{
    p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none',
    transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</Typography>
      </Box>
      {Icon && (
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}15` }}>
          <Icon sx={{ fontSize: 22, color }} />
        </Box>
      )}
    </Box>
  </Paper>
);

export const StatCardsGrid = ({ children }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2.5, mb: 3 }}>
    {children}
  </Box>
);

export default StatCard;
