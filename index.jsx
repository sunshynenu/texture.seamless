import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Download, RefreshCw, AlertCircle } from 'lucide-react';

// IMPORTANT: Replace the "YOUR_NEW_KEY" below with a FRESH key from AI Studio
// Do not use the leaked one!
const API_KEY = "YOUR_NEW_KEY_HERE"; 
const genAI = new GoogleGenerativeAI(API_KEY);

const TextureApp = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTexture = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      // We use Gemini 2.0 Flash for direct image generation
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const fullPrompt = `Generate a high-resolution, seamless, tileable 3D texture map of: ${prompt}. Output as a PNG image.`;
      
      // This is the specific logic you requested:
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      // Pulling the base64 image data from the AI response
      const imageData = response.candidates[0].content.parts[0].inlineData; 
      
      if (imageData && imageData.data) {
        const imageSrc = `data:image/png;base64,${imageData.data}`;
        setImage(imageSrc);
      } else {
        throw new Error("The AI didn't return image data. It might have sent text instead.");
      }

    } catch (err) {
      const msg = err.message || "Unknown Error";
      setError(`AI Error: ${msg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-8 font-sans">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8 text-center">
        Texture Generator
      </h1>

      <div className="w-full max-w-md space-y-4">
        <textarea
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Describe your texture (e.g., 'lava rock')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />

        <button
          onClick={generateTexture}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
          {loading ? "SYNTHESIZING..." : "RUN SYNTHESIS"}
        </button>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} />
            <span className="break-all">{error}</span>
          </div>
        )}

        <div className="aspect-square w-full bg-zinc-900 rounded-2xl border-2 border-zinc-800 border-dashed flex items-center justify-center overflow-hidden relative">
          {image ? (
            <>
              <img src={image} alt="Generated texture" className="w-full h-full object-cover" />
              <a 
                href={image} 
                download="texture.png"
                className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <Download size={24} />
              </a>
            </>
          ) : (
            <div className="text-zinc-500 text-center p-8">
              {loading ? "AI is painting your texture..." : "No texture generated yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<TextureApp />);
