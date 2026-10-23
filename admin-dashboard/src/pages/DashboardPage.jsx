import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAdminAuth } from '../context/AdminAuthContext';
import styles from './DashboardPage.module.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: color + '22', color }}>
      <span>{icon}</span>
    </div>
    <div>
      <p className={styles.statValue}>{Number(value).toLocaleString()}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
);

const PIE_COLORS = ['#1B6CA8','#F26419','#2EC4B6','#FFB703','#EF476F','#06D6A0'];

export default function DashboardPage() {
  const { api } = useAdminAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setData(r))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loader}>Loading dashboard…</div>;
  if (!data)   return <div className={styles.loader}>Failed to load data.</div>;

  const { stats, popularDest, recentSubmissions } = data;

  const pieData = [
    { name: 'Travelers', value: stats.users },
    { name: 'Destinations', value: stats.destinations },
    { name: 'Reviews', value: stats.reviews },
    { name: 'Itineraries', value: stats.itineraries },
    { name: 'Pending', value: stats.pending_destinations },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <p className={styles.pageSubtitle}>Welcome back! Here's what's happening on LakbayLocal.</p>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard icon="👥" label="Total Users"          value={stats.users}                color="var(--primary)" />
        <StatCard icon="🏝" label="Destinations"         value={stats.destinations}         color="var(--accent)" />
        <StatCard icon="⏳" label="Pending Submissions"  value={stats.pending_destinations} color="var(--warning)" />
        <StatCard icon="⭐" label="Total Reviews"        value={stats.reviews}              color="var(--secondary)" />
        <StatCard icon="🗺" label="Itineraries Created"  value={stats.itineraries}          color="var(--success)" />
      </div>

      <div className={styles.chartsRow}>
        {/* Bar chart: popular destinations */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Destinations by Reviews</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={popularDest} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Bar dataKey="review_count" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: platform breakdown */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Platform Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent submissions */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Recent Submissions</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Destination</th>
              <th>City</th>
              <th>Submitted By</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.map(s => (
              <tr key={s.id}>
                <td className={styles.bold}>{s.name}</td>
                <td>{s.city || '—'}</td>
                <td>{s.submitted_by || 'Admin'}</td>
                <td>
                  <span className={styles.badge} data-status={s.status}>{s.status}</span>
                </td>
                <td className={styles.muted}>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
