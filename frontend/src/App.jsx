import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import AppRoutes from '@/routes/AppRoutes'

function App() {
  return (
    /**
     * reducedMotion="user" is the single global accessibility gate for Framer
     * Motion (PRD B12): when the OS requests reduced motion it strips transform
     * and layout animations across the whole tree while keeping opacity fades,
     * so nothing slides, scales or parallaxes. index.css carries the matching
     * CSS-side killswitch for keyframe/transition animations.
     */
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MotionConfig>
  )
}

export default App
