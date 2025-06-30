import requests
import json
from pymongo import MongoClient
from bson import ObjectId

# MongoDB connection to verify the user exists
MONGODB_URI = "mongodb+srv://vishalnyapathi214:5QgwpkLnDSoxkdvf@maindb.mx4soxz.mongodb.net/main?retryWrites=true&w=majority&appName=MainDB"
client = MongoClient(MONGODB_URI)
db = client['main']

user_id = "686291a8eaef645daddfb2db"

# Check if user exists in MongoDB
try:
    print("Checking user in MongoDB...")
    user = db.User.find_one({"_id": ObjectId(user_id)})
    if user:
        print("✅ User found in MongoDB:")
        print(f"  Name: {user.get('name')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Profile: {user.get('profile', {})}")
    else:
        print("❌ User not found in MongoDB")
        
    # Check collection name
    collections = db.list_collection_names()
    print(f"Available collections: {collections}")
    
    # Check if there are any users
    user_count = db.User.count_documents({})
    print(f"Total users in User collection: {user_count}")
    
    # Check users collection (lowercase)
    users_count = db.users.count_documents({})
    print(f"Total users in users collection: {users_count}")
    
except Exception as e:
    print(f"❌ MongoDB check failed: {e}")

client.close()
