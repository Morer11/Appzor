import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { getBuildStatus } from '../services/apiService';
import { BuildStatus as BuildStatusType } from '../types/build';

const BuildStatus: React.FC = () => {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();
  const [buildStatus, setBuildStatus] = useState<BuildStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buildId) {
      setError('Build ID is missing');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const status = await getBuildStatus(buildId);
        setBuildStatus(status);
        
        // If build is completed, redirect to download page after 2 seconds
        if (status.status === 'completed') {
          setTimeout(() => {
            navigate(`/downloads/${buildId}`);
          }, 2000);
        }
        
        // If build is still in progress, poll for updates
        if (status.status === 'processing' || status.status === 'queued') {
          const timer = setTimeout(fetchStatus, 3000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Failed to fetch build status:', err);
        setError('Failed to fetch build status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [buildId, navigate]);

  const getStatusIcon = () => {
    if (!buildStatus) return <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />;
    
    switch (buildStatus.status) {
      case 'queued':
        return <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!buildStatus) return 'Checking build status...';
    
    switch (buildStatus.status) {
      case 'queued':
        return 'Your build is in the queue...';
      case 'processing':
        return buildStatus.step || 'Processing your game files...';
      case 'completed':
        return 'Build completed! Redirecting to download page...';
      case 'failed':
        return `Build failed: ${buildStatus.error || 'An unknown error occurred'}`;
      default:
        return 'Unknown status';
    }
  };

  const getProgressPercentage = () => {
    if (!buildStatus) return 0;
    
    switch (buildStatus.status) {
      case 'queued':
        return 10;
      case 'processing':
        return buildStatus.progress || 50;
      case 'completed':
        return 100;
      case 'failed':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading build status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="text-center mb-6">
          {getStatusIcon()}
          <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
            {buildStatus?.status === 'completed' ? 'Build Successful!' : 'Building Your APK'}
          </h2>
          <p className="text-gray-600">{getStatusMessage()}</p>
        </div>

        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                buildStatus?.status === 'failed' ? 'bg-red-500' : 
                buildStatus?.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${getProgressPercentage()}%`, transition: 'width 0.5s ease' }}
            ></div>
          </div>
        </div>

        {buildStatus?.status === 'completed' && (
          <div className="text-center">
            <button
              onClick={() => navigate(`/downloads/${buildId}`)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download APK Now
            </button>
          </div>
        )}

        {buildStatus?.status === 'failed' && (
          <div className="text-center">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildStatus;