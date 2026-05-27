import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RiLoader4Line, RiAlertLine } from 'react-icons/ri';
import axios from 'axios';
import { useStatement } from '../context/StatementContext';

const LoadingPage = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { setStatementData } = useStatement();

  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);
  const uploadedRef = useRef(false); // guard against React StrictMode double-invoke

  useEffect(() => {
    if (uploadedRef.current) return;
    uploadedRef.current = true;

    const file = location.state?.file;
    if (!file) {
      navigate('/upload');
      return;
    }

    // Animate to 70% while the real call is in-flight
    const progressTimer = setTimeout(() => setProgress(70), 200);

    const doUpload = async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          '/api/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );

        const { transactions, summary } = response.data;

        setStatementData((prev) => ({
          ...prev,
          transactions,
          summary,
          filename:       file.name,
          filtered:       transactions,
          activeCategory: 'All',
          activePage:     1,
          amountFilter:   'All',
          // preserve categories fetched from DB — never overwrite with upload result
        }));

        setProgress(100);
        setTimeout(() => navigate('/dashboard'), 400);
      } catch (err) {
        let msg = 'Failed to process the file. Please try again.';

        if (err.response?.data?.detail) {
          msg = err.response.data.detail;
        } else if (!err.response) {
          msg =
            'Could not connect to server. Make sure the backend is running on http://localhost:8000';
        }

        setError(msg);
      }
    };

    doUpload();
    return () => clearTimeout(progressTimer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Error state ── */
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f8f8f6' }}
      >
        <div
          className="bg-white rounded-xl p-8 max-w-sm w-full text-center"
          style={{ border: '0.5px solid #e5e5e5' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#FCEBEB' }}
          >
            <RiAlertLine style={{ color: '#E24B4A', fontSize: 24 }} />
          </div>

          <h3 className="text-sm font-semibold mb-2" style={{ color: '#1a1a1a' }}>
            Upload failed
          </h3>
          <p className="text-xs mb-6" style={{ color: '#6b6b6b' }}>
            {error}
          </p>

          <Link
            to="/upload"
            className="inline-flex items-center justify-center text-white text-xs font-medium px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#534AB7' }}
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  /* ── Loading animation ── */
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#f8f8f6' }}
    >
      <div className="text-center w-80">
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#534AB7' }}
          >
            <RiLoader4Line
              className="animate-spin"
              style={{ color: '#fff', fontSize: 24 }}
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-1" style={{ color: '#1a1a1a' }}>
          Analyzing your statement…
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6b6b6b' }}>
          Running ML model on transactions
        </p>

        <div
          className="rounded-full h-1.5 mb-2"
          style={{ backgroundColor: '#e5e5e5' }}
        >
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: '#534AB7',
              transition: 'width 1.5s ease-out',
            }}
          />
        </div>

        <div className="flex justify-between text-xs" style={{ color: '#6b6b6b' }}>
          <span>Processing</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
