import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai'; // MiMo 兼容 OpenAI SDK

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 初始化 MiMo (使用 OpenAI SDK)
const mimo = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.ai.xiaomi.com/v1',
});

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '请输入描述词！' });
  }

  try {
    // 1. 调用 MiMo 优化提示词
    const completion = await mimo.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一个专业的绘图专家，请将用户描述转化为精美的英文绘图提示词。只需返回英文提示词。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mimo-v2.5-pro", // 替换为你申请到的具体模型名称
    });

    const optimizedPrompt = completion.choices[0].message.content?.trim() || prompt;

    console.log(`原始描述: ${prompt}`);
    console.log(`MiMo 优化后的描述: ${optimizedPrompt}`);

    // 2. 绘图逻辑
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    res.json({
      message: 'Generated with MiMo assistance',
      originalPrompt: prompt,
      optimizedPrompt,
      imageUrl
    });

  } catch (error: any) {
    console.error('MiMo 报错:', error);
    res.status(500).json({
      error: 'MiMo 接口响应失败，请检查 API Key / Base URL / 模型名称'
    });
  }
});

app.get('/', (req, res) => {
  res.send('Nano Banana API (MiMo Mode) is running! 🍌');
});

app.listen(port, () => {
  console.log(`MiMo Mode running on ${port}`);
});