import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Clipboard, FileText, GraduationCap, LoaderCircle, MessageSquare, Pencil, Plus, Save, ShieldAlert, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { classroomService } from '../services/classroomService';
import { examService } from '../services/examService';
import TestManagementPage from './admin/TestManagementPage';

const statusLabels = { OWNED: 'Lớp của tôi', PENDING: 'Đang chờ duyệt', APPROVED: 'Đã tham gia', BLOCKED: 'Đã bị chặn', REMOVED: 'Đã rời lớp' };
const assignmentStatusLabels = { NOT_SUBMITTED: 'Chưa nộp', SUBMITTED: 'Đã nộp', LATE: 'Đã nộp trễ', GRADED: 'Đã nhận xét', MISSING: 'Quá hạn · chưa nộp' };
const getAssignmentStatusLabel = (status, late) => {
  if (status === 'GRADED') return late ? 'Đã nhận xét · nộp trễ' : 'Đã nhận xét';
  if (late || status === 'LATE') return 'Đã nộp trễ';
  return assignmentStatusLabels[status] || status || 'Chưa có trạng thái';
};
const formatVietnamDateTime = (value) => {
  if (!value) return '—';
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasZone ? value : `${value}+07:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
};
const vietnamDateTimeToLocalInput = (value) => {
  if (!value) return '';
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasZone ? value : `${value}+07:00`);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const localInputToVietnamDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
};
const getDeadlineHint = (value, now) => {
  if (!value) return '';
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const deadline = new Date(hasZone ? value : `${value}+07:00`).getTime();
  if (!Number.isFinite(deadline)) return '';
  const difference = deadline - now;
  if (difference < 0) return 'Đã quá hạn';
  if (difference < 24 * 60 * 60 * 1000) return `Còn ${Math.max(1, Math.ceil(difference / (60 * 60 * 1000)))} giờ`;
  return `Còn ${Math.ceil(difference / (24 * 60 * 60 * 1000))} ngày`;
};
const nextRequestVersion = (versions, key) => {
  versions.current[key] = (versions.current[key] || 0) + 1;
  return versions.current[key];
};
const isCurrentRequest = (versions, key, version) => versions.current[key] === version;

const ClassroomsPage = () => {
  const { isTeacher } = useAuth();
  const requestVersions = useRef({});
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [membersState, setMembersState] = useState({ key: '', items: [], error: '' });
  const [materialsState, setMaterialsState] = useState({ key: '', items: [], error: '' });
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [downloadingMaterialId, setDownloadingMaterialId] = useState('');
  const materialFileInputRef = useRef(null);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [editingClassroom, setEditingClassroom] = useState(false);
  const [classEditForm, setClassEditForm] = useState({ className: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [assignmentsState, setAssignmentsState] = useState({ key: '', items: [], error: '' });
  const [assignmentRetry, setAssignmentRetry] = useState(0);
  const [assignmentTests, setAssignmentTests] = useState([]);
  const [classroomTests, setClassroomTests] = useState([]);
  const [studioOpen, setStudioOpen] = useState(false);
  const [editingClassroomTest, setEditingClassroomTest] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [submissionRetry, setSubmissionRetry] = useState(0);
  const [submissionState, setSubmissionState] = useState({ key: '', data: null, error: '' });
  const [submissionSort, setSubmissionSort] = useState({ sortBy: 'name', direction: 'ASC' });
  const [editingAssignmentId, setEditingAssignmentId] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [assignmentForm, setAssignmentForm] = useState({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' });
  const [clockNow, setClockNow] = useState(() => Date.now());
  const membersRequestKey = `${selectedClass?.id || ''}/${filterStatus}/${isTeacher}`;
  const members = isTeacher && membersState.key === membersRequestKey ? membersState.items : [];
  const membersLoading = isTeacher && Boolean(selectedClass?.id) && membersState.key !== membersRequestKey;
  const membersError = membersState.key === membersRequestKey ? membersState.error : '';
  const canViewMaterials = Boolean(selectedClass && (isTeacher || selectedClass.status === 'APPROVED'));
  const materialsRequestKey = `${selectedClass?.id || ''}/${canViewMaterials}`;
  const materials = canViewMaterials && materialsState.key === materialsRequestKey ? materialsState.items : [];
  const materialsLoading = canViewMaterials && Boolean(selectedClass?.id) && materialsState.key !== materialsRequestKey;
  const materialsError = materialsState.key === materialsRequestKey ? materialsState.error : '';
  const canViewAssignments = Boolean(selectedClass && (isTeacher || selectedClass.status === 'APPROVED'));
  const assignmentsRequestKey = `${selectedClass?.id || ''}/${canViewAssignments}/${assignmentRetry}`;
  const assignments = canViewAssignments && assignmentsState.key === assignmentsRequestKey ? assignmentsState.items : [];
  const assignmentsLoading = canViewAssignments && Boolean(selectedClass?.id) && assignmentsState.key !== assignmentsRequestKey;
  const assignmentsError = assignmentsState.key === assignmentsRequestKey ? assignmentsState.error : '';
  const submissionsRequestKey = `${selectedAssignmentId}/${submissionSort.sortBy}/${submissionSort.direction}/${submissionRetry}`;
  const submissionsLoading = isTeacher && Boolean(selectedAssignmentId) && submissionState.key !== submissionsRequestKey;
  const submissionsError = submissionState.key === submissionsRequestKey ? submissionState.error : '';
  const submissionData = submissionState.key === submissionsRequestKey ? submissionState.data : null;
  const submissions = submissionData?.submissions || [];
  const assignmentSummary = submissionData?.summary || null;

  const loadClassrooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await classroomService.getMine();
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được danh sách lớp.');
      const list = response.data || [];
      setClassrooms(list);
      setSelectedClass((current) => list.find((item) => item.id === current?.id) || list[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được danh sách lớp.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async (classroomId, status) => {
    const version = nextRequestVersion(requestVersions, 'members');
    if (!classroomId || !isTeacher) return;
    const requestKey = `${classroomId}/${status}/${isTeacher}`;
    try {
      const response = await classroomService.getMembers(classroomId, status);
      if (!isCurrentRequest(requestVersions, 'members', version)) return;
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được danh sách học sinh.');
      setMembersState({ key: requestKey, items: response.data || [], error: '' });
    } catch (err) {
      if (isCurrentRequest(requestVersions, 'members', version)) {
        const message = err.response?.data?.message || err.message || 'Không tải được danh sách học sinh.';
        setMembersState({ key: requestKey, items: [], error: message });
        setError(message);
      }
    }
  }, [isTeacher]);

  const loadMaterials = useCallback(async (classroomId, canView) => {
    const version = nextRequestVersion(requestVersions, 'materials');
    if (!classroomId || !canView) return;
    const requestKey = `${classroomId}/${canView}`;
    try {
      const response = await classroomService.getMaterials(classroomId);
      if (!isCurrentRequest(requestVersions, 'materials', version)) return;
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được tài liệu lớp.');
      setMaterialsState({ key: requestKey, items: response.data || [], error: '' });
    } catch (err) {
      if (isCurrentRequest(requestVersions, 'materials', version)) {
        const message = err.response?.data?.message || err.message || 'Không tải được tài liệu lớp.';
        setMaterialsState({ key: requestKey, items: [], error: message });
        setError(message);
      }
    }
  }, []);

  const loadAssignments = useCallback(async (classroomId) => {
    const version = nextRequestVersion(requestVersions, 'assignments');
    if (!classroomId) return;
    const requestKey = `${classroomId}/${isTeacher || selectedClass?.status === 'APPROVED'}/${assignmentRetry}`;
    try {
      const response = await classroomService.getAssignments(classroomId);
      if (!isCurrentRequest(requestVersions, 'assignments', version)) return;
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được bài tập.');
      const list = response.data || [];
      setAssignmentsState({ key: requestKey, items: list, error: '' });
      setSelectedAssignmentId((current) => list.find((item) => item.id === current)?.id || '');
    } catch (err) {
      if (isCurrentRequest(requestVersions, 'assignments', version)) {
        const message = err.response?.data?.message || err.message || 'Không tải được bài tập.';
        setAssignmentsState({ key: requestKey, items: [], error: message });
        setError(message);
      }
    }
  }, [assignmentRetry, isTeacher, selectedClass?.status]);

  const loadSubmissions = useCallback(async (assignmentId, sortBy, direction) => {
    const version = nextRequestVersion(requestVersions, 'submissions');
    if (!assignmentId || !isTeacher) return;
    const requestKey = `${assignmentId}/${sortBy}/${direction}/${submissionRetry}`;
    try {
      const [submissionsResponse, summaryResponse] = await Promise.all([
        classroomService.getAssignmentSubmissions(assignmentId, sortBy, direction),
        classroomService.getAssignmentSummary(assignmentId),
      ]);
      if (!isCurrentRequest(requestVersions, 'submissions', version)) return;
      if (submissionsResponse.code !== 1000) throw new Error(submissionsResponse.message || 'Không tải được danh sách nộp bài.');
      if (summaryResponse.code !== 1000) throw new Error(summaryResponse.message || 'Không tải được thống kê bài tập.');
      setSubmissionState({
        key: requestKey,
        data: { submissions: submissionsResponse.data || [], summary: summaryResponse.data || null },
        error: '',
      });
    } catch (err) {
      if (!isCurrentRequest(requestVersions, 'submissions', version)) return;
      const message = err.response?.data?.message || err.message || 'Không tải được danh sách nộp bài.';
      setSubmissionState({ key: requestKey, data: null, error: message });
      setError(message);
    }
  }, [isTeacher, submissionRetry]);

  useEffect(() => { loadClassrooms(); }, [loadClassrooms]);
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { loadMembers(selectedClass?.id, filterStatus); }, [filterStatus, loadMembers, selectedClass?.id]);
  useEffect(() => {
    loadMaterials(selectedClass?.id, isTeacher || selectedClass?.status === 'APPROVED');
  }, [isTeacher, loadMaterials, selectedClass?.id, selectedClass?.status]);
  useEffect(() => {
    if (selectedClass?.id && (isTeacher || selectedClass.status === 'APPROVED')) loadAssignments(selectedClass.id);
    else setSelectedAssignmentId('');
  }, [isTeacher, loadAssignments, selectedClass?.id, selectedClass?.status]);
  useEffect(() => { loadSubmissions(selectedAssignmentId, submissionSort.sortBy, submissionSort.direction); }, [loadSubmissions, selectedAssignmentId, submissionSort]);
  const loadAssignableTests = useCallback(async (classroomId) => {
    const version = nextRequestVersion(requestVersions, 'assignableTests');
    if (!isTeacher || !classroomId) { setAssignmentTests([]); return; }
    try {
      const response = await classroomService.getAssignableTests(classroomId);
      if (!isCurrentRequest(requestVersions, 'assignableTests', version)) return;
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được danh sách đề giao bài.');
      setAssignmentTests(response.data?.content || []);
    } catch (err) {
      if (!isCurrentRequest(requestVersions, 'assignableTests', version)) return;
      setAssignmentTests([]);
      setError(err.response?.data?.message || err.message || 'Không tải được danh sách đề giao bài.');
    }
  }, [isTeacher]);

  const loadClassroomTests = useCallback(async (classroomId) => {
    const version = nextRequestVersion(requestVersions, 'classroomTests');
    if (!isTeacher || !classroomId) { setClassroomTests([]); return; }
    try {
      const response = await examService.getClassroomTests(classroomId, 1, 100);
      if (!isCurrentRequest(requestVersions, 'classroomTests', version)) return;
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được đề riêng của lớp.');
      setClassroomTests(response.data?.content || []);
    } catch (err) {
      if (!isCurrentRequest(requestVersions, 'classroomTests', version)) return;
      setClassroomTests([]);
      setError(err.response?.data?.message || err.message || 'Không tải được đề riêng của lớp.');
    }
  }, [isTeacher]);

  useEffect(() => {
    if (isTeacher && selectedClass?.id) {
      loadAssignableTests(selectedClass.id);
      loadClassroomTests(selectedClass.id);
    } else {
      setAssignmentTests([]);
      setClassroomTests([]);
    }
  }, [isTeacher, loadAssignableTests, loadClassroomTests, selectedClass?.id]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await classroomService.create(className, classDescription);
      if (response.code !== 1000) throw new Error(response.message || 'Không tạo được lớp.');
      setClassName(''); setClassDescription(''); setNotice('Đã tạo lớp. Gửi mã tham gia cho học sinh của bạn.');
      await loadClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tạo được lớp.');
    } finally { setBusy(false); }
  };

  const beginEditClassroom = () => {
    if (!selectedClass || !isTeacher) return;
    setClassEditForm({ className: selectedClass.className || '', description: selectedClass.description || '' });
    setEditingClassroom(true);
  };

  const saveClassroomDetails = async (event) => {
    event.preventDefault();
    if (!selectedClass?.id || !isTeacher) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await classroomService.update(selectedClass.id, classEditForm.className, classEditForm.description);
      if (response.code !== 1000) throw new Error(response.message || 'Không cập nhật được thông tin lớp.');
      const updatedClass = response.data;
      setSelectedClass(updatedClass);
      setClassrooms((items) => items.map((item) => item.id === updatedClass.id ? updatedClass : item));
      setEditingClassroom(false);
      setNotice('Đã cập nhật thông tin lớp.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không cập nhật được thông tin lớp.');
    } finally { setBusy(false); }
  };

  const handleSelectClassroom = (classroom) => {
    if (classroom.id === selectedClass?.id) return;
    const hasAssignmentDraft = Boolean(editingAssignmentId || assignmentForm.title.trim()
      || assignmentForm.instructions.trim() || assignmentForm.testId || assignmentForm.deadline);
    if ((editingClassroom || hasAssignmentDraft)
      && !window.confirm('Đổi lớp sẽ bỏ các thay đổi chưa lưu. Bạn có muốn tiếp tục không?')) return;

    setEditingClassroom(false);
    setClassEditForm({ className: '', description: '' });
    setEditingAssignmentId('');
    setAssignmentForm({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' });
    setSelectedAssignmentId('');
    setFeedbackDrafts({});
    setMaterialTitle('');
    setMaterialFile(null);
    if (materialFileInputRef.current) materialFileInputRef.current.value = '';
    setSelectedClass(classroom);
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await classroomService.join(joinCode.trim().toUpperCase());
      if (response.code !== 1000) throw new Error(response.message || 'Không gửi được yêu cầu tham gia.');
      setJoinCode(''); setNotice('Yêu cầu đã gửi. Bạn sẽ thấy lớp sau khi giáo viên xử lý.');
      await loadClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không gửi được yêu cầu tham gia.');
    } finally { setBusy(false); }
  };

  const handleMemberStatus = async (member, status) => {
    setBusy(true); setError('');
    try {
      const response = await classroomService.changeMemberStatus(selectedClass.id, member.id, status);
      if (response.code !== 1000) throw new Error(response.message || 'Không cập nhật được thành viên.');
      await loadMembers(selectedClass.id, filterStatus);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không cập nhật được thành viên.');
    } finally { setBusy(false); }
  };

  const handleUploadMaterial = async (event) => {
    event.preventDefault();
    if (!selectedClass || !materialFile) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await classroomService.uploadMaterial(selectedClass.id, materialTitle, materialFile);
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được tài liệu lên.');
      setMaterialTitle(''); setMaterialFile(null);
      if (materialFileInputRef.current) materialFileInputRef.current.value = '';
      setNotice('Đã tải tài liệu PDF riêng tư lên lớp.');
      await loadMaterials(selectedClass.id, true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được tài liệu lên.');
    } finally { setBusy(false); }
  };

  const handleDownloadMaterial = async (material) => {
    if (!selectedClass || !material.downloadable) return;
    setDownloadingMaterialId(material.id); setError('');
    try {
      const response = await classroomService.getMaterialDownloadLink(selectedClass.id, material.id);
      if (response.code !== 1000 || !response.data?.url) throw new Error(response.message || 'Không tạo được link tải.');
      window.location.assign(response.data.url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được tài liệu.');
    } finally { setDownloadingMaterialId(''); }
  };

  const handleHideMaterial = async (material) => {
    if (!selectedClass || !window.confirm(`Ẩn tài liệu “${material.title}” khỏi lớp?`)) return;
    setBusy(true); setError('');
    try {
      const response = await classroomService.hideMaterial(selectedClass.id, material.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không ẩn được tài liệu.');
      setNotice('Đã ẩn tài liệu khỏi lớp.');
      await loadMaterials(selectedClass.id, true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không ẩn được tài liệu.');
    } finally { setBusy(false); }
  };

  const handleSaveAssignment = async (event) => {
    event.preventDefault();
    if (!selectedClass || !assignmentForm.testId || !assignmentForm.deadline) return;
    setBusy(true); setError(''); setNotice('');
    const payload = {
      ...assignmentForm,
      deadline: localInputToVietnamDateTime(assignmentForm.deadline),
    };
    try {
      const response = editingAssignmentId
        ? await classroomService.updateAssignment(editingAssignmentId, payload)
        : await classroomService.createAssignment(selectedClass.id, payload);
      if (response.code !== 1000) throw new Error(response.message || 'Không lưu được bài tập.');
      setNotice(editingAssignmentId ? 'Đã cập nhật bài tập và hạn nộp.' : 'Đã giao bài tập cho lớp.');
      setEditingAssignmentId('');
      setAssignmentForm({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' });
      await loadAssignments(selectedClass.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không lưu được bài tập.');
    } finally { setBusy(false); }
  };

  const refreshClassTests = async () => {
    if (!selectedClass?.id) return;
    await Promise.all([loadClassroomTests(selectedClass.id), loadAssignableTests(selectedClass.id)]);
  };

  if (studioOpen && selectedClass && isTeacher) {
    return (
      <div className="min-h-screen bg-[#f5f0df] px-3 py-5 sm:px-6">
        <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-3 border-2 border-black bg-white p-3 shadow-[4px_4px_0_#111]">
          <div><p className="text-xs font-black uppercase tracking-widest">Studio đề riêng</p><p className="font-black">{selectedClass.className}</p></div>
          <button type="button" onClick={async () => { setStudioOpen(false); setEditingClassroomTest(null); await refreshClassTests(); }} className="border-2 border-black bg-yellow-300 px-4 py-2 text-sm font-black">Đóng studio</button>
        </div>
        <TestManagementPage classroomScope={selectedClass.id} initialTest={editingClassroomTest} />
      </div>
    );
  }

  const editAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm({
      title: assignment.title || '',
      instructions: assignment.instructions || '',
      testId: assignment.testId || '',
      deadline: vietnamDateTimeToLocalInput(assignment.deadline),
      latePolicy: assignment.latePolicy || '',
    });
  };

  const archiveAssignment = async (assignment) => {
    setBusy(true); setError('');
    try {
      const response = await classroomService.archiveAssignment(assignment.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không ẩn được bài tập.');
      setNotice('Đã ẩn bài tập; dữ liệu các lượt nộp được giữ lại.');
      await loadAssignments(selectedClass.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không ẩn được bài tập.');
    } finally { setBusy(false); }
  };

  const saveFeedback = async (submission) => {
    if (!submission.resultId) return;
    const comment = feedbackDrafts[submission.resultId] ?? submission.teacherComment ?? '';
    setBusy(true); setError('');
    try {
      const response = await classroomService.addAssignmentFeedback(submission.resultId, comment);
      if (response.code !== 1000) throw new Error(response.message || 'Không lưu được nhận xét.');
      setNotice('Đã lưu nhận xét và tạo thông báo cho học sinh.');
      await loadSubmissions(selectedAssignmentId, submissionSort.sortBy, submissionSort.direction);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không lưu được nhận xét.');
    } finally { setBusy(false); }
  };

  const copyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); setNotice('Đã sao chép mã lớp.'); }
    catch { setNotice(`Mã lớp: ${code}`); }
  };

  const rotateJoinCode = async () => {
    if (!selectedClass?.id || !isTeacher || !window.confirm('Đổi mã tham gia? Mã hiện tại sẽ ngừng hoạt động; học sinh đã tham gia và yêu cầu đang chờ vẫn được giữ nguyên.')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.rotateJoinCode(selectedClass.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không đổi được mã tham gia.');
      const updatedClass = response.data;
      setSelectedClass(updatedClass);
      setClassrooms((items) => items.map((item) => item.id === updatedClass.id ? updatedClass : item));
      setNotice('Đã đổi mã tham gia. Mã cũ không còn hiệu lực.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không đổi được mã tham gia.');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[70vh] bg-[#fffdf5] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-2 border-black bg-[#FFE600] p-6 shadow-[6px_6px_0_#111] sm:p-8">
          <div className="flex items-center gap-3"><GraduationCap size={30} /><span className="text-xs font-black uppercase tracking-[0.2em]">Không gian lớp học</span></div>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Lớp học của bạn</h1>
          <p className="mt-2 max-w-2xl font-medium">Tạo lớp, chia sẻ mã tham gia và quản lý các yêu cầu của học sinh.</p>
        </header>

        {(error || notice) && <div role={error ? 'alert' : 'status'} className={`mb-5 border-2 border-black p-4 font-bold ${error ? 'bg-rose-200' : 'bg-sky-100'}`}>{error || notice}</div>}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-5">
            <form onSubmit={isTeacher ? handleCreate : handleJoin} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black">{isTeacher ? <><Plus size={20} /> Tạo lớp mới</> : <><UserPlus size={20} /> Tham gia lớp</>}</h2>
              {isTeacher ? (
                <>
                  <label htmlFor="class-name" className="mb-2 block text-sm font-bold">Tên lớp</label>
                  <input id="class-name" maxLength={120} required value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Ví dụ: TOEIC mục tiêu 650" className="w-full border-2 border-black px-3 py-3 outline-none focus:bg-yellow-50" />
                  <label htmlFor="class-description" className="mb-2 mt-3 block text-sm font-bold">Mô tả lớp <span className="font-medium">(không bắt buộc)</span></label>
                  <textarea id="class-description" rows={3} maxLength={2000} value={classDescription} onChange={(event) => setClassDescription(event.target.value)} placeholder="Mục tiêu, lịch học hoặc thông tin dành cho học sinh" className="w-full border-2 border-black px-3 py-2 outline-none focus:bg-yellow-50" />
                </>
              ) : (
                <>
                  <label htmlFor="class-code" className="mb-2 block text-sm font-bold">Mã tham gia 8 ký tự</label>
                  <input id="class-code" required minLength={8} maxLength={8} value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="Nhập mã do giáo viên cung cấp" className="w-full border-2 border-black px-3 py-3 font-mono uppercase tracking-widest outline-none focus:bg-yellow-50" />
                </>
              )}
              <button disabled={busy} className="mt-4 inline-flex items-center gap-2 border-2 border-black bg-black px-4 py-2.5 font-black text-white disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={17} /> : null}{isTeacher ? 'Tạo lớp' : 'Gửi yêu cầu'}</button>
            </form>

            <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black"><BookOpen size={19} /> Danh sách lớp</h2>
              {loading ? <p className="text-sm font-semibold">Đang tải lớp học…</p> : classrooms.length === 0 ? <p className="border-2 border-dashed border-slate-400 p-4 text-sm font-semibold">Chưa có lớp học nào. {isTeacher ? 'Tạo lớp đầu tiên ở phía trên.' : 'Nhập mã lớp để gửi yêu cầu tham gia.'}</p> : (
                <div className="space-y-3">
                  {classrooms.map((classroom) => (
                    <button key={classroom.id} type="button" onClick={() => handleSelectClassroom(classroom)} className={`block w-full border-2 border-black p-4 text-left transition ${selectedClass?.id === classroom.id ? 'bg-[#FFE600] shadow-[3px_3px_0_#111]' : 'bg-white hover:bg-yellow-50'}`}>
                      <span className="block font-black">{classroom.className}</span>
                      <span className="mt-1 block text-xs font-bold uppercase tracking-wide">{isTeacher ? `Mã: ${classroom.classCode}` : (statusLabels[classroom.status] || classroom.status)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="min-h-72 border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111] sm:p-6">
            {selectedClass ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-black pb-4">
                  <div><p className="text-xs font-black uppercase tracking-widest text-slate-600">{isTeacher ? 'Quản lý lớp' : 'Thông tin lớp'}</p><h2 className="mt-1 text-2xl font-black">{selectedClass.className}</h2><p className="mt-1 text-sm font-semibold">Giáo viên: {selectedClass.teacherName}</p>{selectedClass.description && <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm">{selectedClass.description}</p>}</div>
                  {isTeacher && <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={beginEditClassroom} className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-black shadow-[2px_2px_0_#111] disabled:opacity-50"><Pencil size={15} /> Sửa thông tin</button><button type="button" disabled={busy} onClick={() => copyCode(selectedClass.classCode)} className="inline-flex items-center gap-2 border-2 border-black bg-yellow-200 px-3 py-2 text-sm font-black disabled:opacity-50"><Clipboard size={16} /> {selectedClass.classCode}</button><button type="button" disabled={busy} onClick={rotateJoinCode} className="border-2 border-black bg-white px-3 py-2 text-sm font-black shadow-[2px_2px_0_#111] disabled:opacity-50">Đổi mã tham gia</button></div>}
                </div>
                {isTeacher && editingClassroom && <form onSubmit={saveClassroomDetails} className="mt-4 grid gap-3 border-2 border-black bg-[#fffdf2] p-4 sm:grid-cols-2">
                  <label htmlFor="class-edit-name" className="text-sm font-black">Tên lớp<input id="class-edit-name" required maxLength={120} value={classEditForm.className} onChange={(event) => setClassEditForm((form) => ({ ...form, className: event.target.value }))} className="mt-1 block min-h-11 w-full border-2 border-black bg-white px-3 py-2 font-medium" /></label>
                  <label htmlFor="class-edit-description" className="text-sm font-black sm:col-span-2">Mô tả lớp<textarea id="class-edit-description" rows={3} maxLength={2000} value={classEditForm.description} onChange={(event) => setClassEditForm((form) => ({ ...form, description: event.target.value }))} className="mt-1 block w-full border-2 border-black bg-white px-3 py-2 font-medium" /></label>
                  <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={busy} className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 font-black disabled:opacity-50"><Save size={16} /> Lưu thông tin</button><button type="button" disabled={busy} onClick={() => setEditingClassroom(false)} className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black disabled:opacity-50"><X size={16} /> Hủy</button></div>
                </form>}
                {(isTeacher || selectedClass.status === 'APPROVED') && <section className="mt-5 border-2 border-black bg-[#fffdf2] p-4 shadow-[3px_3px_0_#111] sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h3 className="flex items-center gap-2 font-black"><FileText size={18} /> Tài liệu lớp</h3><p className="mt-1 text-xs font-semibold">PDF tối đa 10 MiB. Link tải được cấp sau khi kiểm tra quyền và hết hạn sau 5 phút.</p></div>
                    <span className="border-2 border-black bg-white px-2 py-1 text-[11px] font-black uppercase">{materials.length} tài liệu</span>
                  </div>
                  {isTeacher && <form onSubmit={handleUploadMaterial} className="mt-4 grid gap-3 border-2 border-black bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <label className="block text-xs font-black">Tên tài liệu<input required maxLength={120} value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Ví dụ: Tài liệu ôn Part 5" className="mt-1 block min-h-11 w-full border-2 border-black bg-white px-3 py-2 text-sm font-medium" /></label>
                    <label className="block text-xs font-black">Tệp PDF<input ref={materialFileInputRef} required type="file" accept=".pdf,application/pdf" onChange={(event) => setMaterialFile(event.target.files?.[0] || null)} className="mt-1 block min-h-11 w-full border-2 border-black bg-white px-2 py-2 text-xs font-semibold file:mr-2 file:border-0 file:bg-yellow-300 file:px-2 file:py-1 file:font-black" /></label>
                    <button type="submit" disabled={busy || !materialFile} className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111] disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Plus size={16} />} Tải lên</button>
                  </form>}
                  <div className="mt-4 space-y-2">
                    {materialsLoading ? <p role="status" className="border-2 border-black bg-white p-3 text-sm font-semibold">Đang tải tài liệu…</p>
                      : materialsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-3 text-sm font-bold"><span>{materialsError}</span><button type="button" onClick={() => loadMaterials(selectedClass.id, true)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div>
                        : materials.length === 0 ? <p className="border-2 border-dashed border-black bg-white p-3 text-sm font-semibold">Chưa có tài liệu trong lớp.</p> : materials.map((material) => (
                      <article key={material.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white p-3">
                        <div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-black bg-yellow-200"><FileText size={18} /></span><div className="min-w-0"><p className="break-words font-black">{material.title}</p><p className="mt-1 break-all text-xs font-medium text-slate-700">{material.originalFileName || 'Tài liệu PDF'} · {material.sizeBytes ? `${(material.sizeBytes / (1024 * 1024)).toFixed(1)} MiB` : 'Dung lượng cũ chưa có'} · {material.createdAt ? new Date(material.createdAt).toLocaleDateString('vi-VN') : ''}</p>{!material.downloadable && <p className="mt-1 text-xs font-bold text-rose-800">Tệp cũ chưa có link tải riêng; giáo viên cần tải lại.</p>}</div></div>
                        <div className="flex gap-2">{material.downloadable && <button type="button" disabled={downloadingMaterialId === material.id} onClick={() => handleDownloadMaterial(material)} className="inline-flex min-h-10 items-center gap-2 border-2 border-black bg-[#FFE600] px-3 py-2 text-xs font-black disabled:opacity-50">{downloadingMaterialId === material.id ? <LoaderCircle className="animate-spin" size={14} /> : <FileText size={14} />} Tải PDF</button>}{isTeacher && <button type="button" disabled={busy} onClick={() => handleHideMaterial(material)} className="min-h-10 border-2 border-black bg-rose-200 px-3 py-2 text-xs font-black disabled:opacity-50">Ẩn</button>}</div>
                      </article>
                    ))}
                  </div>
                </section>}
                {isTeacher ? (
                  <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-black"><Users size={18} /> Học sinh</h3><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="border-2 border-black bg-white px-3 py-2 text-sm font-bold"><option value="PENDING">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="BLOCKED">Đã chặn</option><option value="REMOVED">Đã gỡ</option></select></div>
                    <div className="mt-4 space-y-3">
                      {membersLoading ? <p role="status" className="border-2 border-black bg-white p-4 text-sm font-semibold">Đang tải danh sách học sinh…</p>
                        : membersError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-4 text-sm font-bold"><span>{membersError}</span><button type="button" onClick={() => loadMembers(selectedClass.id, filterStatus)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div>
                          : members.length === 0 ? <p className="border-2 border-dashed border-slate-400 p-4 text-sm font-semibold">Không có học sinh trong trạng thái này.</p> : members.map((member) => (
                        <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-black p-4">
                          <div><p className="font-black">{member.studentName}</p><p className="text-sm font-medium text-slate-600">{member.studentEmail}</p></div>
                          <div className="flex flex-wrap gap-2">
                            {member.status === 'PENDING' && <><button disabled={busy} onClick={() => handleMemberStatus(member, 'APPROVED')} className="inline-flex items-center gap-1 border-2 border-black bg-lime-300 px-3 py-1.5 text-xs font-black"><Check size={14} /> Duyệt</button><button disabled={busy} onClick={() => handleMemberStatus(member, 'REMOVED')} className="inline-flex items-center gap-1 border-2 border-black bg-rose-200 px-3 py-1.5 text-xs font-black"><X size={14} /> Từ chối</button></>}
                            {member.status === 'APPROVED' && <><button disabled={busy} onClick={() => handleMemberStatus(member, 'BLOCKED')} className="inline-flex items-center gap-1 border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black"><ShieldAlert size={14} /> Chặn</button><button disabled={busy} onClick={() => handleMemberStatus(member, 'REMOVED')} className="border-2 border-black bg-rose-200 px-3 py-1.5 text-xs font-black">Gỡ</button></>}
                            {member.status === 'BLOCKED' && <button disabled={busy} onClick={() => handleMemberStatus(member, 'APPROVED')} className="inline-flex items-center gap-1 border-2 border-black bg-lime-300 px-3 py-1.5 text-xs font-black"><Check size={14} /> Mở chặn</button>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 border-t-2 border-black pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><h3 className="flex items-center gap-2 text-lg font-black"><BookOpen size={19} /> Đề riêng của lớp</h3><p className="mt-1 text-xs font-semibold">Chỉ giáo viên lớp này và học sinh đã duyệt mới có quyền mở đề.</p></div>
                        <button type="button" onClick={() => { setEditingClassroomTest(null); setStudioOpen(true); }} className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111]"><Plus size={16} /> Soạn đề riêng</button>
                      </div>
                      <div className="mt-3 space-y-2">
                        {classroomTests.length === 0 ? <p className="border-2 border-dashed border-slate-400 bg-white p-3 text-sm font-semibold">Lớp chưa có đề riêng.</p> : classroomTests.map((test) => <article key={test.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white p-3"><div><p className="font-black">{test.titleTest}</p><p className="text-xs font-bold">{test.status === 'PUBLISHED' ? 'Đã phát hành trong lớp' : 'Bản nháp'}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditingClassroomTest(test); setStudioOpen(true); }} className="border-2 border-black bg-sky-200 px-3 py-1.5 text-xs font-black">Sửa đề</button><button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { const response = await examService.publishClassroomTest(selectedClass.id, test.id); if (response.code !== 1000) throw new Error(response.message || 'Không phát hành được đề.'); setNotice('Đã phát hành đề cho học sinh trong lớp.'); await refreshClassTests(); } catch (err) { setError(err.response?.data?.message || err.message || 'Không phát hành được đề.'); } finally { setBusy(false); } }} className="border-2 border-black bg-yellow-200 px-3 py-1.5 text-xs font-black disabled:opacity-50">{test.status === 'PUBLISHED' ? 'Đã phát hành' : 'Phát hành'}</button><button type="button" disabled={busy} onClick={async () => { if (!window.confirm(`Xóa đề “${test.titleTest}” khỏi lớp?`)) return; setBusy(true); setError(''); try { const response = await examService.deleteClassroomTest(selectedClass.id, test.id); if (response.code !== 1000) throw new Error(response.message || 'Không xóa được đề.'); setNotice('Đã xóa đề riêng của lớp.'); await refreshClassTests(); } catch (err) { setError(err.response?.data?.message || err.message || 'Đề đã giao hoặc đã có kết quả; dữ liệu được giữ nguyên.'); } finally { setBusy(false); } }} className="border-2 border-black bg-rose-200 px-3 py-1.5 text-xs font-black disabled:opacity-50">Xóa</button></div></article>)}
                      </div>
                    </div>
                    <div className="mt-8 border-t-2 border-black pt-5">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-black"><FileText size={19} /> Bài tập</h3>
                      <form onSubmit={handleSaveAssignment} className="space-y-3 border-2 border-black bg-[#fff9d6] p-4">
                        <p className="font-black">{editingAssignmentId ? 'Sửa bài tập / gia hạn' : 'Giao đề hệ thống cho lớp'}</p>
                        <input required maxLength={255} value={assignmentForm.title} onChange={(event) => setAssignmentForm((form) => ({ ...form, title: event.target.value }))} placeholder="Tên bài tập" className="w-full border-2 border-black bg-white px-3 py-2" />
                        <select required value={assignmentForm.testId} onChange={(event) => setAssignmentForm((form) => ({ ...form, testId: event.target.value }))} className="w-full border-2 border-black bg-white px-3 py-2">
                          <option value="">Chọn đề đã phát hành cho lớp</option>
                          <optgroup label="Đề chung của hệ thống">
                            {assignmentTests.filter((test) => !test.classroomId).map((test) => <option key={test.id} value={test.id}>{test.titleTest}</option>)}
                          </optgroup>
                          <optgroup label="Đề riêng của lớp">
                            {assignmentTests.filter((test) => test.classroomId === selectedClass?.id).map((test) => <option key={test.id} value={test.id}>{test.titleTest}</option>)}
                          </optgroup>
                        </select>
                        <textarea maxLength={5000} rows={2} value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((form) => ({ ...form, instructions: event.target.value }))} placeholder="Hướng dẫn (không bắt buộc)" className="w-full border-2 border-black bg-white px-3 py-2" />
                        <label className="block text-sm font-bold">Hạn nộp (giờ Việt Nam, Asia/Ho_Chi_Minh)<input required type="datetime-local" value={assignmentForm.deadline} onChange={(event) => setAssignmentForm((form) => ({ ...form, deadline: event.target.value }))} className="mt-1 block w-full border-2 border-black bg-white px-3 py-2" /><span className="mt-1 block text-xs font-semibold">Thời điểm hiển thị cho học sinh theo giờ Việt Nam, không theo múi giờ thiết bị.</span></label>
                        <label className="block text-sm font-bold">Chính sách nộp trễ<select required value={assignmentForm.latePolicy} onChange={(event) => setAssignmentForm((form) => ({ ...form, latePolicy: event.target.value }))} className="mt-1 block w-full border-2 border-black bg-white px-3 py-2"><option value="">Chọn chính sách nộp trễ</option><option value="REJECT_AFTER_DEADLINE">Hết hạn thì từ chối bài nộp</option><option value="ACCEPT_AND_MARK_LATE">Vẫn nhận và đánh dấu nộp trễ</option></select></label>
                        <div className="flex gap-2"><button disabled={busy || assignmentTests.length === 0 || !assignmentForm.latePolicy} className="border-2 border-black bg-black px-4 py-2 font-black text-white disabled:opacity-50">{busy ? 'Đang lưu…' : editingAssignmentId ? 'Lưu thay đổi' : 'Giao bài tập'}</button>{editingAssignmentId && <button type="button" onClick={() => { setEditingAssignmentId(''); setAssignmentForm({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' }); }} className="border-2 border-black bg-white px-4 py-2 font-black">Hủy sửa</button>}</div>
                      </form>
                      <div className="mt-4 space-y-3">
                        {assignmentsLoading ? <p role="status" className="border-2 border-black bg-white p-3 text-sm font-semibold">Đang tải bài tập…</p>
                          : assignmentsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-3 text-sm font-bold"><span>{assignmentsError}</span><button type="button" onClick={() => setAssignmentRetry((retry) => retry + 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div>
                            : assignments.length === 0 ? <p className="border-2 border-dashed border-slate-400 p-3 text-sm font-semibold">Lớp chưa có bài tập đang mở.</p> : assignments.map((assignment) => (
                          <div key={assignment.id} className={`border-2 border-black p-4 ${selectedAssignmentId === assignment.id ? 'bg-[#fff4a3] shadow-[3px_3px_0_#111]' : 'bg-white'}`}>
                            <button type="button" onClick={() => setSelectedAssignmentId(assignment.id)} className="w-full text-left"><span className="block font-black">{assignment.title}</span><span className="mt-1 block text-xs font-semibold">{assignment.testTitle} · Hạn: {formatVietnamDateTime(assignment.deadline)}</span></button>
                            <div className="mt-3 flex gap-2"><button type="button" onClick={() => editAssignment(assignment)} className="border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black">Sửa / gia hạn</button><button type="button" disabled={busy} onClick={() => archiveAssignment(assignment)} className="inline-flex items-center gap-1 border-2 border-black bg-rose-200 px-3 py-1 text-xs font-black"><Trash2 size={13} /> Ẩn bài</button></div>
                          </div>
                        ))}
                      </div>
                      {selectedAssignmentId && (
                        <div className="mt-6 border-t-2 border-black pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-black">Bài nộp mới nhất mỗi học sinh</h4><select aria-label="Sắp xếp danh sách bài nộp" value={`${submissionSort.sortBy}:${submissionSort.direction}`} onChange={(event) => { const [sortBy, direction] = event.target.value.split(':'); setSubmissionSort({ sortBy, direction }); }} className="border-2 border-black bg-white px-2 py-1 text-xs font-bold"><option value="name:ASC">Tên A–Z</option><option value="name:DESC">Tên Z–A</option><option value="score:DESC">Điểm cao đến thấp</option><option value="score:ASC">Điểm thấp đến cao</option></select></div>
                          {!submissionsLoading && !submissionsError && assignmentSummary && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">{[["Đủ điều kiện", assignmentSummary.eligibleStudents], ["Đã nộp", assignmentSummary.submittedCount], ["Nộp trễ", assignmentSummary.lateCount], ["Chưa nộp", assignmentSummary.notSubmittedCount], ["Quá hạn", assignmentSummary.missingCount], ["Đã nhận xét", assignmentSummary.reviewedCount], ["Điểm TB đã nhận xét", assignmentSummary.averageScore == null ? '—' : Number(assignmentSummary.averageScore).toFixed(1)]].map(([label, value]) => <div key={label} className="border-2 border-black bg-white p-2"><span className="block text-[10px] font-black uppercase">{label}</span><span className="text-lg font-black">{value}</span>{label === 'Điểm TB đã nhận xét' && <span className="block text-[10px] font-semibold">{assignmentSummary.averageScoreSubmissionCount} bài, không gồm bài trễ chưa nhận xét</span>}</div>)}</div>}
                          <div className="mt-3 space-y-3">
                            {submissionsLoading ? <p role="status" className="border-2 border-black bg-white p-4 text-sm font-semibold">Đang tải bài nộp…</p>
                              : submissionsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-4 text-sm font-bold"><span>{submissionsError}</span><button type="button" onClick={() => setSubmissionRetry((retry) => retry + 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div>
                                : submissions.length === 0 ? <p className="border-2 border-dashed border-black bg-white p-4 text-sm font-semibold">Chưa có học sinh đủ điều kiện trong danh sách này.</p> : submissions.map((submission) => (
                              <div key={submission.studentId} className="border-2 border-black p-3">
                                <div className="flex flex-wrap justify-between gap-2"><div><p className="font-black">{submission.studentName}</p><p className="text-xs text-slate-600">{submission.studentEmail}</p></div><span className={`h-fit border border-black px-2 py-1 text-xs font-black ${submission.late || submission.status === 'LATE' ? 'bg-amber-200' : submission.status === 'MISSING' ? 'bg-rose-200' : 'bg-lime-200'}`}>{getAssignmentStatusLabel(submission.status, submission.late)}</span></div>
                                {submission.resultId ? <><p className="mt-2 text-sm font-bold">Điểm: {submission.score} · {submission.correctCount}/{submission.totalCount} câu · {submission.submittedAt ? formatVietnamDateTime(submission.submittedAt) : ''}</p><Link to={`/results/${submission.resultId}?classroomReview=1`} className="mt-2 inline-block text-sm font-black underline">Mở bài làm</Link><label className="mt-3 block text-xs font-black uppercase">Nhận xét<textarea rows={2} maxLength={5000} value={feedbackDrafts[submission.resultId] ?? submission.teacherComment ?? ''} onChange={(event) => setFeedbackDrafts((drafts) => ({ ...drafts, [submission.resultId]: event.target.value }))} className="mt-1 w-full border-2 border-black px-2 py-2 text-sm font-normal normal-case" /></label><button disabled={busy || !(feedbackDrafts[submission.resultId] ?? submission.teacherComment ?? '').trim()} onClick={() => saveFeedback(submission)} className="mt-2 inline-flex items-center gap-1 border-2 border-black bg-[#FFE600] px-3 py-1.5 text-xs font-black"><MessageSquare size={13} /> Lưu nhận xét</button></> : <p className="mt-2 text-sm font-semibold">Học sinh chưa nộp.</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-5 border-2 border-black bg-sky-100 p-4 font-bold">Trạng thái: {statusLabels[selectedClass.status] || selectedClass.status}. Giáo viên cần duyệt yêu cầu trước khi bạn truy cập nội dung lớp.</p>
                    {selectedClass.status === 'APPROVED' && <div className="mt-6"><h3 className="mb-3 flex items-center gap-2 text-lg font-black"><FileText size={19} /> Bài tập được giao</h3>{assignmentsLoading ? <p role="status" className="border-2 border-black bg-white p-4 text-sm font-semibold">Đang tải bài tập…</p> : assignmentsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-4 text-sm font-bold"><span>{assignmentsError}</span><button type="button" onClick={() => setAssignmentRetry((retry) => retry + 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div> : assignments.length === 0 ? <p className="border-2 border-dashed border-slate-400 p-4 text-sm font-semibold">Chưa có bài tập.</p> : <div className="space-y-3">{assignments.map((assignment) => { const status = assignment.mySubmissionStatus; const deadlineExpired = getDeadlineHint(assignment.deadline, clockNow) === 'Đã quá hạn'; const displayStatus = status === 'NOT_SUBMITTED' && deadlineExpired ? 'MISSING' : status; const canSubmit = !(assignment.latePolicy === 'REJECT_AFTER_DEADLINE' && deadlineExpired); return <article key={assignment.id} className="border-2 border-black bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><h4 className="font-black">{assignment.title}</h4><span className={`border border-black px-2 py-1 text-xs font-black ${assignment.myLatestSubmissionLate || displayStatus === 'LATE' ? 'bg-amber-200' : displayStatus === 'MISSING' ? 'bg-rose-200' : displayStatus === 'GRADED' ? 'bg-lime-200' : 'bg-[#fffdf2]'}`}>{getAssignmentStatusLabel(displayStatus, assignment.myLatestSubmissionLate)}</span></div><p className="mt-1 text-sm font-semibold">{assignment.testTitle}</p><p className="text-sm font-semibold">Hạn nộp: {formatVietnamDateTime(assignment.deadline)}</p>{['NOT_SUBMITTED', 'MISSING'].includes(status) && <p className="mt-1 text-xs font-black">{getDeadlineHint(assignment.deadline, clockNow)}</p>}{assignment.instructions && <p className="mt-2 whitespace-pre-wrap text-sm">{assignment.instructions}</p>}{assignment.myLatestResultId && <Link to={`/results/${assignment.myLatestResultId}`} className="mt-2 inline-block text-sm font-black underline">Xem bài đã nộp{assignment.myLatestSubmissionLate ? ' (trễ)' : ''}</Link>}{canSubmit && <Link to={`/courses/${assignment.testId}/take?assignmentId=${assignment.id}`} className="mt-3 inline-flex border-2 border-black bg-[#FFE600] px-4 py-2 text-sm font-black">{assignment.myLatestResultId ? 'Làm lại bài' : 'Bắt đầu làm'}</Link>}</article>; })}</div>}</div>}
                  </>
                )}
              </>
            ) : <div className="flex h-full min-h-60 flex-col items-center justify-center text-center"><BookOpen size={38} /><p className="mt-3 font-black">Chọn một lớp để xem chi tiết</p></div>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClassroomsPage;
