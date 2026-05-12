import { useState } from 'react'
import posthog from 'posthog-js'
import './ExperimentNotice.css'

const STORAGE_KEY = 'pato_v2_experiment_ack'

export default function ExperimentNotice() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  if (!visible) return null

  const handleStart = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    posthog.capture('experiment_session_start')
    setVisible(false)
  }

  return (
    <div className="exp-overlay">
      <div className="exp-dialog">
        <div className="exp-badge">NGHIÊN CỨU</div>
        <h2 className="exp-heading">Đây là website thử nghiệm</h2>
        <p className="exp-body">
          Trang web này được xây dựng phục vụ mục đích nghiên cứu hành vi người
          dùng. Mọi thông tin và chức năng chỉ mang tính thử nghiệm, không phải
          website chính thức của PATO.
        </p>
        <button className="exp-btn" onClick={handleStart}>
          Tôi đã hiểu — Bắt đầu trải nghiệm
        </button>
      </div>
    </div>
  )
}
