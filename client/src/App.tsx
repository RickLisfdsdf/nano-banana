import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!prompt) {
      setError('请输入描述词！')
      return
    }

    setLoading(true)
    setError('')
    setImageUrl('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/api/generate-image`, {
        prompt
      })
      
      if (response.data.imageUrl) {
        setImageUrl(response.data.imageUrl)
      } else {
        setError('生成失败，请重试。')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || '无法连接到服务器')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Nano Banana 🍌</h1>
        <p>让 Gemini 为您绘制精彩图片</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述您想生成的图片 (例如: A futuristic city with flying bananas)"
            rows={4}
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? '正在生成...' : '立即生成'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="result-section">
          {loading ? (
            <div className="skeleton-loader"></div>
          ) : imageUrl ? (
            <div className="image-wrapper">
              <img src={imageUrl} alt={prompt} />
              <p className="image-caption">{prompt}</p>
            </div>
          ) : (
            <div className="placeholder">
              <p>在上方输入描述并点击生成，您的艺术品将出现在这里</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Nano Banana - Powered by Gemini</p>
      </footer>
    </div>
  )
}

export default App
