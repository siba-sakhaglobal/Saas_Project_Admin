import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../../context/ProjectContext';
import cms from '../../../services/cms';
import {
  Edit3, Calendar, Users, Heart, Image, ShoppingBag, BarChart3, Shield,
  TrendingUp, CheckCircle, FileText, Target, Eye, ArrowRight, Clock,
  AlertTriangle, HardDrive, UserCheck, BarChart, Settings, Layers,
  Package, Megaphone, Activity, DollarSign, Mail, Globe, Zap,
} from 'lucide-react';
import {
  LineChart, Line, BarChart as RechartBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const ICON_MAP = {
  Edit3, Calendar, Users, Heart, Image, ShoppingBag, BarChart3, Shield,
  TrendingUp, CheckCircle, FileText, Target, Eye, Clock, AlertTriangle,
  HardDrive, UserCheck, BarChart, Settings, Layers, Package, Megaphone,
  Activity, DollarSign, Mail, Globe, Zap,
};

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const COLOR_MAP = {
  blue:   { bg: '#EFF6FF', fg: '#2563EB' },
  green:  { bg: '#ECFDF5', fg: '#10B981' },
  yellow: { bg: '#FEF3C7', fg: '#D97706' },
  purple: { bg: '#F5F3FF', fg: '#8B5CF6' },
  red:    { bg: '#FEF2F2', fg: '#DC2626' },
  pink:   { bg: '#FDF2F8', fg: '#EC4899' },
  cyan:   { bg: '#ECFEFF', fg: '#0891B2' },
  orange: { bg: '#FFF7ED', fg: '#EA580C' },
  slate:  { bg: '#F1F5F9', fg: '#475569' },
};

const QUICK_ACTIONS = [
  { label: 'Blog',            icon: 'FileText',  route: '/blog',     color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Events',          icon: 'Calendar',   route: '/events',   color: '#10B981', bg: '#ECFDF5' },
  { label: 'Media',           icon: 'Image',      route: '/media',    color: '#D97706', bg: '#FEF3C7' },
  { label: 'Team',            icon: 'Users',      route: '/team',     color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'User Management', icon: 'UserCheck',  route: '/users',    color: '#EC4899', bg: '#FDF2F8' },
  { label: 'Settings',        icon: 'Settings',   route: '/settings', color: '#0891B2', bg: '#ECFEFF' },
];

const PINNED_CHART_KEYS = ['endUsers.signupsTrend', 'team.byRole'];

const cardStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const fmt = (v) => (typeof v === 'number' ? v.toLocaleString() : v ?? '0');

const EnterpriseDashboard = () => {
  const { projectId } = useProject();
  const navigate = useNavigate();
  const [data, setData] = useState({ widgets: [], values: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        const { data: d } = await cms.raw().get(`/api/projects/${projectId}/dashboard-data`);
        setData({
          widgets: Array.isArray(d.widgets) ? d.widgets : [],
          values: d.values || {},
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setData({ widgets: [], values: {} });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const statWidgets     = data.widgets.filter(w => w.type === 'stat_card' || w.type === 'counter');
  const allCharts       = data.widgets.filter(w => w.type?.startsWith('chart_'));
  const pinnedCharts    = allCharts.filter(w => PINNED_CHART_KEYS.includes(w.dataKey));
  const remainingCharts = allCharts.filter(w => !PINNED_CHART_KEYS.includes(w.dataKey));
  const activityWidgets = data.widgets.filter(w => w.type === 'activity_feed');

  const renderChart = (widget, height = 200) => {
    const cd = data.values[widget.dataKey] || [];
    if (!Array.isArray(cd) || cd.length === 0) {
      return <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0', fontSize: 13 }}>No data available</div>;
    }
    const tipStyle = { backgroundColor: '#1E293B', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 };
    if (widget.type === 'chart_line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={cd}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} width={30} />
            <Tooltip contentStyle={tipStyle} />
            <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    if (widget.type === 'chart_bar') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RechartBarChart data={cd}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} width={30} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </RechartBarChart>
        </ResponsiveContainer>
      );
    }
    if (widget.type === 'chart_donut' || widget.type === 'chart_pie') {
      const legendData = cd.filter(d => d.value > 0);
      return (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie data={cd} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {cd.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {legendData.length > 0 && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              {legendData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ fontSize: 11, color: '#64748B' }}>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: 28, width: 160, background: '#F1F5F9', borderRadius: 6, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12, marginBottom: 24 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ height: 96, background: '#F1F5F9', borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 280, background: '#F1F5F9', borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Project overview and key metrics</p>
      </div>

      {/* ROW 1: All Stat/Counter Cards — ~7 per row */}
      {statWidgets.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {statWidgets.map(widget => {
            const Icon = ICON_MAP[widget.icon] || Eye;
            const c = COLOR_MAP[widget.color] || COLOR_MAP.blue;
            const value = data.values[widget.dataKey];
            return (
              <div key={widget.id} style={{
                ...cardStyle, padding: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, minHeight: 92,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, backgroundColor: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 18, height: 18, color: c.fg }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', lineHeight: 1.1 }}>{fmt(value)}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{widget.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ROW 2: Quick Actions | Signups Trend | Members by Role — 3 equal columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {QUICK_ACTIONS.map(action => (
              <div
                key={action.label}
                onClick={() => navigate(`/p/${projectId}${action.route}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  borderRadius: 8, cursor: 'pointer', transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = action.bg}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', backgroundColor: action.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, flex: 1 }}>{action.label}</span>
                <ArrowRight style={{ width: 12, height: 12, color: '#CBD5E1' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Signups Trend */}
        {pinnedCharts[0] ? (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{pinnedCharts[0].title}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Last 30 days</div>
              </div>
              <TrendingUp style={{ width: 16, height: 16, color: '#10B981' }} />
            </div>
            {renderChart(pinnedCharts[0], 190)}
          </div>
        ) : (
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp style={{ width: 28, height: 28, color: '#CBD5E1', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Signups Trend</p>
            </div>
          </div>
        )}

        {/* Members by Role */}
        {pinnedCharts[1] ? (
          <div style={cardStyle}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{pinnedCharts[1].title}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Distribution</div>
            </div>
            {renderChart(pinnedCharts[1], 190)}
          </div>
        ) : (
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Users style={{ width: 28, height: 28, color: '#CBD5E1', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Members by Role</p>
            </div>
          </div>
        )}
      </div>

      {/* ROW 3: Remaining charts + System Health + Activity — auto grid */}
      {(remainingCharts.length > 0 || activityWidgets.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          {/* Remaining charts */}
          {remainingCharts.map(widget => (
            <div key={widget.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{widget.title}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{widget.description || ''}</div>
                </div>
                <TrendingUp style={{ width: 16, height: 16, color: '#10B981' }} />
              </div>
              {renderChart(widget, 190)}
            </div>
          ))}

          {/* System Health */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>System Health</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Plan</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{data.values.planName || 'Free'}</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>Storage</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                    {data.values.storageUsed || 0} / {data.values.storageLimit || '—'} MB
                  </span>
                </div>
                <div style={{ width: '100%', height: 5, background: '#E2E8F0', borderRadius: 3 }}>
                  <div style={{
                    height: 5, background: '#2563EB', borderRadius: 3,
                    width: `${Math.min(((data.values.storageUsed || 0) / (data.values.storageLimit || 100)) * 100, 100)}%`,
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>API Keys</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{data.values.apiKeysActive || 0} Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>End Users</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{fmt(data.values.endUsersTotal)}</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          {activityWidgets.map(widget => (
            <div key={widget.id} style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
                {widget.title || 'Recent Activity'}
              </div>
              {Array.isArray(data.values[widget.dataKey]) && data.values[widget.dataKey].length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {data.values[widget.dataKey].map((item, idx) => {
                    const Icon = ICON_MAP[item.icon] || Clock;
                    return (
                      <div key={idx} style={{
                        display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0',
                        borderBottom: '1px solid #F1F5F9',
                      }}>
                        <Icon style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, flex: 1 }}>{item.title || 'Activity'}</span>
                        <span style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }}>{item.time || 'Now'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>No activity yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;
