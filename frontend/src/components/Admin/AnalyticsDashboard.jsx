import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/analytics/summary');
        setSummary(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      }
    };

    fetchData();
  }, []);

  if (!summary) return <p>Loading analytics...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📊 Analytics Dashboard</h2>
      <p><strong>Total Orders:</strong> {summary.totalOrders}</p>

      <h3>Top Products:</h3>
      <ul>
        {summary.topProducts.map((product, index) => (
          <li key={index} style={{ marginBottom: '1rem' }}>
            <strong>ID:</strong> {product._id}<br />
            <strong>Total Sold:</strong> {product.totalSold}<br />
            <strong>Revenue:</strong> ${product.totalRevenue.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnalyticsDashboard;
