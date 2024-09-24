import './index.css'
import React, { useEffect, useRef, useState } from 'react'
import { Box } from 'face-api.js'
import * as faceapi from 'face-api.js'

function App() {
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const MODEL_URL = '/models'
    Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL), faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)]).then(() => {
      setModelsLoaded(true)
    })
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string)
        }
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleImageLoad = async () => {
    if (!modelsLoaded) {
      console.warn('Models not loaded yet')
      return
    }

    if (imageRef.current) {
      try {
        const detections = await faceapi.detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
        setBoxes(detections.map((detection) => detection.relativeBox))
      } catch (err) {
        console.error('Error during face detection:', err)
        setError('Error during face detection. Please check the console for more details.')
      }
    }
  }

  return (
    <div>
      <h2>Face Detection on Image</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {imageUrl && modelsLoaded ? (
        <div style={{ position: 'relative' }}>
          <figure style={{ maxWidth: '700px', position: 'relative' }}>
            <img ref={imageRef} src={imageUrl} alt="Uploaded" onLoad={handleImageLoad} style={{ width: '100%', height: 'auto' }} />
            {boxes.map((box, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  border: '2px solid #00ff00',
                  left: `${(box.left * 100).toFixed(2)}%`,
                  top: `${(box.top * 100).toFixed(2)}%`,
                  width: `${(box.width * 100).toFixed(2)}%`,
                  height: `${(box.height * 100).toFixed(2)}%`,
                }}
              />
            ))}
          </figure>
        </div>
      ) : (
        <p>Loading models...</p>
      )}
    </div>
  )
}

export default App
