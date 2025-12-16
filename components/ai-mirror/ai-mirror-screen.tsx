"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Camera, Sparkles, Upload, Loader2, RotateCcw, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSkinAnalysis, useVirtualTryon } from "@/hooks/use-ai"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function AIMirrorScreen() {
  const [activeTab, setActiveTab] = useState<"tryon" | "analysis">("tryon")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { analyze, result: skinResult, isAnalyzing, reset: resetSkin } = useSkinAnalysis()
  const { tryOn, result: tryonResult, isProcessing, reset: resetTryon } = useVirtualTryon()

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 960 },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Camera access denied:", err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(dataUrl)
        stopCamera()
      }
    }
  }, [stopCamera])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!capturedImage) return
    await analyze({ image: capturedImage })
  }

  const handleTryon = async () => {
    if (!capturedImage || !selectedProduct) return
    await tryOn({ userImage: capturedImage, productId: selectedProduct })
  }

  const handleReset = () => {
    setCapturedImage(null)
    setSelectedProduct(null)
    resetSkin()
    resetTryon()
  }

  // Sample products for try-on
  const sampleProducts = [
    { id: "lip-01", name: "Ruby Red Lipstick", type: "lipstick", color: "#C41E3A" },
    { id: "lip-02", name: "Nude Pink Gloss", type: "lipstick", color: "#E8B4B8" },
    { id: "eye-01", name: "Smoky Shadow", type: "eyeshadow", color: "#36454F" },
    { id: "eye-02", name: "Golden Shimmer", type: "eyeshadow", color: "#FFD700" },
  ]

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Mirror</h1>
          <p className="text-muted-foreground text-sm">Virtual try-on & skin analysis</p>
        </div>
        {capturedImage && (
          <Button variant="ghost" size="icon" onClick={handleReset}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tryon" | "analysis")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tryon">Virtual Try-On</TabsTrigger>
          <TabsTrigger value="analysis">Skin Analysis</TabsTrigger>
        </TabsList>

        {/* Camera/Image Preview */}
        <Card className="mt-4 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] bg-muted">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : capturedImage ? (
                <Image src={capturedImage || "/placeholder.svg"} alt="Captured" fill className="object-cover" />
              ) : tryonResult?.resultImage ? (
                <Image
                  src={tryonResult.resultImage || "/placeholder.svg"}
                  alt="Try-on result"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Take a photo or upload an image</p>
                </div>
              )}

              {/* Processing Overlay */}
              {(isAnalyzing || isProcessing) && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">{isAnalyzing ? "Analyzing skin..." : "Processing try-on..."}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        {/* Camera Controls */}
        {!capturedImage && !tryonResult && (
          <div className="flex gap-2">
            {cameraActive ? (
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
            ) : (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Open Camera
              </Button>
            )}
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        )}

        <TabsContent value="tryon" className="space-y-4 mt-4">
          {capturedImage && (
            <>
              {/* Product Selection */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Select Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {sampleProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg min-w-[70px] border-2 transition-all",
                          selectedProduct === product.id ? "border-primary bg-primary/5" : "border-transparent",
                        )}
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-muted"
                          style={{ backgroundColor: product.color }}
                        />
                        <span className="text-xs text-center truncate w-full">{product.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleTryon} disabled={!selectedProduct || isProcessing} className="w-full">
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Try On Now
              </Button>
            </>
          )}

          {tryonResult && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          {capturedImage && !skinResult && (
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Analyze My Skin
            </Button>
          )}

          {skinResult && (
            <Card>
              <CardHeader>
                <CardTitle>Skin Analysis Results</CardTitle>
                <CardDescription>Based on AI analysis of your photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Score */}
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-primary">{skinResult.overallScore}/100</div>
                  <p className="text-sm text-muted-foreground">Overall Skin Health</p>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                  {skinResult.metrics?.map((metric: { name: string; score: number; status: string }) => (
                    <div key={metric.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.name}</span>
                        <span className="text-muted-foreground">{metric.score}%</span>
                      </div>
                      <Progress value={metric.score} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* Skin Type */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Skin Type</span>
                  <Badge variant="secondary">{skinResult.skinType}</Badge>
                </div>

                {/* Concerns */}
                {skinResult.concerns && skinResult.concerns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Areas of Concern</p>
                    <div className="flex flex-wrap gap-2">
                      {skinResult.concerns.map((concern: string) => (
                        <Badge key={concern} variant="outline">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {skinResult.recommendations && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {skinResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
