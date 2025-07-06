import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckSquare, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <main className="text-center">
          <h1 className="text-4xl font-bold mb-4">Super App</h1>
          <p className="text-xl text-muted-foreground mb-12">Your productivity toolkit</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/ideas">
              <div className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Lightbulb className="h-12 w-12 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Daily Ideas</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture and organize your thoughts quickly
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/todo">
              <div className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <CheckSquare className="h-12 w-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Todo Lists</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage tasks and shopping lists
                  </p>
                </div>
              </div>
            </Link>
            
            <div className="group p-6 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 opacity-50">
              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  More apps on the way
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
