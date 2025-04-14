
import React, { useState } from 'react';
import VectorEditor from '@/components/VectorEditor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileDown, FileUp, Save, Settings, Home } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const VectorStudio: React.FC = () => {
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [canvasHeight, setCanvasHeight] = useState<number>(600);
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCreateNewCanvas = () => {
    // Reset canvas with new dimensions
    // This will trigger the useEffect in VectorEditor that watches for width/height changes
    const tempWidth = canvasWidth;
    const tempHeight = canvasHeight;
    setCanvasWidth(0);
    setCanvasHeight(0);
    // Use setTimeout to ensure the state update cycle completes before setting new values
    setTimeout(() => {
      setCanvasWidth(tempWidth);
      setCanvasHeight(tempHeight);
      toast({
        title: "Canvas Updated",
        description: `New canvas size: ${tempWidth}×${tempHeight}px`,
      });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 no-print">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-slate-800">
              Vector Studio
            </h1>
            <p className="text-slate-500 mt-1">
              Create professional vector graphics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="max-w-[200px]"
              aria-label="Project name"
            />
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="mr-2" size={16} />
              Settings
            </Button>
            <Button asChild variant="outline">
              <a href="/">
                <Home className="mr-2" size={16} />
                Home
              </a>
            </Button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Canvas Settings</CardTitle>
              <CardDescription>Configure your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="space-y-2">
                  <Label htmlFor="canvas-width">Width (px)</Label>
                  <Input
                    id="canvas-width"
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Number(e.target.value))}
                    min={100}
                    max={3000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canvas-height">Height (px)</Label>
                  <Input
                    id="canvas-height"
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Number(e.target.value))}
                    min={100}
                    max={3000}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreateNewCanvas}>Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6">
        <VectorEditor width={canvasWidth} height={canvasHeight} />
      </main>

      <footer className="bg-slate-800 text-white py-4 mt-8 no-print">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-300">&copy; {new Date().getFullYear()} Vector Studio | All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default VectorStudio;
