# CoreSync Push-up Tracker Integration

This guide explains how to integrate your Python push-up counter with CoreSync.

## Setup Instructions

### 1. Get Your Access Token

1. Log into CoreSync in your browser
2. Open browser console (F12)
3. Run this command:
```javascript
JSON.parse(localStorage.getItem('sb-jqsgqnamltsmsqxkligt-auth-token')).access_token
```
4. Copy the token that appears

### 2. Install Required Python Package

```bash
pip install requests
```

### 3. Modify Your Python Script

Add this code to your push-up counter script:

```python
import requests
import json

# Configuration
CORESYNC_API_URL = "https://jqsgqnamltsmsqxkligt.supabase.co/functions/v1/log-external-workout"
ACCESS_TOKEN = "YOUR_ACCESS_TOKEN_HERE"  # Replace with your actual token

def log_to_coresync(reps, exercise_name="Push-ups"):
    """Send workout data to CoreSync"""
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    
    data = {
        "exercise_name": exercise_name,
        "reps": reps,
        "sets": 1,
        "notes": "Auto-logged from Python push-up tracker"
    }
    
    try:
        response = requests.post(CORESYNC_API_URL, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Logged to CoreSync: {result['message']}")
            print(f"   Calories burned: {result['calories']}")
        else:
            print(f"❌ Failed to log: {response.text}")
    except Exception as e:
        print(f"❌ Error logging to CoreSync: {e}")

# Add this at the end of your push-up counter, where you currently save to CSV
# Right after: df.to_csv(csv_name, ...) or print(f"Saved {len(log)} reps...")

if rep_count > 0:  # Only log if reps were recorded
    log_to_coresync(rep_count, "Push-ups")
```

### 4. Integration Point

In your existing script, find where you save the reps to CSV (around line 147-148):
```python
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    # ... CSV saving code ...
    print(f"Saved {len(log)} reps to {csv_name}")
```

Add the CoreSync logging right after:
```python
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    # ... CSV saving code ...
    print(f"Saved {len(log)} reps to {csv_name}")
    
    # NEW: Log to CoreSync
    total_reps = len(log)
    log_to_coresync(total_reps, "Push-ups")
```

## How It Works

1. Your Python script detects and counts push-ups using computer vision
2. When you finish (press 'q'), the script sends the rep count to CoreSync API
3. CoreSync creates a workout entry with:
   - Exercise: Push-ups
   - Reps: Your counted reps
   - Estimated calories burned
   - Auto-generated workout duration
4. The workout appears in your CoreSync dashboard, analytics, and leaderboard!

## Troubleshooting

**401 Unauthorized Error**: Your access token has expired. Get a new one from the browser console.

**Connection Error**: Check your internet connection and verify the API URL.

**Missing Data**: Ensure `rep_count` or `len(log)` has a value > 0 before logging.

## Security Note

- Keep your access token private - don't share it or commit it to GitHub
- Tokens expire after some time - you'll need to refresh them periodically
- For production use, consider implementing proper OAuth flow