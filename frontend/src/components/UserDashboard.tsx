import React, { useState, useEffect } from 'react';
import { uploadData, getMyData, getDataAnalysis } from '../api';
import AnalysisDashboard from './AnalysisDashboard';

const UserDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getMyData();
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const uploadRes = await uploadData(file);
      setSelectedAnalysisId(uploadRes.data.id);
      const analysisRes = await getDataAnalysis(uploadRes.data.id);
      setAnalysisData(analysisRes.data);
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const viewAnalysis = async (id: number) => {
    setLoading(true);
    setError('');
    setSelectedAnalysisId(id);
    setAnalysisData(null);
    try {
      const response = await getDataAnalysis(id);
      setAnalysisData(response.data);
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } catch (err) {
      console.error('Failed to fetch analysis', err);
      const detail = (err as any)?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Data Analytics Platform</h1>
            <p className="text-sm text-gray-500">Welcome, {localStorage.getItem('username') || 'User'}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Upload Section */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </span>
              Upload & Analyze Data
            </h2>
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-md p-1"
              />
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md"
              >
                {loading ? 'Processing...' : 'Run AI Analysis'}
              </button>
            </form>
            {error && <p className="text-red-500 mt-3 text-sm font-medium">{error}</p>}
          </section>

          {/* Analysis Dashboard */}
          {analysisData && (
            <section id="analysis-results" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
                <button 
                  onClick={() => setAnalysisData(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Results
                </button>
              </div>
              <AnalysisDashboard key={selectedAnalysisId ?? 'current'} data={analysisData} />
            </section>
          )}

          {/* History Section */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 font-bold text-gray-700">
                  <tr>
                    <th className="px-4 py-3 border-b">Filename</th>
                    <th className="px-4 py-3 border-b">Date</th>
                    <th className="px-4 py-3 border-b text-center">Model R²</th>
                    <th className="px-4 py-3 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.length > 0 ? history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.filename}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.model_accuracy > 0.5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {(item.model_accuracy * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => viewAnalysis(item.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Analysis
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No history found. Upload your first dataset to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
