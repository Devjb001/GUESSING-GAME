import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const DebugPage = () => {
  const [logs, setLogs] = useState([]);
  const [backendUrl, setBackendUrl] = useState('');
  const [testResult, setTestResult] = useState('');

  const addLog = (msg) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    console.log(msg);
  };

  useEffect(() => {
    // Detect backend URL
    const isProduction = 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    window.location.hostname !== '';
  
  const url = isProduction
    ? 'https://guessing-game-yck1.onrender.com'  // ← PUT YOUR ACTUAL RENDER URL
    : 'http://localhost:5000';
  
  setBackendUrl(url);
  addLog(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  addLog(`Hostname: ${window.location.hostname}`);
  addLog(`Detected backend URL: ${url}`);
    // Test HTTP connection
    fetch(url)
      .then(res => res.json())
      .then(data => {
        addLog(`✅ HTTP connection successful!`);
        addLog(`Response: ${JSON.stringify(data)}`);
        setTestResult('HTTP: ✅ Working');
      })
      .catch(err => {
        addLog(`❌ HTTP connection failed: ${err.message}`);
        setTestResult('HTTP: ❌ Failed');
      });

    // Test WebSocket connection
    addLog('Attempting WebSocket connection...');
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      addLog(`✅ WebSocket connected! Socket ID: ${socket.id}`);
      setTestResult(prev => prev + ' | WebSocket: ✅ Working');
    });

    socket.on('connect_error', (error) => {
      addLog(`❌ WebSocket error: ${error.message}`);
      setTestResult(prev => prev + ' | WebSocket: ❌ Failed');
    });

    socket.on('disconnect', () => {
      addLog('⚠️ WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#fff', minHeight: '100vh' }}>
      <h1>🔍 Connection Debug Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Environment Info:</h3>
        <p><strong>Frontend URL:</strong> {window.location.href}</p>
        <p><strong>Backend URL:</strong> {backendUrl}</p>
        <p><strong>Hostname:</strong> {window.location.hostname}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Test Results:</h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{testResult || 'Testing...'}</p>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#2d2d2d', borderRadius: '8px' }}>
        <h3>Connection Logs:</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid #444' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;