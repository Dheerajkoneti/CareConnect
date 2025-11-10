// ===========================
// ✅ MIGRATE USERS TO FIREBASE
// ===========================

const mongoose = require("mongoose");
const admin = require("firebase-admin");

// ✅ Load Mongo User Model
const User = require("./models/User");

// ✅ Firebase Admin SDK
const serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function generateAvatarColor(name) {
  const colors = ["#4f46e5", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

async function migrate() {
  await mongoose.connect("YOUR_MONGODB_URL");

  const users = await User.find({}).lean();
  console.log(`✅ Total Users Found: ${users.length}`);

  for (let u of users) {
    const ref = db.collection("users").doc(u._id.toString());

    await ref.set({
      uid: u._id.toString(),
      name: u.name,
      email: u.email,
      status: "offline",
      lastActive: Date.now(),
      avatarColor: generateAvatarColor(u.name || "U"),
    });

    console.log("✅ Migrated:", u.name);
  }

  console.log("✅ Migration Complete!");
  process.exit();
}

migrate();
