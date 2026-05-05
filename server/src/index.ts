import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 这里的 API KEY 需要用户在 .env 中设置
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 注意：目前标准的 Gemini API (via @google/generative-ai) 主要用于文本和多模态理解
    // 图像生成通常通过 Google Cloud Vertex AI 的 Imagen 模型。
    // 这里我们先编写一个结构化的响应，并提示用户配置 API。
    
    console.log(`Generating image for prompt: ${prompt}`);
    
    // 模拟生成过程 (因为 Imagen API 通常需要 Vertex AI SDK 或特定的 REST 调用)
    // 如果用户有具体的模型需求，可以后续调整。
    // 这里先返回一个提示信息或占位符逻辑。
    
    res.json({ 
      message: 'Backend received prompt successfully',
      prompt: prompt,
      imageUrl: 'https://via.placeholder.com/512?text=Image+Generation+Coming+Soon' 
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
