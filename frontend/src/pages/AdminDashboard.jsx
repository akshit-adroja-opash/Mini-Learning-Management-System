import { useQuery } from "@tanstack/react-query";
import { getAdminAnalytics } from "../api/adminApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await getAdminAnalytics();
      return res.data;
    },
  });

  if (isLoading) return <p>Loading dashboard...</p>;

  const chartData =
    data?.monthlyEnrollments?.map((item) => ({
      name: `${item._id.month}/${item._id.year}`,
      enrollments: item.count,
    })) || [];

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="card">
          <h3>Total Users</h3>
          <p>{data?.totalUsers || 0}</p>
        </div>

        <div className="card">
          <h3>Total Courses</h3>
          <p>{data?.totalCourses || 0}</p>
        </div>

        <div className="card">
          <h3>Total Enrollments</h3>
          <p>{data?.totalEnrollments || 0}</p>
        </div>
      </div>

      {/* ✅ FIXED CHART */}
      <div className="chart-box">
        <h2>Monthly Enrollments</h2>

        {chartData.length === 0 ? (
          <p>No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="enrollments" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}