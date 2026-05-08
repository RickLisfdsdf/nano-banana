import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true
}));
app.use(express.json());

// --- 初始化各个模型客户端 ---

// 1. MiMo (Xiaomi)
const mimo = new OpenAI({
  apiKey: process.env.MIMO_API_KEY || 'no-key',
  baseURL: process.env.MIMO_BASE_URL || 'https://api.ai.xiaomi.com/v1',
});

// 2. Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 3. DeepSeek (示例：同样使用 OpenAI SDK)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'no-key',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_INSTRUCTION = "你是一个专业的 AI 绘图提示词优化专家。请将用户的描述词转化为一段详细的、充满艺术感的英文绘图提示词(Prompt)。只需返回优化后的英文内容，不要有任何其他解释。";

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt, modelType } = req.body; // modelType: 'mimo', 'gemini', 'deepseek', 'none'

  if (!prompt) {
    return res.status(400).json({ error: '请输入描述词！' });
  }

  let optimizedPrompt = prompt;
  let usedModel = modelType || 'none';
  let optimizationError = null;

  try {
    console.log(`收到请求 - 模型: ${usedModel}, 描述: ${prompt}`);

    if (usedModel === 'mimo') {
      const completion = await mimo.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: prompt }
        ],
        model: process.env.MIMO_MODEL || "mimo-v2.5-pro",
      });
      optimizedPrompt = completion.choices[0].message.content?.trim() || prompt;

    } else if (usedModel === 'gemini') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${SYSTEM_INSTRUCTION}\n\n用户描述词: ${prompt}`);
      optimizedPrompt = result.response.text().trim() || prompt;

    } else if (usedModel === 'deepseek') {
      const completion = await deepseek.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
      });
      optimizedPrompt = completion.choices[0].message.content?.trim() || prompt;
    }

    console.log(`优化结果: ${optimizedPrompt}`);

  } catch (error: any) {
    console.error(`模型 ${usedModel} 优化出错:`, error.message);
    optimizationError = error.message;
    // 出错时保持 original prompt，不中断流程
  }

  // --- 生成图片阶段 (Pollinations AI) ---
  try {
    const encodedPrompt = encodeURIComponent(optimizedPrompt);
    const randomSeed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    res.json({ 
      message: optimizationError ? `模型优化失败 (${optimizationError})，已直接生成图片` : '生成成功',
      originalPrompt: prompt,
      optimizedPrompt: optimizedPrompt,
      imageUrl: imageUrl,
      modelUsed: usedModel
    });

  } catch (error: any) {
    res.status(500).json({ error: '图片生成接口调用失败' });
  }
});

app.get('/', (req, res) => {
  res.send('🍌 Nano Banana Multi-Model API 正在运行！');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
