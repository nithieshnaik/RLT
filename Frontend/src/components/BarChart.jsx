import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ callHistory }) => {
  // Default data in case callHistory is not provided
  const defaultLabels = ['Today', 'Yesterday', '22-10-2025', '23-10-2025', '24-10-2025', '25-10-2025', '26-10-2025'];
  const defaultAvgCalls = [10, 20, 30, 40, 50, 60, 70];
  const defaultTotalCalls = [12, 18, 25, 35, 45, 55, 65];

  // Data for the chart - use provided data or defaults
  const data = {
    labels: callHistory?.labels || defaultLabels,
    datasets: [
      {
        label: 'Average Calls',
        data: callHistory?.avgCalls || defaultAvgCalls,
        backgroundColor: 'rgba(135, 206, 235, 0.5)', // Light Blue
        borderColor: 'rgba(0, 123, 255, 1)', // Blue
        borderWidth: 1,
        barThickness: 35,
      },
      {
        label: 'Total Calls',
        data: callHistory?.totalCalls || defaultTotalCalls,
        backgroundColor: '#2D8BBA', // Darker Blue
        borderColor: '#41B8D5', // Dark Blue
        borderWidth: 1,
        barThickness: 35,
      },
    ],
  };

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-[94vh] h-[27vh] mx-auto bg-white rounded-2xl shadow-lg">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;