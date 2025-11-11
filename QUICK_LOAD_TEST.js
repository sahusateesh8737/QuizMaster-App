// ============================================================================
// SIMPLIFIED QUICK LOAD TEST - Paste Once, Run Immediately
// ============================================================================

class QuizLoadTester {
  constructor(numUsers = 100) {
    this.baseUrl = window.location.origin + '/api'
    this.numUsers = numUsers
    this.users = []
    this.success = 0
    this.failed = 0
    console.log(`🚀 Load Tester Ready! Testing with ${numUsers} users`)
  }

  async test100Users() {
    console.log(`\n🧪 STARTING: Register 100 users...`)
    console.log('⏱️  This will take about 20-30 seconds\n')
    
    const startTime = Date.now()
    
    for (let i = 0; i < 100; i++) {
      await this.registerUser(i)
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    const duration = Date.now() - startTime
    console.log(`\n✅ COMPLETE in ${duration}ms`)
    console.log(`✅ Success: ${this.success}/100`)
    console.log(`❌ Failed: ${this.failed}/100`)
    console.log(`⏱️  Average time per user: ${(duration/100).toFixed(0)}ms`)
    console.log(`📊 Users created: ${this.users.length}`)
  }

  async registerUser(index) {
    const userData = {
      username: `test${index}_${Date.now()}`,
      email: `test${index}_${Date.now()}@test.com`,
      password: 'Test@1234',
      password_confirm: 'Test@1234'
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        this.users.push({
          username: userData.username,
          token: data.tokens?.access
        })
        this.success++
        if (index % 10 === 0) console.log(`✅ ${index} users registered...`)
      } else {
        this.failed++
        if (index % 10 === 0) console.log(`⚠️  Some failures, continuing...`)
      }
    } catch (error) {
      this.failed++
    }
  }

  async joinQuiz(joinCode, count = 50) {
    console.log(`\n🧪 STARTING: ${count} users joining quiz "${joinCode}"...`)
    const startTime = Date.now()
    let successJoins = 0

    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/live/sessions/join/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            join_code: joinCode,
            nickname: `User${i}`
          })
        })

        if (response.ok) {
          successJoins++
        }

        if (i % 10 === 0) console.log(`✅ ${i} users joining...`)
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        // Silent
      }
    }

    const duration = Date.now() - startTime
    console.log(`\n✅ COMPLETE in ${duration}ms`)
    console.log(`✅ Joined: ${successJoins}/${count}`)
    console.log(`⏱️  Average join time: ${(duration/count).toFixed(0)}ms`)
  }

  async stressEndpoint(endpoint, count = 100) {
    console.log(`\n🧪 STARTING: Stress testing ${endpoint}...`)
    console.log(`📊 Sending ${count} rapid requests\n`)
    
    const startTime = Date.now()
    let successCount = 0
    const times = []

    for (let i = 0; i < count; i++) {
      const reqStart = Date.now()
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`)
        const time = Date.now() - reqStart
        times.push(time)
        
        if (response.ok) successCount++
        
        if (i % 20 === 0) console.log(`📊 Progress: ${i}/${count}`)
      } catch (error) {
        // Silent
      }
    }

    const duration = Date.now() - startTime
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const max = Math.max(...times)
    const min = Math.min(...times)

    console.log(`\n✅ COMPLETE in ${duration}ms`)
    console.log(`✅ Success: ${successCount}/${count}`)
    console.log(`📊 Avg response: ${avg.toFixed(2)}ms`)
    console.log(`📊 Min: ${min}ms | Max: ${max}ms`)
    console.log(`📊 Requests/sec: ${(count / (duration/1000)).toFixed(0)}`)
  }
}

// ============================================================================
// AUTO-START
// ============================================================================
window.tester = new QuizLoadTester(100)

console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 QUICK LOAD TESTER READY - USE THESE COMMANDS:        ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📝 Register 100 users:                                   ║
║     await tester.test100Users()                           ║
║                                                           ║
║  🎯 Join quiz (put join code):                            ║
║     await tester.joinQuiz('ABC123', 50)                   ║
║                                                           ║
║  🔥 Stress test endpoint:                                 ║
║     await tester.stressEndpoint('/quizzes/categories/')   ║
║                                                           ║
║  💡 TIP: Open Network tab in DevTools to see traffic!     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`)

// Make it available globally
window.tester
