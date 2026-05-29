import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getExamById } from '../../../apicalls/exams'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { message } from 'antd'
import Instructions from './Instructions'
import { addReport } from '../../../apicalls/reports'

function WriteExam() {
  const [examData, setExamData] = useState()
  const [questions, setQuestions] = useState([])
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [visitedQuestions, setVisitedQuestions] = useState([0])
  const [reviewQuestions, setReviewQuestions] = useState([])
  const [result, setResult] = useState()
  const [violationCount, setViolationCount] = useState(0)
  const [copyPasteCount, setCopyPasteCount] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const { id } = useParams()
  const dispatch = useDispatch()
  const [view, setView] = useState("instructions")
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [timeUp, setTimeUp] = useState(false)
  const [intervalId, setIntervalId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const { user } = useSelector(state => state.users)
  const navigate = useNavigate();

  const startTimer = (initialSeconds, existingEndTime = null) => {
    let totalSeconds = initialSeconds;
    
    let endTime = existingEndTime;
    if (!existingEndTime) {
      endTime = Date.now() + initialSeconds * 1000;
      const initialStartTime = Date.now();
      setStartTime(initialStartTime);
      localStorage.setItem(`resume_exam_${user._id}_${id}`, JSON.stringify({
        endTime,
        selectedOptions,
        visitedQuestions,
        reviewQuestions,
        selectedQuestionIndex,
        violationCount: 0,
        copyPasteCount: 0,
        startTime: initialStartTime
      }));
    }

    const intId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds)
      } else {
        setTimeUp(true);
      }
    }, 1000);
    setIntervalId(intId)
  }

  const getExamDataById = async (id) => {
    try {
      dispatch(ShowLoading())
      const response = await getExamById(id)
      dispatch(HideLoading())
      if (response.success) {
        setExamData(response.data)
        setQuestions(response.data.questions)
        
        const existing = localStorage.getItem(`resume_exam_${user._id}_${id}`);
        if (existing) {
          const parsed = JSON.parse(existing);
          const remainingTime = Math.floor((parsed.endTime - Date.now()) / 1000);
          
          setSelectedOptions(parsed.selectedOptions || {});
          setVisitedQuestions(parsed.visitedQuestions || [0]);
          setReviewQuestions(parsed.reviewQuestions || []);
          setSelectedQuestionIndex(parsed.selectedQuestionIndex || 0);
          setViolationCount(parsed.violationCount || 0);
          setCopyPasteCount(parsed.copyPasteCount || 0);
          setStartTime(parsed.startTime || Date.now());

          if (remainingTime > 0) {
             setSecondsLeft(remainingTime);
             setResumeData({ remainingTime, endTime: parsed.endTime });
             setView("resume");
          } else {
             setSecondsLeft(0);
             setView("questions");
             setTimeUp(true);
          }
        } else {
          setSecondsLeft(response.data.duration * 60)
        }
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const calculateResult = async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        const isMulti = question.questionType === 'multi'
        const selected = selectedOptions[index]

        let isCorrect = false
        if (isMulti) {
          const userArr = Array.isArray(selected) ? [...selected].sort() : []
          const correctArr = [...(question.correctOptions || [])].sort()
          isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr)
        } else {
          isCorrect = question.correctOption === selected
        }

        if (isCorrect) {
          correctAnswers.push(question)
        } else {
          wrongAnswers.push(question)
        }
      })

      let verdict = "Pass";
      if (correctAnswers.length < examData.passingMarks) {
        verdict = "Fail";
      }

      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
        selectedOptions,
      }
      setResult(tempResult)

      const logs = {
        startTime: startTime,
        endTime: Date.now(),
        tabSwitchCount: violationCount,
        copyPasteCount: copyPasteCount
      };

      dispatch(ShowLoading())
      const response = await addReport({
        exam: id,
        result: tempResult,
        user: user._id,
        logs: logs
      })
      dispatch(HideLoading())
      if (response.success) {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
          if (document.exitFullscreen) document.exitFullscreen().catch(e => console.log(e));
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        }
        localStorage.removeItem(`resume_exam_${user._id}_${id}`);
        setView("result");
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  useEffect(() => {
    if (timeUp && view === "questions") {
      clearInterval(intervalId)
      calculateResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp])

  useEffect(() => {
    if (id) {
      getExamDataById(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!visitedQuestions.includes(selectedQuestionIndex)) {
      setVisitedQuestions([...visitedQuestions, selectedQuestionIndex]);
    }
  }, [selectedQuestionIndex, visitedQuestions])

  useEffect(() => {
    if (view === "questions" && !timeUp) {
      const existing = localStorage.getItem(`resume_exam_${user._id}_${id}`);
      if (existing) {
        const parsed = JSON.parse(existing);
        localStorage.setItem(`resume_exam_${user._id}_${id}`, JSON.stringify({
          ...parsed,
          selectedOptions,
          visitedQuestions,
          reviewQuestions,
          selectedQuestionIndex,
          violationCount,
          copyPasteCount,
          startTime
        }));
      }
    }
  }, [selectedOptions, visitedQuestions, reviewQuestions, selectedQuestionIndex, view, timeUp, violationCount, copyPasteCount, startTime])

  useEffect(() => {
    if (view === "questions" && !timeUp) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setViolationCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 4) {
              message.error("Exam auto-submitted due to multiple tab-switch violations.");
              setTimeUp(true);
            } else {
              message.warning(`Warning ${newCount}/3: Please do not switch tabs or leave the test. Exam will be auto-submitted after 3 warnings.`);
            }
            return newCount;
          });
        }
      };

      const preventDefaultAction = (e) => {
        e.preventDefault();
        message.warning("This action is disabled during the exam.");
        setCopyPasteCount(prev => prev + 1);
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener('copy', preventDefaultAction);
      document.addEventListener('cut', preventDefaultAction);
      document.addEventListener('paste', preventDefaultAction);
      document.addEventListener('contextmenu', preventDefaultAction);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener('copy', preventDefaultAction);
        document.removeEventListener('cut', preventDefaultAction);
        document.removeEventListener('paste', preventDefaultAction);
        document.removeEventListener('contextmenu', preventDefaultAction);
      };
    }
  }, [view, timeUp]);

  const toggleReview = () => {
    if (reviewQuestions.includes(selectedQuestionIndex)) {
      setReviewQuestions(reviewQuestions.filter(q => q !== selectedQuestionIndex))
    } else {
      setReviewQuestions([...reviewQuestions, selectedQuestionIndex])
    }
  }

  const clearResponse = () => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev }
      delete newOptions[selectedQuestionIndex]
      return newOptions
    })
  }

  const getQuestionStatus = (index) => {
    if (reviewQuestions.includes(index)) return 'review';
    
    const ans = selectedOptions[index];
    if (ans && (Array.isArray(ans) ? ans.length > 0 : true)) return 'attempted';

    if (visitedQuestions.includes(index)) return 'skipped';
    
    return 'unexplored';
  }

  const handleOptionSelect = (optionKey) => {
    const question = questions[selectedQuestionIndex]
    const isMulti = question.questionType === 'multi'

    setSelectedOptions(prev => {
      if (isMulti) {
        const currentSelected = Array.isArray(prev[selectedQuestionIndex]) ? prev[selectedQuestionIndex] : []
        const newSelected = currentSelected.includes(optionKey)
          ? currentSelected.filter(o => o !== optionKey)
          : [...currentSelected, optionKey]
        return { ...prev, [selectedQuestionIndex]: newSelected }
      } else {
        return { ...prev, [selectedQuestionIndex]: optionKey }
      }
    })
  }

  const isOptionSelected = (optionKey) => {
    const question = questions[selectedQuestionIndex]
    const selected = selectedOptions[selectedQuestionIndex]
    if (question.questionType === 'multi') {
      return Array.isArray(selected) && selected.includes(optionKey)
    }
    return selected === optionKey
  }

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    examData && (
      <div>
        {view === "instructions" && (
          <Instructions
            examData={examData}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {view === "resume" && (
          <div className="result" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
            <i className="ri-information-line" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 16, display: 'block' }}></i>
            <h1 className="page-title" style={{ marginBottom: 12 }}>Resume Exam</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
              You have an ongoing attempt for <strong>{examData.name}</strong>.<br/>
              Click the button below to re-enter full-screen mode and continue your exam.
            </p>
            <button 
              className="primary-contained-btn"
              onClick={() => {
                const el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
                
                startTimer(resumeData.remainingTime, resumeData.endTime);
                setView("questions");
              }}
              style={{ padding: '12px 24px', fontSize: 16 }}
            >
              <i className="ri-play-circle-line"></i> Resume Exam
            </button>
          </div>
        )}

        {view === "questions" && questions.length > 0 && (
          <div className="write-exam-layout">
            <div className="write-exam-main">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h1 className="page-title" style={{ fontSize: 20 }}>{examData.name}</h1>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Question {selectedQuestionIndex + 1} of {questions.length}
                </div>
              </div>
              <div className="timer" style={{
                background: secondsLeft < 60 ? 'var(--danger)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: secondsLeft < 60 ? '0 0 16px rgba(239,68,68,0.4)' : 'var(--shadow-sm)',
                height: 52, width: 90, borderRadius: 'var(--radius-sm)'
              }}>
                {formatTime(secondsLeft)}
              </div>
            </div>

            <div className="card-lg" style={{ padding: '32px 40px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
                  <span style={{ color: 'var(--primary-light)', marginRight: 8 }}>Q{selectedQuestionIndex + 1}.</span>
                  {questions[selectedQuestionIndex].name}
                </h2>
                {questions[selectedQuestionIndex].questionType === 'multi' && (
                  <span className="badge badge-warning" style={{ alignSelf: 'flex-start', flexShrink: 0, marginLeft: 16 }}>
                    Multi-correct
                  </span>
                )}
              </div>

              {questions[selectedQuestionIndex].image && (
                <div style={{ marginBottom: 24 }}>
                  <img
                    src={questions[selectedQuestionIndex].image}
                    alt="Question"
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                {Object.keys(questions[selectedQuestionIndex].options).map((optionKey) => {
                  const selected = isOptionSelected(optionKey)
                  const isMulti = questions[selectedQuestionIndex].questionType === 'multi'

                  return (
                    <div
                      key={optionKey}
                      className={selected ? "selected-option" : "option"}
                      onClick={() => handleOptionSelect(optionKey)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: isMulti ? 4 : '50%',
                        border: `2px solid ${selected ? 'var(--primary)' : 'var(--text-muted)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? 'var(--primary)' : 'transparent',
                        color: 'white', flexShrink: 0
                      }}>
                        {selected && <i className="ri-check-line" style={{ fontSize: 16 }}></i>}
                      </div>
                      <div style={{ fontSize: 15, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        <strong style={{ color: selected ? 'var(--primary-light)' : 'var(--text-primary)', marginRight: 6 }}>
                          {optionKey}.
                        </strong>
                        {questions[selectedQuestionIndex].options[optionKey]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="primary-outlined-btn"
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex - 1)}
                  disabled={selectedQuestionIndex === 0}
                  style={{ opacity: selectedQuestionIndex === 0 ? 0.5 : 1, cursor: selectedQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <i className="ri-arrow-left-line"></i> Previous
                </button>
                <button 
                  className="primary-outlined-btn" 
                  onClick={clearResponse}
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
                >
                  Clear Response
                </button>
                <button 
                  className="primary-outlined-btn" 
                  onClick={toggleReview}
                  style={{ 
                    color: reviewQuestions.includes(selectedQuestionIndex) ? 'var(--warning)' : 'var(--text-secondary)',
                    borderColor: reviewQuestions.includes(selectedQuestionIndex) ? 'var(--warning)' : 'var(--border)'
                  }}
                >
                  {reviewQuestions.includes(selectedQuestionIndex) ? <i className="ri-bookmark-fill"></i> : <i className="ri-bookmark-line"></i>}
                  {reviewQuestions.includes(selectedQuestionIndex) ? ' Marked for Review' : ' Mark for Review'}
                </button>
              </div>

              {selectedQuestionIndex < questions.length - 1 ? (
                <button
                  className="primary-contained-btn"
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex + 1)}
                >
                  Next <i className="ri-arrow-right-line"></i>
                </button>
              ) : (
                <button
                  className="success-btn"
                  onClick={() => {
                    clearInterval(intervalId)
                    setTimeUp(true)
                  }}
                >
                  <i className="ri-check-double-line"></i> Submit Exam
                </button>
              )}
            </div>
            </div>

            {/* Right Sidebar for Question Grid */}
            <div className="card-lg write-exam-sidebar" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                Questions Grid
              </h3>
              
              <div className="write-exam-question-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
                {questions.map((q, index) => {
                  const status = getQuestionStatus(index);
                  let bgColor = 'var(--bg-input)';
                  let color = 'var(--text-secondary)';
                  let borderColor = 'var(--border)';

                  if (status === 'attempted') {
                    bgColor = 'var(--success)';
                    color = 'white';
                    borderColor = 'var(--success)';
                  } else if (status === 'review') {
                    bgColor = 'var(--warning)';
                    color = 'white';
                    borderColor = 'var(--warning)';
                  } else if (status === 'skipped') {
                    bgColor = 'var(--bg-input)';
                    borderColor = 'var(--text-muted)';
                  }

                  const isActive = index === selectedQuestionIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedQuestionIndex(index)}
                      style={{
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 500,
                        background: bgColor,
                        color: color,
                        border: `1px solid ${borderColor}`,
                        boxShadow: isActive ? '0 0 0 2px var(--bg-default), 0 0 0 4px var(--primary)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--success)' }}></div>
                  <span>Attempted ({Object.keys(selectedOptions).filter(k => selectedOptions[k] && (!Array.isArray(selectedOptions[k]) || selectedOptions[k].length > 0)).length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--warning)' }}></div>
                  <span>Marked for Review ({reviewQuestions.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--text-muted)' }}></div>
                  <span>Skipped ({visitedQuestions.filter(q => !selectedOptions[q] || (Array.isArray(selectedOptions[q]) && selectedOptions[q].length === 0)).length - reviewQuestions.length})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--text-muted)' }}></div>
                  <span>Unexplored ({questions.length - visitedQuestions.length})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "result" && (
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="card-lg" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
              {/* Background glow based on verdict */}
              <div style={{
                position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
                width: 300, height: 300, borderRadius: '50%',
                background: result.verdict === 'Pass'
                  ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}></div>

              <div style={{
                width: 80, height: 80, margin: '0 auto 20px', borderRadius: '50%',
                background: result.verdict === 'Pass' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className={result.verdict === 'Pass' ? 'ri-trophy-line' : 'ri-emotion-sad-line'}
                  style={{ fontSize: 40, color: result.verdict === 'Pass' ? 'var(--success)' : 'var(--danger)' }}>
                </i>
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                {result.verdict === 'Pass' ? 'Congratulations!' : 'Better luck next time!'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 30 }}>
                You scored <strong style={{ color: 'var(--text-primary)' }}>{result.correctAnswers.length}</strong> out of <strong style={{ color: 'var(--text-primary)' }}>{examData.totalMarks}</strong>
              </p>

              <div style={{
                display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40,
                background: 'var(--bg-input)', padding: 24, borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Passing Marks</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{examData.passingMarks}</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Correct</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{result.correctAnswers.length}</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Wrong</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{result.wrongAnswers.length}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button className="primary-outlined-btn" onClick={() => navigate('/')}>
                  Go to Home
                </button>
                <button className="primary-contained-btn" onClick={() => setView("review")}>
                  <i className="ri-eye-line"></i> Review Answers
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "review" && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 className="page-title">Review Answers</h1>
              <button className="primary-outlined-btn" onClick={() => navigate('/')}>
                <i className="ri-home-line"></i> Back to Home
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questions.map((question, index) => {
                const isMulti = question.questionType === 'multi'
                const selected = selectedOptions[index]

                let isCorrect = false
                let userAnsStr = ''
                let correctAnsStr = ''

                if (isMulti) {
                  const userArr = Array.isArray(selected) ? [...selected].sort() : []
                  const correctArr = [...(question.correctOptions || [])].sort()
                  isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr)
                  userAnsStr = userArr.length > 0 ? userArr.join(', ') : 'None'
                  correctAnsStr = correctArr.join(', ')
                } else {
                  isCorrect = question.correctOption === selected
                  userAnsStr = selected || 'None'
                  correctAnsStr = question.correctOption || ''
                }

                return (
                  <div key={index} className="card" style={{ padding: 24, borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h2 style={{ fontSize: 16, color: 'var(--text-primary)', flex: 1 }}>
                        <span style={{ color: 'var(--primary-light)', marginRight: 8 }}>Q{index + 1}.</span>
                        {question.name}
                      </h2>
                      {isMulti && <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>Multi</span>}
                    </div>

                    {question.image && (
                      <img src={question.image} alt="Q" style={{ maxHeight: 150, borderRadius: 4, marginBottom: 16 }} />
                    )}

                    <div style={{
                      background: 'var(--bg-input)', padding: 16, borderRadius: 'var(--radius-sm)',
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <div style={{ fontSize: 14 }}>
                        <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Your Answer:</span>
                        <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                          {userAnsStr}
                        </strong>
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 120 }}>Correct Answer:</span>
                        <strong style={{ color: 'var(--success)' }}>
                          {correctAnsStr}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  )
}

export default WriteExam