import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, AlertCircle, Smartphone, Calendar, FileType } from 'lucide-react';
import { getBuildList, getBuild } from '../services/apiService';
import { Build } from '../types/build';

const Downloads: React.FC = () => {
  const { buildId } = useParams<{ buildId?: string }>();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedBuildId, setHighlightedBuildId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilds = async () => {
      try {
        // If buildId is provided, fetch that specific build
        if (buildId) {
          const build = await getBuild(buildId);
          if (build) {
            setBuilds([build]);
            setHighlightedBuildId(buildId);
          }
        } else {
          // Otherwise fetch all builds
          const buildList = await getBuildList();
          setBuilds(buildList);
        }
      } catch (err) {
        console.error('Failed to fetch builds:', err);
        setError('Failed to load your builds. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [buildId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Processing</span>;
      case 'queued':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Queued</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg mb-4 p-4">
              <div className="flex justify-between">
                <div className="w-1/2">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-1/4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Builds</h1>
      
      {builds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No builds found</h2>
          <p className="text-gray-600 mb-6">You haven't created any APK builds yet.</p>
          <a
            href="/upload"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Build
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {builds.map((build) => (
            <div 
              key={build.id}
              className={`bg-white rounded-xl shadow-md transition-all duration-300 ${
                highlightedBuildId === build.id ? 'ring-2 ring-indigo-500 transform scale-[1.02]' : ''
              }`}
            >
              <div className="p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-gray-800 mr-3">
                        {build.name || `Build #${build.id.substring(0, 8)}`}
                      </h2>
                      {getStatusBadge(build.status)}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(build.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FileType className="h-4 w-4 mr-1" />
                        <span>{build.fileSize ? `${(build.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {build.status === 'completed' && (
                    <a
                      href={build.downloadUrl}
                      download
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium 
                                rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download APK
                    </a>
                  )}
                </div>
                
                {build.status === 'failed' && build.error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    <strong>Error:</strong> {build.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;