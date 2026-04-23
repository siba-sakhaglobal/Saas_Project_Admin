import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/authService';
import { hasApiKey } from './services/cms';
import { ProjectProvider } from './context/ProjectContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/tenant-dashboard/DashboardPage';
import Dashboard from './components/pages/dashboard/Dashboard';
import EnterpriseDashboard from './components/pages/dashboard/EnterpriseDashboard';
import PagesManager from './components/pages/pages/PagesManager';
import PageBuilder from './components/pages/PageBuilder';
import BlogManager from './components/pages/blog/BlogManager';
import BlogEditor from './components/pages/blog/BlogEditor';
import MediaManager from './components/pages/media/MediaManager';
import EventsManager from './components/pages/events/EventsManager';
import EventEditor from './components/pages/events/EventEditor';
import DonationsManager from './components/pages/donations/DonationsManager';
import DonationEditor from './components/pages/donations/DonationEditor';
import TeamManager from './components/pages/team/TeamManager';
import TeamMemberEdit from './components/pages/team/TeamMemberEdit';
import TeamSettings from './components/pages/team/TeamSettings';
import ComponentsManager from './components/pages/components/ComponentsManager';
import ComponentEditor from './components/pages/components/ComponentEditor';
import ComponentPreview from './components/pages/components/ComponentPreview';
import ComponentUsageManager from './components/components/ComponentUsageManager';
import EnhancedProductManager from './components/pages/products/EnhancedProductManager';
import MultiImageProductEditor from './components/pages/products/MultiImageProductEditor';
import CategoryManager from './components/pages/products/CategoryManager';
import EventCategoryManager from './components/pages/events/EventCategoryManager';
import BlogCategoryManager from './components/pages/blog/BlogCategoryManager';
import TeamDesignationManager from './components/pages/team/TeamDesignationManager';
import Settings from './components/pages/settings/Settings';
import Analytics from './components/pages/analytics/Analytics';
import UserManager from './components/pages/users/UserManager';
import ServicesManager from './components/pages/services/ServicesManager';
import ServiceEditor from './components/pages/services/ServiceEditor';
import OrdersManager from './components/pages/orders/OrdersManager';
import OrderEditor from './components/pages/orders/OrderEditor';
import InvoicesManager from './components/pages/invoices/InvoicesManager';
import InvoiceEditor from './components/pages/invoices/InvoiceEditor';
import AppointmentsManager from './components/pages/appointments/AppointmentsManager';
import AppointmentEditor from './components/pages/appointments/AppointmentEditor';
import ShipmentsManager from './components/pages/shipments/ShipmentsManager';
import ShipmentEditor from './components/pages/shipments/ShipmentEditor';
import VendorsManager from './components/pages/vendors/VendorsManager';
import VendorEditor from './components/pages/vendors/VendorEditor';
import BannersManager from './components/pages/banners/BannersManager';
import BannerEditor from './components/pages/banners/BannerEditor';
import TransactionsManager from './components/pages/transactions/TransactionsManager';
import LoadingSpinner from './components/common/LoadingSpinner';

function ProjectRoutes() {
  return (
    <ProjectProvider>
      <Layout>
        <Routes>
          <Route path="dashboard" element={<EnterpriseDashboard />} />
          <Route path="dashboard/basic" element={<Dashboard />} />
          <Route path="pages" element={<PagesManager />} />
          <Route path="pages/builder/:id?" element={<PageBuilder />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="blog/categories" element={<BlogCategoryManager />} />
          <Route path="media" element={<MediaManager />} />
          <Route path="events" element={<EventsManager />} />
          <Route path="events/new" element={<EventEditor />} />
          <Route path="events/edit/:id" element={<EventEditor />} />
          <Route path="events/categories" element={<EventCategoryManager />} />
          <Route path="donations" element={<DonationsManager />} />
          <Route path="donations/new" element={<DonationEditor />} />
          <Route path="donations/edit/:id" element={<DonationEditor />} />
          <Route path="team" element={<TeamManager />} />
          <Route path="team/new" element={<TeamMemberEdit />} />
          <Route path="team/edit/:id" element={<TeamMemberEdit />} />
          <Route path="team/designations" element={<TeamDesignationManager />} />
          <Route path="components" element={<ComponentsManager />} />
          <Route path="components/usage" element={<ComponentUsageManager />} />
          <Route path="components/edit/:componentType" element={<ComponentEditor />} />
          <Route path="components/preview/:componentType" element={<ComponentPreview />} />
          <Route path="products" element={<EnhancedProductManager />} />
          <Route path="products/new" element={<MultiImageProductEditor />} />
          <Route path="products/edit/:id" element={<MultiImageProductEditor />} />
          <Route path="products/categories" element={<CategoryManager />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="services/new" element={<ServiceEditor />} />
          <Route path="services/edit/:id" element={<ServiceEditor />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="orders/new" element={<OrderEditor />} />
          <Route path="orders/edit/:id" element={<OrderEditor />} />
          <Route path="invoices" element={<InvoicesManager />} />
          <Route path="invoices/new" element={<InvoiceEditor />} />
          <Route path="invoices/edit/:id" element={<InvoiceEditor />} />
          <Route path="appointments" element={<AppointmentsManager />} />
          <Route path="appointments/new" element={<AppointmentEditor />} />
          <Route path="appointments/edit/:id" element={<AppointmentEditor />} />
          <Route path="shipments" element={<ShipmentsManager />} />
          <Route path="shipments/new" element={<ShipmentEditor />} />
          <Route path="shipments/edit/:id" element={<ShipmentEditor />} />
          <Route path="vendors" element={<VendorsManager />} />
          <Route path="vendors/new" element={<VendorEditor />} />
          <Route path="vendors/edit/:id" element={<VendorEditor />} />
          <Route path="banners" element={<BannersManager />} />
          <Route path="banners/new" element={<BannerEditor />} />
          <Route path="banners/edit/:id" element={<BannerEditor />} />
          <Route path="transactions" element={<TransactionsManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings/*" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Layout>
    </ProjectProvider>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Always require login
  if (!user) {
    return <LoginPage />;
  }

  // API key mode: login done → go straight to project dashboard (no tenant dashboard)
  if (hasApiKey) {
    return (
      <Routes>
        <Route path="/*" element={<ProjectRoutes />} />
      </Routes>
    );
  }

  // No API key: full tenant admin flow with project selector
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/p/:projectId/*" element={<ProjectRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
