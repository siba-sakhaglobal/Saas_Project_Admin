import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  Work as WorkIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon,
  Reorder as ReorderIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import cms from '../../../services/cms';

const TeamSettings = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState({ open: false, editing: null });

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    display_name: '',
    description: '',
    color: '#2196F3',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await cms.team.categories();
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Category handlers
  const handleOpenCategoryDialog = (category = null) => {
    if (category) {
      setCategoryForm(category);
      setCategoryDialog({ open: true, editing: category.id });
    } else {
      setCategoryForm({
        name: '',
        display_name: '',
        description: '',
        color: '#2196F3',
        sort_order: categories.length,
        is_active: true
      });
      setCategoryDialog({ open: true, editing: null });
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (categoryDialog.editing) {
        await cms.raw().put(`/api/team-categories/${categoryDialog.editing}`, categoryForm);
        showSnackbar('Category updated successfully', 'success');
      } else {
        await cms.raw().post('/api/team-categories', categoryForm);
        showSnackbar('Category created successfully', 'success');
      }

      setCategoryDialog({ open: false, editing: null });
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar(error.response?.data?.error || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await cms.raw().delete(`/api/team-categories/${id}`);
        showSnackbar('Category deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        showSnackbar(error.response?.data?.error || 'Failed to delete category', 'error');
      }
    }
  };


  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading team settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            color="inherit"
            href="/team"
            onClick={(e) => {
              e.preventDefault();
              navigate('/team');
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            Team Management
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton
            onClick={() => navigate('/team')}
            sx={{
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Team Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage categories and designations for team members
            </Typography>
          </Box>
        </Box>

        {/* Stats Card */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <CategoryIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{categories.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categories
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Typography variant="h6">Team Categories</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCategoryDialog()}
          >
            Add Category
          </Button>
        </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Display Name</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{category.display_name}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: category.color,
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}
                        />
                      </TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell>
                        <Chip
                          label={category.is_active ? 'Active' : 'Inactive'}
                          color={category.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCategoryDialog(category)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCategory(category.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
      </Paper>

      {/* Category Dialog */}
      <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ open: false, editing: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {categoryDialog.editing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name (slug)"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., executive_team"
                helperText="Lowercase with underscores only"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={categoryForm.display_name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="e.g., Executive Team"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color"
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog({ open: false, editing: null })}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSaveCategory}
            variant="contained"
          >
            {categoryDialog.editing ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeamSettings;