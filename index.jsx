import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RefreshCw, Sparkles, AlertCircle, Download } from 'lucide-react';

// SECURE API KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY - add to Vercel env vars');
}
const genAI = new GoogleGenerativeAI(API_KEY);

const TextureApp = () => {
  const [prompt,
