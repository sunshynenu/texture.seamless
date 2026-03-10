import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, Download, RefreshCw, AlertCircle } from 'lucide-react';

// 1. Setup API (Using the Vercel variable we set up)
const API_KEY = "AIzaSyCduxqf7gbGzLZgLSHcHiJSjRymNsrHrFw";
const genAI = new GoogleGenerativeAI("AIzaSyCduxqf7gbGzLZgLSHcHiJSjRymNsrHrFw");;

const TextureApp = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateTexture = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);

    try {
      // NOTE: We use Gemini to "enhance" your prompt for better textures
      const textModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // This line tells Google to be less strict for art prompts
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      });

      const promptResult = await textModel.generateContent(
        `Technical Artist Prompt: Create a highly detailed visual description for a tileable, seamless 3D texture: ${prompt}. Only output the description, no conversational text.`
      );
      
      // Safety check: Make sure Google actually gave us text back
      const response = await promptResult.response;
      const optimizedPrompt = response.text() || "seamless texture " + prompt;

      const encodedPrompt = encodeURIComponent(optimizedPrompt.substring(0, 500));
      const generatedUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&model=flux&nologo=true`;
      
      setImage(generatedUrl);
    } catch (err) {
      // This will now tell us the SPECIFIC error in the console
      setError("AI Connection Error. Try a simpler prompt like 'Red brick'.");
      console.error("DETAILED ERROR:", err);
    }


  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-8 font-sans">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
        Texture Generator
      </h1>

      <div className="w-full max-w-md space-y-4">
        <textarea
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Describe your texture (e.g., 'Blue marble with gold veins')"
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
          <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
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
