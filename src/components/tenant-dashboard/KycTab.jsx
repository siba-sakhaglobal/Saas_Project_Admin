import React, { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Chip, Card, CardContent,
  Button, Tooltip, Skeleton
} from '@mui/material';
import {
  VerifiedUser, HourglassEmpty, CloudUpload, Check,
  AccessTime
} from '@mui/icons-material';
import cms from '../../services/cms';

const KycTab = () => {
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadKyc = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await cms.raw().get('/api/tenant-dashboard/kyc');
        setKycData(data || {});
      } catch (err) {
        console.error('Failed to load KYC data:', err);
        setError(err.message || 'Failed to load KYC data');
      } finally {
        setLoading(false);
      }
    };

    loadKyc();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const isVerified = kycData?.status === 'verified';

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={120} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} />
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Status Banner */}
      <Card sx={{
        backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB',
        border: `1px solid ${isVerified ? '#D1FAE5' : '#FEF3C7'}`,
        mb: 3,
        borderRadius: '3px'
      }}>
        <CardContent sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3
        }}>
          {isVerified ? (
            <VerifiedUser sx={{ fontSize: 40, color: '#10B981' }} />
          ) : (
            <HourglassEmpty sx={{ fontSize: 40, color: '#F59E0B' }} />
          )}
          <Box>
            <Typography sx={{
              fontSize: 20,
              fontWeight: 600,
              color: '#1E293B',
              mb: 1
            }}>
              {isVerified ? 'Account Verified' : 'Verification Pending'}
            </Typography>
            <Typography sx={{ color: '#64748B' }}>
              {kycData?.tenantName || 'Your Account'}
            </Typography>
            {isVerified && kycData?.verifiedAt && (
              <Typography sx={{
                fontSize: 12,
                color: '#94A3B8',
                mt: 0.5
              }}>
                Verified on {formatDate(kycData.verifiedAt)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {kycData?.nextSteps && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {kycData.nextSteps}
        </Alert>
      )}

      {/* Documents Section */}
      <Box>
        <Typography sx={{
          fontSize: 16,
          fontWeight: 600,
          color: '#1E293B',
          mb: 2
        }}>
          Required Documents
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2
        }}>
          {(kycData?.documents || []).map((doc) => {
            const isApproved = doc.status === 'approved';
            const isPending = doc.status === 'pending';
            const isNotUploaded = doc.status === 'not_uploaded';

            let statusColor = '#94A3B8';
            let statusBg = '#F1F5F9';
            let statusIcon = null;

            if (isApproved) {
              statusColor = '#10B981';
              statusBg = '#ECFDF5';
              statusIcon = <Check sx={{ fontSize: 16 }} />;
            } else if (isPending) {
              statusColor = '#F59E0B';
              statusBg = '#FFFBEB';
              statusIcon = <AccessTime sx={{ fontSize: 16 }} />;
            } else if (isNotUploaded) {
              statusColor = '#94A3B8';
              statusBg = '#F1F5F9';
              statusIcon = <CloudUpload sx={{ fontSize: 16 }} />;
            }

            return (
              <Card key={doc.name} sx={{
                border: '1px solid #E2E8F0',
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1E293B',
                    mb: 2
                  }}>
                    {doc.name}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    px: 1.5,
                    py: 1,
                    backgroundColor: statusBg,
                    borderRadius: '2px'
                  }}>
                    {statusIcon && (
                      <Box sx={{ color: statusColor, display: 'flex' }}>
                        {statusIcon}
                      </Box>
                    )}
                    <Typography sx={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: statusColor,
                      textTransform: 'capitalize'
                    }}>
                      {doc.status.replace('_', ' ')}
                    </Typography>
                  </Box>

                  {doc.uploadedAt && (
                    <Typography sx={{
                      fontSize: 12,
                      color: '#94A3B8',
                      mb: 2
                    }}>
                      Uploaded: {formatDate(doc.uploadedAt)}
                    </Typography>
                  )}

                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 2
                  }}>
                    {isNotUploaded ? (
                      <Tooltip title="Document upload coming soon">
                        <Button
                          variant="outlined"
                          size="small"
                          disabled
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '2px'
                          }}
                        >
                          Upload
                        </Button>
                      </Tooltip>
                    ) : isApproved ? (
                      <Tooltip title="Document viewer coming soon">
                        <Button
                          variant="outlined"
                          size="small"
                          disabled
                          fullWidth
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '2px'
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default KycTab;
