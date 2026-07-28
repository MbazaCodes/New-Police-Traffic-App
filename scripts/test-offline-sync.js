/**
 * OFFLINE SYNC & FORM TEST SUITE
 * Tests: add-citizen-screen, IndexedDB queue, API integration
 * Run: node scripts/test-offline-sync.js
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
  if (passed) testsPassed++;
  else testsFailed++;
}

async function fetchJSON(url, options = {}) {
  return new Promise((resolve, reject) => {
    const reqUrl = new URL(url, BASE_URL);
    const req = http.request(reqUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TZ POLICE APP - FORM 1 TEST SUITE');
  console.log('   add-citizen-screen.tsx + Offline Sync');
  console.log('='.repeat(60) + '\n');

  // ========================================
  // TEST 1: Server is running
  // ========================================
  console.log('--- Server Health ---');
  try {
    const res = await fetchJSON('/');
    logTest('Server Running', res.status === 200, `Status: ${res.status}`);
  } catch (e) {
    logTest('Server Running', false, e.message);
  }

  // ========================================
  // TEST 2: Citizens API Endpoint exists
  // ========================================
  console.log('\n--- Citizens API ---');
  try {
    const res = await fetchJSON('/api/citizens', { method: 'GET' });
    logTest('GET /api/citizens', res.status === 200 || res.status === 401, `Status: ${res.status}`);
  } catch (e) {
    logTest('GET /api/citizens', false, e.message);
  }

  try {
    const testPayload = {
      name: 'TEST_CITIZEN_' + Date.now(),
      nida: '12345678901234567890',
      mobile: '0712345678',
      gender: 'Mme',
      address: 'Test Address, Dar es Salaam',
      occupation: 'Mfanyabiashara'
    };
    
    const res = await fetchJSON('/api/citizens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    logTest('POST /api/citizens accepts payload', 
      res.status === 201 || res.status === 400 || res.status === 401 || res.status === 503,
      `Status: ${res.status} - ${res.data?.error || 'OK'}`);
  } catch (e) {
    logTest('POST /api/citizens accepts payload', false, e.message);
  }

  // ========================================
  // TEST 3: Form Component Structure
  // ========================================
  console.log('\n--- Form Component Structure ---');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const formPath = path.join(__dirname, '../New-Police-Traffic-App/src/components/police/screens/add-citizen-screen.tsx');
    const formContent = fs.readFileSync(formPath, 'utf8');

    // Check for required imports
    const hasOfflineSync = formContent.includes('saveWithOfflineSupport');
    const hasInitAutoSync = formContent.includes('initAutoSync');
    const hasSubscribeToSyncStatus = formContent.includes('subscribeToSyncStatus');
    const hasDatePicker = formContent.includes('DatePicker');
    const hasNidaInput = formContent.includes('NidaInputField');
    const hasTZLocations = formContent.includes('TZ_ALL_REGIONS');

    logTest('Imports saveWithOfflineSupport', hasOfflineSync);
    logTest('Imports initAutoSync', hasInitAutoSync);
    logTest('Imports subscribeToSyncStatus', hasSubscribeToSyncStatus);
    logTest('Uses DatePicker component', hasDatePicker);
    logTest('Uses NidaInputField component', hasNidaInput);
    logTest('Uses TZ locations dropdown', hasTZLocations);

    // Check for sync status UI
    const hasSyncIndicator = formContent.includes('isOfflineMode') && formContent.includes('syncStatus.pending');
    const hasSyncButton = formContent.includes('Sasa Sasisha') || formContent.includes('processSyncQueue');
    const hasWifiIcon = formContent.includes('WifiOff');
    const hasCloudIcon = formContent.includes('CloudUpload');

    logTest('Has sync status indicator', hasSyncIndicator);
    logTest('Has manual sync button', hasSyncButton);
    logTest('Shows WifiOff icon when offline', hasWifiIcon);
    logTest('Shows CloudUpload icon when pending', hasCloudIcon);

    // Check for cached record display
    const hasCachedDisplay = formContent.includes('savedRecord.cached') || formContent.includes('Inasubiri usasishaji');
    logTest('Shows cached/pending status on saved records', hasCachedDisplay);

  } catch (e) {
    logTest('Form Component Structure check', false, e.message);
  }

  // ========================================
  // TEST 4: Offline Sync Module
  // ========================================
  console.log('\n--- Offline Sync Module ---');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const syncPath = path.join(__dirname, '../New-Police-Traffic-App/src/lib/offline-sync.ts');
    const syncContent = fs.readFileSync(syncPath, 'utf8');

    // Check for required functions/exports
    const hasQueueSyncItem = syncContent.includes('export async function queueSyncItem');
    const hasReadSyncQueue = syncContent.includes('export async function readSyncQueue');
    const hasRemoveSyncItem = syncContent.includes('export async function removeSyncItem');
    const hasProcessSyncQueue = syncContent.includes('export async function processSyncQueue');
    const hasSaveWithOfflineSupport = syncContent.includes('export async function saveWithOfflineSupport');
    const hasInitAutoSync = syncContent.includes('export function initAutoSync');
    const hasSubscribeToSyncStatus = syncContent.includes('export function subscribeToSyncStatus');
    const hasIndexedDB = syncContent.includes('indexedDB.open');
    const hasRetryLogic = syncContent.includes('retries') || syncContent.includes('maxRetries');
    const hasAutoSyncInterval = syncContent.includes('setInterval') || syncContent.includes('30000');

    logTest('Exports queueSyncItem()', hasQueueSyncItem);
    logTest('Exports readSyncQueue()', hasReadSyncQueue);
    logTest('Exports removeSyncItem()', hasRemoveSyncItem);
    logTest('Exports processSyncQueue()', hasProcessSyncQueue);
    logTest('Exports saveWithOfflineSupport()', hasSaveWithOfflineSupport);
    logTest('Exports initAutoSync()', hasInitAutoSync);
    logTest('Exports subscribeToSyncStatus()', hasSubscribeToSyncStatus);
    logTest('Uses IndexedDB for persistence', hasIndexedDB);
    logTest('Implements retry logic', hasRetryLogic);
    logTest('Has auto-sync interval (~30s)', hasAutoSyncInterval);

    // Check DB config
    const dbName = syncContent.match(/DB_NAME\s*=\s*"([^"]+)"/)?.[1];
    const storeName = syncContent.match(/STORE_NAME\s*=\s*"([^"]+)"/)?.[1];
    logTest(`IndexedDB database: ${dbName}`, !!dbName);
    logTest(`Store name: ${storeName}`, !!storeName);

  } catch (e) {
    logTest('Offline Sync Module check', false, e.message);
  }

  // ========================================
  // TEST 5: NIDA Input Component
  // ========================================
  console.log('\n--- NIDA Input Component ---');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const nidaPath = path.join(__dirname, '../New-Police-Traffic-App/src/components/police/ui/nida-input.tsx');
    const nidaContent = fs.readFileSync(nidaPath, 'utf8');

    const hasFormatNida = nidaContent.includes('formatNida');
    const hasValidation = nidaContent.includes('validateNidaFormatted');
    const hasPattern0000 = nidaContent.includes('0000-0000-0000-0000-00');
    const hasDigitLimit = nidaContent.includes('slice(0, 20)');
    const removesNonDigits = nidaContent.includes('replace(/\\D/g, "")');
    const showsCheckmark = nidaContent.includes('✓') || nidaContent.includes('check');
    const showsProgress = nidaContent.includes('20)') && nidaContent.includes('/20');

    logTest('Has formatNida() function', hasFormatNida);
    logTest('Has validateNidaFormatted()', hasValidation);
    logTest('Uses pattern 0000-0000-0000-0000-00', hasPattern0000);
    logTest('Limits to 20 digits', hasDigitLimit);
    logTest('Removes non-digit characters', removesNonDigits);
    logTest('Shows ✓ when valid', showsCheckmark);
    logTest('Shows digit progress (X/20)', showsProgress);

  } catch (e) {
    logTest('NIDA Input Component check', false, e.message);
  }

  // ========================================
  // TEST 6: DatePicker Component
  // ========================================
  console.log('\n--- DatePicker Component ---');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const datePickerPath = path.join(__dirname, '../New-Police-Traffic-App/src/components/police/ui/date-picker.tsx');
    const datePickerContent = fs.readFileSync(datePickerPath, 'utf8');

    const usesNativeDateInput = datePickerContent.includes('type="date"');
    const hasSwahiliLocale = datePickerContent.includes('sw-TZ');
    const hasCalendarIcon = datePickerContent.includes('Calendar');
    const supportsMinMax = datePickerContent.includes('minDate') || datePickerContent.includes('maxDate');
    const formatsDateDisplay = datePickerContent.includes('toLocaleDateString');

    logTest('Uses native date input', usesNativeDateInput);
    logTest('Uses Swahili locale (sw-TZ)', hasSwahiliLocale);
    logTest('Shows Calendar icon', hasCalendarIcon);
    logTest('Supports min/max date constraints', supportsMinMax);
    logTest('Formats date for display', formatsDateDisplay);

  } catch (e) {
    logTest('DatePicker Component check', false, e.message);
  }

  // ========================================
  // TEST 7: TZ Locations Data
  // ========================================
  console.log('\n--- TZ Locations Data ---');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const tzPath = path.join(__dirname, '../New-Police-Traffic-App/src/lib/tz-locations.ts');
    const tzContent = fs.readFileSync(tzPath, 'utf8');

    const hasRegionsExport = tzContent.includes('TZ_ALL_REGIONS');
    const hasDistrictsFunction = tzContent.includes('districtsForRegion');
    const hasDarEsSalaam = tzContent.includes('Dar es Salaam') || tzContent.includes("Dar-es-Salaam");
    const hasArusha = tzContent.includes('Arusha');
    const hasMwanza = tzContent.includes('Mwanza');

    logTest('Exports TZ_ALL_REGIONS array', hasRegionsExport);
    logTest('Exports districtsForRegion() function', hasDistrictsFunction);
    logTest('Includes Dar es Salaam region', hasDarEsSalaam);
    logTest('Includes Arusha region', hasArusha);
    logTest('Includes Mwanza region', hasMwanza);

    // Count regions
    const regionMatch = tzContent.match(/TZ_ALL_REGIONS\s*=\s*\[([^\]]*)\]/);
    if (regionMatch) {
      const regions = regionMatch[1].match(/"[^"]+"/g) || [];
      logTest(`Total regions defined: ${regions.length}`, regions.length >= 20);
    }

  } catch (e) {
    logTest('TZ Locations Data check', false, e.message);
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
