const mongoose = require('mongoose');
const dns = require('dns');
const { promisify } = require('util');

const lookupAsync = promisify(dns.lookup);
const resolveAsync = promisify(dns.resolve);

// MongoDB URI from your .env
const MONGODB_URI = 'mongodb+srv://vishalnyapathi214:5QgwpkLnDSoxkdvf@maindb.mx4soxz.mongodb.net/main?retryWrites=true&w=majority&appName=MainDB';

async function diagnosticTest() {
  console.log('🔍 Running MongoDB Connection Diagnostics...\n');
  
  try {
    // Extract hostname from URI
    const url = new URL(MONGODB_URI);
    const hostname = url.hostname;
    
    console.log('📋 Connection Details:');
    console.log(`Hostname: ${hostname}`);
    console.log(`Port: ${url.port || '27017'}`);
    console.log(`Database: ${url.pathname.substring(1).split('?')[0]}`);
    console.log('');
    
    // Test 1: DNS Resolution
    console.log('🔍 Test 1: DNS Resolution');
    try {
      const addresses = await lookupAsync(hostname);
      console.log(`✅ DNS Resolution successful: ${addresses.address}`);
    } catch (dnsError) {
      console.error(`❌ DNS Resolution failed: ${dnsError.message}`);
      return;
    }
    
    // Test 2: SRV Record Resolution (for mongodb+srv)
    console.log('\n🔍 Test 2: SRV Record Resolution');
    try {
      const srvRecords = await resolveAsync(hostname, 'SRV');
      console.log(`✅ SRV Records found: ${srvRecords.length} records`);
      srvRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.name}:${record.port} (priority: ${record.priority})`);
      });
    } catch (srvError) {
      console.log(`⚠️  SRV Resolution warning: ${srvError.message}`);
    }
    
    // Test 3: Basic MongoDB Connection
    console.log('\n🔍 Test 3: MongoDB Connection Test');
    
    mongoose.set('bufferCommands', false);
    
    const startTime = Date.now();
    
    try {
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        bufferCommands: false,
        bufferMaxEntries: 0
      });
      
      const endTime = Date.now();
      console.log(`✅ MongoDB connection successful! (${endTime - startTime}ms)`);
      console.log(`Connected to: ${conn.connection.host}`);
      console.log(`Database: ${conn.connection.name}`);
      
      // Test 4: Simple operation
      console.log('\n🔍 Test 4: Database Operation Test');
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`✅ Database accessible. Found ${collections.length} collections:`);
      collections.forEach(col => console.log(`   - ${col.name}`));
      
      await mongoose.connection.close();
      console.log('\n✅ All tests passed! MongoDB connection is working properly.');
      
    } catch (mongoError) {
      const endTime = Date.now();
      console.error(`❌ MongoDB connection failed after ${endTime - startTime}ms`);
      console.error('Error details:', {
        name: mongoError.name,
        message: mongoError.message,
        code: mongoError.code,
        codeName: mongoError.codeName
      });
      
      console.log('\n🔧 Troubleshooting suggestions:');
      console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Verify the username and password in the connection string');
      console.log('3. Ensure the cluster is running and accessible');
      console.log('4. Check your internet connection and firewall settings');
      console.log('5. Try connecting from MongoDB Compass with the same URI');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic test failed:', error.message);
  }
}

// Run the diagnostic
diagnosticTest().catch(console.error);
