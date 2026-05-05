import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// 跨域设置：允许前端访问
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // * 代表允许所有来源
  credentials: true
}));

app.use(express.json());

app.post('/api/generate-image', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: '请输入描述词！'
    });
  }

  try {
    console.log(`正在为描述词生成图片: ${prompt}`);

    // 编码描述词
    const encodedPrompt = encodeURIComponent(prompt);

    // 随机 seed 确保每次生成不同
    const randomSeed = Math.floor(Math.random() * 99999);

    // Pollinations 免费绘图接口
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

    // 返回结果给前端
    res.json({
      success: true,
      message: '图片生成成功',
      prompt,
      imageUrl
    });

  } catch (error) {
    console.error('生成出错:', error);

    res.status(500).json({
      success: false,
      error: '生成失败，请重试'
    });
  }
});

// 健康检查
app.get('/', (req: Request, res: Response) => {
  res.send('🍌 Nano Banana API (纯净版) 正在运行！');
});

app.listen(port, () => {
  console.log(`服务器启动于端口 ${port}`);
});