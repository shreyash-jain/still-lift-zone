"use client";

import { useState } from "react";
import { playMessageAudio, PlayTextAudioOptions } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AudioTestPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("Take a deep breath and relax");
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string>("");
  const [options, setOptions] = useState<PlayTextAudioOptions>({
    rate: 0.95,
    pitch: 1,
    volume: 0.9,
    mood: "Good",
    context: "Still",
    isHomepage: false,
  });

  // Prevent hydration issues
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  const handlePlay = async (
    testTitle?: string,
    testMessage?: string,
    testOptions?: PlayTextAudioOptions
  ) => {
    setIsPlaying(true);
    const currentTitle = testTitle ?? title;
    const currentMessage = testMessage ?? message;
    const currentOptions = testOptions ?? options;

    setLastPlayed(
      `${currentTitle ? currentTitle + ": " : ""}${currentMessage}`
    );

    try {
      await playMessageAudio(currentTitle, currentMessage, currentOptions);
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const predefinedTests = [
    {
      name: "Homepage Audio (No Mood/Context)",
      title: "Welcome",
      message: "Welcome to StillLift",
      options: { isHomepage: true },
    },
    {
      name: "Mood-Context: Still (Matches Display)",
      title: "VISUALIZE",
      message: "VISUALIZE: Find a quiet space and breathe",
      options: { mood: "Good", context: "safe" },
    },
    {
      name: "Mood-Context: Moving (Matches Display)",
      title: "ACTION",
      message: "ACTION: Take a gentle walk",
      options: { mood: "Good", context: "moving" },
    },
    {
      name: "Mood-Context: Focused (Matches Display)",
      title: "ACTION",
      message: "ACTION: Concentrate on your breathing",
      options: { mood: "Good", context: "focused" },
    },
    {
      name: "Treasure Chest Audio",
      title: "TREASURE",
      message: "treasure_chest_revealtoken",
      options: {},
    },
    {
      name: "Mood-Context + Homepage (Should use Mood-Context)",
      title: "ACTION",
      message: "ACTION: Concentrate on your breathing",
      options: { mood: "Good", context: "focused", isHomepage: true },
    },
    {
      name: "TTS Fallback (No File)",
      title: "TEST",
      message: "This should use text-to-speech",
      options: { rate: 0.8, pitch: 1.2, volume: 0.7 },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Audio Library Test
          </h1>
          <p className="text-lg text-gray-600">
            Test your audio library functionality
          </p>
        </div>

        {/* Custom Test */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Audio Test</CardTitle>
            <CardDescription>
              Test with your own title and message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title..."
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rate">Rate</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="2"
                  value={options.rate}
                  onChange={(e) =>
                    setOptions({ ...options, rate: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pitch">Pitch</Label>
                <Input
                  id="pitch"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="2"
                  value={options.pitch}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      pitch: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={options.volume}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      volume: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mood">Mood</Label>
                <select
                  id="mood"
                  value={options.mood || ""}
                  onChange={(e) =>
                    setOptions({ ...options, mood: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">None</option>
                  <option value="Good">Good</option>
                  <option value="Calm">Calm</option>
                  <option value="Energetic">Energetic</option>
                </select>
              </div>
              <div>
                <Label htmlFor="context">Context</Label>
                <select
                  id="context"
                  value={options.context || ""}
                  onChange={(e) =>
                    setOptions({ ...options, context: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">None</option>
                  <option value="safe">Safe/Still</option>
                  <option value="moving">Moving</option>
                  <option value="focused">Focused</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isHomepage"
                  checked={options.isHomepage || false}
                  onChange={(e) =>
                    setOptions({ ...options, isHomepage: e.target.checked })
                  }
                />
                <Label htmlFor="isHomepage">Homepage Audio</Label>
              </div>
            </div>

            <Button
              onClick={() => handlePlay()}
              disabled={isPlaying}
              className="w-full"
            >
              {isPlaying ? "Playing..." : "Play Audio"}
            </Button>

            {lastPlayed && (
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">Last played:</p>
                <p className="font-medium">{lastPlayed}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predefined Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Predefined Tests</CardTitle>
            <CardDescription>Test different audio scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedTests.map((test, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">{test.name}</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Title:</strong> {test.title || "None"}
                    <br />
                    <strong>Message:</strong> {test.message}
                  </p>
                  {Object.keys(test.options).length > 0 && (
                    <p className="text-xs text-gray-500">
                      <strong>Options:</strong> {JSON.stringify(test.options)}
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={() =>
                      handlePlay(test.title, test.message, test.options)
                    }
                    disabled={isPlaying}
                    className="w-full"
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audio Files Info */}
        <Card>
          <CardHeader>
            <CardTitle>Available Audio Files</CardTitle>
            <CardDescription>Your current audio library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="font-medium">homepage audio.mp3</span>
                <span className="text-sm text-gray-600">Homepage audio</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">
                  Mood_Good_Context_Still_Audio_1.mp3
                </span>
                <span className="text-sm text-gray-600">
                  Still/Safe context
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">
                  Mood_Good_Context_Move_Audio_1.mp3
                </span>
                <span className="text-sm text-gray-600">Moving context</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">
                  Mood_Good_Context_focused_Audio_1.mp3
                </span>
                <span className="text-sm text-gray-600">Focused context</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="font-medium">
                  treasure_chest_revealtoken.mp3
                </span>
                <span className="text-sm text-gray-600">
                  Special treasure audio
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>
                <strong>1. Test Audio File Matching:</strong> Try the predefined
                tests to see which audio files are found
              </p>
              <p>
                <strong>2. Test TTS Fallback:</strong> Use messages that
                don&apos;t match any audio files to test text-to-speech
              </p>
              <p>
                <strong>3. Test Options:</strong> Adjust rate, pitch, and volume
                to hear the differences
              </p>
              <p>
                <strong>4. Test Mood-Context:</strong> Use different mood and
                context combinations
              </p>
              <p>
                <strong>5. Check Console:</strong> Open browser dev tools to see
                detailed audio loading logs
              </p>
              <p>
                <strong>6. Audio-Screen Matching:</strong> Audio now matches
                what&apos;s displayed: &quot;ACTION: [message]&quot; format
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
