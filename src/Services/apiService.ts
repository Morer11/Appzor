import axios from 'axios';
import { Build, BuildStatus } from '../types/build';

// API base URL
const API_BASE_URL = '/api';

// Simulate API responses for demo purposes
// In a real implementation, these would make actual API calls
export const uploadGameFiles = async (file: File): Promise<{ buildId: string }> => {
  // Create a form data object
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would be:
    // const response = await axios.post(`${API_BASE_URL}/builds/upload`, formData);
    // return response.data;
    
    // For demo purposes, return a mock response
    return { buildId: `build-${Math.random().toString(36).substring(2, 10)}` };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getBuildStatus = async (buildId: string): Promise<BuildStatus> => {
  try {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real implementation, this would be:
    // const response = await axios.get(`${API_BASE_URL}/builds/${buildId}/status`);
    // return response.data;
    
    // For demo purposes, simulate different build statuses
    const statuses: BuildStatus[] = [
      { status: 'queued', progress: 0 },
      { status: 'processing', step: 'Extracting files...', progress: 25 },
      { status: 'processing', step: 'Configuring Capacitor...', progress: 50 },
      { status: 'processing', step: 'Building APK...', progress: 75 },
      { status: 'completed', progress: 100 }
    ];
    
    // Get a random status, biased towards completed for demo purposes
    const randomIndex = Math.floor(Math.random() * (statuses.length + 2));
    return statuses[Math.min(randomIndex, statuses.length - 1)];
  } catch (error) {
    console.error('Get build status error:', error);
    throw error;
  }
};

export const getBuild = async (buildId: string): Promise<Build> => {
  try {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real implementation, this would be:
    // const response = await axios.get(`${API_BASE_URL}/builds/${buildId}`);
    // return response.data;
    
    // For demo purposes, return a mock build
    return {
      id: buildId,
      name: `My Game ${buildId.substring(0, 4)}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      fileSize: Math.floor(Math.random() * 50 * 1024 * 1024), // Random size up to 50MB
      downloadUrl: `/api/builds/${buildId}/download`,
      error: null
    };
  } catch (error) {
    console.error('Get build error:', error);
    throw error;
  }
};

export const getBuildList = async (): Promise<Build[]> => {
  try {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would be:
    // const response = await axios.get(`${API_BASE_URL}/builds`);
    // return response.data;
    
    // For demo purposes, return mock builds
    const mockBuilds: Build[] = [];
    const statuses = ['completed', 'completed', 'completed', 'processing', 'failed'];
    
    for (let i = 0; i < 5; i++) {
      const status = statuses[i];
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockBuilds.push({
        id: `build-${Math.random().toString(36).substring(2, 10)}`,
        name: `Game Build ${i + 1}`,
        status,
        createdAt: date.toISOString(),
        fileSize: Math.floor(Math.random() * 50 * 1024 * 1024), // Random size up to 50MB
        downloadUrl: status === 'completed' ? `/api/builds/sample-${i}/download` : undefined,
        error: status === 'failed' ? 'Invalid HTML structure in game files' : null
      });
    }
    
    return mockBuilds;
  } catch (error) {
    console.error('Get build list error:', error);
    throw error;
  }
};