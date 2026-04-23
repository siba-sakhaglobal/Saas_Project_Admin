import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Save as SaveIcon,
  PlayArrow as TestIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Payment as PaymentIcon,
  Extension as IntegrationIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  Public as PublicIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';

// Email Provider Form Component
const EmailProviderForm = ({ provider, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    provider_name: provider?.provider_name || '',
    provider_type: provider?.provider_type || 'smtp',
    configuration: {
      host: provider?.configuration?.host || '',
      port: provider?.configuration?.port || 587,
      username: provider?.configuration?.username || '',
      password: provider?.configuration?.password || '',
      api_key: provider?.configuration?.api_key || '',
      from_email: provider?.configuration?.from_email || '',
      from_name: provider?.configuration?.from_name || '',
      encryption: provider?.configuration?.encryption || 'tls'
    },
    is_active: provider?.is_active || true,
    is_default: provider?.is_default || false
  });

  const emailProviders = [
    { value: 'smtp', label: 'SMTP (Generic)', requiresAuth: true },
    { value: 'gmail', label: 'Gmail', requiresAuth: true },
    { value: 'sendgrid', label: 'SendGrid', requiresAuth: false },
    { value: 'mailgun', label: 'Mailgun', requiresAuth: false },
    { value: 'ses', label: 'Amazon SES', requiresAuth: false },
    { value: 'brevo', label: 'Brevo (Sendinblue)', requiresAuth: false },
    { value: 'postmark', label: 'Postmark', requiresAuth: false },
    { value: 'sparkpost', label: 'SparkPost', requiresAuth: false }
  ];

  const getProviderConfig = (providerType) => {
    const configs = {
      gmail: { host: 'smtp.gmail.com', port: 587, encryption: 'tls' },
      sendgrid: { host: 'smtp.sendgrid.net', port: 587, encryption: 'tls' },
      mailgun: { host: 'smtp.mailgun.org', port: 587, encryption: 'tls' },
      ses: { host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'tls' },
      brevo: { host: 'smtp-relay.brevo.com', port: 587, encryption: 'tls' },
      postmark: { host: 'smtp.postmarkapp.com', port: 587, encryption: 'tls' },
      sparkpost: { host: 'smtp.sparkpostmail.com', port: 587, encryption: 'tls' }
    };
    return configs[providerType] || { host: '', port: 587, encryption: 'tls' };
  };

  const handleProviderTypeChange = (newType) => {
    const config = getProviderConfig(newType);
    setFormData(prev => ({
      ...prev,
      provider_type: newType,
      provider_name: emailProviders.find(p => p.value === newType)?.label || '',
      configuration: {
        ...prev.configuration,
        ...config
      }
    }));
  };

  const selectedProvider = emailProviders.find(p => p.value === formData.provider_type);
  const isApiProvider = !selectedProvider?.requiresAuth;

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Provider Type Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Email Provider</InputLabel>
            <Select
              value={formData.provider_type}
              onChange={(e) => handleProviderTypeChange(e.target.value)}
              label="Email Provider"
            >
              {emailProviders.map((provider) => (
                <MenuItem key={provider.value} value={provider.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {provider.label}
                    {provider.value === 'brevo' && (
                      <Chip label="New!" size="small" color="success" />
                    )}
                    {!provider.requiresAuth && (
                      <Chip label="API" size="small" color="info" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Provider Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Provider Name"
            value={formData.provider_name}
            onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
            placeholder="e.g., Production Email Server"
          />
        </Grid>

        {/* From Email & Name */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="From Email"
            type="email"
            value={formData.configuration.from_email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, from_email: e.target.value }
            }))}
            placeholder="noreply@yourorganization.org"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="From Name"
            value={formData.configuration.from_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, from_name: e.target.value }
            }))}
            placeholder="Aahwahan Foundation"
          />
        </Grid>

        {/* API Key for API-based providers */}
        {isApiProvider && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`${selectedProvider?.label} API Key`}
              type="password"
              value={formData.configuration.api_key}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuration: { ...prev.configuration, api_key: e.target.value }
              }))}
              placeholder="Enter your API key"
              helperText={
                formData.provider_type === 'brevo'
                  ? "Get your API key from Brevo Dashboard → SMTP & API → API Keys"
                  : `Get your API key from ${selectedProvider?.label} dashboard`
              }
            />
          </Grid>
        )}

        {/* SMTP Configuration for SMTP providers */}
        {selectedProvider?.requiresAuth && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={formData.configuration.host}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, host: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={formData.configuration.port}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, port: parseInt(e.target.value) }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.configuration.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, username: e.target.value }
                }))}
                placeholder="your-email@gmail.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.configuration.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, password: e.target.value }
                }))}
                placeholder="App password or account password"
                helperText={formData.provider_type === 'gmail' ? "Use App Password, not your regular Gmail password" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Encryption</InputLabel>
                <Select
                  value={formData.configuration.encryption}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration, encryption: e.target.value }
                  }))}
                  label="Encryption"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="ssl">SSL</MenuItem>
                  <MenuItem value="tls">TLS (Recommended)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {/* Additional Configuration */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_default}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                />
              }
              label="Set as Default Provider"
            />
          </Box>
        </Grid>

        {/* Brevo-specific help */}
        {formData.provider_type === 'brevo' && (
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight="bold">Brevo Setup Instructions:</Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                1. Login to your <strong>Brevo account</strong><br/>
                2. Go to <strong>SMTP & API → API Keys</strong><br/>
                3. Create a new API key with <strong>"Send emails"</strong> permission<br/>
                4. Copy the API key and paste it above<br/>
                5. Verify your sender domain in Brevo dashboard
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(formData)}
          disabled={!formData.provider_name || !formData.configuration.from_email}
        >
          {provider ? 'Update Provider' : 'Add Provider'}
        </Button>
      </Box>
    </Box>
  );
};

// SMS Provider Form Component (simplified)
const SmsProviderForm = ({ provider, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    provider_name: provider?.provider_name || '',
    provider_type: provider?.provider_type || 'twilio',
    configuration: {
      api_key: provider?.configuration?.api_key || '',
      api_secret: provider?.configuration?.api_secret || '',
      from_number: provider?.configuration?.from_number || ''
    },
    is_active: provider?.is_active || true,
    is_default: provider?.is_default || false
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>SMS Provider</InputLabel>
            <Select
              value={formData.provider_type}
              onChange={(e) => setFormData(prev => ({ ...prev, provider_type: e.target.value }))}
              label="SMS Provider"
            >
              <MenuItem value="twilio">Twilio</MenuItem>
              <MenuItem value="msg91">MSG91</MenuItem>
              <MenuItem value="textlocal">TextLocal</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Provider Name"
            value={formData.provider_name}
            onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={formData.configuration.api_key}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, api_key: e.target.value }
            }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="From Number"
            value={formData.configuration.from_number}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, from_number: e.target.value }
            }))}
            placeholder="+1234567890"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={() => onSave(formData)}>
          {provider ? 'Update Provider' : 'Add Provider'}
        </Button>
      </Box>
    </Box>
  );
};

// Payment Gateway Form Component (simplified)
const PaymentGatewayForm = ({ gateway, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    gateway_name: gateway?.gateway_name || '',
    gateway_type: gateway?.gateway_type || 'razorpay',
    environment: gateway?.environment || 'sandbox',
    configuration: {
      key_id: gateway?.configuration?.key_id || '',
      key_secret: gateway?.configuration?.key_secret || ''
    },
    supported_currencies: gateway?.supported_currencies || ['INR'],
    is_active: gateway?.is_active || true,
    is_default: gateway?.is_default || false
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Gateway</InputLabel>
            <Select
              value={formData.gateway_type}
              onChange={(e) => setFormData(prev => ({ ...prev, gateway_type: e.target.value }))}
              label="Payment Gateway"
            >
              <MenuItem value="razorpay">Razorpay</MenuItem>
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="payu">PayU</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Gateway Name"
            value={formData.gateway_name}
            onChange={(e) => setFormData(prev => ({ ...prev, gateway_name: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Key ID"
            value={formData.configuration.key_id}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, key_id: e.target.value }
            }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Key Secret"
            type="password"
            value={formData.configuration.key_secret}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              configuration: { ...prev.configuration, key_secret: e.target.value }
            }))}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={() => onSave(formData)}>
          {gateway ? 'Update Gateway' : 'Add Gateway'}
        </Button>
      </Box>
    </Box>
  );
};

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCard, setSavingCard] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({});
  const [themeSettings, setThemeSettings] = useState({
    title: '',
    tagline: '',
    primaryColor: '#2563EB',
    secondaryColor: '#3B82F6',
    accentColor: '#F97316',
    fontFamily: 'Inter',
    headingFont: 'Inter',
    baseFontSize: '16px',
    borderRadius: '8px',
    spacingDensity: 'normal',
    cardStyle: 'flat',
  });
  const [emailProviders, setEmailProviders] = useState([]);
  const [smsProviders, setSmsProviders] = useState([]);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      new_donation: true,
      new_volunteer: true,
      new_event_registration: true,
      contact_form: true,
      newsletter_subscription: true,
      campaign_goal_reached: true,
      weekly_report: false,
      monthly_report: true
    },
    sms: {
      new_donation: false,
      event_reminder: true,
      urgent_alerts: true
    },
    push: {
      enabled: false,
      new_donation: false,
      system_updates: true
    }
  });

  // Dialog states
  const [emailDialog, setEmailDialog] = useState({ open: false, provider: null });
  const [smsDialog, setSmsDialog] = useState({ open: false, provider: null });
  const [paymentDialog, setPaymentDialog] = useState({ open: false, gateway: null });
  const [testResults, setTestResults] = useState({});
  const [integrationDialog, setIntegrationDialog] = useState({ open: false, integration: null });
  const [integrationForm, setIntegrationForm] = useState({});

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, emailRes, smsRes, paymentRes, integrationRes] = await Promise.all([
        cms.raw().get(`/api/settings/grouped`),
        cms.raw().get(`/api/settings/email-providers`),
        cms.raw().get(`/api/settings/sms-providers`),
        cms.raw().get(`/api/settings/payment-gateways`),
        cms.raw().get(`/api/settings/integrations`)
      ]);

      const grouped = settingsRes.data?.data || settingsRes.data || {};
      setGeneralSettings(grouped);

      if (grouped.appearance) {
        setThemeSettings(prev => ({
          ...prev,
          primaryColor: grouped.appearance.primary_color || prev.primaryColor,
          secondaryColor: grouped.appearance.secondary_color || prev.secondaryColor,
          fontFamily: grouped.appearance.font_family || prev.fontFamily,
          headingFont: grouped.appearance.heading_font || prev.headingFont,
          baseFontSize: grouped.appearance.base_font_size || prev.baseFontSize,
          borderRadius: grouped.appearance.border_radius || prev.borderRadius,
          spacingDensity: grouped.appearance.spacing_density || prev.spacingDensity,
          cardStyle: grouped.appearance.card_style || prev.cardStyle,
          title: grouped.appearance.title || prev.title,
          tagline: grouped.appearance.tagline || prev.tagline,
        }));
      }
      if (grouped.notifications) {
        setNotificationSettings(prev => ({ ...prev, ...grouped.notifications }));
      }
      if (grouped.security) {
        setSecuritySettings(grouped.security);
      }

      setEmailProviders(emailRes.data?.data || emailRes.data || []);
      setSmsProviders(smsRes.data?.data || smsRes.data || []);
      setPaymentGateways(paymentRes.data?.data || paymentRes.data || []);
      setIntegrations(integrationRes.data?.data || integrationRes.data || []);
    } catch (error) {
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (group, settings) => {
    setSaving(true);
    try {
      const settingsArray = Object.entries(settings || {}).map(([key, value]) => ({
        group,
        key,
        value,
      }));

      await cms.raw().put(`/api/settings/bulk`, { settings: settingsArray });
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testEmailProvider = async (providerId) => {
    try {
      setTestResults(prev => ({ ...prev, [`email_${providerId}`]: 'testing' }));
      const response = await cms.raw().post(`/api/settings/email-providers/${providerId}/test`);
      const { data } = response;
      setTestResults(prev => ({ ...prev, [`email_${providerId}`]: data.status }));
      showSnackbar(data.message, data.status === 'success' ? 'success' : 'error');
    } catch (error) {
      setTestResults(prev => ({ ...prev, [`email_${providerId}`]: 'failed' }));
      showSnackbar('Email test failed', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'testing': return <CircularProgress size={20} />;
      default: return <WarningIcon color="warning" />;
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading && <LinearProgress sx={{ mb: 3 }} />}

        {/* Tab Navigation - Clean Swiss Design */}
        <Paper sx={{
          mb: 4,
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
          backgroundColor: '#FFFFFF'
        }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '14px',
                color: '#475569',
                minHeight: 48,
                borderBottom: '2px solid transparent',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: '#2563EB',
                  fontWeight: 600,
                  borderBottomColor: '#2563EB'
                },
                '&:hover': {
                  color: '#2563EB'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563EB',
                height: 2
              }
            }}
          >
            <Tab icon={<SettingsIcon />} label="General" iconPosition="start" />
            <Tab icon={<IntegrationIcon />} label="Integrations" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
            <Tab icon={<TuneIcon />} label="Advanced" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* General Settings - Merged with Theme */}
        <TabPanel value={tabValue} index={0}>
          {/* Section 1: Site Information */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, mb: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Site Information
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
              Basic information about your organization
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Site Name"
                value={generalSettings.general?.site_name || ''}
                onChange={(e) => setGeneralSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, site_name: e.target.value }
                }))}
                placeholder="Aahwahan Foundation"
                variant="outlined"
                size="small"
                slotProps={{
                  input: {
                    sx: {
                      fontSize: 14,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0'
                      },
                      '&:focus-within .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563EB'
                      }
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="Site Description"
                multiline
                rows={3}
                value={generalSettings.general?.site_description || ''}
                onChange={(e) => setGeneralSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, site_description: e.target.value }
                }))}
                variant="outlined"
                size="small"
                slotProps={{
                  input: {
                    sx: {
                      fontSize: 14,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0'
                      },
                      '&:focus-within .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563EB'
                      }
                    }
                  }
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Admin Email"
                    type="email"
                    value={generalSettings.general?.admin_email || ''}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, admin_email: e.target.value }
                    }))}
                    variant="outlined"
                    size="small"
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: 14,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
                          },
                          '&:focus-within .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2563EB'
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={generalSettings.general?.phone || ''}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, phone: e.target.value }
                    }))}
                    variant="outlined"
                    size="small"
                    slotProps={{
                      input: {
                        sx: {
                          fontSize: 14,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
                          },
                          '&:focus-within .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2563EB'
                          }
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Box>

          {/* Row: Theme & Colors + Branding side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Theme & Colors */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Theme & Colors
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
              Define your brand colors
            </Typography>
            <Stack spacing={3}>
              {/* Primary Color */}
              <Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 1.5 }}>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  {['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#DC2626', '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#475569'].map((color) => (
                    <Box
                      key={color}
                      onClick={() => setThemeSettings(prev => ({ ...prev, primaryColor: color }))}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: themeSettings.primaryColor === color ? '2px solid #1E293B' : '2px solid transparent',
                        boxShadow: themeSettings.primaryColor === color ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Custom Hex"
                  value={themeSettings.primaryColor || ''}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  variant="outlined"
                  size="small"
                  placeholder="#2563EB"
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0'
                        }
                      }
                    }
                  }}
                />
              </Box>

              {/* Secondary Color */}
              <Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 1.5 }}>
                  Secondary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  {['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#DC2626', '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#475569'].map((color) => (
                    <Box
                      key={color}
                      onClick={() => setThemeSettings(prev => ({ ...prev, secondaryColor: color }))}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: themeSettings.secondaryColor === color ? '2px solid #1E293B' : '2px solid transparent',
                        boxShadow: themeSettings.secondaryColor === color ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Custom Hex"
                  value={themeSettings.secondaryColor || ''}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  variant="outlined"
                  size="small"
                  placeholder="#3B82F6"
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0'
                        }
                      }
                    }
                  }}
                />
              </Box>

              {/* Accent Color */}
              <Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 1.5 }}>
                  Accent/CTA Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                  {['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#DC2626', '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#475569'].map((color) => (
                    <Box
                      key={color}
                      onClick={() => setThemeSettings(prev => ({ ...prev, accentColor: color }))}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: themeSettings.accentColor === color ? '2px solid #1E293B' : '2px solid transparent',
                        boxShadow: themeSettings.accentColor === color ? '0 0 0 3px rgba(249, 115, 22, 0.2)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  label="Custom Hex"
                  value={themeSettings.accentColor || ''}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                  variant="outlined"
                  size="small"
                  placeholder="#F97316"
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 13,
                        fontFamily: 'monospace',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0'
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Stack>
          </Box>
          {/* Branding */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>Branding</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Set the name and visual identity</Typography>
            <Stack spacing={2}>
              <TextField fullWidth label="Project Title" value={themeSettings.title || ''} onChange={(e) => setThemeSettings(prev => ({ ...prev, title: e.target.value }))} placeholder="Your Project Name" variant="outlined" size="small" />
              <TextField fullWidth label="Tagline" value={themeSettings.tagline || ''} onChange={(e) => setThemeSettings(prev => ({ ...prev, tagline: e.target.value }))} placeholder="Short description or slogan" variant="outlined" size="small" />
              <Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 1 }}>Logo Upload</Typography>
                <Button variant="outlined" disabled fullWidth sx={{ textTransform: 'none', fontSize: 13, borderColor: '#E2E8F0', color: '#94A3B8', '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#94A3B8' } }}>Upload Logo</Button>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mb: 1 }}>Favicon Upload</Typography>
                <Button variant="outlined" disabled fullWidth sx={{ textTransform: 'none', fontSize: 13, borderColor: '#E2E8F0', color: '#94A3B8', '&.Mui-disabled': { borderColor: '#E2E8F0', color: '#94A3B8' } }}>Upload Favicon</Button>
              </Box>
            </Stack>
          </Box>
          </Box>

          {/* Row: Layout & Design + Typography side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>

          {/* Typography */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>
              Typography
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
              Configure fonts and text sizes
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Font Family</InputLabel>
                <Select value={themeSettings.fontFamily || 'Inter'} onChange={(e) => setThemeSettings(prev => ({ ...prev, fontFamily: e.target.value }))} label="Font Family" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {['Inter', 'Helvetica', 'Arial', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Nunito'].map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Heading Font</InputLabel>
                <Select value={themeSettings.headingFont || 'Inter'} onChange={(e) => setThemeSettings(prev => ({ ...prev, headingFont: e.target.value }))} label="Heading Font" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {['System Default', 'Inter', 'Helvetica', 'Arial', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Nunito'].map((font) => (
                    <MenuItem key={font} value={font}>{font}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Base Font Size</InputLabel>
                <Select value={themeSettings.baseFontSize || '16px'} onChange={(e) => setThemeSettings(prev => ({ ...prev, baseFontSize: e.target.value }))} label="Base Font Size" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {['14px', '15px', '16px', '17px', '18px'].map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Layout & Design */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>Layout & Design</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Spacing, borders, and component styles</Typography>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Border Radius</InputLabel>
                <Select value={themeSettings.borderRadius || '8px'} onChange={(e) => setThemeSettings(prev => ({ ...prev, borderRadius: e.target.value }))} label="Border Radius" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {[{ label: 'None', value: '0px' }, { label: 'Small', value: '4px' }, { label: 'Medium', value: '8px' }, { label: 'Large', value: '12px' }, { label: 'Extra Large', value: '16px' }].map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Spacing Density</InputLabel>
                <Select value={themeSettings.spacingDensity || 'normal'} onChange={(e) => setThemeSettings(prev => ({ ...prev, spacingDensity: e.target.value }))} label="Spacing Density" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {['Compact', 'Normal', 'Comfortable'].map((d) => (
                    <MenuItem key={d} value={d.toLowerCase()}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Card Style</InputLabel>
                <Select value={themeSettings.cardStyle || 'flat'} onChange={(e) => setThemeSettings(prev => ({ ...prev, cardStyle: e.target.value }))} label="Card Style" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  {[{ label: 'Flat (border only)', value: 'flat' }, { label: 'Elevated (shadow)', value: 'elevated' }, { label: 'Bordered (prominent)', value: 'bordered' }].map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
          </Box>

          {/* Row: SEO & Localization side by side */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>

          {/* Localization */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>Localization</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Regional and language preferences</Typography>
            <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: 14 }}>Timezone</InputLabel>
                  <Select
                    value={generalSettings.general?.timezone || 'Asia/Kolkata'}
                    onChange={(e) => setGeneralSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                    label="Timezone"
                    sx={{
                      fontSize: 14,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E2E8F0'
                      },
                      '&:focus-within .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2563EB'
                      }
                    }}
                  >
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">America/New_York</MenuItem>
                    <MenuItem value="Europe/London">Europe/London</MenuItem>
                  </Select>
                </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Default Currency</InputLabel>
                <Select value={generalSettings.general?.currency || 'INR'} onChange={(e) => setGeneralSettings(prev => ({ ...prev, general: { ...prev.general, currency: e.target.value } }))} label="Default Currency" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Date Format</InputLabel>
                <Select value={generalSettings.general?.date_format || 'DD/MM/YYYY'} onChange={(e) => setGeneralSettings(prev => ({ ...prev, general: { ...prev.general, date_format: e.target.value } }))} label="Date Format" sx={{ fontSize: 14, color: '#1E293B', '& .MuiSelect-select': { color: '#1E293B' } }}>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* SEO & Analytics */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 0.5 }}>SEO & Analytics</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Search engine optimization and tracking codes</Typography>
            <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Google Analytics ID"
                  value={generalSettings.seo?.google_analytics_id || ''}
                  onChange={(e) => setGeneralSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, google_analytics_id: e.target.value }
                  }))}
                  placeholder="G-XXXXXXXXXX"
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 14,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0'
                        },
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563EB'
                        }
                      }
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Google Tag Manager ID"
                  value={generalSettings.seo?.google_tag_manager_id || ''}
                  onChange={(e) => setGeneralSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, google_tag_manager_id: e.target.value }
                  }))}
                  placeholder="GTM-XXXXXXX"
                  variant="outlined"
                  size="small"
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: 14,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E2E8F0'
                        },
                        '&:focus-within .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2563EB'
                        }
                      }
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Facebook Pixel ID"
                  value={generalSettings.seo?.facebook_pixel_id || ''}
                  onChange={(e) => setGeneralSettings(prev => ({
                    ...prev,
                    seo: { ...prev.seo, facebook_pixel_id: e.target.value }
                  }))}
                  placeholder="123456789012345"
                  variant="outlined"
                  size="small"
                />
            </Stack>
          </Box>
          </Box>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={async () => {
                await saveSettings('general', generalSettings.general);
                await saveSettings('appearance', {
                  primary_color: themeSettings.primaryColor,
                  secondary_color: themeSettings.secondaryColor,
                  font_family: themeSettings.fontFamily,
                  heading_font: themeSettings.headingFont,
                  base_font_size: themeSettings.baseFontSize,
                  border_radius: themeSettings.borderRadius,
                  spacing_density: themeSettings.spacingDensity,
                  card_style: themeSettings.cardStyle,
                  title: themeSettings.title,
                  tagline: themeSettings.tagline,
                });
              }}
              disabled={saving}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                py: 1.25,
                px: 3,
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Save Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Email Providers */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>Integrations</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>Manage email, SMS, payment gateways, and third-party integrations</Typography>
          </Box>

          {/* Email Providers Section */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, mb: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>
                Email Service Providers
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                Configure SMTP servers and API-based email services. Brevo, SendGrid, and more supported.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setEmailDialog({ open: true, provider: null })}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                py: 1,
                px: 2,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Add Provider
            </Button>
          </Box>

          <Alert severity="info" sx={{
            mb: 3,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            '& .MuiAlert-message': {
              fontSize: 13
            }
          }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E40AF' }}>Quick Setup Tip:</Typography>
            <Typography sx={{ color: '#1E40AF', fontSize: 13 }}>For quick setup, we recommend <strong>Brevo</strong> (free tier: 300 emails/day) or <strong>SendGrid</strong> (free tier: 100 emails/day).</Typography>
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {emailProviders.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Box sx={{
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px'
                }}>
                  <EmailIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600, mb: 1 }}>
                    No Email Providers Configured
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontSize: 13 }}>
                    Add your first email provider to start sending notifications
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setEmailDialog({ open: true, provider: null })}
                    sx={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 14,
                      py: 1,
                      px: 2,
                      borderRadius: '8px',
                      '&:hover': { backgroundColor: '#1d4ed8' }
                    }}
                  >
                    Add First Provider
                  </Button>
                </Box>
              </Box>
            ) : (
              emailProviders.map((provider) => (
                  <Box key={provider.id}
                    sx={{
                      backgroundColor: '#FFFFFF',
                      border: provider.is_default ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      p: 3,
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                          {provider.provider_name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={provider.provider_type.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: provider.provider_type === 'brevo' ? '#DCFCE7' : '#EFF6FF',
                              color: provider.provider_type === 'brevo' ? '#166534' : '#1E40AF',
                              fontWeight: 500,
                              fontSize: 12,
                              height: 24
                            }}
                          />
                          {provider.provider_type === 'brevo' && (
                            <Chip label="Recommended" size="small" sx={{
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              fontWeight: 500,
                              fontSize: 12,
                              height: 24
                            }} />
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {provider.is_default && (
                          <Chip label="Default" size="small" sx={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            fontWeight: 500,
                            fontSize: 12,
                            height: 24,
                            mb: 1
                          }} />
                        )}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {getStatusIcon(testResults[`email_${provider.id}`] || provider.test_status)}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{
                      backgroundColor: '#F8FAFC',
                      p: 2,
                      borderRadius: '8px',
                      mb: 3,
                      borderLeft: '3px solid #2563EB'
                    }}>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 1 }}>
                        <strong>Host:</strong> {provider.configuration?.host || 'API-based service'}
                      </Typography>
                      {provider.configuration?.port && (
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 1 }}>
                          <strong>Port:</strong> {provider.configuration.port}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: 13 }}>
                        <strong>Status:</strong> {provider.is_active ? '✅ Active' : '❌ Inactive'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TestIcon />}
                        onClick={() => testEmailProvider(provider.id)}
                        disabled={testResults[`email_${provider.id}`] === 'testing'}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: 13,
                          borderColor: '#E2E8F0',
                          color: '#475569',
                          '&:hover': {
                            borderColor: '#CBD5E1',
                            backgroundColor: '#F8FAFC'
                          }
                        }}
                      >
                        Test
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setEmailDialog({ open: true, provider })}
                          sx={{
                            flex: 1,
                            backgroundColor: '#2563EB',
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: 13,
                            borderRadius: '6px',
                            '&:hover': { backgroundColor: '#1d4ed8' }
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                  </Box>
              ))
            )}
          </Box>
          </Box>

          {/* SMS Providers Section */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, mb: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>
                SMS Service Providers
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                Configure SMS providers for sending notifications, OTPs, and alerts to users.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSmsDialog({ open: true, provider: null })}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                py: 1,
                px: 2,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Add Provider
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {smsProviders.map((provider) => (
                <Box key={provider.id}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: provider.is_default ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    p: 3,
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                        {provider.provider_name}
                      </Typography>
                      <Chip
                        label={provider.provider_type}
                        size="small"
                        sx={{
                          backgroundColor: '#F3F4F6',
                          color: '#1F2937',
                          fontWeight: 500,
                          fontSize: 12,
                          height: 24
                        }}
                      />
                    </Box>
                    <Box>
                      {provider.is_default && (
                        <Chip label="Default" size="small" sx={{
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          fontWeight: 500,
                          fontSize: 12,
                          height: 24
                        }} />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 1 }}>
                    <strong>From:</strong> {provider.configuration?.from_number || 'Not configured'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 3 }}>
                    <strong>Status:</strong> {provider.is_active ? '✅ Active' : '❌ Inactive'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<TestIcon />}
                      sx={{
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: 13,
                        borderColor: '#E2E8F0',
                        color: '#475569',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                          backgroundColor: '#F8FAFC'
                        }
                      }}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setSmsDialog({ open: true, provider })}
                      sx={{
                        flex: 1,
                        backgroundColor: '#2563EB',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: 13,
                        borderRadius: '6px',
                        '&:hover': { backgroundColor: '#1d4ed8' }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
            ))}
          </Box>
          </Box>

          {/* Payment Gateways Section */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, mb: 3, bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>
                Payment Gateways
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                Configure and manage payment gateway integrations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPaymentDialog({ open: true, gateway: null })}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                py: 1,
                px: 2,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Add Gateway
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {paymentGateways.map((gateway) => (
                <Box key={gateway.id}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: gateway.is_default ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    p: 3,
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                        {gateway.gateway_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={gateway.environment}
                          size="small"
                          sx={{
                            backgroundColor: gateway.environment === 'production' ? '#DCFCE7' : '#FEF3C7',
                            color: gateway.environment === 'production' ? '#166534' : '#92400E',
                            fontWeight: 500,
                            fontSize: 12,
                            height: 24
                          }}
                        />
                        <Chip
                          label={gateway.gateway_type}
                          size="small"
                          sx={{
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
                            fontWeight: 500,
                            fontSize: 12,
                            height: 24
                          }}
                        />
                      </Box>
                    </Box>
                    {gateway.is_default && (
                      <Chip label="Default" size="small" sx={{
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        fontWeight: 500,
                        fontSize: 12,
                        height: 24
                      }} />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 1 }}>
                    <strong>Currencies:</strong> {gateway.supported_currencies?.join(', ') || 'None'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 3 }}>
                    <strong>Status:</strong> {gateway.is_active ? '✅ Active' : '❌ Inactive'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<TestIcon />}
                      sx={{
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: 13,
                        borderColor: '#E2E8F0',
                        color: '#475569',
                        '&:hover': {
                          borderColor: '#CBD5E1',
                          backgroundColor: '#F8FAFC'
                        }
                      }}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setPaymentDialog({ open: true, gateway })}
                      sx={{
                        flex: 1,
                        backgroundColor: '#2563EB',
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: 13,
                        borderRadius: '6px',
                        '&:hover': { backgroundColor: '#1d4ed8' }
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
            ))}
          </Box>
          </Box>

          {/* Third-Party Integrations Section */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, mb: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>Third-Party Integrations</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, fontSize: 13 }}>External platforms and services</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {integrations.map((integration) => {
              const intKey = integration.type || integration.key;
              const intData = typeof integration === 'object' ? integration : {};
              const isEnabled = intData.enabled !== undefined ? !!intData.enabled : !!intData.is_active;
              return (
              <Box key={integration.id || intKey} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>{integration.name || intKey}</Typography>
                    <Chip label={isEnabled ? 'Enabled' : 'Disabled'} size="small"
                      sx={{ bgcolor: isEnabled ? '#DCFCE7' : '#F1F5F9', color: isEnabled ? '#166534' : '#64748B', fontWeight: 500, fontSize: 12, height: 24 }} />
                  </Box>
                  <Switch checked={isEnabled}
                    onChange={async () => {
                      try {
                        const val = { ...intData, enabled: !isEnabled };
                        ['id', 'name'].forEach(k => delete val[k]);
                        await cms.raw().post('/api/settings/integrations', { key: intKey, value: val });
                        showSnackbar(`${integration.name || intKey} ${!isEnabled ? 'enabled' : 'disabled'}`, 'success');
                        loadAllSettings();
                      } catch { showSnackbar('Failed to toggle', 'error'); }
                    }}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  {Object.entries(intData).filter(([k]) => !['id', 'name', 'type', 'enabled', 'is_active'].includes(k)).map(([k, v]) => (
                    <Typography key={k} variant="body2" sx={{ color: '#475569', fontSize: 13, mb: 0.5 }}>
                      <strong>{k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</strong> {v === '' || v === null || v === undefined ? '—' : String(v)}
                    </Typography>
                  ))}
                </Box>
                <Button size="small" variant="outlined" startIcon={<EditIcon />}
                  onClick={() => {
                    const formData = {};
                    Object.entries(intData).forEach(([k, v]) => {
                      if (!['id', 'name', 'type'].includes(k)) formData[k] = v;
                    });
                    setIntegrationForm(formData);
                    setIntegrationDialog({ open: true, integration: { ...integration, _key: intKey } });
                  }}
                  sx={{ mt: 2, textTransform: 'none', fontWeight: 500, fontSize: 13, borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}>Configure</Button>
              </Box>
              );
            })}
          </Box>
          </Box>
        </TabPanel>

        {/* Security */}
        {/* Notifications */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
              Notification Preferences
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
              Configure automated notifications for various events and user actions
            </Typography>
          </Box>

          <Alert severity="info" sx={{
            mb: 3,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            '& .MuiAlert-message': {
              fontSize: 13
            }
          }}>
            <Typography sx={{ color: '#1E40AF', fontSize: 13 }}>Enable or disable notification channels and customize when you receive alerts.</Typography>
          </Alert>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {/* Email Notifications */}
              <Box sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ mb: 3 }}>
                  <EmailIcon sx={{ fontSize: 40, mb: 1, color: '#2563EB' }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                    Email Notifications
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                    Configure email alerts for important events
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.new_donation}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, new_donation: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>New Donation Received</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.new_volunteer}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, new_volunteer: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>New Volunteer Registration</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.new_event_registration}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, new_event_registration: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Event Registration</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.contact_form}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, contact_form: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Contact Form Submission</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.newsletter_subscription}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, newsletter_subscription: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Newsletter Subscription</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.campaign_goal_reached}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, campaign_goal_reached: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: 14, color: '#475569' }}>Campaign Goal Reached</Typography>
                        <Chip label="Important" size="small" sx={{
                          backgroundColor: '#DCFCE7',
                          color: '#166534',
                          fontWeight: 500,
                          fontSize: 11,
                          height: 20,
                          ml: 1
                        }} />
                      </Box>
                    }
                  />
                  <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#475569', fontSize: 13, mt: 2 }}>Reports</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.weekly_report}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, weekly_report: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Weekly Summary Report</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.email?.monthly_report}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, monthly_report: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Monthly Analytics Report</Typography>}
                  />
                </Stack>
              </Box>

            {/* SMS Notifications */}
              <Box sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ mb: 3 }}>
                  <SmsIcon sx={{ fontSize: 40, mb: 1, color: '#2563EB' }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                    SMS Notifications
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                    Instant SMS alerts for critical updates
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.sms?.new_donation}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, new_donation: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Large Donations (₹10,000+)</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.sms?.event_reminder}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, event_reminder: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Event Reminders (24h before)</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.sms?.urgent_alerts}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, urgent_alerts: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: 14, color: '#475569' }}>Urgent System Alerts</Typography>
                        <Chip label="Critical" size="small" sx={{
                          backgroundColor: '#FEE2E2',
                          color: '#991B1B',
                          fontWeight: 500,
                          fontSize: 11,
                          height: 20,
                          ml: 1
                        }} />
                      </Box>
                    }
                  />
                  <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
                  <Alert severity="warning" sx={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    '& .MuiAlert-message': {
                      fontSize: 12
                    }
                  }}>
                    <Typography sx={{ fontSize: 13, color: '#92400E' }}>SMS notifications may incur additional charges based on your SMS provider.</Typography>
                  </Alert>
                </Stack>
              </Box>

            {/* Push Notifications */}
              <Box sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                p: 3,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ mb: 3 }}>
                  <NotificationsIcon sx={{ fontSize: 40, mb: 1, color: '#2563EB' }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                    Push Notifications
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                    Browser and mobile app notifications
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.push?.enabled}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, enabled: e.target.checked }
                        }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Enable Push Notifications</Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                          Requires user permission
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.push?.new_donation}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, new_donation: e.target.checked }
                        }))}
                        disabled={!notificationSettings.push?.enabled}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>New Donations</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.push?.system_updates}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, system_updates: e.target.checked }
                        }))}
                        disabled={!notificationSettings.push?.enabled}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#2563EB'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#2563EB'
                          }
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>System Updates</Typography>}
                  />
                  <Box sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    borderLeft: '3px solid #2563EB'
                  }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontSize: 12 }}>
                      Push notifications require SSL certificate and service worker setup.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
          </Box>

            {/* Notification Recipients */}
              <Box sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                p: 3
              }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
                    Notification Recipients
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
                    Manage email addresses and phone numbers that receive notifications
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Admin Email Addresses"
                      placeholder="admin@example.com, manager@example.com"
                      value={generalSettings.notifications?.admin_emails || ''}
                      onChange={(e) => setGeneralSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, admin_emails: e.target.value }
                      }))}
                      helperText="Comma-separated email addresses for admin notifications"
                      variant="outlined"
                      size="small"
                      slotProps={{
                        input: {
                          sx: {
                            fontSize: 14,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#E2E8F0'
                            },
                            '&:focus-within .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2563EB'
                            }
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMS Alert Numbers"
                      placeholder="+91 9876543210, +91 9876543211"
                      value={generalSettings.notifications?.sms_numbers || ''}
                      onChange={(e) => setGeneralSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, sms_numbers: e.target.value }
                      }))}
                      helperText="Comma-separated phone numbers for SMS alerts"
                      variant="outlined"
                      size="small"
                      slotProps={{
                        input: {
                          sx: {
                            fontSize: 14,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#E2E8F0'
                            },
                            '&:focus-within .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2563EB'
                            }
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

            {/* Save Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={() => {
                    saveSettings('notifications', notificationSettings);
                  }}
                  disabled={saving}
                  sx={{
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#2563EB',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#1d4ed8'
                    }
                  }}
                >
                  Save Notification Settings
                </Button>
              </Box>
        </TabPanel>

        {/* Advanced */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
              Advanced Settings
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13 }}>
              Security, database, backup, performance, and system operations
            </Typography>
          </Box>

          {/* 6 cards: 3 columns x 2 rows */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>

            {/* 1. Authentication */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 2 }}>Authentication</Typography>
              <Stack spacing={2} sx={{ flex: 1 }}>
                <TextField fullWidth label="Session Timeout (seconds)" type="number"
                  value={generalSettings.security?.session_timeout ?? 3600}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, security: { ...prev.security, session_timeout: Number(e.target.value) } }))}
                  variant="outlined" size="small" />
                <TextField fullWidth label="Max Login Attempts" type="number"
                  value={generalSettings.security?.max_login_attempts ?? 5}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, security: { ...prev.security, max_login_attempts: Number(e.target.value) } }))}
                  variant="outlined" size="small" />
                <FormControlLabel
                  control={<Switch checked={!!generalSettings.security?.require_2fa}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, security: { ...prev.security, require_2fa: e.target.checked } }))}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2563EB' } }} />}
                  label={<Typography sx={{ fontSize: 14, color: '#475569' }}>Require 2FA</Typography>}
                />
              </Stack>
              <Button variant="contained" size="small" disabled={savingCard === 'auth'}
                onClick={async () => {
                  setSavingCard('auth');
                  await saveSettings('security', { session_timeout: generalSettings.security?.session_timeout ?? 3600, max_login_attempts: generalSettings.security?.max_login_attempts ?? 5, require_2fa: !!generalSettings.security?.require_2fa });
                  setSavingCard('');
                }}
                sx={{ mt: 2, bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, fontSize: 13, '&:hover': { bgcolor: '#1D4ED8' } }}>
                {savingCard === 'auth' ? 'Saving...' : 'Save'}
              </Button>
            </Box>

            {/* 2. File Upload Security */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 2 }}>File Upload Security</Typography>
              <Stack spacing={2} sx={{ flex: 1 }}>
                <TextField fullWidth label="Max Upload Size (MB)" type="number"
                  value={generalSettings.security?.max_upload_size_mb ?? 10}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, security: { ...prev.security, max_upload_size_mb: Number(e.target.value) } }))}
                  variant="outlined" size="small" />
                <TextField fullWidth label="Allowed File Types"
                  value={typeof generalSettings.security?.allowed_file_types === 'string' ? generalSettings.security.allowed_file_types : (Array.isArray(generalSettings.security?.allowed_file_types) ? generalSettings.security.allowed_file_types.join(', ') : 'jpg, jpeg, png, gif, webp, pdf, doc, docx, xls, xlsx')}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, security: { ...prev.security, allowed_file_types: e.target.value } }))}
                  helperText="Comma-separated extensions" variant="outlined" size="small" />
              </Stack>
              <Button variant="contained" size="small" disabled={savingCard === 'upload'}
                onClick={async () => {
                  setSavingCard('upload');
                  await saveSettings('security', { max_upload_size_mb: generalSettings.security?.max_upload_size_mb ?? 10, allowed_file_types: generalSettings.security?.allowed_file_types || 'jpg, jpeg, png, gif, webp, pdf, doc, docx, xls, xlsx' });
                  setSavingCard('');
                }}
                sx={{ mt: 2, bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, fontSize: 13, '&:hover': { bgcolor: '#1D4ED8' } }}>
                {savingCard === 'upload' ? 'Saving...' : 'Save'}
              </Button>
            </Box>

            {/* 3. Database & Backup */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 2 }}>Database & Backup</Typography>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Button variant="outlined" startIcon={<BackupIcon />} fullWidth
                  onClick={async () => {
                    try {
                      showSnackbar('Exporting project settings...', 'info');
                      const res = await cms.raw().get('/api/settings/export-settings', { responseType: 'blob' });
                      const { data } = res;
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `project-settings-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                      showSnackbar('Settings exported successfully', 'success');
                      loadAllSettings();
                    } catch { showSnackbar('Export failed', 'error'); }
                  }}
                  sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}>
                  Export Settings
                </Button>
                <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                  Last: {generalSettings.advanced?.last_backup ? new Date(generalSettings.advanced.last_backup).toLocaleString() : 'Never'}
                </Typography>
              </Stack>
            </Box>

            {/* 4. Performance */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1E293B', mb: 2 }}>Performance</Typography>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Button variant="outlined" startIcon={<SpeedIcon />} fullWidth
                  onClick={async () => {
                    try {
                      await cms.raw().post('/api/settings/clear-cache');
                      showSnackbar('Module cache cleared for this project', 'success');
                      loadAllSettings();
                    } catch { showSnackbar('Failed to clear cache', 'error'); }
                  }}
                  sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}>
                  Clear Module Cache
                </Button>
                <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                  Last cleared: {generalSettings.advanced?.cache_cleared_at ? new Date(generalSettings.advanced.cache_cleared_at).toLocaleString() : 'Never'}
                </Typography>
              </Stack>
            </Box>

            {/* 5. Sessions */}
            <Box sx={{ bgcolor: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#DC2626', mb: 2 }}>Sessions</Typography>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Box sx={{ p: 2, border: '1px solid #FECACA', borderRadius: 1, bgcolor: '#fff' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>Invalidate All Sessions</Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Force all end users to re-authenticate</Typography>
                </Box>
              </Stack>
              <Button variant="outlined" fullWidth size="small"
                onClick={async () => {
                  if (!window.confirm('This will log out all end users for this project. Are you sure?')) return;
                  try {
                    const res = await cms.raw().post('/api/settings/invalidate-sessions');
                    const { data } = res;
                    const resultData = data?.data || data;
                    showSnackbar(`${resultData.revoked} sessions revoked for this project`, 'success');
                    loadAllSettings();
                  } catch { showSnackbar('Failed to invalidate sessions', 'error'); }
                }}
                sx={{ mt: 2, borderColor: '#DC2626', color: '#DC2626', textTransform: 'none', fontWeight: 600 }}>
                Invalidate All
              </Button>
            </Box>

            {/* 6. Danger Zone */}
            <Box sx={{ bgcolor: '#FEF2F2', border: '2px solid #FCA5A5', borderRadius: 1.5, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#DC2626', mb: 2 }}>Danger Zone</Typography>
              <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid #FECACA', borderRadius: 1, bgcolor: '#fff' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: 13 }}>Reset All Settings</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>Restore defaults</Typography>
                  </Box>
                  <Button variant="outlined" size="small"
                    onClick={() => {
                      if (!window.confirm('Reset ALL settings to defaults? This cannot be undone.')) return;
                      showSnackbar('Settings reset to defaults', 'success');
                      loadAllSettings();
                    }}
                    sx={{ borderColor: '#DC2626', color: '#DC2626', textTransform: 'none', fontWeight: 600, fontSize: 12, minWidth: 60 }}>Reset</Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid #FECACA', borderRadius: 1, bgcolor: '#fff' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: 13 }}>Clear All Cache</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>Force regeneration</Typography>
                  </Box>
                  <Button variant="outlined" size="small"
                    onClick={async () => {
                      if (!window.confirm('Clear all cached data for this project?')) return;
                      try {
                        await cms.raw().post('/api/settings/clear-cache');
                        showSnackbar('Project cache cleared', 'success');
                        loadAllSettings();
                      } catch { showSnackbar('Failed to clear cache', 'error'); }
                    }}
                    sx={{ borderColor: '#DC2626', color: '#DC2626', textTransform: 'none', fontWeight: 600, fontSize: 12, minWidth: 60 }}>Clear</Button>
                </Box>
              </Stack>
            </Box>

          </Box>
        </TabPanel>
      </Container>

      {/* Email Provider Dialog */}
      <Dialog
        open={emailDialog.open}
        onClose={() => setEmailDialog({ open: false, provider: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {emailDialog.provider ? 'Edit Email Provider' : 'Add Email Provider'}
        </DialogTitle>
        <DialogContent>
          <EmailProviderForm
            provider={emailDialog.provider}
            onSave={(providerData) => {
              // Handle save
              setEmailDialog({ open: false, provider: null });
              loadAllSettings();
              showSnackbar('Email provider saved successfully', 'success');
            }}
            onCancel={() => setEmailDialog({ open: false, provider: null })}
          />
        </DialogContent>
      </Dialog>

      {/* SMS Provider Dialog */}
      <Dialog
        open={smsDialog.open}
        onClose={() => setSmsDialog({ open: false, provider: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {smsDialog.provider ? 'Edit SMS Provider' : 'Add SMS Provider'}
        </DialogTitle>
        <DialogContent>
          <SmsProviderForm
            provider={smsDialog.provider}
            onSave={(providerData) => {
              setSmsDialog({ open: false, provider: null });
              loadAllSettings();
              showSnackbar('SMS provider saved successfully', 'success');
            }}
            onCancel={() => setSmsDialog({ open: false, provider: null })}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog
        open={paymentDialog.open}
        onClose={() => setPaymentDialog({ open: false, gateway: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {paymentDialog.gateway ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
        </DialogTitle>
        <DialogContent>
          <PaymentGatewayForm
            gateway={paymentDialog.gateway}
            onSave={(gatewayData) => {
              setPaymentDialog({ open: false, gateway: null });
              loadAllSettings();
              showSnackbar('Payment gateway saved successfully', 'success');
            }}
            onCancel={() => setPaymentDialog({ open: false, gateway: null })}
          />
        </DialogContent>
      </Dialog>

      {/* Integration Configure Dialog */}
      <Dialog
        open={integrationDialog.open}
        onClose={() => setIntegrationDialog({ open: false, integration: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          Configure {integrationDialog.integration?.name || integrationDialog.integration?._key || 'Integration'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {Object.entries(integrationForm).map(([key, value]) => {
              if (key === 'type' || key === '_key') return null;
              if (typeof value === 'boolean') {
                return (
                  <FormControlLabel key={key}
                    control={<Switch checked={value}
                      onChange={(e) => setIntegrationForm(prev => ({ ...prev, [key]: e.target.checked }))}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2563EB' } }} />}
                    label={<Typography sx={{ fontSize: 14, color: '#475569' }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Typography>}
                  />
                );
              }
              return (
                <TextField key={key} fullWidth size="small"
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  value={value || ''}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, [key]: e.target.value }))}
                  type={key.includes('key') || key.includes('secret') ? 'password' : 'text'}
                  variant="outlined"
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIntegrationDialog({ open: false, integration: null })}
            sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained"
            onClick={async () => {
              try {
                const intKey = integrationDialog.integration?._key || integrationDialog.integration?.type;
                await cms.raw().post('/api/settings/integrations', { key: intKey, value: integrationForm });
                showSnackbar('Integration saved', 'success');
                setIntegrationDialog({ open: false, integration: null });
                loadAllSettings();
              } catch { showSnackbar('Failed to save integration', 'error'); }
            }}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#1D4ED8' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;