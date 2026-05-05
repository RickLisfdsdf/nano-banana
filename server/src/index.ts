import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 跨域配置：允许您的前端 Vercel 地址访问
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// 初始化 Google Gemini AI
// 请确保您在 Render 的环境变量中设置了 GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '请输入描述词！' });
  }

  try {
    // 1. 调用 Gemini 1.5 Flash 优化用户的描述词
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemInstruction = `你是一个专业的 AI 绘图提示词优化专家。
请将用户的描述词转化为一段详细的、充满艺术感的英文绘图提示词(Prompt)。
要求：增加关于灯光、构图、艺术风格和材质的细节，长度约 50 个单词。
只需返回优化后的英文 Prompt 内容，不要有任何其他解释。`;

    const result = await model.generateContent([systemInstruction, prompt]);
    const optimizedPrompt = result.response.text().trim();

    console.log(`原始描述: ${prompt}`);
    console.log(`Gemini 优化后的描述: ${optimizedPrompt}`);

    // 2. 将优化后的 Prompt 送往图像生成接口 (使用 Pollinations 免密钥接口)
    const encodedPrompt = encodeURIComponent(optimizedPrompt);

    // 增加随机 seed 确保每次生成的图片都有所不同
    const randomSeed = Math.floor(Math.random() * 100000);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    // 返回结果给前端
    res.json({
      message: '图片生成成功',
      originalPrompt: prompt,
      optimizedPrompt: optimizedPrompt,
      imageUrl: imageUrl
    });

  } catch (error: any) {
    console.error('后端处理出错:', error);
    res.status(500).json({ error: 'Gemini 接口响应失败，请检查 API Key 设置' });
  }
});

// 健康检查接口，方便在浏览器查看后端是否存活
app.get('/', (req, res) => {
  res.send('🍌 Nano Banana API 运行正常！');
});

app.listen(port, () => {
  console.log(`服务器已启动，端口：${port}`);
});