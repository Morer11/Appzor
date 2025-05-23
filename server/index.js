import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const buildsDir = path.join(__dirname, 'builds');
const tempDir = path.join(__dirname, 'temp');

[uploadsDir, buildsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: tempDir
}));

// Capacitor configuration for Android
const capacitorConfig = {
  appId: 'com.gameconverter.app',
  appName: 'AppZorb App',
  webDir: 'www',
  server: {
    androidScheme: 'file',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    buildOptions: {
      minSdkVersion: 21,
      targetSdkVersion: 33
    }
  }
};

// In-memory storage for build status (in production, use a database)
const builds = new Map();

// API Routes
app.post('/api/builds/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const gameFile = req.files.file;
    const platform = req.body.platform || 'android';
    
    // Validate file is a ZIP
    if (!gameFile.name.endsWith('.zip')) {
      return res.status(400).json({ error: 'Only ZIP files are allowed.' });
    }
    
    // Generate a unique build ID
    const buildId = uuidv4();
    const uploadPath = path.join(uploadsDir, `${buildId}.zip`);
    const extractPath = path.join(tempDir, buildId);
    
    // Save the file
    await gameFile.mv(uploadPath);
    
    // Create a build record
    const build = {
      id: buildId,
      name: gameFile.name.replace('.zip', ''),
      status: 'queued',
      createdAt: new Date().toISOString(),
      fileSize: gameFile.size,
      downloadUrl: null,
      error: null,
      platform
    };
    
    builds.set(buildId, build);
    
    // Start the build process in the background
    if (platform === 'android') {
      processAndroidBuild(buildId, uploadPath, extractPath);
    } else {
      processPCBuild(buildId, uploadPath, extractPath);
    }
    
    return res.status(201).json({ buildId });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file.' });
  }
});

app.get('/api/builds/:buildId/status', (req, res) => {
  const { buildId } = req.params;
  const build = builds.get(buildId);
  
  if (!build) {
    return res.status(404).json({ error: 'Build not found.' });
  }
  
  return res.json({
    status: build.status,
    progress: build.progress || 0,
    step: build.step,
    error: build.error,
    platform: build.platform
  });
});

app.get('/api/builds/:buildId', (req, res) => {
  const { buildId } = req.params;
  const build = builds.get(buildId);
  
  if (!build) {
    return res.status(404).json({ error: 'Build not found.' });
  }
  
  return res.json(build);
});

app.get('/api/builds', (req, res) => {
  const buildList = Array.from(builds.values());
  return res.json(buildList);
});

app.get('/api/builds/:buildId/download', (req, res) => {
  const { buildId } = req.params;
  const build = builds.get(buildId);
  
  if (!build || build.status !== 'completed') {
    return res.status(404).json({ error: 'Build not found or not completed.' });
  }
  
  const buildPath = path.join(buildsDir, `${buildId}${build.platform === 'android' ? '.apk' : '.zip'}`);
  
  if (!fs.existsSync(buildPath)) {
    return res.status(404).json({ error: 'Build file not found.' });
  }
  
  return res.download(buildPath, `${build.name}${build.platform === 'android' ? '.apk' : '.zip'}`);
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Function to process Android build
async function processAndroidBuild(buildId, zipPath, extractPath) {
  try {
    const build = builds.get(buildId);
    if (!build) return;
    
    // Update status to processing
    build.status = 'processing';
    build.progress = 10;
    build.step = 'Extracting files...';
    
    // Create Capacitor project
    fs.mkdirSync(extractPath, { recursive: true });
    
    // Extract ZIP file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    
    build.progress = 30;
    build.step = 'Configuring Capacitor...';
    
    // Create Capacitor config
    fs.writeFileSync(
      path.join(extractPath, 'capacitor.config.json'),
      JSON.stringify(capacitorConfig, null, 2)
    );
    
    build.progress = 50;
    build.step = 'Building Android project...';
    
    // Copy game files to www directory
    const wwwDir = path.join(extractPath, 'www');
    fs.mkdirSync(wwwDir, { recursive: true });
    fs.cpSync(extractPath, wwwDir, { recursive: true });
    
    // Initialize Capacitor project
    execSync('npm init -y', { cwd: extractPath });
    execSync('npm install @capacitor/core @capacitor/cli @capacitor/android', { cwd: extractPath });
    execSync('npx cap init "Game App" com.gameconverter.app --web-dir www', { cwd: extractPath });
    execSync('npx cap add android', { cwd: extractPath });
    
    build.progress = 70;
    build.step = 'Building APK...';
    
    // Build APK
    execSync('npx cap sync android', { cwd: extractPath });
    execSync('cd android && ./gradlew assembleDebug', { cwd: extractPath });
    
    // Copy APK to builds directory
    const apkSource = path.join(extractPath, 'android/app/build/outputs/apk/debug/app-debug.apk');
    const apkDest = path.join(buildsDir, `${buildId}.apk`);
    fs.copyFileSync(apkSource, apkDest);
    
    // Update build status
    build.status = 'completed';
    build.progress = 100;
    build.downloadUrl = `/api/builds/${buildId}/download`;
    
    // Clean up
    fs.rmSync(extractPath, { recursive: true, force: true });
    fs.rmSync(zipPath);
    
  } catch (error) {
    console.error(`Build error for ${buildId}:`, error);
    
    const build = builds.get(buildId);
    if (build) {
      build.status = 'failed';
      build.error = error.message || 'An unknown error occurred during the build process.';
    }
  }
}

// Function to process PC build
async function processPCBuild(buildId, zipPath, extractPath) {
  try {
    const build = builds.get(buildId);
    if (!build) return;
    
    // Update status to processing
    build.status = 'processing';
    build.progress = 20;
    build.step = 'Processing files...';
    
    // Create build directory
    fs.mkdirSync(extractPath, { recursive: true });
    
    // Extract ZIP file
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    
    build.progress = 50;
    build.step = 'Optimizing for desktop...';
    
    // Create a new ZIP file with optimized structure
    const outputZip = new AdmZip();
    
    // Add all files from the extract path
    const files = fs.readdirSync(extractPath);
    files.forEach(file => {
      const filePath = path.join(extractPath, file);
      if (fs.statSync(filePath).isFile()) {
        outputZip.addLocalFile(filePath);
      } else {
        outputZip.addLocalFolder(filePath, file);
      }
    });
    
    build.progress = 80;
    build.step = 'Creating PC package...';
    
    // Save the optimized ZIP
    const outputPath = path.join(buildsDir, `${buildId}.zip`);
    outputZip.writeZip(outputPath);
    
    // Update build status
    build.status = 'completed';
    build.progress = 100;
    build.downloadUrl = `/api/builds/${buildId}/download`;
    
    // Clean up
    fs.rmSync(extractPath, { recursive: true, force: true });
    fs.rmSync(zipPath);
    
  } catch (error) {
    console.error(`Build error for ${buildId}:`, error);
    
    const build = builds.get(buildId);
    if (build) {
      build.status = 'failed';
      build.error = error.message || 'An unknown error occurred during the build process.';
    }
  }
}
