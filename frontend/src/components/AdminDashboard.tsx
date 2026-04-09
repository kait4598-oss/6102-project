import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllData, deleteUserData } from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [dataFiles, setDataFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await getAllUsers();
      const dataRes = await getAllData(); 
      setUsers(usersRes.data);
      setDataFiles(dataRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async (dataId: number) => {
    if (!confirm('Are you sure you want to permanently delete this dataset and its analysis?')) return;
    try {
      await deleteUserData(dataId);
      fetchAdminData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {loading ? (
          <p className="text-center py-12">Loading...</p>
        ) : (
          <div className="space-y-12">
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Username</th>
                      <th className="px-4 py-2 border">Role</th>
                      <th className="px-4 py-2 border">Hashed Password (Demo Only)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{user.id}</td>
                        <td className="px-4 py-2 border font-medium">{user.username}</td>
                        <td className="px-4 py-2 border text-gray-500">{user.role}</td>
                        <td className="px-4 py-2 border text-xs text-gray-400 font-mono truncate max-w-[200px]">
                          {user.hashed_password}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Data & Model Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">User ID</th>
                      <th className="px-4 py-2 border">Filename</th>
                      <th className="px-4 py-2 border">Model Accuracy</th>
                      <th className="px-4 py-2 border">Heatmap Status</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataFiles.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{item.id}</td>
                        <td className="px-4 py-2 border">{item.user_id}</td>
                        <td className="px-4 py-2 border font-medium">{item.filename}</td>
                        <td className="px-4 py-2 border text-blue-600 font-bold">
                          {(item.model_accuracy * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-2 border">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Stored in S3
                          </span>
                        </td>
                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleDeleteData(item.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete All Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
