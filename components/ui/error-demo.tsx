"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showErrorToast, showWarningToast, showInfoToast } from "@/lib/error-handler"

export function ErrorDemo() {
  const handleTestErrors = () => {
    // Test different error scenarios
    showErrorToast({
      status: 422,
      message: "title: Field required\ndescription: String should have at least 3 characters"
    })

    setTimeout(() => {
      showErrorToast({
        status: 404,
        message: "List not found"
      })
    }, 1000)

    setTimeout(() => {
      showErrorToast({
        status: 500,
        message: "Internal server error"
      })
    }, 2000)
  }

  // Removed handleTestSuccess function

  const handleTestWarning = () => {
    showWarningToast("Warning", "This action might have unexpected consequences")
  }

  const handleTestInfo = () => {
    showInfoToast("Information", "Here's some helpful information for you")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Toast Notification Demo</CardTitle>
        <CardDescription>
          Test different types of toast notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTestErrors} variant="destructive" className="w-full">
          Test Error Toasts
        </Button>
        
        {/* Removed success test button */}
        
        <Button onClick={handleTestWarning} variant="outline" className="w-full">
          Test Warning Toast
        </Button>
        
        <Button onClick={handleTestInfo} variant="outline" className="w-full">
          Test Info Toast
        </Button>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Error toasts show when operations fail</p>
          {/* Removed success toast description */}
          <p>• Warning toasts show important warnings</p>
          <p>• Info toasts show helpful information</p>
        </div>
      </CardContent>
    </Card>
  )
} 