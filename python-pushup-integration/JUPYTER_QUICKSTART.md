# Quick Integration Guide for Your Jupyter Notebook

## Step 1: Generate Your API Token

1. Go to CoreSync Settings: https://coresync.com/settings
2. Find "API Tokens" section
3. Click "Generate Token"
4. Name it "Push-up Tracker"
5. **COPY THE TOKEN** (starts with `cs_...`) - you'll only see it once!

## Step 2: Add This Code to Your Notebook

Add this cell at the top of your notebook (after imports):

```python
import requests
import json

# Your CoreSync API Token
CORESYNC_API_TOKEN = "cs_YOUR_TOKEN_HERE"  # ⚠️ REPLACE THIS

def log_to_coresync(reps):
    """Log push-ups to CoreSync"""
    url = "https://jqsgqnamltsmsqxkligt.supabase.co/functions/v1/log-external-workout"
    
    headers = {
        "X-API-Token": CORESYNC_API_TOKEN,
        "Content-Type": "application/json"
    }
    
    data = {
        "exercise_name": "Push-ups",
        "reps": reps,
        "sets": 1,
        "notes": "Auto-logged from Jupyter push-up tracker"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Logged {reps} push-ups to CoreSync!")
            print(f"   Calories: {result['calories']}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
```

## Step 3: Integrate with Your Existing Code

Find this section in your notebook (around line 147-148):

```python
# Your existing code
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    
    if os.path.exists(csv_name):
        df.to_csv(csv_name, mode="a", header=False, index=False)
    else:
        df.to_csv(csv_name, index=False)
    
    print(f"Saved {len(log)} reps to {csv_name}")
    
    # 🆕 ADD THIS LINE:
    log_to_coresync(len(log))
    
else:
    print("No reps recorded.")
```

## Step 4: Test It!

Run your push-up tracker:
1. Do some push-ups
2. Press 'q' to stop
3. You should see:
   ```
   Saved 14 reps to pushup_log.csv
   ✅ Logged 14 push-ups to CoreSync!
      Calories: 7
   ```

## That's It!

Now every time you finish a set, your push-ups will automatically sync to CoreSync and appear in:
- Your Dashboard
- Analytics charts
- Leaderboard
- Weekly streak counter

## Common Issues

**401 Unauthorized Error**
- Your token is wrong or expired
- Generate a new token in Settings

**Connection Error**
- Check your internet connection
- Make sure you copied the full token (starts with `cs_`)

**No reps being sent**
- Make sure `len(log) > 0` before calling the function
- Check that the function is being called after `df.to_csv()`

## Need Help?

Check the full documentation in `jupyter_notebook_integration.py` for advanced features!