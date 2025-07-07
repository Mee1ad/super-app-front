"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showErrorToast, showSuccessToast, showWarningToast, showInfoToast } from "@/lib/error-handler"

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

  const handleTestSuccess = () => {
    showSuccessToast("Operation Successful", "Your action was completed successfully")
  }

  const handleTestWarning = () => {
    showWarningToast("Warning", "This action might have unexpected consequences")
  }

  const handleTestInfo = () => {
    showInfoToast("Information", "Here's some helpful information for you")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Demo</CardTitle>
        <CardDescription>
          Test the animated error handling system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleTestErrors} variant="destructive">
            Test Errors
          </Button>
          <Button onClick={handleTestSuccess} variant="default">
            Test Success
          </Button>
          <Button onClick={handleTestWarning} variant="outline">
            Test Warning
          </Button>
          <Button onClick={handleTestInfo} variant="secondary">
            Test Info
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>• Error toasts show validation errors, server errors, etc.</p>
          <p>• Success toasts confirm successful operations</p>
          <p>• Warning toasts show important notices</p>
          <p>• Info toasts provide helpful information</p>
        </div>
      </CardContent>
    </Card>
  )
} 