import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Table, message, Modal } from 'antd';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import { getAttemptsByExam } from '../../../apicalls/reports';

function AdminExamResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reportsData, setReportsData] = useState([]);
  const [examName, setExamName] = useState("");
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(null);

  const getResults = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAttemptsByExam({ examId: id });
      dispatch(HideLoading());
      if (response.success) {
        setReportsData(response.data);
        if (response.data.length > 0) {
          setExamName(response.data[0].exam.name);
        }
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalAppeared = reportsData.length;
  const totalPassed = reportsData.filter(r => r.result.verdict === 'Pass').length;
  const totalFailed = reportsData.filter(r => r.result.verdict === 'Fail').length;

  const downloadExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Total Marks,Obtained Marks,Verdict,Start Time,End Time,Tab Switches,Copy Paste Attempts\n";
    reportsData.forEach(r => {
        const row = [
            `"${r.user.name}"`,
            r.exam.totalMarks,
            r.result.correctAnswers.length,
            r.result.verdict,
            r.logs?.startTime ? `"${new Date(r.logs.startTime).toLocaleString()}"` : "N/A",
            r.logs?.endTime ? `"${new Date(r.logs.endTime).toLocaleString()}"` : "N/A",
            r.logs?.tabSwitchCount || 0,
            r.logs?.copyPasteCount || 0
        ];
        csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Exam_Results_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showLogs = (logs) => {
    setSelectedLogs(logs);
    setLogsModalVisible(true);
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'user',
      render: (text, record) => <span style={{ fontWeight: 600 }}>{record.user.name}</span>,
      sorter: (a, b) => a.user.name.localeCompare(b.user.name)
    },
    {
      title: 'Total Marks',
      render: (text, record) => record.exam.totalMarks
    },
    {
      title: 'Obtained Marks',
      render: (text, record) => record.result.correctAnswers.length
    },
    {
      title: 'Verdict',
      dataIndex: 'verdict',
      render: (text, record) => (
        <span className={`badge ${record.result.verdict === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
          {record.result.verdict}
        </span>
      )
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary-outlined-btn" onClick={() => showLogs(record.logs)} style={{ padding: '4px 12px', fontSize: 13 }}>
            <i className="ri-file-list-3-line"></i> Logs
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{examName ? `Results: ${examName}` : 'Exam Results'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Detailed report and student logs</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="primary-outlined-btn" onClick={() => navigate('/admin/exams')}>
             Back to Exams
          </button>
          <button className="primary-contained-btn" onClick={downloadExcel} disabled={reportsData.length === 0}>
            <i className="ri-download-line"></i> Download Excel
          </button>
        </div>
      </div>

      <div className="divider"></div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, marginTop: 24 }}>
          <div style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Appeared</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-light)' }}>{totalAppeared}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Passed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{totalPassed}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Failed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{totalFailed}</div>
          </div>
      </div>

      <Table columns={columns} dataSource={reportsData} rowKey="_id" />

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="ri-file-list-3-line" style={{ color: 'var(--primary)' }}></i> Student Activity Logs</div>}
        visible={logsModalVisible}
        onCancel={() => setLogsModalVisible(false)}
        footer={null}
        bodyStyle={{ padding: '24px' }}
      >
        {selectedLogs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
               <span style={{ color: 'var(--text-muted)' }}>Start Time</span>
               <span style={{ fontWeight: 600 }}>{selectedLogs.startTime ? new Date(selectedLogs.startTime).toLocaleString() : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
               <span style={{ color: 'var(--text-muted)' }}>End Time</span>
               <span style={{ fontWeight: 600 }}>{selectedLogs.endTime ? new Date(selectedLogs.endTime).toLocaleString() : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
               <span style={{ color: 'var(--text-muted)' }}>Tab Switches (Visibility)</span>
               <span style={{ fontWeight: 600, color: selectedLogs.tabSwitchCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{selectedLogs.tabSwitchCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
               <span style={{ color: 'var(--text-muted)' }}>Copy/Paste/Right-Click Attempts</span>
               <span style={{ fontWeight: 600, color: selectedLogs.copyPasteCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{selectedLogs.copyPasteCount || 0}</span>
            </div>
          </div>
        ) : (
          <p>No logs found for this attempt.</p>
        )}
      </Modal>
    </div>
  );
}

export default AdminExamResults;
