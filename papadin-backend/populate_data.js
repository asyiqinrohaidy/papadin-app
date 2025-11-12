// papadin-backend/populate_data.js
// Script to automatically populate test data for ML training

import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

// Initialize Firebase
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Configuration
const OUTLET_EMAIL = "asyiqinrohaidy@gmail.com"; // Change this if needed
const ITEMS = [
  { name: "Ayam", unit: "PCS" },
  { name: "Tepung", unit: "BAG" },
  { name: "Minyak 5L", unit: "BTL" },
  { name: "Ais", unit: "BAG" },
];

// Generate random number within range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate dates from today backwards
function generateDates(numDays) {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Generate realistic stock data with patterns
function generateStockData(item, dateIndex, totalDays) {
  const dayOfWeek = new Date().getDay() - dateIndex;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  let baseOrder, baseStockIn, baseBaki;
  
  // Different patterns for different items
  switch(item.name) {
    case "Ayam":
      baseOrder = randomInt(35, 55);
      baseStockIn = randomInt(40, 60);
      baseBaki = randomInt(10, 30);
      if (isWeekend) baseOrder += 10; // Weekend spike
      break;
    case "Tepung":
      baseOrder = randomInt(3, 8);
      baseStockIn = randomInt(5, 10);
      baseBaki = randomInt(2, 6);
      break;
    case "Minyak 5L":
      baseOrder = randomInt(2, 6);
      baseStockIn = randomInt(3, 7);
      baseBaki = randomInt(1, 5);
      break;
    case "Ais":
      baseOrder = randomInt(4, 8);
      baseStockIn = randomInt(5, 10);
      baseBaki = randomInt(2, 6);
      if (isWeekend) baseOrder += 2; // Small weekend increase
      break;
    default:
      baseOrder = randomInt(5, 15);
      baseStockIn = randomInt(10, 20);
      baseBaki = randomInt(3, 10);
  }
  
  return {
    stockIn: baseStockIn,
    baki: baseBaki,
    order: baseOrder,
  };
}

// Main function to populate data
async function populateData() {
  console.log("🚀 Starting data population...");
  console.log(`📧 Outlet: ${OUTLET_EMAIL}`);
  console.log(`📅 Generating 30 days of data...`);
  
  try {
    const dates = generateDates(30); // 30 days of data
    const stokCollection = db.collection("stokOutlet");
    let recordCount = 0;
    
    console.log("\n📊 Adding records...\n");
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      
      for (const item of ITEMS) {
        const stockData = generateStockData(item, i, dates.length);
        
        const record = {
          tarikh: date,
          outlet: OUTLET_EMAIL,
          item: item.name,
          unit: item.unit,
          stockIn: stockData.stockIn,
          baki: stockData.baki,
          order: stockData.order,
          remark: i < 5 ? "recent" : "",
          createdAt: new Date(),
        };
        
        await stokCollection.add(record);
        recordCount++;
        
        // Progress indicator
        if (recordCount % 10 === 0) {
          console.log(`   ✅ Added ${recordCount} records...`);
        }
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log(`✅ SUCCESS! Added ${recordCount} records`);
    console.log("=".repeat(50));
    console.log("\n📈 Data Summary:");
    console.log(`   - Total Records: ${recordCount}`);
    console.log(`   - Date Range: ${dates[dates.length - 1]} to ${dates[0]}`);
    console.log(`   - Items: ${ITEMS.map(i => i.name).join(", ")}`);
    console.log(`   - Outlet: ${OUTLET_EMAIL}`);
    
    console.log("\n🎯 Next Steps:");
    console.log("   1. Refresh your admin dashboard");
    console.log("   2. Train the ML model: POST http://localhost:5000/ml/train");
    console.log("   3. Get predictions: POST http://localhost:5000/ml/predict-all");
    
    process.exit(0);
    
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

// Run the script
console.log("\n" + "=".repeat(50));
console.log("   📦 PAPADIN DATA POPULATION SCRIPT");
console.log("=".repeat(50) + "\n");

populateData();