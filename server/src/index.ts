import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// 初始化 MiMo
const mimo = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.ai.xiaomi.com/v1',
});

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: '请输入描述词！'
    });
  }

  try {
    console.log(`收到用户请求: ${prompt}`);

    // 调用 MiMo 优化提示词
    const completion = await mimo.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional image prompt expert. Optimize the user input into a detailed English prompt for AI drawing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mimo-v2.5-pro",
    }).catch((e: any) => {
      // 输出 MiMo 返回的具体错误
      console.error("MiMo 接口返回了具体错误:", e.status, e.message, e.error);
      throw e;
    });

    const optimizedPrompt =
      completion.choices[0].message.content?.trim() || prompt;

    console.log(`MiMo 优化后提示词: ${optimizedPrompt}`);

    // 正常绘图
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      optimizedPrompt
    )}?width=1024&height=1024&nologo=true&seed=${Math.floor(
      Math.random() * 1000
    )}`;

    res.json({
      success: true,
      originalPrompt: prompt,
      optimizedPrompt,
      imageUrl
    });

  } catch (error: any) {
    console.error('最终捕获报错:', error.message);

    // 保底方案：MiMo 不可用则直接原始提示词绘图
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}?width=1024&height=1024&nologo=true&seed=${Math.floor(
      Math.random() * 1000
    )}`;

    res.json({
      success: false,
      imageUrl: fallbackUrl,
      originalPrompt: prompt,
      message: "MiMo 暂时不可用，已为您直接绘图"
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Nano Banana API (MiMo Backup Mode) is running! 🍌');
});

app.listen(port, () => {
  console.log(`Server running with MiMo on ${port}`);
});