import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  RiUploadCloud2Line,
  RiRobot2Line,
  RiBarChart2Line,
  RiDownloadLine,
  RiArrowRightSLine,
  RiAlertLine,
} from 'react-icons/ri';
import { FiUpload } from 'react-icons/fi';

const FORMAT_PILLS = ['PDF', 'CSV', 'XLS', 'XLSX'];

const FEATURE_CARDS = [
  {
    icon: <RiRobot2Line style={{ color: '#534AB7', fontSize: 16 }} />,
    iconBg: '#EEEDFE',
    title: '7 categories',
    sub: 'Auto-tagged by ML',
  },
  {
    icon: <RiBarChart2Line style={{ color: '#1D9E75', fontSize: 16 }} />,
    iconBg: '#E1F5EE',
    title: 'Charts & insights',
    sub: 'Visual dashboard',
  },
  {
    icon: <RiDownloadLine style={{ color: '#378ADD', fontSize: 16 }} />,
    iconBg: '#E6F1FB',
    title: 'Export reports',
    sub: 'Excel & PDF',
  },
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [typeError, setTypeError] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setTypeError('Only PDF, CSV, XLS, XLSX allowed');
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;
      setTypeError(null);
      // Pass the File object via navigation state so LoadingPage can upload it
      navigate('/loading', { state: { file } });
    },
    [navigate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs mb-8" style={{ color: '#6b6b6b' }}>
          <span style={{ color: '#6b6b6b' }}>Home</span>
          <RiArrowRightSLine />
          <span style={{ color: '#1a1a1a' }}>Upload</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#1a1a1a' }}>
            Analyze your bank statement
          </h1>
          <p className="text-sm" style={{ color: '#6b6b6b' }}>
            Upload your statement and we'll categorize every transaction using ML
          </p>
        </div>

        {/* Dropzone */}
        <div className="flex justify-center mb-10">
          <div
            {...getRootProps()}
            className="w-full max-w-[480px] rounded-xl p-8 text-center cursor-pointer bg-white transition-colors"
            style={{
              border: isDragActive ? '1.5px dashed #534AB7' : '1.5px dashed #d1d5db',
              backgroundColor: isDragActive ? '#f5f3ff' : '#ffffff',
            }}
          >
            <input {...getInputProps()} />

            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#534AB7' }}
              >
                <RiUploadCloud2Line style={{ color: '#fff', fontSize: 24 }} />
              </div>
            </div>

            <p className="text-sm font-medium mb-1" style={{ color: '#1a1a1a' }}>
              Drop your statement here
            </p>
            <p className="text-xs mb-5" style={{ color: '#6b6b6b' }}>
              or click to browse files
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-white text-xs font-medium px-4 py-2 rounded-lg mb-5 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#534AB7' }}
            >
              <FiUpload />
              Choose file
            </button>

            <div className="flex justify-center gap-2">
              {FORMAT_PILLS.map((fmt) => (
                <span
                  key={fmt}
                  className="text-xs rounded-full px-2.5 py-0.5"
                  style={{ border: '1px solid #e5e5e5', color: '#6b6b6b' }}
                >
                  {fmt}
                </span>
              ))}
            </div>

            {typeError && (
              <div
                className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: '#FCEBEB',
                  color: '#E24B4A',
                  border: '1px solid #E24B4A',
                }}
              >
                <RiAlertLine style={{ flexShrink: 0 }} />
                {typeError}
              </div>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-4">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-4"
              style={{ border: '0.5px solid #e5e5e5' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: card.iconBg }}
              >
                {card.icon}
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                {card.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>
    </div>
  );
};

export default UploadPage;
