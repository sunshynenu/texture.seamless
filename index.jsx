import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. SECURE CONFIG (no hardcoded key!)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('Set VITE_GEMINI_API_KEY in .env or Vercel env vars');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. TEXTURE PREVIEW
const TextureCanvas = ({ imageUrl, isLoading, loadingStep }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8">
        <div className="w-24 h-24 border-4 border-zinc-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-medium text-zinc-400">{loadingStep}</div>
      </div>
    );
  }
  return (
    <div className="relative bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
      {imageUrl ? (
        <img src={imageUrl} alt="Generated texture" className="w-full h-96 object-cover cursor-grab active:cursor-grabbing" />
      ) : (
        <div className="w-full h-96 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <span className="text-zinc-500 text-lg">No texture generated yet</span>
        </div>
      )}
    </div>
  );
};

// 3. MAIN APP
const App = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const generateTexture = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setLoadingStep('Contacting Gemini...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Generate a seamless tileable texture image for: "${prompt}". High resolution, perfect seamless repeat, professional quality. Return ONLY the image URL.`
      );
      const imageUrl = result.response.text().trim(); // Assume API returns URL
      setImageUrl(imageUrl);
    } catch (error) {
      console.error('Generation failed:', error);
      setLoadingStep('Error—check API key');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8 text-center font-[Waiting]">
          Seamless Texture Generator
        </h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., red brick wall, floral pattern, wood grain..."
              className="w-full p-6 bg-zinc-900/50 border border-zinc-700 rounded-2xl resize-vertical min-h-[200px] text-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={generateTexture}
              disabled={isLoading || !prompt.trim()}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 py-4 px-8 rounded-2xl font-bold text-lg transition-all"
            >
              {isLoading ? 'Generating...' : 'RUN SYNTHESIS'}
            </button>
          </div>
          <TextureCanvas imageUrl={imageUrl} isLoading={isLoading} loadingStep={loadingStep} />
        </div>
      </div>
    </div>
  );
};

// 4. MOUNT
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
