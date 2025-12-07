import { useState } from "react";
import { ModeToggle } from "./Toggle";
import { Button } from "./ui/button";
import { Key } from "lucide-react";
import { ApiKeyManager } from "./ApiKeyManager";

export default function Navbar() {
  const [isApiManagerOpen, setIsApiManagerOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title Section */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinBoard
              </h1>
              <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 font-medium">
                Customizable Finance Dashboard
              </span>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApiManagerOpen(true)}
                className="hidden sm:flex"
              >
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* API Key Manager Modal */}
      <ApiKeyManager
        open={isApiManagerOpen}
        onClose={() => setIsApiManagerOpen(false)}
      />
    </>
  );
}