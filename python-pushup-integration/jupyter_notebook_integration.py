"""
CoreSync Push-up Tracker Integration for Jupyter Notebook
Add this code to your existing Jupyter notebook
"""

import requests
import json

# ============================================
# CONFIGURATION - UPDATE THIS WITH YOUR TOKEN
# ============================================
CORESYNC_API_URL = "https://jqsgqnamltsmsqxkligt.supabase.co/functions/v1/log-external-workout"
API_TOKEN = "cs_YOUR_TOKEN_HERE"  # ⚠️ REPLACE WITH YOUR ACTUAL TOKEN FROM CORESYNC SETTINGS


def log_to_coresync(reps, exercise_name="Push-ups", sets=1, notes=None):
    """
    Send workout data to CoreSync
    
    Args:
        reps (int): Total number of repetitions completed
        exercise_name (str): Name of the exercise (default: "Push-ups")
        sets (int): Number of sets (default: 1)
        notes (str): Optional notes about the workout
    
    Returns:
        bool: True if successful, False otherwise
    """
    headers = {
        "X-API-Token": API_TOKEN,
        "Content-Type": "application/json",
    }
    
    data = {
        "exercise_name": exercise_name,
        "reps": reps,
        "sets": sets,
        "notes": notes or f"Auto-logged from Jupyter Notebook - {exercise_name} tracker"
    }
    
    try:
        print(f"📤 Sending {reps} reps to CoreSync...")
        response = requests.post(CORESYNC_API_URL, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Logged to CoreSync: {result['message']}")
            print(f"   📊 Calories burned: {result['calories']}")
            print(f"   🆔 Workout ID: {result['workout_id']}")
            return True
        else:
            print(f"❌ Failed to log to CoreSync")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to CoreSync: {e}")
        return False


# ============================================
# INTEGRATION WITH YOUR EXISTING CODE
# ============================================

# ADD THIS AT THE END OF YOUR PUSH-UP TRACKING CELL
# Right after you save to CSV (where you have: df.to_csv(csv_name, ...))

# Example integration:
"""
# Your existing code saves the log
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    
    if os.path.exists(csv_name):
        df.to_csv(csv_name, mode="a", header=False, index=False)
    else:
        df.to_csv(csv_name, index=False)
    
    print(f"Saved {len(log)} reps to {csv_name}")
    
    # 🆕 NEW: Auto-log to CoreSync
    total_reps = len(log)
    if total_reps > 0:
        log_to_coresync(total_reps, "Push-ups")
"""

# ============================================
# TESTING THE CONNECTION
# ============================================

def test_coresync_connection():
    """Test if your API token is working"""
    print("🧪 Testing CoreSync connection...")
    result = log_to_coresync(5, "Test Push-ups", notes="Connection test from Jupyter")
    if result:
        print("✅ Connection successful! You're ready to go!")
    else:
        print("❌ Connection failed. Check your API token and internet connection.")
    return result


# Uncomment the line below to test your connection
# test_coresync_connection()


# ============================================
# ALTERNATIVE: LOG TOTAL REPS AT END OF SESSION
# ============================================

def log_session_summary(rep_count):
    """
    Call this at the end of your workout session
    to log the total reps to CoreSync
    """
    if rep_count > 0:
        print(f"\n📝 Workout Session Complete!")
        print(f"Total reps: {rep_count}")
        log_to_coresync(rep_count, "Push-ups")
    else:
        print("No reps recorded in this session")


# ============================================
# STEP-BY-STEP INSTRUCTIONS
# ============================================
"""
HOW TO USE:

1. Generate API Token in CoreSync:
   - Go to https://coresync.com/settings
   - Scroll to "API Tokens" section
   - Click "Generate Token"
   - Give it a name (e.g., "Jupyter Notebook")
   - Copy the token (starts with cs_...)

2. Update this file:
   - Replace "cs_YOUR_TOKEN_HERE" with your actual token
   - Save the file

3. Add to your Jupyter notebook:
   - Copy the log_to_coresync() function to your notebook
   - Update your configuration with your token
   
4. Integrate with your tracking code:
   Option A: Log after each session
   ```python
   if log:
       df = pd.DataFrame(log)
       df.to_csv("pushup_log.csv", ...)
       print(f"Saved {len(log)} reps to pushup_log.csv")
       
       # Log to CoreSync
       log_to_coresync(len(log), "Push-ups")
   ```
   
   Option B: Log manually
   ```python
   # After your workout
   log_session_summary(total_reps)
   ```

5. Test the connection:
   - Run: test_coresync_connection()
   - Should see "✅ Connection successful!"

TROUBLESHOOTING:
- 401 Error: Token is invalid or expired, generate a new one
- 400 Error: Check that reps is a valid number > 0
- Connection Error: Check internet connection and API URL
- No response: Verify the API endpoint URL is correct

SECURITY TIPS:
- ⚠️ Never commit your API token to GitHub
- Store it in environment variables or a .env file
- Use different tokens for different applications
- Revoke tokens in CoreSync settings if compromised
"""