import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// --- 全局错误捕获，防止进程崩溃 ---
process.on('uncaughtException', (err) => {
  console.error('🔥 未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 未处理的 Promise 拒绝:', reason);
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true
}));
app.use(express.json());

// --- 初始化模型客户端 ---
const mimo = new OpenAI({
  apiKey: process.env.MIMO_API_KEY || 'no-key',
  baseURL: process.env.MIMO_BASE_URL || 'https://api.ai.xiaomi.com/v1',
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'no-key',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_INSTRUCTION = "你是一个世界顶级的 AI 艺术总监。你的任务是将用户简单的描述词，改写为极其详细、具有电影质感的英文绘图提示词(Prompt)。\n\n优化规则：\n1. 细节填充：加入具体的材质（如丝绸、磨砂金属）、光影（如丁达尔效应、电影级逆光）、环境描述。\n2. 艺术风格：明确风格（如 Photorealistic, Cinematic, 8k resolution, Unreal Engine 5 render）。\n3. 构图控制：加入镜头语言（如 Wide angle, Close-up, Depth of field）。\n4. 只返回英文：不要任何多余解释，直接输出优化后的英文内容。";

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt, modelType } = req.body; 

  if (!prompt) {
    return res.status(400).json({ error: '请输入描述词！' });
  }

  let optimizedPrompt = prompt;
  let usedModel = (modelType as string) || 'none';
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
      const choice = completion.choices[0];
      optimizedPrompt = choice?.message.content?.trim() || prompt;

    } else if (usedModel === 'gemini') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
      const choice = completion.choices[0];
      optimizedPrompt = choice?.message.content?.trim() || prompt;
    }

  } catch (error: any) {
    console.error(`模型 ${usedModel} 优化出错:`, error.message);
    optimizationError = error.message;
  }

  try {
    const encodedPrompt = encodeURIComponent(optimizedPrompt);
    const randomSeed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}&model=flux`;

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

app.get('/', (_req: Request, res: Response) => {
  res.send('🍌 Nano Banana Multi-Model API 正在运行！');
});

// 监听端口，增加对 Render 的兼容性支持
const serverPort = typeof port === 'string' ? parseInt(port, 10) : port;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`🚀 Nano Banana Backend is running!`);
  console.log(`📡 Listening on: 0.0.0.0:${serverPort}`);
});
