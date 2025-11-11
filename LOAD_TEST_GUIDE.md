# 🚀 Quick Load Test - Copy & Paste Guide

## Option 1: QUICK LOAD TEST (Recommended - Simpler)

**File:** `QUICK_LOAD_TEST.js`

### Steps:
1. Open browser on your site
2. Press **F12** (DevTools)
3. Go to **Console** tab
4. **Copy entire `QUICK_LOAD_TEST.js` file**
5. **Paste** into console and press Enter

### Immediately run tests:

```javascript
// Test 1: Register 100 users
await tester.test100Users()

// Test 2: Join 50 users to a live quiz
await tester.joinQuiz('YOUR_JOIN_CODE', 50)

// Test 3: Stress test any endpoint (100 requests)
await tester.stressEndpoint('/quizzes/categories/', 100)
```

---

## Option 2: FULL LOAD TEST (More Features)

**File:** `load-test-script.js`

### Steps:
Same as above, copy entire file into console

### Run tests:

```javascript
// Already initialized as window.tester

// Register users
await tester.testUserRegistration()

// Join quiz
await tester.testLiveQuizJoin('ABC123')

// Submit answers
await tester.testAnswerSubmission(questionId, optionId)

// Stress test
await tester.testEndpointStress('/endpoint/', 'GET', 100)

// View summary
tester.printSummary()
```

---

## 📊 What Each Test Does

### test100Users()
- Creates 100 users with random usernames
- Takes ~20-30 seconds
- Shows success/failure rate
- Shows average time per user

### joinQuiz(code, count)
- Joins N users to live quiz
- Requires join code from teacher
- Shows join success rate
- Shows average join time

### stressEndpoint(path, count)
- Hammers any API endpoint
- Sends N requests rapidly
- Shows response times
- Shows requests per second

---

## 🎯 Real-World Test Scenarios

### Scenario 1: Full User Registration Test
```javascript
const tester = new QuizLoadTester(100)
await tester.test100Users()
```

### Scenario 2: Live Quiz Stress Test
```javascript
// First, start a quiz as teacher and get the join code
const tester = new QuizLoadTester(100)

// Have 50 users join
await tester.joinQuiz('ABC123', 50)

// Now start quiz as teacher and:
// Answer a question

// Then have all users submit answer
await tester.stressEndpoint('/live/participants/1/submit_answer/', 50)
```

### Scenario 3: API Performance Test
```javascript
const tester = new QuizLoadTester()

// Test categories endpoint
await tester.stressEndpoint('/quizzes/categories/', 200)

// Test quizzes list
await tester.stressEndpoint('/quizzes/', 200)

// Test user profile
await tester.stressEndpoint('/users/profile/', 100)
```

---

## 🔍 How to Monitor Results

### Open DevTools Network Tab:
1. Press **F12**
2. Go to **Network** tab
3. Run a test
4. Watch requests come in real-time
5. See response times and sizes

### Check Server Performance:
- Open backend terminal where Django runs
- Watch for:
  - Database queries
  - Error messages
  - Response times
  - CPU usage

---

## ⚠️ Important Notes

1. **Start small**: Test with 10 users first, then scale up
2. **Watch the server**: Monitor backend logs during tests
3. **Don't break things**: Heavy load might temporarily slow down site
4. **Cool down**: Wait between tests to let server recover
5. **Production**: Don't run heavy tests on production without permission

---

## 🐛 Troubleshooting

### Getting "undefined"?
- Make sure you pasted the ENTIRE file
- Check console for errors
- Scroll up in console to see initialization message

### Requests failing?
- Check if API URL is correct
- Make sure you're using right join code
- Backend might be rejecting duplicate emails

### Too slow?
- Reduce number of users
- Increase delay between requests
- Check server resources

---

## 📈 Expected Performance

### Normal Server:
- User registration: 200-400ms per user
- Quiz join: 100-200ms per user
- Quiz answer: 50-150ms per answer
- Category fetch: 50-100ms per request

### Slow Server:
- Times are 2-5x slower
- High failure rate (>10%)
- Timeouts happening

### Fast Server:
- Times <100ms
- 100% success rate
- Smooth scaling

---

## 🎓 Learning

The tester shows you:
- ✅ How many requests your server handles
- ✅ Response time performance
- ✅ Where bottlenecks are
- ✅ If database queries are slow
- ✅ If API limits are being hit

Use this data to optimize!

---

## 💡 Pro Tips

1. **Open Network tab FIRST** before running test
2. **Sort by time** to see slowest requests
3. **Check for 429 errors** (rate limiting)
4. **Look for 500 errors** (server issues)
5. **Compare results** before/after optimizations

---

**Ready to test? Pick either `QUICK_LOAD_TEST.js` or `load-test-script.js`, copy it, and paste into console!** 🚀
