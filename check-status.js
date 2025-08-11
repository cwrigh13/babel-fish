const http = require('http');

// Check server status
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:5000/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: 'running', data: result });
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'error', error: 'Request timeout' });
    });
    
    req.end();
  });
}

// Check client status (vanilla JavaScript)
function checkClient() {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:3000', (res) => {
      resolve({ status: 'running', statusCode: res.statusCode });
    });
    
    req.on('error', (err) => {
      resolve({ status: 'error', error: err.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'error', error: 'Request timeout' });
    });
    
    req.end();
  });
}

// Main check function
async function checkStatus() {
  console.log('🔍 Checking Babel Fish Application Status...\n');
  
  console.log('📡 Checking Server (Port 5000)...');
  const serverStatus = await checkServer();
  if (serverStatus.status === 'running') {
    console.log('✅ Server is running successfully!');
    console.log(`   Health: ${JSON.stringify(serverStatus.data)}`);
  } else {
    console.log('❌ Server is not running or has errors:');
    console.log(`   Error: ${serverStatus.error}`);
  }
  
  console.log('\n🌐 Checking Client (Port 3000)...');
  const clientStatus = await checkClient();
  if (clientStatus.status === 'running') {
    console.log('✅ Client is running successfully!');
    console.log(`   Status Code: ${clientStatus.statusCode}`);
  } else {
    console.log('❌ Client is not running or has errors:');
    console.log(`   Error: ${clientStatus.error}`);
  }
  
  console.log('\n📱 Access URLs:');
  console.log('   Client: http://localhost:3000');
  console.log('   Server: http://localhost:5000');
  console.log('   Health: http://localhost:5000/health');
  
  if (serverStatus.status === 'running' && clientStatus.status === 'running') {
    console.log('\n🎉 Both applications are running successfully!');
    console.log('   You can now use the Babel Fish application.');
  } else {
    console.log('\n⚠️  Some applications may not be running properly.');
    console.log('   Check the error messages above and ensure all dependencies are installed.');
  }
}

// Run the check
checkStatus().catch(console.error);
