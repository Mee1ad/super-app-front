'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { diaryApi } from '@/app/diary/atoms/api'

export default function TestDiaryApiPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const result = await testFn()
      const testResult = { name: testName, status: 'PASS', result }
      setTestResults(prev => [...prev, testResult])
      setResult(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      const testResult = { name: testName, status: 'FAIL', error: errorMessage }
      setTestResults(prev => [...prev, testResult])
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const testGetDiaryEntries = () => runTest('Get All Diary Entries', () => diaryApi.getDiaryEntries())
  
  const testGetDiaryEntry = (id: string) => runTest(`Get Diary Entry ${id}`, () => diaryApi.getDiaryEntry(id))
  
  const testGetMoods = () => runTest('Get Moods', () => diaryApi.getMoods())
  
  const testCreateEntry = () => runTest('Create Diary Entry', () => 
    diaryApi.createDiaryEntry({
      title: 'Test Entry',
      content: 'This is a test entry',
      mood: 'happy',
      date: new Date().toISOString().slice(0, 10)
    })
  )

  const runAllTests = async () => {
    setTestResults([])
    
    // Test 1: Get moods
    await testGetMoods()
    
    // Test 2: Get all entries
    const entriesResult = await testGetDiaryEntries()
    
    // Test 3: Get specific entries if we have them
    if (entriesResult && entriesResult.entries && entriesResult.entries.length > 0) {
      const firstEntry = entriesResult.entries[0]
      await testGetDiaryEntry(firstEntry.id)
      
      if (entriesResult.entries.length > 1) {
        const secondEntry = entriesResult.entries[1]
        await testGetDiaryEntry(secondEntry.id)
      }
    }
    
    // Test 4: Test non-existent entry
    await testGetDiaryEntry('non-existent-id')
    
    // Test 5: Create new entry
    await testCreateEntry()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diary API Test Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Run All Tests</h2>
          <button 
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Individual Tests</h2>
          <div className="flex gap-2 mb-3">
            <button 
              onClick={testGetMoods}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
            >
              Get Moods
            </button>
            <button 
              onClick={testGetDiaryEntries}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
            >
              Get All Entries
            </button>
            <button 
              onClick={testCreateEntry}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:opacity-50"
            >
              Create Entry
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            {['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'].map(id => (
              <button
                key={id}
                onClick={() => testGetDiaryEntry(id)}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
              >
                Get {id}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => testGetDiaryEntry('non-existent-id')}
              disabled={loading}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:opacity-50"
            >
              Test Non-existent ID
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border ${
                    test.status === 'PASS' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="font-semibold">
                    {test.status === 'PASS' ? '✅' : '❌'} {test.name}
                  </div>
                  {test.error && (
                    <div className="text-sm mt-1">
                      <strong>Error:</strong> {test.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Current Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Current Result:</strong>
            <pre className="mt-2 text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 