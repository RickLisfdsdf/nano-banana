import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [modelType, setModelType] = useState('mimo')
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const models = [
    { id: 'mimo', name: 'MiMo', color: '#ff9800' },
    { id: 'gemini', name: 'Gemini', color: '#4285f4' },
    { id: 'deepseek', name: 'DeepSeek', color: '#00a67e' },
    { id: 'none', name: '直接绘图', color: '#757575' }
  ]

  const handleGenerate = async () => {
    if (!prompt) {
      setError('请输入描述词！')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    setImageUrl('')
    setOptimizedPrompt('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/api/generate-image`, {
        prompt,
        modelType
      })
      
      if (response.data.imageUrl) {
        setImageUrl(response.data.imageUrl)
        setOptimizedPrompt(response.data.optimizedPrompt || '')
        setMessage(response.data.message || '')
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
        <h1>Nano Banana <span className="version-tag">V2.0</span> 🍌</h1>
        <p>选择您喜欢的 AI 助手为您绘图</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <div className="model-tabs">
            {models.map(m => (
              <button
                key={m.id}
                className={`tab-button ${modelType === m.id ? 'active' : ''}`}
                style={{ '--active-color': m.color } as any}
                onClick={() => setModelType(m.id)}
                disabled={loading}
              >
                {m.name}
              </button>
            ))}
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述您想生成的图片 (例如: A futuristic city with flying bananas)"
            rows={4}
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className={`generate-button ${loading ? 'loading' : ''}`}
          >
            {loading ? '正在处理...' : '立即生成'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && !error && <div className="info-message">{message}</div>}

        <div className="result-section">
          {loading ? (
            <div className="skeleton-loader">
              <div className="spinner"></div>
              <p>正在使用 {models.find(m => m.id === modelType)?.name} 优化并生成...</p>
            </div>
          ) : imageUrl ? (
            <div className="image-wrapper">
              <img src={imageUrl} alt={optimizedPrompt || prompt} />
              {optimizedPrompt && optimizedPrompt !== prompt && (
                <div className="optimized-prompt-box">
                  <strong>✨ {modelType.toUpperCase()} 优化后的描述词:</strong>
                  <p>{optimizedPrompt}</p>
                </div>
              )}
              <p className="image-caption">原始描述: {prompt}</p>
            </div>
          ) : (
            <div className="placeholder">
              <p>您的艺术品将出现在这里</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Nano Banana - 支持多模型切换</p>
      </footer>
    </div>
  )
}

export default App
