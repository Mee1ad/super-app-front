import Link from "next/link";
import { Lightbulb, CheckSquare, BookOpen, Heart, Utensils } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <main className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Super App</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12">Your productivity toolkit</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            <Link href="/todo">
              <div className="group p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <CheckSquare className="h-8 w-8 md:h-12 md:w-12 text-green-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">Todo Lists</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage tasks and shopping lists
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/food-planner">
              <div className="group p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Utensils className="h-8 w-8 md:h-12 md:w-12 text-orange-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">Food Planner</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Plan meals and track nutrition
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/ideas">
              <div className="group p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Lightbulb className="h-8 w-8 md:h-12 md:w-12 text-yellow-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">Ideas</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Capture and organize ideas
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/diary">
              <div className="group p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-blue-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">Diary</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Journal your thoughts and experiences
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/habit">
              <div className="group p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Heart className="h-8 w-8 md:h-12 md:w-12 text-red-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">Habit Tracker</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Build and track healthy habits
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
