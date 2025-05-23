import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, CheckCircle, X, Smartphone, Monitor } from 'lucide-react';
import { uploadGameFiles } from '../services/apiService';

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<'android' | 'pc'>('android');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const uploadedFile = acceptedFiles[0];
    
    if (!uploadedFile.name.endsWith('.zip')) {
      setError('Please upload a ZIP file.');
      return;
    }
    
    if (uploadedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size exceeds the 50MB limit.');
      return;
    }
    
    setFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const response = await uploadGameFiles(file, platform);
      navigate(`/build/${response.buildId}`);
    } catch (err) {
      setError('Failed to upload the file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Upload Your Game Files</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Platform</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setPlatform('android')}
              className={`p-4 rounded-lg border-2 transition-all ${
                platform === 'android'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">Android App</h3>
                <p className="text-sm text-gray-500">Build as APK file</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setPlatform('pc')}
              className={`p-4 rounded-lg border-2 transition-all ${
                platform === 'pc'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Monitor className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">PC App</h3>
                <p className="text-sm text-gray-500">Build as executable</p>
              </div>
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
            <li>Your game files must be packaged in a <strong>ZIP archive</strong></li>
            <li>The ZIP file must contain an <strong>index.html</strong> file at the root</li>
            <li>Maximum file size: <strong>50MB</strong></li>
            <li>Include all necessary assets (images, sounds, etc.)</li>
            <li>Your game should be responsive and work on {platform === 'android' ? 'mobile devices' : 'desktop browsers'}</li>
          </ul>
          
          <form onSubmit={handleSubmit}>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                         ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
            >
              <input {...getInputProps()} />
              
              {file ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                  <p className="text-gray-700 mb-2">
                    Drag and drop your ZIP file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 50MB
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={!file || uploading}
              className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-white 
                        ${!file || uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                        transition-colors duration-300`}
            >
              {uploading ? 'Uploading...' : `Convert to ${platform === 'android' ? 'APK' : 'PC App'}`}
            </button>
          </form>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <h3 className="font-medium mb-2">Pro Tips</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Make sure your game works in a {platform === 'android' ? 'mobile' : 'desktop'} browser before uploading</li>
            <li>Test your game's performance on {platform === 'android' ? 'various devices' : 'different browsers'}</li>
            <li>Keep your file size as small as possible for faster conversion</li>
            <li>Use relative paths for all resources in your HTML/CSS/JS files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;