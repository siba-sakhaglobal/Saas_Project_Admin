import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, Typography,
  IconButton, Snackbar, Alert
} from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import ProjectGeneralTab from './ProjectEditModal/GeneralTab';
import ProjectMembersTab from './ProjectEditModal/MembersTab';
import ProjectApiKeysTab from './ProjectEditModal/ApiKeysTab';
import ProjectModulesTab from './ProjectEditModal/ModulesTab';
import ProjectSignupFieldsTab from './ProjectEditModal/SignupFieldsTab';
import ProjectWidgetsTab from './ProjectEditModal/WidgetsTab';
import UserGroupsTab from './ProjectEditModal/UserGroupsTab';
import DeleteProjectDialog from './ProjectEditModal/DeleteProjectDialog';

const ProjectEditModal = ({ open, project, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (open && project) {
      setActiveTab(0);
    }
  }, [open, project]);

  const handleCloseModal = () => {
    setDeleteOpen(false);
    onClose?.();
  };

  if (!project) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, height: '80vh', maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings sx={{ color: '#2563EB', fontSize: 24 }} />
            Edit Project: {project.name}
          </Box>
          <IconButton onClick={handleCloseModal} size="small" sx={{ color: '#94A3B8' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: '1px solid #E2E8F0' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              color: '#94A3B8',
              '&.Mui-selected': { color: '#2563EB' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB' }
          }}>
            <Tab label="General" />
            <Tab label="Members" />
            <Tab label="API Keys" />
            <Tab label="Modules" />
            <Tab label="Signup Fields" />
            <Tab label="Widgets" />
            <Tab label="User Groups" />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3, overflow: 'auto', flex: 1 }}>
          {activeTab === 0 && (
            <ProjectGeneralTab
              project={project}
              onDelete={() => setDeleteOpen(true)}
              onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })}
              onSave={onSave}
              onClose={handleCloseModal}
            />
          )}
          {activeTab === 1 && (
            <ProjectMembersTab
              project={project}
              onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })}
            />
          )}
          {activeTab === 2 && (
            <ProjectApiKeysTab
              project={project}
              onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })}
            />
          )}
          {activeTab === 3 && (
            <ProjectModulesTab project={project} onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })} />
          )}
          {activeTab === 4 && (
            <ProjectSignupFieldsTab project={project} onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })} />
          )}
          {activeTab === 5 && (
            <ProjectWidgetsTab project={project} onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })} />
          )}
          {activeTab === 6 && (
            <UserGroupsTab project={project} onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        open={deleteOpen}
        project={project}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => {
          setDeleteOpen(false);
          setTimeout(() => {
            handleCloseModal();
            onSave?.();
          }, 1000);
        }}
        onSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg, severity })}
      />

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProjectEditModal;
