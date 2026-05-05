# Nano Banana 部署指南 (方案 A)

本项目采用前后端分离部署架构。

## 1. 后端部署 (推荐使用 Render 或 Railway)
后端是一个 Node.js (Express) 应用。

- **源码目录**: `nano-banana/server`
- **构建命令**: `npm install && npm run build`
- **启动命令**: `npm start`
- **环境变量 (Environment Variables)**:
  - `PORT`: `3001` (通常由平台自动分配)
  - `GEMINI_API_KEY`: 您的 Google Gemini API 密钥
  - `FRONTEND_URL`: 部署后的前端网址 (例如 `https://your-nano-banana.vercel.app`)

## 2. 前端部署 (推荐使用 Vercel 或 Netlify)
前端是一个 Vite + React 应用。

- **源码目录**: `nano-banana/client`
- **构建命令**: `npm install && npm run build`
- **输出目录 (Output Directory)**: `dist`
- **环境变量 (Environment Variables)**:
  - `VITE_API_URL`: 部署后的后端网址 (例如 `https://nano-banana-api.onrender.com`)

## 3. 部署流程
1. 将整个代码上传到 GitHub。
2. **先部署后端**：在 Render/Railway 上连接 GitHub，进入 `server` 文件夹进行部署。拿到后端分配的 URL。
3. **再部署前端**：在 Vercel 上连接 GitHub，进入 `client` 文件夹进行部署。
   - 在 Vercel 的环境变量设置中填入 `VITE_API_URL` (即上一步拿到的后端 URL)。
4. **回过头更新后端变量**：回到后端部署平台，将 `FRONTEND_URL` 设置为前端部署成功的 URL，以通过跨域校验。

恭喜！您的网站现在就可以全球访问并分享给朋友了！🍌✨
