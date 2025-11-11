// ============================================================================
// QuizMaster Load Testing Script
// ============================================================================
// Paste this into browser console to simulate multiple concurrent users
// Tests: API endpoints, live quiz sessions, real-time updates
// ============================================================================

class QuizLoadTester {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || window.location.origin + '/api'
    this.wsUrl = config.wsUrl || window.location.origin.replace('http', 'ws')
    this.numUsers = config.numUsers || 100
    this.sessionId = config.sessionId || null
    this.joinCode = config.joinCode || null
    this.delay = config.delay || 100 // ms between each user creation
    
    this.users = []
    this.results = {
      total: 0,
      success: 0,
      failed: 0,
      avgResponseTime: 0,
      errors: []
    }
    
    console.log('🚀 QuizMaster Load Tester Initialized')
    console.log(`📊 Config:`, config)
  }

  // ========================================================================
  // Test 1: Register Multiple Users
  // ========================================================================
  async testUserRegistration() {
    console.log(`\n🧪 TEST 1: Registering ${this.numUsers} users...`)
    const startTime = Date.now()
    const promises = []

    for (let i = 0; i < this.numUsers; i++) {
      const promise = this.registerUser(i)
      promises.push(promise)
      await this.sleep(this.delay)
    }

    await Promise.all(promises)
    const duration = Date.now() - startTime
    
    console.log(`✅ Registration complete in ${duration}ms`)
    console.log(`✅ Success: ${this.results.success}/${this.numUsers}`)
    console.log(`❌ Failed: ${this.results.failed}/${this.numUsers}`)
    
    return this.results
  }

  async registerUser(index) {
    const userData = {
      username: `loadtest_user_${index}_${Date.now()}`,
      email: `loadtest${index}_${Date.now()}@test.com`,
      password: 'TestPass123!',
      password_confirm: 'TestPass123!'
    }

    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        const data = await response.json()
        this.users.push({
          index,
          username: userData.username,
          token: data.tokens?.access,
          responseTime
        })
        this.results.success++
        console.log(`✅ User ${index} registered (${responseTime}ms)`)
      } else {
        this.results.failed++
        const error = await response.text()
        console.error(`❌ User ${index} failed:`, error)
        this.results.errors.push({ index, error })
      }
    } catch (error) {
      this.results.failed++
      console.error(`❌ User ${index} error:`, error.message)
      this.results.errors.push({ index, error: error.message })
    }
  }

  // ========================================================================
  // Test 2: Join Live Quiz Session
  // ========================================================================
  async testLiveQuizJoin(joinCode) {
    if (!joinCode) {
      console.error('❌ Join code required for live quiz test')
      return
    }

    console.log(`\n🧪 TEST 2: ${this.numUsers} users joining quiz ${joinCode}...`)
    this.resetResults()
    const startTime = Date.now()
    const promises = []

    for (let i = 0; i < this.numUsers; i++) {
      const promise = this.joinQuiz(i, joinCode)
      promises.push(promise)
      await this.sleep(this.delay)
    }

    await Promise.all(promises)
    const duration = Date.now() - startTime
    
    console.log(`✅ Join complete in ${duration}ms`)
    console.log(`✅ Success: ${this.results.success}/${this.numUsers}`)
    console.log(`❌ Failed: ${this.results.failed}/${this.numUsers}`)
    
    return this.results
  }

  async joinQuiz(index, joinCode) {
    const joinData = {
      join_code: joinCode,
      nickname: `TestUser${index}`
    }

    const startTime = Date.now()
    try {
      const response = await fetch(`${this.baseUrl}/live/sessions/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinData)
      })

      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        const data = await response.json()
        if (this.users[index]) {
          this.users[index].participantId = data.participant?.id
          this.users[index].sessionId = data.session?.id
        }
        this.results.success++
        console.log(`✅ User ${index} joined quiz (${responseTime}ms)`)
      } else {
        this.results.failed++
        const error = await response.text()
        console.error(`❌ User ${index} join failed:`, error)
        this.results.errors.push({ index, error })
      }
    } catch (error) {
      this.results.failed++
      console.error(`❌ User ${index} join error:`, error.message)
      this.results.errors.push({ index, error: error.message })
    }
  }

  // ========================================================================
  // Test 3: Submit Answers Concurrently
  // ========================================================================
  async testAnswerSubmission(questionId, optionId) {
    console.log(`\n🧪 TEST 3: ${this.users.length} users submitting answers...`)
    this.resetResults()
    const startTime = Date.now()
    const promises = []

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].participantId) {
        const promise = this.submitAnswer(i, questionId, optionId)
        promises.push(promise)
        await this.sleep(50) // Faster for answer submission
      }
    }

    await Promise.all(promises)
    const duration = Date.now() - startTime
    
    console.log(`✅ Submission complete in ${duration}ms`)
    console.log(`✅ Success: ${this.results.success}/${promises.length}`)
    console.log(`❌ Failed: ${this.results.failed}/${promises.length}`)
    
    return this.results
  }

  async submitAnswer(index, questionId, optionId) {
    const user = this.users[index]
    if (!user || !user.participantId) return

    const answerData = {
      question_id: questionId,
      selected_option_id: optionId,
      time_taken: Math.random() * 20 + 5 // Random time 5-25s
    }

    const startTime = Date.now()
    try {
      const response = await fetch(
        `${this.baseUrl}/live/participants/${user.participantId}/submit_answer/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answerData)
        }
      )

      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        this.results.success++
        console.log(`✅ User ${index} submitted answer (${responseTime}ms)`)
      } else {
        this.results.failed++
        const error = await response.text()
        console.error(`❌ User ${index} submit failed:`, error)
      }
    } catch (error) {
      this.results.failed++
      console.error(`❌ User ${index} submit error:`, error.message)
    }
  }

  // ========================================================================
  // Test 4: API Endpoint Stress Test
  // ========================================================================
  async testEndpointStress(endpoint, method = 'GET', iterations = 100) {
    console.log(`\n🧪 TEST 4: Stress testing ${endpoint} (${iterations} requests)...`)
    this.resetResults()
    const startTime = Date.now()
    const responseTimes = []

    for (let i = 0; i < iterations; i++) {
      const reqStart = Date.now()
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' }
        })

        const responseTime = Date.now() - reqStart
        responseTimes.push(responseTime)

        if (response.ok) {
          this.results.success++
        } else {
          this.results.failed++
        }

        if (i % 10 === 0) {
          console.log(`📊 Progress: ${i}/${iterations}`)
        }
      } catch (error) {
        this.results.failed++
        console.error(`❌ Request ${i} failed:`, error.message)
      }
    }

    const duration = Date.now() - startTime
    const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const maxResponse = Math.max(...responseTimes)
    const minResponse = Math.min(...responseTimes)

    console.log(`✅ Stress test complete in ${duration}ms`)
    console.log(`✅ Success: ${this.results.success}/${iterations}`)
    console.log(`📊 Avg response: ${avgResponse.toFixed(2)}ms`)
    console.log(`📊 Min response: ${minResponse}ms`)
    console.log(`📊 Max response: ${maxResponse}ms`)
    console.log(`📊 Requests/sec: ${(iterations / (duration / 1000)).toFixed(2)}`)
    
    return {
      ...this.results,
      avgResponse,
      maxResponse,
      minResponse,
      requestsPerSecond: iterations / (duration / 1000)
    }
  }

  // ========================================================================
  // Test 5: WebSocket Connection Test
  // ========================================================================
  async testWebSocketConnections(sessionId, count = 50) {
    console.log(`\n🧪 TEST 5: Testing ${count} WebSocket connections...`)
    this.resetResults()
    const startTime = Date.now()
    const sockets = []

    return new Promise((resolve) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          try {
            const socket = io(this.wsUrl, {
              transports: ['websocket', 'polling']
            })

            socket.on('connect', () => {
              console.log(`✅ WebSocket ${i} connected`)
              socket.emit('join_quiz', { sessionId })
              this.results.success++
            })

            socket.on('connect_error', (error) => {
              console.error(`❌ WebSocket ${i} error:`, error.message)
              this.results.failed++
            })

            sockets.push(socket)
          } catch (error) {
            console.error(`❌ WebSocket ${i} creation failed:`, error.message)
            this.results.failed++
          }

          if (i === count - 1) {
            setTimeout(() => {
              const duration = Date.now() - startTime
              console.log(`✅ WebSocket test complete in ${duration}ms`)
              console.log(`✅ Connected: ${this.results.success}/${count}`)
              console.log(`❌ Failed: ${this.results.failed}/${count}`)
              
              // Cleanup
              sockets.forEach(s => s.disconnect())
              resolve(this.results)
            }, 2000)
          }
        }, i * this.delay)
      }
    })
  }

  // ========================================================================
  // Test 6: Full Live Quiz Flow
  // ========================================================================
  async testFullQuizFlow(joinCode) {
    console.log(`\n🧪 TEST 6: Full quiz flow with ${this.numUsers} users...`)
    console.log('📝 Step 1: Users joining quiz...')
    await this.testLiveQuizJoin(joinCode)
    
    console.log('\n⏳ Waiting 3 seconds for quiz to start...')
    await this.sleep(3000)
    
    // Note: You'll need to manually start the quiz and provide question details
    console.log('\n📝 To complete test:')
    console.log('1. Start the quiz as teacher')
    console.log('2. Call: tester.testAnswerSubmission(questionId, optionId)')
    console.log('3. Repeat for each question')
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================
  resetResults() {
    this.results = {
      total: 0,
      success: 0,
      failed: 0,
      avgResponseTime: 0,
      errors: []
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getResults() {
    return {
      users: this.users.length,
      results: this.results
    }
  }

  clearUsers() {
    this.users = []
    this.resetResults()
    console.log('✅ User data cleared')
  }

  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 LOAD TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Users Created: ${this.users.length}`)
    console.log(`Last Test Results:`)
    console.log(`  ✅ Success: ${this.results.success}`)
    console.log(`  ❌ Failed: ${this.results.failed}`)
    console.log(`  ⚠️  Errors: ${this.results.errors.length}`)
    console.log('='.repeat(60) + '\n')
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         QuizMaster Load Testing Script Ready!                  ║
╚════════════════════════════════════════════════════════════════╝

📚 QUICK START GUIDE:

1️⃣  Initialize Tester:
   const tester = new QuizLoadTester({ numUsers: 100 })

2️⃣  Test User Registration:
   await tester.testUserRegistration()

3️⃣  Test Live Quiz Join:
   await tester.testLiveQuizJoin('ABC123')

4️⃣  Test API Endpoint:
   await tester.testEndpointStress('/quizzes/categories/')

5️⃣  Test Answer Submission:
   await tester.testAnswerSubmission(questionId, optionId)

6️⃣  View Results:
   tester.printSummary()

🎯 FULL STRESS TEST (100 users):
   const tester = new QuizLoadTester({ numUsers: 100 })
   await tester.testUserRegistration()
   await tester.testLiveQuizJoin('YOUR_JOIN_CODE')
   tester.printSummary()

⚙️  CUSTOM CONFIG:
   const tester = new QuizLoadTester({
     numUsers: 50,
     delay: 200,
     baseUrl: 'https://your-api.com/api'
   })

📊 ENDPOINT STRESS TEST:
   await tester.testEndpointStress('/quizzes/', 'GET', 500)

🔧 WEBSOCKET TEST (if socket.io loaded):
   await tester.testWebSocketConnections(sessionId, 50)

💡 TIP: Open Network tab in DevTools to see requests in real-time!
`)

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================
// Create global tester instance automatically
window.tester = new QuizLoadTester({ numUsers: 100 })
console.log('\n✅ AUTO-INITIALIZED: window.tester is ready!')
console.log('🚀 You can now run tests immediately:\n')
console.log('   await tester.testUserRegistration()')
console.log('   await tester.testLiveQuizJoin("YOUR_JOIN_CODE")')
console.log('   tester.printSummary()\n')

// Return the tester instance
window.tester
