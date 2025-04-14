
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Circle,
  Square,
  Type,
  Image as ImageIcon,
  Pencil,
  MousePointer,
  Move,
  Trash2,
  Copy,
  Save,
  FileUp,
  FileDown,
  Layers,
  Palette,
  Sliders,
  RotateCw,
  PenTool,
  Scissors,
  Undo,
  Redo,
  Grid,
  Lock,
  Unlock,
  EyeOff,
  Eye
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  object: fabric.Object;
  visible: boolean;
  locked: boolean;
}

interface VectorEditorProps {
  width?: number;
  height?: number;
}

const VectorEditor: React.FC<VectorEditorProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(20);
  const [opacity, setOpacity] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(100);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(20);
  const [isDrawingPath, setIsDrawingPath] = useState<boolean>(false);
  const [pathPoints, setPathPoints] = useState<fabric.Point[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvasInstanceRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        isDrawingMode: false,
        // Enable text editing
        selection: true,
        selectionBorderColor: 'rgba(0,0,0,0.3)',
        selectionLineWidth: 1
      });
      
      canvasInstanceRef.current = canvas;
      
      // Set up event listeners
      canvas.on('selection:created', handleSelectionChange);
      canvas.on('selection:updated', handleSelectionChange);
      canvas.on('selection:cleared', () => setActiveObject(null));
      canvas.on('object:added', handleObjectAdded);
      canvas.on('object:modified', handleObjectModified);
      
      // Set up mouse events for path drawing
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
      
      // Enable text editing with double click
      canvas.on('mouse:dblclick', (options) => {
        if (options.target && options.target.type === 'textbox') {
          options.target.enterEditing();
          options.target.selectAll();
        }
      });
      
      // Save initial state
      saveCanvasState();
      
      // Clean up on unmount
      return () => {
        canvas.dispose();
        canvasInstanceRef.current = null;
      };
    }
  }, []);

  // Update canvas size when props change
  useEffect(() => {
    if (canvasInstanceRef.current && (width > 0 && height > 0)) {
      canvasInstanceRef.current.setWidth(width);
      canvasInstanceRef.current.setHeight(height);
      canvasInstanceRef.current.renderAll();
    }
  }, [width, height]);
  
  // Handle selection changes
  const handleSelectionChange = (e: fabric.IEvent) => {
    const selection = e.selected?.[0];
    if (selection) {
      setActiveObject(selection);
      // Update controls based on selected object
      setFillColor(selection.fill as string || '#ffffff');
      setStrokeColor(selection.stroke as string || '#000000');
      setStrokeWidth(selection.strokeWidth || 1);
      if (selection.type === 'textbox') {
        setFontSize((selection as fabric.Textbox).fontSize as number || 20);
        // Ensure text editing is enabled
        (selection as fabric.Textbox).set({
          editable: true,
          selectable: true
        });
      }
      setOpacity(selection.opacity ? selection.opacity * 100 : 100);
    }
  };

  // Handle object added to canvas
  const handleObjectAdded = (e: fabric.IEvent) => {
    if (e.target && !isDrawingPath) {
      const object = e.target;
      const id = Date.now().toString();
      const name = `Layer ${layers.length + 1}`;
      
      setLayers(prev => [...prev, {
        id,
        name,
        object,
        visible: true,
        locked: false
      }]);
      
      saveCanvasState();
    }
  };

  // Handle object modified
  const handleObjectModified = () => {
    saveCanvasState();
  };
  
  // Save canvas state for undo/redo
  const saveCanvasState = () => {
    if (!canvasInstanceRef.current) return;
    
    const json = JSON.stringify(canvasInstanceRef.current.toJSON());
    setUndoStack(prev => [...prev, json]);
    setRedoStack([]);
  };
  
  // Undo last action
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);
    
    loadCanvasState(previousState);
  };
  
  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, nextState]);
    
    loadCanvasState(nextState);
  };
  
  // Load canvas state from JSON
  const loadCanvasState = (json: string) => {
    if (!canvasInstanceRef.current) return;
    
    canvasInstanceRef.current.loadFromJSON(json, () => {
      canvasInstanceRef.current?.renderAll();
      updateLayersFromCanvas();
    });
  };
  
  // Update layers array from canvas objects
  const updateLayersFromCanvas = () => {
    if (!canvasInstanceRef.current) return;
    
    const objects = canvasInstanceRef.current.getObjects();
    setLayers(objects.map((object, index) => {
      const existingLayer = layers.find(layer => layer.object === object);
      return {
        id: existingLayer?.id || Date.now().toString() + index,
        name: existingLayer?.name || `Layer ${index + 1}`,
        object,
        visible: existingLayer?.visible ?? true,
        locked: existingLayer?.locked ?? false
      };
    }));
  };
  
  // Mouse event handlers for path drawing
  const handleMouseDown = (e: fabric.IEvent) => {
    if (activeTool !== 'path' || !canvasInstanceRef.current) return;
    
    const pointer = canvasInstanceRef.current.getPointer(e.e);
    
    if (!isDrawingPath) {
      // Start a new path
      setIsDrawingPath(true);
      setPathPoints([new fabric.Point(pointer.x, pointer.y)]);
    } else {
      // Add a point to the existing path
      setPathPoints(prev => [...prev, new fabric.Point(pointer.x, pointer.y)]);
      
      // Create or update the path object
      drawPath();
    }
  };
  
  const handleMouseMove = (e: fabric.IEvent) => {
    if (!isDrawingPath || activeTool !== 'path' || !canvasInstanceRef.current) return;
    
    // Preview the path as user moves mouse
    const pointer = canvasInstanceRef.current.getPointer(e.e);
    const points = [...pathPoints, new fabric.Point(pointer.x, pointer.y)];
    
    drawPath(points, true);
  };
  
  const handleMouseUp = (e: fabric.IEvent) => {
    if (activeTool !== 'path' || !canvasInstanceRef.current) return;
    
    if (isDrawingPath) {
      // Add the point where mouse was released
      const pointer = canvasInstanceRef.current.getPointer(e.e);
      const newPoints = [...pathPoints, new fabric.Point(pointer.x, pointer.y)];
      setPathPoints(newPoints);
      
      // Check if double-clicked or near starting point to finish the path
      if (newPoints.length > 2 && 
          Math.abs(newPoints[0].x - pointer.x) < 20 && 
          Math.abs(newPoints[0].y - pointer.y) < 20) {
        finishPath();
      } else {
        // Update the path with the new point
        drawPath(newPoints);
      }
    }
  };
  
  // Draw the path on canvas
  const drawPath = (points = pathPoints, isPreview = false) => {
    if (!canvasInstanceRef.current || points.length < 2) return;
    
    // Remove previous preview path
    const objects = canvasInstanceRef.current.getObjects();
    const previewPath = objects.find(obj => obj.data?.isPreview);
    if (previewPath) {
      canvasInstanceRef.current.remove(previewPath);
    }
    
    // Create SVG path string
    let pathString = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      // For smoother curves, use quadratic bezier
      if (i < points.length - 1) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        pathString += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
      } else {
        pathString += ` L ${points[i].x} ${points[i].y}`;
      }
    }
    
    // Create fabric path object
    const path = new fabric.Path(pathString, {
      fill: isPreview ? 'transparent' : fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: opacity / 100,
      data: { isPreview },
      selectable: !isPreview,
      evented: !isPreview
    });
    
    canvasInstanceRef.current.add(path);
    
    if (!isPreview) {
      canvasInstanceRef.current.setActiveObject(path);
    }
    canvasInstanceRef.current.renderAll();
  };
  
  // Finish drawing the path
  const finishPath = () => {
    if (pathPoints.length < 2) {
      setIsDrawingPath(false);
      setPathPoints([]);
      return;
    }
    
    // Close the path if near starting point
    const closePath = 
      Math.abs(pathPoints[0].x - pathPoints[pathPoints.length - 1].x) < 20 && 
      Math.abs(pathPoints[0].y - pathPoints[pathPoints.length - 1].y) < 20;
    
    let points = [...pathPoints];
    if (closePath) {
      points[points.length - 1] = points[0].clone();
    }
    
    // Remove any preview paths before creating the final path
    if (canvasInstanceRef.current) {
      const objects = canvasInstanceRef.current.getObjects();
      const previewPath = objects.find(obj => obj.data?.isPreview);
      if (previewPath) {
        canvasInstanceRef.current.remove(previewPath);
      }
    }
    
    drawPath(points);
    setIsDrawingPath(false);
    setPathPoints([]);
    saveCanvasState();
    
    // Reset the active tool to select after completing the path
    setActiveTool('select');
  };
  
  // Tool handlers
  const handleAddRectangle = () => {
    if (!canvasInstanceRef.current) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: opacity / 100,
    });
    
    canvasInstanceRef.current.add(rect);
    canvasInstanceRef.current.setActiveObject(rect);
  };
  
  const handleAddCircle = () => {
    if (!canvasInstanceRef.current) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: opacity / 100,
    });
    
    canvasInstanceRef.current.add(circle);
    canvasInstanceRef.current.setActiveObject(circle);
  };
  
  const handleAddText = () => {
    if (!canvasInstanceRef.current) return;
    
    const text = new fabric.Textbox('Edit this text', {
      left: 100,
      top: 100,
      fontSize,
      fill: fillColor,
      fontFamily: 'Arial',
      width: 200,
      editable: true,
      editingBorderColor: '#03a9f4',
      cursorWidth: 2,
      cursorColor: '#333',
      selectionColor: 'rgba(3, 169, 244, 0.3)',
      lockMovementX: false,
      lockMovementY: false
    });
    
    canvasInstanceRef.current.add(text);
    canvasInstanceRef.current.setActiveObject(text);
    // Immediately enter editing mode
    text.enterEditing();
    text.selectAll();
  };
  
  const handleDeleteSelected = () => {
    if (!canvasInstanceRef.current || !activeObject) return;
    
    canvasInstanceRef.current.remove(activeObject);
    setActiveObject(null);
    
    // Update layers
    setLayers(prev => prev.filter(layer => layer.object !== activeObject));
    saveCanvasState();
  };
  
  const handleDuplicate = () => {
    if (!canvasInstanceRef.current || !activeObject) return;
    
    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
        evented: true,
      });
      canvasInstanceRef.current?.add(cloned);
      canvasInstanceRef.current?.setActiveObject(cloned);
    });
  };
  
  // Layer management
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newVisibility = !layer.visible;
        layer.object.set('visible', newVisibility);
        return { ...layer, visible: newVisibility };
      }
      return layer;
    }));
    
    canvasInstanceRef.current?.renderAll();
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newLocked = !layer.locked;
        layer.object.set('selectable', !newLocked);
        layer.object.set('evented', !newLocked);
        return { ...layer, locked: newLocked };
      }
      return layer;
    }));
    
    canvasInstanceRef.current?.renderAll();
  };

  const handleLayerRename = (layerId: string, newName: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, name: newName } : layer
    ));
  };

  // Grid management
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  useEffect(() => {
    if (!canvasInstanceRef.current) return;
    
    // Remove existing grid
    const existingGrid = canvasInstanceRef.current.getObjects().filter(obj => obj.data?.isGrid);
    existingGrid.forEach(obj => canvasInstanceRef.current?.remove(obj));
    
    if (showGrid) {
      // Draw new grid
      for (let i = 0; i <= width; i += gridSize) {
        const line = new fabric.Line([i, 0, i, height], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
          data: { isGrid: true }
        });
        canvasInstanceRef.current.add(line);
      }
      
      for (let i = 0; i <= height; i += gridSize) {
        const line = new fabric.Line([0, i, width, i], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
          data: { isGrid: true }
        });
        canvasInstanceRef.current.add(line);
      }
      
      // Send grid to back
      const gridLines = canvasInstanceRef.current.getObjects().filter(obj => obj.data?.isGrid);
      gridLines.forEach(line => line.sendToBack());
    }
    
    canvasInstanceRef.current.renderAll();
  }, [showGrid, gridSize, width, height]);
  
  const handleExportSVG = () => {
    if (!canvasInstanceRef.current) return;
    
    const svg = canvasInstanceRef.current.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vector-design.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  const handleExportPNG = () => {
    if (!canvasInstanceRef.current) return;
    
    const dataURL = canvasInstanceRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'vector-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleZoom = (value: number[]) => {
    if (!canvasInstanceRef.current) return;
    
    const zoomValue = value[0] / 100;
    canvasInstanceRef.current.setZoom(zoomValue);
    setZoom(value[0]);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvasInstanceRef.current || !e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || typeof event.target.result !== 'string') return;
      
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        const image = new fabric.Image(imgObj, {
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvasInstanceRef.current?.add(image);
        canvasInstanceRef.current?.setActiveObject(image);
      };
    };
    
    reader.readAsDataURL(file);
  };
  
  // Update object properties
  useEffect(() => {
    if (!activeObject) return;
    
    activeObject.set({
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: opacity / 100,
    });
    
    if (activeObject.type === 'textbox') {
      (activeObject as fabric.Textbox).set({
        fontSize,
      });
    }
    
    canvasInstanceRef.current?.renderAll();
  }, [activeObject, fillColor, strokeColor, strokeWidth, fontSize, opacity]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-2 bg-slate-100 rounded-md">
        <div className="flex space-x-2">
          <Button 
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setActiveTool('select')}
            title="Select Tool"
          >
            <MousePointer size={16} />
          </Button>
          <Button 
            variant={activeTool === 'move' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setActiveTool('move')}
            title="Move Tool"
          >
            <Move size={16} />
          </Button>
          <Button 
            variant={activeTool === 'path' ? 'default' : 'outline'}
            size="icon"
            onClick={() => {
              setActiveTool('path');
              if (isDrawingPath) {
                finishPath();
              }
            }}
            title="Pen Tool"
          >
            <PenTool size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleAddRectangle}
            title="Add Rectangle"
          >
            <Square size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleAddCircle}
            title="Add Circle"
          >
            <Circle size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleAddText}
            title="Add Text"
          >
            <Type size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => document.getElementById('image-upload')?.click()}
            title="Add Image"
          >
            <ImageIcon size={16} />
            <input 
              id="image-upload" 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </Button>
          <Button 
            variant={showGrid ? 'default' : 'outline'}
            size="icon"
            onClick={toggleGrid}
            title="Toggle Grid"
          >
            <Grid size={16} />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            title="Undo"
          >
            <Undo size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo"
          >
            <Redo size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleDeleteSelected}
            disabled={!activeObject}
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleDuplicate}
            disabled={!activeObject}
            title="Duplicate"
          >
            <Copy size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleExportSVG}
            title="Export SVG"
          >
            <FileDown size={16} />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleExportPNG}
            title="Export PNG"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1">
        <div className="flex-1 border border-slate-300 rounded-md overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="w-64 ml-4">
          <Tabs defaultValue="properties">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="styles">Styles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Object Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fill Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 border border-slate-300 rounded-md" 
                        style={{ backgroundColor: fillColor }}
                      />
                      <Input 
                        type="color" 
                        value={fillColor} 
                        onChange={(e) => setFillColor(e.target.value)}
                        className="w-full h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stroke Color</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 border border-slate-300 rounded-md" 
                        style={{ backgroundColor: strokeColor }}
                      />
                      <Input 
                        type="color" 
                        value={strokeColor} 
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="w-full h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stroke Width: {strokeWidth}px</Label>
                    <Slider 
                      value={[strokeWidth]} 
                      min={0} 
                      max={20} 
                      step={1}
                      onValueChange={(value) => setStrokeWidth(value[0])}
                    />
                  </div>
                  
                  {activeObject?.type === 'textbox' && (
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize}px</Label>
                      <Slider 
                        value={[fontSize]} 
                        min={8} 
                        max={72} 
                        step={1}
                        onValueChange={(value) => setFontSize(value[0])}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Opacity: {opacity}%</Label>
                    <Slider 
                      value={[opacity]} 
                      min={0} 
                      max={100} 
                      step={1}
                      onValueChange={(value) => setOpacity(value[0])}
                    />
                  </div>

                  {activeTool === 'path' && isDrawingPath && (
                    <div className="mt-4">
                      <Button 
                        onClick={finishPath}
                        className="w-full"
                      >
                        Complete Path
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="layers">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Layers</CardTitle>
                </CardHeader>
                <CardContent>
                  {layers.length === 0 ? (
                    <p className="text-sm text-slate-500">No layers yet</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {layers.map((layer) => (
                        <div 
                          key={layer.id} 
                          className="flex items-center justify-between p-2 border rounded-md hover:bg-slate-50"
                          onClick={() => {
                            if (!layer.locked && canvasInstanceRef.current) {
                              canvasInstanceRef.current.setActiveObject(layer.object);
                              canvasInstanceRef.current.renderAll();
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerVisibility(layer.id);
                              }}
                            >
                              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </Button>
                            <span className="text-sm truncate max-w-[100px]">{layer.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerLock(layer.id);
                            }}
                          >
                            {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="styles">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Styles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Zoom: {zoom}%</Label>
                    <Slider 
                      value={[zoom]} 
                      min={10} 
                      max={200} 
                      step={10}
                      onValueChange={handleZoom}
                    />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Grid Size: {gridSize}px</Label>
                    <Slider 
                      value={[gridSize]} 
                      min={5} 
                      max={50} 
                      step={5}
                      onValueChange={(value) => setGridSize(value[0])}
                      disabled={!showGrid}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VectorEditor;
