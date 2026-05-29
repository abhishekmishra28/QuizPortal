import React from 'react'
import { useNavigate } from 'react-router-dom';

function Instructions(props) {
  const { examData, setView, startTimer } = props
  const navigate = useNavigate();

  const isExpired = examData.expiryDate && new Date(examData.expiryDate) < new Date();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card-lg" style={{ padding: '32px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, boxShadow: 'var(--shadow-glow)'
          }}>
            <i className="ri-file-list-3-line" style={{ fontSize: 24, color: 'white' }}></i>
          </div>
          <h1 className="page-title" style={{ fontSize: 24 }}>Exam Instructions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
            Please read the following instructions carefully before starting the exam.
          </p>
        </div>

        <div className="divider" style={{ margin: '20px 0' }}></div>

        {examData.description && (
          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 30 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ri-file-text-line" style={{ color: 'var(--primary-light)' }}></i>
              Exam Description
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              {examData.description}
            </p>
          </div>
        )}

        <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 30 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ri-information-line" style={{ color: 'var(--primary-light)' }}></i>
            General Rules
          </h2>
          <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <i className="ri-timer-line" style={{ color: 'var(--primary)', marginTop: 2 }}></i>
              <span>Exam must be completed in <strong style={{ color: 'var(--text-primary)' }}>{examData.duration} minutes</strong>. It will be submitted automatically when time is up.</span>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <i className="ri-checkbox-circle-line" style={{ color: 'var(--primary)', marginTop: 2 }}></i>
              <span>Once submitted, you cannot change your answers.</span>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <i className="ri-error-warning-line" style={{ color: 'var(--danger)', marginTop: 2 }}></i>
              <span>Do not refresh the page or navigate away. If you do, your exam will be terminated.</span>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <i className="ri-arrow-left-right-line" style={{ color: 'var(--primary)', marginTop: 2 }}></i>
              <span>Use the <strong style={{ color: 'var(--text-primary)' }}>Previous</strong> and <strong style={{ color: 'var(--text-primary)' }}>Next</strong> buttons to navigate between questions.</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <div style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Marks</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-light)' }}>{examData.totalMarks}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passing Marks</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{examData.passingMarks}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Questions</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>{examData.questions?.length || 0}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="primary-outlined-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button 
            className={isExpired ? "primary-outlined-btn" : "primary-contained-btn"} 
            onClick={() => {
              if (!isExpired) {
                const el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
                startTimer(examData.duration * 60);
                setView("questions");
              }
            }}
            disabled={isExpired}
            style={{ opacity: isExpired ? 0.6 : 1, cursor: isExpired ? 'not-allowed' : 'pointer' }}
          >
            {isExpired ? (
              <><i className="ri-close-circle-line"></i> Exam Expired</>
            ) : (
              <><i className="ri-play-circle-line"></i> Start Exam</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Instructions