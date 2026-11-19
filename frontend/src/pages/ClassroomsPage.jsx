import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clipboard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  LoaderCircle,
  Mail,
  Maximize2,
  Megaphone,
  Menu,
  MessageSquare,
  MoreVertical,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Settings,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { classroomService } from '../services/classroomService';
import { examService } from '../services/examService';
import TestManagementPage from './admin/TestManagementPage';
import nunaLaptopImg from '../assets/img/mascot/toby_using_laptop.png';
import nunaBookImg from '../assets/img/mascot/toby_studying_book.png';
import presetStudyDeskImg from '../assets/img/home/lambai.jpg';
import presetLibraryImg from '../assets/img/courses/thuvien.jpg';
import presetAutumnImg from '../assets/img/classrooms/muaThu.jpg';
import presetCampusImg from '../assets/img/contact/hoitruongrua.jpg';

const statusLabels = {
  OWNED: 'Lớp của tôi',
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã tham gia',
  BLOCKED: 'Đã bị chặn',
  REMOVED: 'Đã rời lớp',
};

const assignmentStatusLabels = {
  NOT_SUBMITTED: 'Chưa nộp',
  SUBMITTED: 'Đã nộp',
  LATE: 'Đã nộp trễ',
  GRADED: 'Đã nhận xét',
  MISSING: 'Quá hạn · chưa nộp',
};

const BANNER_THEMES = [
  {
    id: 'blue',
    name: 'Xanh dương nhẹ',
    swatchBg: '#D2E3FC',
    swatchBorder: '#1967D2',
    checkColor: '#1967D2',
    bgClass: 'bg-gradient-to-r from-[#1967D2] via-[#1A73E8] to-[#4285F4]',
    cardHeaderClass: 'bg-gradient-to-r from-[#1967D2] to-[#1A73E8]',
    accentColor: '#1967D2',
  },
  {
    id: 'green',
    name: 'Xanh lá',
    swatchBg: '#CEEAD6',
    swatchBorder: '#1E8E3E',
    checkColor: '#1E8E3E',
    bgClass: 'bg-gradient-to-r from-[#137333] via-[#1E8E3E] to-[#34A853]',
    cardHeaderClass: 'bg-gradient-to-r from-[#137333] to-[#1E8E3E]',
    accentColor: '#1E8E3E',
  },
  {
    id: 'pink',
    name: 'Hồng phấn',
    swatchBg: '#FDCFE8',
    swatchBorder: '#E52592',
    checkColor: '#B80672',
    bgClass: 'bg-gradient-to-r from-[#B80672] via-[#E52592] to-[#F439A0]',
    cardHeaderClass: 'bg-gradient-to-r from-[#B80672] to-[#E52592]',
    accentColor: '#B80672',
  },
  {
    id: 'orange',
    name: 'Cam ấm',
    swatchBg: '#FEDFC8',
    swatchBorder: '#E8710A',
    checkColor: '#C26401',
    bgClass: 'bg-gradient-to-r from-[#B06000] via-[#E8710A] to-[#FA903E]',
    cardHeaderClass: 'bg-gradient-to-r from-[#B06000] to-[#E8710A]',
    accentColor: '#C26401',
  },
  {
    id: 'cyan',
    name: 'Xanh ngọc',
    swatchBg: '#CBF0F8',
    swatchBorder: '#129EAF',
    checkColor: '#007B83',
    bgClass: 'bg-gradient-to-r from-[#007B83] via-[#129EAF] to-[#24C1E0]',
    cardHeaderClass: 'bg-gradient-to-r from-[#007B83] to-[#129EAF]',
    accentColor: '#007B83',
  },
  {
    id: 'purple',
    name: 'Tím học thuật',
    swatchBg: '#E9D2FD',
    swatchBorder: '#8430CE',
    checkColor: '#7627BB',
    bgClass: 'bg-gradient-to-r from-[#681DA8] via-[#8430CE] to-[#A142F4]',
    cardHeaderClass: 'bg-gradient-to-r from-[#681DA8] to-[#8430CE]',
    accentColor: '#7627BB',
  },
  {
    id: 'royal',
    name: 'Xanh dương đậm',
    swatchBg: '#DBEAFE',
    swatchBorder: '#1D4ED8',
    checkColor: '#1D4ED8',
    bgClass: 'bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB]',
    cardHeaderClass: 'bg-gradient-to-r from-[#1E3A8A] to-[#1D4ED8]',
    accentColor: '#1D4ED8',
  },
  {
    id: 'slate',
    name: 'Xám Slate (Mặc định)',
    swatchBg: '#E2E8F0',
    swatchBorder: '#475569',
    checkColor: '#334155',
    bgClass: 'bg-gradient-to-r from-[#37474F] via-[#455A64] to-[#546E7A]',
    cardHeaderClass: 'bg-gradient-to-r from-[#37474F] to-[#455A64]',
    accentColor: '#1D4ED8',
  },
];

const BANNER_PRESETS = [
  { id: '', label: 'Minh họa mặc định', image: null },
  { id: 'preset:study-desk', label: 'Góc ôn luyện TOEIC', image: presetStudyDeskImg },
  { id: 'preset:library', label: 'Thư viện học thuật', image: presetLibraryImg },
  { id: 'preset:autumn', label: 'Không gian mùa thu', image: presetAutumnImg },
  { id: 'preset:campus', label: 'Hội trường Đại học', image: presetCampusImg },
];

const resolveBannerImageSrc = (bannerUrl) => {
  if (!bannerUrl) return '';
  if (bannerUrl.startsWith('preset:')) {
    return BANNER_PRESETS.find((item) => item.id === bannerUrl)?.image || '';
  }
  return bannerUrl;
};

const findBannerTheme = (themeColor, fallbackId = 'slate') =>
  BANNER_THEMES.find((theme) => theme.id === themeColor) ||
  BANNER_THEMES.find((theme) => theme.id === fallbackId) ||
  BANNER_THEMES[BANNER_THEMES.length - 1];

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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
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

const getStoredAnnouncements = (classroomId) => {
  if (!classroomId) return [];
  try {
    const raw = window.localStorage.getItem(`toeic_classroom_stream_${classroomId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveStoredAnnouncements = (classroomId, items) => {
  if (!classroomId) return;
  try {
    window.localStorage.setItem(`toeic_classroom_stream_${classroomId}`, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
};

const getStoredThemeId = (classroomId) => {
  if (!classroomId) return 'slate';
  try {
    return window.localStorage.getItem(`toeic_classroom_theme_${classroomId}`) || 'slate';
  } catch {
    return 'slate';
  }
};

const ClassroomsPage = () => {
  const { user, isTeacher } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestVersions = useRef({});
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [viewMode, setViewMode] = useState('CLASS_DETAIL'); // 'ALL_CLASSES' | 'CLASS_DETAIL'
  const [activeTab, setActiveTab] = useState('STREAM'); // 'STREAM' | 'CLASSWORK' | 'PEOPLE' | 'GRADES'
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);

  // Modals & UI panels
  const [createOrJoinModalOpen, setCreateOrJoinModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmailInput, setInviteEmailInput] = useState('');
  const [inviteEmailChips, setInviteEmailChips] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [fullscreenCodeOpen, setFullscreenCodeOpen] = useState(false);
  const [codeMenuOpen, setCodeMenuOpen] = useState(false);
  const [classInfoExpanded, setClassInfoExpanded] = useState(false);
  const [customizeBannerOpen, setCustomizeBannerOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState('slate');
  const [draftThemeColor, setDraftThemeColor] = useState('slate');
  const [draftBannerUrl, setDraftBannerUrl] = useState('');
  const [presetPickerOpen, setPresetPickerOpen] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [editInfoExpanded, setEditInfoExpanded] = useState(false);
  const bannerFileInputRef = useRef(null);

  // Stream announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [notifyStudentsOnPost, setNotifyStudentsOnPost] = useState(true);
  const [streamFilter, setStreamFilter] = useState('ALL'); // 'ALL' | 'ANNOUNCEMENTS' | 'CLASSWORK'

  // Classwork filters & collapsible forms
  const [classworkTopic, setClassworkTopic] = useState('ALL'); // 'ALL' | 'ASSIGNMENTS' | 'MATERIALS' | 'TESTS'
  const [showAssignmentFormModal, setShowAssignmentFormModal] = useState(false);
  const [showMaterialUploadForm, setShowMaterialUploadForm] = useState(false);

  // Members state
  const [membersState, setMembersState] = useState({ key: '', items: [], error: '' });
  const [filterStatus, setFilterStatus] = useState('APPROVED');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Materials state
  const [materialsState, setMaterialsState] = useState({ key: '', items: [], error: '' });
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [downloadingMaterialId, setDownloadingMaterialId] = useState('');
  const [previewModal, setPreviewModal] = useState({
    open: false,
    loading: false,
    material: null,
    blobUrl: '',
    googleViewerUrl: '',
    mode: 'DIRECT',
    error: '',
  });
  const materialFileInputRef = useRef(null);

  // Create / Edit / Join Classroom state
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [editingClassroom, setEditingClassroom] = useState(false);
  const [classEditForm, setClassEditForm] = useState({ className: '', description: '' });
  const [joinCode, setJoinCode] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Assignments & Submissions state
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
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    instructions: '',
    testId: '',
    deadline: '',
    latePolicy: '',
  });
  const [clockNow, setClockNow] = useState(() => Date.now());

  const membersRequestKey = `${selectedClass?.id || ''}/${filterStatus}/${isTeacher}`;
  const members = useMemo(
    () => (isTeacher && membersState.key === membersRequestKey ? membersState.items : []),
    [isTeacher, membersRequestKey, membersState.items, membersState.key]
  );
  const membersLoading = isTeacher && Boolean(selectedClass?.id) && membersState.key !== membersRequestKey;
  const membersError = membersState.key === membersRequestKey ? membersState.error : '';

  const canViewMaterials = Boolean(selectedClass && (isTeacher || selectedClass.status === 'APPROVED'));
  const materialsRequestKey = `${selectedClass?.id || ''}/${canViewMaterials}`;
  const materials = useMemo(
    () => (canViewMaterials && materialsState.key === materialsRequestKey ? materialsState.items : []),
    [canViewMaterials, materialsRequestKey, materialsState.items, materialsState.key]
  );
  const materialsLoading = canViewMaterials && Boolean(selectedClass?.id) && materialsState.key !== materialsRequestKey;
  const materialsError = materialsState.key === materialsRequestKey ? materialsState.error : '';

  const canViewAssignments = Boolean(selectedClass && (isTeacher || selectedClass.status === 'APPROVED'));
  const assignmentsRequestKey = `${selectedClass?.id || ''}/${canViewAssignments}/${assignmentRetry}`;
  const assignments = useMemo(
    () => (canViewAssignments && assignmentsState.key === assignmentsRequestKey ? assignmentsState.items : []),
    [ assignmentsRequestKey, assignmentsState.items, assignmentsState.key, canViewAssignments]
  );
  const assignmentsLoading = canViewAssignments && Boolean(selectedClass?.id) && assignmentsState.key !== assignmentsRequestKey;
  const assignmentsError = assignmentsState.key === assignmentsRequestKey ? assignmentsState.error : '';

  const submissionsRequestKey = `${selectedAssignmentId}/${submissionSort.sortBy}/${submissionSort.direction}/${submissionRetry}`;
  const submissionsLoading = isTeacher && Boolean(selectedAssignmentId) && submissionState.key !== submissionsRequestKey;
  const submissionsError = submissionState.key === submissionsRequestKey ? submissionState.error : '';
  const submissionData = submissionState.key === submissionsRequestKey ? submissionState.data : null;
  const submissions = submissionData?.submissions || [];
  const assignmentSummary = submissionData?.summary || null;

  const activeTheme = useMemo(
    () => findBannerTheme(selectedClass?.themeColor || selectedThemeId, 'slate'),
    [selectedClass?.themeColor, selectedThemeId]
  );

  const activeBannerSrc = useMemo(
    () => resolveBannerImageSrc(selectedClass?.bannerUrl || ''),
    [selectedClass?.bannerUrl]
  );

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
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được danh sách học viên.');
      setMembersState({ key: requestKey, items: response.data || [], error: '' });
    } catch (err) {
      if (isCurrentRequest(requestVersions, 'members', version)) {
        const message = err.response?.data?.message || err.message || 'Không tải được danh sách học viên.';
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
      setSelectedAssignmentId((current) => list.find((item) => item.id === current)?.id || (list[0]?.id ?? ''));
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

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  useEffect(() => {
    const codeFromUrl = (searchParams.get('joinCode') || '').trim().toUpperCase();
    if (codeFromUrl && !isTeacher) {
      setJoinCode(codeFromUrl.slice(0, 8));
      setCreateOrJoinModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('joinCode');
      setSearchParams(nextParams, { replace: true });
    }
  }, [isTeacher, searchParams, setSearchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedClass?.id) {
      setAnnouncements(getStoredAnnouncements(selectedClass.id));
      setSelectedThemeId(getStoredThemeId(selectedClass.id));
      if (isTeacher && selectedClass.pendingMemberCount > 0) {
        setFilterStatus('PENDING');
      } else {
        setFilterStatus('APPROVED');
      }
    } else {
      setAnnouncements([]);
    }
  }, [isTeacher, selectedClass?.id, selectedClass?.pendingMemberCount]);

  useEffect(() => {
    loadMembers(selectedClass?.id, filterStatus);
  }, [filterStatus, loadMembers, selectedClass?.id]);

  useEffect(() => {
    loadMaterials(selectedClass?.id, isTeacher || selectedClass?.status === 'APPROVED');
  }, [isTeacher, loadMaterials, selectedClass?.id, selectedClass?.status]);

  useEffect(() => {
    if (selectedClass?.id && (isTeacher || selectedClass.status === 'APPROVED')) {
      loadAssignments(selectedClass.id);
    } else {
      setSelectedAssignmentId('');
    }
  }, [isTeacher, loadAssignments, selectedClass?.id, selectedClass?.status]);

  useEffect(() => {
    loadSubmissions(selectedAssignmentId, submissionSort.sortBy, submissionSort.direction);
  }, [loadSubmissions, selectedAssignmentId, submissionSort]);

  const loadAssignableTests = useCallback(async (classroomId) => {
    const version = nextRequestVersion(requestVersions, 'assignableTests');
    if (!isTeacher || !classroomId) {
      setAssignmentTests([]);
      return;
    }
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
    if (!isTeacher || !classroomId) {
      setClassroomTests([]);
      return;
    }
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

  // Upcoming assignments within next 7 days (or not yet expired)
  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        if (!item.deadline) return false;
        const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(item.deadline);
        const deadlineMs = new Date(hasZone ? item.deadline : `${item.deadline}+07:00`).getTime();
        return Number.isFinite(deadlineMs) && deadlineMs >= clockNow;
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [assignments, clockNow]);

  // Unified Stream Feed combining Announcements + Assignments + Materials
  const unifiedStreamItems = useMemo(() => {
    const annItems = announcements.map((ann) => ({
      id: `ann-${ann.id}`,
      rawId: ann.id,
      type: 'ANNOUNCEMENT',
      title: ann.title || 'Thông báo lớp học',
      content: ann.content,
      authorName: ann.authorName || selectedClass?.teacherName || 'Giáo viên',
      createdAt: ann.createdAt,
      pinned: Boolean(ann.pinned),
    }));

    const assignItems = assignments.map((assign) => ({
      id: `assign-${assign.id}`,
      rawId: assign.id,
      type: 'ASSIGNMENT',
      title: `${selectedClass?.teacherName || 'Giáo viên'} đã đăng một bài tập mới: ${assign.title}`,
      subtitle: `${assign.testTitle} · Hạn nộp: ${formatVietnamDateTime(assign.deadline)}`,
      createdAt: assign.createdAt || assign.deadline,
      assignment: assign,
      pinned: false,
    }));

    const matItems = materials.map((mat) => ({
      id: `mat-${mat.id}`,
      rawId: mat.id,
      type: 'MATERIAL',
      title: `${selectedClass?.teacherName || 'Giáo viên'} đã đăng một tài liệu mới: ${mat.title}`,
      subtitle: `${mat.originalFileName || 'Tài liệu PDF'} ${mat.sizeBytes ? `· ${(mat.sizeBytes / (1024 * 1024)).toFixed(1)} MiB` : ''}`,
      createdAt: mat.createdAt,
      material: mat,
      pinned: false,
    }));

    let combined = [...annItems, ...assignItems, ...matItems];
    if (streamFilter === 'ANNOUNCEMENTS') {
      combined = annItems;
    } else if (streamFilter === 'CLASSWORK') {
      combined = [...assignItems, ...matItems];
    }

    return combined.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [announcements, assignments, materials, selectedClass?.teacherName, streamFilter]);

  const filteredMembers = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.studentName || '').toLowerCase().includes(q) ||
        (m.studentEmail || '').toLowerCase().includes(q)
    );
  }, [memberSearchQuery, members]);

  // Student personal grade summary
  const studentGradeSummary = useMemo(() => {
    if (isTeacher || assignments.length === 0) return { total: 0, submitted: 0, avgScore: null };
    const submittedList = assignments.filter((a) => a.myLatestResultId != null);
    const scoredList = submittedList.filter((a) => typeof a.myLatestScore === 'number');
    const avgScore =
      scoredList.length > 0
        ? (scoredList.reduce((acc, item) => acc + Number(item.myLatestScore || 0), 0) / scoredList.length).toFixed(1)
        : null;
    return {
      total: assignments.length,
      submitted: submittedList.length,
      avgScore,
    };
  }, [assignments, isTeacher]);

  const openCustomizeModal = () => {
    if (!selectedClass || !isTeacher) return;
    setClassEditForm({
      className: selectedClass.className || '',
      description: selectedClass.description || '',
    });
    setDraftThemeColor(selectedClass.themeColor || selectedThemeId || 'slate');
    setDraftBannerUrl(selectedClass.bannerUrl || '');
    setPresetPickerOpen(false);
    setEditInfoExpanded(false);
    setCustomizeBannerOpen(true);
  };

  const handleBannerUploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh bìa lớp học tối đa 5 MB.');
      return;
    }
    setBannerUploading(true);
    setError('');
    try {
      const response = await classroomService.uploadBannerImage(file);
      if (response.code !== 1000 || !response.data?.url) {
        throw new Error(response.message || 'Không tải được ảnh bìa lên.');
      }
      setDraftBannerUrl(response.data.url);
      setPresetPickerOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được ảnh bìa lên.');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleSaveCustomizeModal = async (event) => {
    event?.preventDefault();
    if (!selectedClass?.id || !isTeacher) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      let updatedClass = selectedClass;
      const trimmedName = (classEditForm.className || '').trim();
      const trimmedDesc = (classEditForm.description || '').trim();
      if (
        editInfoExpanded &&
        trimmedName &&
        (trimmedName !== (selectedClass.className || '') ||
          trimmedDesc !== (selectedClass.description || ''))
      ) {
        const infoRes = await classroomService.update(selectedClass.id, trimmedName, trimmedDesc);
        if (infoRes.code !== 1000) throw new Error(infoRes.message || 'Không cập nhật được thông tin lớp.');
        updatedClass = infoRes.data;
      }

      const appRes = await classroomService.customizeAppearance(selectedClass.id, {
        themeColor: draftThemeColor,
        bannerUrl: draftBannerUrl || null,
      });
      if (appRes.code !== 1000) throw new Error(appRes.message || 'Không lưu được giao diện lớp học.');
      updatedClass = appRes.data;

      setSelectedThemeId(updatedClass.themeColor || draftThemeColor);
      try {
        window.localStorage.setItem(
          `toeic_classroom_theme_${selectedClass.id}`,
          updatedClass.themeColor || draftThemeColor
        );
      } catch {
        // Ignore storage error
      }
      setSelectedClass(updatedClass);
      setClassrooms((items) => items.map((item) => (item.id === updatedClass.id ? updatedClass : item)));
      setCustomizeBannerOpen(false);
      setNotice('Đã lưu giao diện lớp học thành công.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không lưu được giao diện lớp học.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.create(className, classDescription);
      if (response.code !== 1000) throw new Error(response.message || 'Không tạo được lớp.');
      setClassName('');
      setClassDescription('');
      setCreateOrJoinModalOpen(false);
      setNotice('Đã tạo lớp mới thành công! Hãy chia sẻ mã lớp trên Bảng tin cho học viên của bạn.');
      await loadClassrooms();
      setViewMode('CLASS_DETAIL');
      setActiveTab('STREAM');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tạo được lớp.');
    } finally {
      setBusy(false);
    }
  };

  const beginEditClassroom = () => {
    openCustomizeModal();
  };

  const handleSelectClassroom = (classroom, targetTab = 'STREAM') => {
    if (classroom.id === selectedClass?.id) {
      setViewMode('CLASS_DETAIL');
      setActiveTab(targetTab);
      setSidebarDrawerOpen(false);
      return;
    }
    const hasAssignmentDraft = Boolean(
      editingAssignmentId ||
        assignmentForm.title.trim() ||
        assignmentForm.instructions.trim() ||
        assignmentForm.testId ||
        assignmentForm.deadline
    );
    if (
      (editingClassroom || hasAssignmentDraft) &&
      !window.confirm('Đổi lớp sẽ bỏ các thay đổi chưa lưu. Bạn có muốn tiếp tục không?')
    ) {
      return;
    }

    setEditingClassroom(false);
    setCustomizeBannerOpen(false);
    setClassEditForm({ className: '', description: '' });
    setEditingAssignmentId('');
    setAssignmentForm({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' });
    setSelectedAssignmentId('');
    setFeedbackDrafts({});
    setMaterialTitle('');
    setMaterialFile(null);
    if (materialFileInputRef.current) materialFileInputRef.current.value = '';
    setSelectedClass(classroom);
    setViewMode('CLASS_DETAIL');
    setActiveTab(targetTab);
    setSidebarDrawerOpen(false);
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.join(joinCode.trim().toUpperCase());
      if (response.code !== 1000) throw new Error(response.message || 'Không gửi được yêu cầu tham gia.');
      setJoinCode('');
      setCreateOrJoinModalOpen(false);
      setNotice('Yêu cầu tham gia lớp đã được gửi. Giáo viên sẽ duyệt yêu cầu của bạn.');
      await loadClassrooms();
      setViewMode('CLASS_DETAIL');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không gửi được yêu cầu tham gia.');
    } finally {
      setBusy(false);
    }
  };

  const handlePostAnnouncement = async (event) => {
    event.preventDefault();
    if (!selectedClass?.id || !announcementContent.trim()) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (isTeacher && notifyStudentsOnPost) {
        await classroomService.postAnnouncement(
          selectedClass.id,
          announcementTitle.trim() || `Thông báo từ lớp ${selectedClass.className}`,
          announcementContent.trim()
        );
      }
      const newEntry = {
        id: `${Date.now()}`,
        title: announcementTitle.trim() || 'Thông báo lớp học',
        content: announcementContent.trim(),
        authorName: user?.userName || user?.name || selectedClass.teacherName || (isTeacher ? 'Giáo viên' : 'Học viên'),
        createdAt: new Date().toISOString(),
        pinned: false,
      };
      const nextList = [newEntry, ...announcements];
      setAnnouncements(nextList);
      saveStoredAnnouncements(selectedClass.id, nextList);
      setAnnouncementTitle('');
      setAnnouncementContent('');
      setComposerOpen(false);
      setNotice(
        isTeacher && notifyStudentsOnPost
          ? 'Đã đăng thông báo lên Bảng tin và gửi chuông thông báo cho toàn bộ học viên!'
          : 'Đã đăng nội dung lên Bảng tin lớp học.'
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không gửi được thông báo lớp học.');
    } finally {
      setBusy(false);
    }
  };

  const togglePinAnnouncement = (id) => {
    const nextList = announcements.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    setAnnouncements(nextList);
    saveStoredAnnouncements(selectedClass?.id, nextList);
  };

  const deleteAnnouncement = (id) => {
    if (!window.confirm('Xóa thông báo này khỏi Bảng tin?')) return;
    const nextList = announcements.filter((item) => item.id !== id);
    setAnnouncements(nextList);
    saveStoredAnnouncements(selectedClass?.id, nextList);
  };

  const handleMemberStatus = async (member, status) => {
    setBusy(true);
    setError('');
    try {
      const response = await classroomService.changeMemberStatus(selectedClass.id, member.id, status);
      if (response.code !== 1000) throw new Error(response.message || 'Không cập nhật được thành viên.');
      await Promise.all([loadMembers(selectedClass.id, filterStatus), loadClassrooms()]);
      setNotice('Đã cập nhật trạng thái thành viên.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không cập nhật được thành viên.');
    } finally {
      setBusy(false);
    }
  };

  const parseEmailsFromRaw = (rawText) => {
    if (!rawText) return [];
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return rawText
      .split(/[,;\s\n\r]+/)
      .map((item) => item.trim().toLowerCase())
      .filter((item) => emailRegex.test(item));
  };

  const commitEmailInputToChips = (rawText) => {
    const valid = parseEmailsFromRaw(rawText);
    if (valid.length === 0) return;
    setInviteEmailChips((prev) => Array.from(new Set([...prev, ...valid])));
    setInviteEmailInput('');
  };

  const handleInviteInputKeyDown = (event) => {
    if (['Enter', ',', ';', ' '].includes(event.key)) {
      const parsed = parseEmailsFromRaw(inviteEmailInput);
      if (parsed.length > 0) {
        event.preventDefault();
        commitEmailInputToChips(inviteEmailInput);
      }
    } else if (event.key === 'Backspace' && !inviteEmailInput && inviteEmailChips.length > 0) {
      setInviteEmailChips((prev) => prev.slice(0, -1));
    }
  };

  const handleInviteInputPaste = (event) => {
    const pastedText = event.clipboardData?.getData('text') || '';
    const parsed = parseEmailsFromRaw(pastedText);
    if (parsed.length > 0) {
      event.preventDefault();
      setInviteEmailChips((prev) => Array.from(new Set([...prev, ...parsed])));
    }
  };

  const removeInviteChip = (targetEmail) => {
    setInviteEmailChips((prev) => prev.filter((item) => item !== targetEmail));
  };

  const handleInviteStudents = async (event) => {
    event.preventDefault();
    if (!selectedClass?.id) return;
    const pendingFromInput = parseEmailsFromRaw(inviteEmailInput);
    const allEmails = Array.from(new Set([...inviteEmailChips, ...pendingFromInput]));
    if (allEmails.length === 0) {
      setError('Vui lòng nhập hoặc dán ít nhất một địa chỉ Gmail hợp lệ.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.inviteStudents(
        selectedClass.id,
        allEmails,
        inviteMessage.trim()
      );
      if (response.code !== 1000) {
        throw new Error(response.message || 'Không gửi được lời mời qua Gmail.');
      }
      const data = response.data || {};
      setInviteEmailInput('');
      setInviteEmailChips([]);
      setInviteMessage('');
      setInviteModalOpen(false);
      await Promise.all([loadMembers(selectedClass.id, filterStatus), loadClassrooms()]);
      const summaryParts = [
        `Đã gửi lời mời Gmail tới ${data.emailedCount ?? allEmails.length} học viên`,
      ];
      if (data.autoApprovedCount > 0) {
        summaryParts.push(`tự động thêm ${data.autoApprovedCount} tài khoản đã có trên hệ thống vào lớp`);
      }
      if (data.alreadyMemberCount > 0) {
        summaryParts.push(`${data.alreadyMemberCount} email đã ở trong lớp`);
      }
      setNotice(`${summaryParts.join(' · ')}.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không gửi được lời mời qua Gmail.');
    } finally {
      setBusy(false);
    }
  };

  const handleUploadMaterial = async (event) => {
    event.preventDefault();
    if (!selectedClass || !materialFile) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.uploadMaterial(selectedClass.id, materialTitle, materialFile);
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được tài liệu lên.');
      setMaterialTitle('');
      setMaterialFile(null);
      if (materialFileInputRef.current) materialFileInputRef.current.value = '';
      setShowMaterialUploadForm(false);
      setNotice('Đã tải tài liệu PDF lên lớp học và hiển thị trên Bảng tin.');
      await loadMaterials(selectedClass.id, true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được tài liệu lên.');
    } finally {
      setBusy(false);
    }
  };

  const closePreviewModal = useCallback(() => {
    setPreviewModal((current) => {
      if (current.blobUrl) {
        try {
          window.URL.revokeObjectURL(current.blobUrl);
        } catch {
          // Ignore revoke error
        }
      }
      return {
        open: false,
        loading: false,
        material: null,
        blobUrl: '',
        googleViewerUrl: '',
        mode: 'DIRECT',
        error: '',
      };
    });
  }, []);

  const handlePreviewMaterial = async (material) => {
    if (!selectedClass || !material?.downloadable) return;
    setError('');
    setPreviewModal((current) => {
      if (current.blobUrl) {
        try {
          window.URL.revokeObjectURL(current.blobUrl);
        } catch {
          // Ignore revoke error
        }
      }
      return {
        open: true,
        loading: true,
        material,
        blobUrl: '',
        googleViewerUrl: '',
        mode: 'DIRECT',
        error: '',
      };
    });

    try {
      const [blobResult, linkResult] = await Promise.allSettled([
        classroomService.getMaterialPreviewBlob(selectedClass.id, material.id),
        classroomService.getMaterialPreviewLink(selectedClass.id, material.id),
      ]);

      let nextBlobUrl = '';
      if (blobResult.status === 'fulfilled' && blobResult.value) {
        const pdfBlob = new Blob([blobResult.value], { type: 'application/pdf' });
        nextBlobUrl = window.URL.createObjectURL(pdfBlob);
      }

      let nextGoogleViewerUrl = '';
      if (
        linkResult.status === 'fulfilled' &&
        linkResult.value?.code === 1000 &&
        linkResult.value?.data?.url
      ) {
        nextGoogleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          linkResult.value.data.url
        )}&embedded=true`;
      } else {
        const fallbackLink = await classroomService.getMaterialDownloadLink(
          selectedClass.id,
          material.id
        );
        if (fallbackLink?.code === 1000 && fallbackLink?.data?.url) {
          nextGoogleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
            fallbackLink.data.url
          )}&embedded=true`;
        }
      }

      if (!nextBlobUrl && !nextGoogleViewerUrl) {
        throw new Error('Không tạo được dữ liệu xem trước tài liệu PDF.');
      }

      setPreviewModal((current) => ({
        ...current,
        loading: false,
        blobUrl: nextBlobUrl,
        googleViewerUrl: nextGoogleViewerUrl,
        mode: nextBlobUrl ? 'DIRECT' : 'GOOGLE',
        error: '',
      }));
    } catch (err) {
      setPreviewModal((current) => ({
        ...current,
        loading: false,
        error: err.response?.data?.message || err.message || 'Không thể mở bản xem trước PDF.',
      }));
    }
  };

  const handleDownloadMaterial = async (material) => {
    if (!selectedClass || !material.downloadable) return;
    setDownloadingMaterialId(material.id);
    setError('');
    try {
      const response = await classroomService.getMaterialDownloadLink(selectedClass.id, material.id);
      if (response.code !== 1000 || !response.data?.url) throw new Error(response.message || 'Không tạo được link tải.');
      window.location.assign(response.data.url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được tài liệu.');
    } finally {
      setDownloadingMaterialId('');
    }
  };

  const handleHideMaterial = async (material) => {
    if (!selectedClass || !window.confirm(`Ẩn tài liệu “${material.title}” khỏi lớp?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await classroomService.hideMaterial(selectedClass.id, material.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không ẩn được tài liệu.');
      setNotice('Đã ẩn tài liệu khỏi lớp.');
      await loadMaterials(selectedClass.id, true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không ẩn được tài liệu.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAssignment = async (event) => {
    event.preventDefault();
    if (!selectedClass || !assignmentForm.testId || !assignmentForm.deadline) return;
    setBusy(true);
    setError('');
    setNotice('');
    const payload = {
      ...assignmentForm,
      deadline: localInputToVietnamDateTime(assignmentForm.deadline),
    };
    try {
      const response = editingAssignmentId
        ? await classroomService.updateAssignment(editingAssignmentId, payload)
        : await classroomService.createAssignment(selectedClass.id, payload);
      if (response.code !== 1000) throw new Error(response.message || 'Không lưu được bài tập.');
      setNotice(editingAssignmentId ? 'Đã cập nhật bài tập và hạn nộp.' : 'Đã giao bài tập mới cho lớp.');
      setEditingAssignmentId('');
      setShowAssignmentFormModal(false);
      setAssignmentForm({ title: '', instructions: '', testId: '', deadline: '', latePolicy: '' });
      await loadAssignments(selectedClass.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không lưu được bài tập.');
    } finally {
      setBusy(false);
    }
  };

  const refreshClassTests = async () => {
    if (!selectedClass?.id) return;
    await Promise.all([loadClassroomTests(selectedClass.id), loadAssignableTests(selectedClass.id)]);
  };

  const editAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentForm({
      title: assignment.title || '',
      instructions: assignment.instructions || '',
      testId: assignment.testId || '',
      deadline: vietnamDateTimeToLocalInput(assignment.deadline),
      latePolicy: assignment.latePolicy || '',
    });
    setActiveTab('CLASSWORK');
    setShowAssignmentFormModal(true);
  };

  const archiveAssignment = async (assignment) => {
    if (!window.confirm(`Ẩn bài tập “${assignment.title}” khỏi lớp học?`)) return;
    setBusy(true);
    setError('');
    try {
      const response = await classroomService.archiveAssignment(assignment.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không ẩn được bài tập.');
      setNotice('Đã ẩn bài tập; dữ liệu các lượt nộp được giữ lại.');
      await loadAssignments(selectedClass.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không ẩn được bài tập.');
    } finally {
      setBusy(false);
    }
  };

  const saveFeedback = async (submission) => {
    if (!submission.resultId) return;
    const comment = feedbackDrafts[submission.resultId] ?? submission.teacherComment ?? '';
    setBusy(true);
    setError('');
    try {
      const response = await classroomService.addAssignmentFeedback(submission.resultId, comment);
      if (response.code !== 1000) throw new Error(response.message || 'Không lưu được nhận xét.');
      setNotice('Đã lưu nhận xét và tạo thông báo cho học viên.');
      await loadSubmissions(selectedAssignmentId, submissionSort.sortBy, submissionSort.direction);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không lưu được nhận xét.');
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (code) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setNotice(`Đã sao chép mã lớp: ${code}`);
    } catch {
      setNotice(`Mã lớp: ${code}`);
    }
  };

  const rotateJoinCode = async () => {
    if (
      !selectedClass?.id ||
      !isTeacher ||
      !window.confirm(
        'Đổi mã tham gia? Mã hiện tại sẽ ngừng hoạt động; học viên đã tham gia và yêu cầu đang chờ vẫn được giữ nguyên.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await classroomService.rotateJoinCode(selectedClass.id);
      if (response.code !== 1000) throw new Error(response.message || 'Không đổi được mã tham gia.');
      const updatedClass = response.data;
      setSelectedClass(updatedClass);
      setClassrooms((items) => items.map((item) => (item.id === updatedClass.id ? updatedClass : item)));
      setNotice('Đã đổi mã tham gia mới. Mã cũ không còn hiệu lực.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không đổi được mã tham gia.');
    } finally {
      setBusy(false);
    }
  };

  if (studioOpen && selectedClass && isTeacher) {
    return (
      <div className="classrooms-page min-h-screen bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto mb-5 flex max-w-7xl items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
              Studio đề riêng của lớp
            </p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{selectedClass.className}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              setStudioOpen(false);
              setEditingClassroomTest(null);
              await refreshClassTests();
            }}
            className="editorial-button-secondary px-4 py-2 text-sm font-semibold"
          >
            Đóng studio
          </button>
        </div>
        <TestManagementPage classroomScope={selectedClass.id} initialTest={editingClassroomTest} />
      </div>
    );
  }

  return (
    <div className="classrooms-page min-h-[85vh] bg-white text-slate-900">
      {/* GOOGLE CLASSROOM TOP SUB-HEADER BAR */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Hamburger + Classroom Brand + Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2.5 py-3">
            <button
              type="button"
              onClick={() => setSidebarDrawerOpen((prev) => !prev)}
              aria-label="Mở danh sách lớp học"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Menu size={20} />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ALL_CLASSES')}
              className="flex items-center gap-2.5 text-left transition hover:opacity-80"
            >
              <span className="grid h-8 w-9 shrink-0 place-items-center rounded-md border border-emerald-700 bg-emerald-600 text-white shadow-xs">
                <GraduationCap size={18} />
              </span>
              <span className="text-lg font-medium tracking-tight text-slate-700">Lớp học</span>
            </button>

            {selectedClass && viewMode === 'CLASS_DETAIL' && (
              <>
                <ChevronRight size={18} className="shrink-0 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setActiveTab('STREAM')}
                  className="truncate text-lg font-semibold tracking-tight text-slate-900 hover:text-[#1D4ED8]"
                >
                  {selectedClass.className}
                </button>
              </>
            )}
          </div>

          {/* Center: 4 Google Classroom Navigation Tabs */}
          {selectedClass && viewMode === 'CLASS_DETAIL' && (
            <nav
              aria-label="Điều hướng trong lớp học"
              className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-slate-100 lg:order-2 lg:w-auto lg:border-t-0"
            >
              {[
                { id: 'STREAM', label: 'Bảng tin' },
                {
                  id: 'CLASSWORK',
                  label: 'Bài tập trên lớp',
                  badge: assignments.length + materials.length || null,
                },
                {
                  id: 'PEOPLE',
                  label: 'Mọi người',
                  badge: isTeacher && selectedClass.pendingMemberCount > 0 ? selectedClass.pendingMemberCount : null,
                  badgeUrgent: true,
                },
                { id: 'GRADES', label: 'Điểm' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition ${
                      isActive ? 'text-[#1D4ED8]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge ? (
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                          tab.badgeUrgent
                            ? 'bg-red-600 text-white'
                            : isActive
                              ? 'bg-blue-100 text-[#1D4ED8]'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-[#1D4ED8]" />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: Action Icons (Create/Join, All Classes Grid, Studio, Settings) */}
          <div className="order-2 flex items-center gap-2 py-2 lg:order-3">
            <button
              type="button"
              onClick={() => setCreateOrJoinModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
            >
              <Plus size={16} />
              <span>{isTeacher ? 'Tạo lớp mới' : 'Tham gia lớp'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'ALL_CLASSES' ? 'CLASS_DETAIL' : 'ALL_CLASSES')}
              title="Danh sách tất cả lớp học"
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                viewMode === 'ALL_CLASSES'
                  ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={18} />
            </button>

            {isTeacher && selectedClass && viewMode === 'CLASS_DETAIL' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingClassroomTest(null);
                    setStudioOpen(true);
                  }}
                  title="Mở Studio soạn đề riêng của lớp"
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#1D4ED8]"
                >
                  <FolderOpen size={18} />
                </button>
                <button
                  type="button"
                  onClick={beginEditClassroom}
                  title="Cài đặt và tùy chỉnh lớp học"
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-[#1D4ED8]"
                >
                  <Settings size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN BODY WITH GOOGLE CLASSROOM LEFT ICON RAIL + CONTENT */}
      <div className="mx-auto flex max-w-[1440px]">
        {/* Left Compact Icon Rail (Desktop) */}
        <aside className="hidden w-16 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white py-4 md:flex">
          <button
            type="button"
            onClick={() => setViewMode('ALL_CLASSES')}
            title="Màn hình chính Lớp học"
            className={`grid h-11 w-11 place-items-center rounded-full transition ${
              viewMode === 'ALL_CLASSES'
                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home size={20} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedClass) {
                setViewMode('CLASS_DETAIL');
                setActiveTab('CLASSWORK');
              }
            }}
            title="Lịch và Bài tập trên lớp"
            className={`grid h-11 w-11 place-items-center rounded-full transition ${
              viewMode === 'CLASS_DETAIL' && activeTab === 'CLASSWORK'
                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar size={20} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedClass) {
                setViewMode('CLASS_DETAIL');
                setActiveTab('PEOPLE');
              }
            }}
            title="Mọi người trong lớp"
            className={`relative grid h-11 w-11 place-items-center rounded-full transition ${
              viewMode === 'CLASS_DETAIL' && activeTab === 'PEOPLE'
                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={20} />
            {isTeacher && selectedClass?.pendingMemberCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedClass) {
                setViewMode('CLASS_DETAIL');
                setActiveTab('GRADES');
              }
            }}
            title="Sổ điểm lớp học"
            className={`grid h-11 w-11 place-items-center rounded-full transition ${
              viewMode === 'CLASS_DETAIL' && activeTab === 'GRADES'
                ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award size={20} />
          </button>

          <div className="my-1 h-px w-8 bg-slate-200" />

          {/* Quick Class Avatar Initials in Left Rail */}
          <div className="flex flex-col items-center gap-2">
            {classrooms.slice(0, 6).map((cls) => {
              const isSelected = selectedClass?.id === cls.id && viewMode === 'CLASS_DETAIL';
              const initial = (cls.className || 'L').trim().charAt(0).toUpperCase();
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleSelectClassroom(cls, 'STREAM')}
                  title={cls.className}
                  className={`grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-bold transition ${
                    isSelected
                      ? 'bg-[#1D4ED8] text-white ring-2 ring-blue-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {initial}
                </button>
              );
            })}
          </div>
        </aside>

        {/* SLIDE-OVER CLASS SWITCHER DRAWER (When Menu is clicked) */}
        {sidebarDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px]"
              onClick={() => setSidebarDrawerOpen(false)}
            />
            <aside className="relative z-10 flex w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-emerald-600 text-white">
                    <GraduationCap size={18} />
                  </span>
                  <span className="font-bold text-slate-900">Lớp học trực tuyến</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarDrawerOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('ALL_CLASSES');
                    setSidebarDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-r-full px-4 py-3 text-left text-sm font-semibold transition ${
                    viewMode === 'ALL_CLASSES'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home size={18} />
                  <span>Màn hình chính (Tất cả lớp)</span>
                </button>

                <div className="my-3 border-t border-slate-200 pt-3">
                  <p className="px-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {isTeacher ? 'Lớp đang giảng dạy' : 'Lớp đã đăng ký'} ({classrooms.length})
                  </p>
                  <div className="mt-2 space-y-1">
                    {classrooms.map((classroom) => {
                      const isSelected = selectedClass?.id === classroom.id && viewMode === 'CLASS_DETAIL';
                      const initial = (classroom.className || 'L').trim().charAt(0).toUpperCase();
                      return (
                        <button
                          key={classroom.id}
                          type="button"
                          onClick={() => handleSelectClassroom(classroom, 'STREAM')}
                          className={`flex w-full items-center gap-3 rounded-r-full px-4 py-2.5 text-left transition ${
                            isSelected
                              ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                              isSelected ? 'bg-[#1D4ED8] text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {initial}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{classroom.className}</p>
                            <p className="truncate font-mono text-[11px] text-slate-500">
                              {isTeacher ? `Mã: ${classroom.classCode}` : statusLabels[classroom.status] || classroom.status}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 p-4">
                <button
                  type="button"
                  onClick={() => {
                    setSidebarDrawerOpen(false);
                    setCreateOrJoinModalOpen(true);
                  }}
                  className="editorial-button-primary flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold"
                >
                  <Plus size={15} />
                  {isTeacher ? 'Tạo lớp học mới' : 'Tham gia lớp bằng mã'}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          {/* Status / Error Banner */}
          {(error || notice) && (
            <div
              role={error ? 'alert' : 'status'}
              className={`mx-auto mb-6 flex max-w-5xl items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium ${
                error
                  ? 'border-red-300 bg-red-50 text-red-800'
                  : 'border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]'
              }`}
            >
              <span>{error || notice}</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setNotice('');
                }}
                className="rounded-full p-1 hover:bg-black/5"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* LOADING OR EMPTY STATE */}
          {loading ? (
            <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-600">
              <LoaderCircle className="animate-spin text-[#1D4ED8]" size={22} />
              <span className="text-sm font-semibold">Đang tải không gian lớp học…</span>
            </div>
          ) : classrooms.length === 0 ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <img
                src={nunaBookImg}
                alt="Nuna đồng hành lớp học"
                className="mx-auto h-28 w-28 object-contain"
              />
              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Chào mừng bạn đến với Không gian Lớp học TOEIC
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
                {isTeacher
                  ? 'Bạn chưa có lớp học nào. Tạo lớp học đầu tiên để nhận mã lớp 8 ký tự, đăng thông báo trên Bảng tin, tải tài liệu PDF và giao bài tập cho học viên.'
                  : 'Bạn chưa tham gia lớp học nào. Nhập mã lớp 8 ký tự do giáo viên cung cấp để tham gia lớp học.'}
              </p>
              <button
                type="button"
                onClick={() => setCreateOrJoinModalOpen(true)}
                className="editorial-button-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                <Plus size={18} />
                {isTeacher ? 'Tạo lớp học đầu tiên' : 'Nhập mã tham gia lớp'}
              </button>
            </div>
          ) : viewMode === 'ALL_CLASSES' || !selectedClass ? (
            /* GOOGLE CLASSROOM HOME: ALL CLASSES GRID VIEW */
            <div className="mx-auto max-w-6xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
                    Tổng quan lớp học
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                    Tất cả lớp học của bạn ({classrooms.length})
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOrJoinModalOpen(true)}
                  className="editorial-button-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
                >
                  <Plus size={16} />
                  {isTeacher ? 'Tạo lớp mới' : 'Tham gia lớp bằng mã'}
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((cls) => {
                  const clsTheme = findBannerTheme(cls.themeColor || getStoredThemeId(cls.id), 'slate');
                  const clsBannerSrc = resolveBannerImageSrc(cls.bannerUrl || '');
                  return (
                    <article
                      key={cls.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition hover:border-slate-300 hover:shadow-md"
                    >
                      <div
                        onClick={() => handleSelectClassroom(cls, 'STREAM')}
                        style={
                          clsBannerSrc
                            ? {
                                backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.72), rgba(15,23,42,0.38)), url(${clsBannerSrc})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }
                            : undefined
                        }
                        className={`relative cursor-pointer p-5 text-white ${clsBannerSrc ? 'bg-slate-800' : clsTheme.cardHeaderClass}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="line-clamp-1 text-xl font-bold tracking-tight text-white group-hover:underline">
                            {cls.className}
                          </h2>
                          <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                            {isTeacher ? `Mã: ${cls.classCode}` : statusLabels[cls.status] || cls.status}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-white/90">
                          GV: {cls.teacherName}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <p className="line-clamp-2 text-xs text-slate-600">
                            {cls.description || 'Không gian bảng tin, tài liệu PDF và bài tập luyện thi TOEIC của lớp.'}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Users size={14} className="text-[#1D4ED8]" />
                              {cls.approvedMemberCount ?? 0} học viên
                            </span>
                            {isTeacher && cls.pendingMemberCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-700">
                                {cls.pendingMemberCount} chờ duyệt
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            onClick={() => handleSelectClassroom(cls, 'STREAM')}
                            className="text-xs font-bold text-[#1D4ED8] hover:underline"
                          >
                            Mở Bảng tin →
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSelectClassroom(cls, 'CLASSWORK')}
                              title="Bài tập trên lớp"
                              className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectClassroom(cls, 'PEOPLE')}
                              title="Mọi người"
                              className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Users size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectClassroom(cls, 'GRADES')}
                              title="Điểm số"
                              className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                              <Award size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SELECTED CLASSROOM DETAIL VIEW */
            <div className="mx-auto max-w-5xl">
              {/* =========================================================
                  TAB 1: BẢNG TIN (STREAM) — GOOGLE CLASSROOM STYLE
              ========================================================= */}
              {activeTab === 'STREAM' && (
                <div>
                  {/* HERO BANNER (Matching Google Classroom Screenshot) */}
                  <div
                    style={
                      activeBannerSrc
                        ? {
                            backgroundImage: `linear-gradient(115deg, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.36) 55%, rgba(15, 23, 42, 0.25) 100%), url(${activeBannerSrc})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                    className={`relative min-h-[220px] overflow-hidden rounded-2xl p-6 text-white shadow-sm sm:min-h-[240px] sm:p-8 ${
                      activeBannerSrc ? 'bg-slate-800' : activeTheme.bgClass
                    }`}
                  >
                    {/* Right Decorative Vector Laptop / Tablet / Phone Illustration (when no custom photo) */}
                    {!activeBannerSrc && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 420 240"
                        className="pointer-events-none absolute right-0 top-0 hidden h-full w-auto opacity-85 sm:block"
                      >
                        {/* Tablet */}
                        <g transform="translate(115, 10) rotate(28)">
                          <rect x="0" y="0" width="90" height="125" rx="8" fill="#1E293B" opacity="0.7" />
                          <rect x="6" y="8" width="78" height="109" rx="3" fill="#38BDF8" opacity="0.85" />
                          <rect x="14" y="18" width="46" height="6" rx="2" fill="#E0F2FE" />
                          <rect x="14" y="30" width="60" height="4" rx="2" fill="#BAE6FD" />
                          <rect x="14" y="40" width="52" height="4" rx="2" fill="#BAE6FD" />
                        </g>
                        {/* Smartphone */}
                        <g transform="translate(150, 145) rotate(-25)">
                          <rect x="0" y="0" width="54" height="96" rx="7" fill="#0F172A" opacity="0.8" />
                          <rect x="4" y="7" width="46" height="82" rx="3" fill="#0284C7" opacity="0.9" />
                          <rect x="10" y="16" width="34" height="22" rx="2" fill="#7DD3FC" opacity="0.7" />
                        </g>
                        {/* Open Laptop */}
                        <g transform="translate(245, 30) rotate(-32)">
                          <rect x="0" y="0" width="160" height="100" rx="6" fill="#334155" />
                          <rect x="6" y="6" width="148" height="88" rx="3" fill="#2563EB" />
                          <rect x="18" y="18" width="65" height="6" rx="2" fill="#93C5FD" />
                          <rect x="18" y="30" width="95" height="5" rx="2" fill="#60A5FA" />
                          <rect x="18" y="40" width="80" height="5" rx="2" fill="#60A5FA" />
                          <rect x="-10" y="100" width="180" height="72" rx="8" fill="#CBD5E1" opacity="0.9" />
                          <rect x="6" y="110" width="148" height="36" rx="3" fill="#64748B" opacity="0.75" />
                          <rect x="64" y="150" width="32" height="16" rx="2" fill="#94A3B8" />
                        </g>
                      </svg>
                    )}

                    {/* Top Right Customize Button */}
                    {isTeacher && (
                      <div className="relative z-10 flex justify-end">
                        <button
                          type="button"
                          onClick={openCustomizeModal}
                          className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#1D4ED8] shadow-xs backdrop-blur-xs transition hover:bg-white"
                        >
                          <Pencil size={14} />
                          <span>Tùy chỉnh</span>
                        </button>
                      </div>
                    )}

                    {/* Class Name & Subtitle */}
                    <div className="relative z-10 mt-4 max-w-2xl sm:mt-6">
                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                        {selectedClass.className}
                      </h1>
                      <p className="mt-2 text-sm font-medium text-white/90 sm:text-base">
                        Giáo viên: {selectedClass.teacherName}
                        {selectedClass.approvedMemberCount != null
                          ? ` · ${selectedClass.approvedMemberCount} học viên`
                          : ''}
                      </p>
                    </div>

                    {/* Bottom Right Info Toggle Button (ⓘ) */}
                    <button
                      type="button"
                      onClick={() => setClassInfoExpanded((prev) => !prev)}
                      title="Hiển thị thông tin lớp học"
                      aria-expanded={classInfoExpanded}
                      className="absolute bottom-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/20 text-white backdrop-blur-xs transition hover:bg-black/35"
                    >
                      <Info size={18} />
                    </button>
                  </div>

                  {/* EXPANDABLE BANNER INFO BAR (When ⓘ is clicked) */}
                  {classInfoExpanded && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Tên lớp học
                          </span>
                          <span className="mt-1 block text-sm font-bold text-slate-900">
                            {selectedClass.className}
                          </span>
                        </div>
                        <div>
                          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Giáo viên phụ trách
                          </span>
                          <span className="mt-1 block text-sm font-semibold text-slate-900">
                            {selectedClass.teacherName}
                            {selectedClass.teacherEmail ? ` (${selectedClass.teacherEmail})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Trạng thái / Quy mô
                          </span>
                          <span className="mt-1 block font-mono text-sm font-semibold text-[#1D4ED8]">
                            {statusLabels[selectedClass.status] || selectedClass.status} ·{' '}
                            {selectedClass.approvedMemberCount ?? 0} học viên
                          </span>
                        </div>
                      </div>
                      {selectedClass.description && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Mô tả và Mục tiêu lớp học
                          </span>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                            {selectedClass.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending student notice */}
                  {!isTeacher && selectedClass.status !== 'APPROVED' && (
                    <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                      Trạng thái tham gia: <strong>{statusLabels[selectedClass.status] || selectedClass.status}</strong>.
                      Giáo viên cần duyệt yêu cầu trước khi bạn truy cập bài tập và tài liệu của lớp.
                    </div>
                  )}

                  {/* GOOGLE CLASSROOM 2-COLUMN STREAM LAYOUT */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
                    {/* LEFT SIDEBAR: MÃ LỚP + SẮP ĐẾN HẠN + NUNA */}
                    <div className="space-y-4">
                      {/* Card 1: Mã lớp (Teacher) or Thông tin thành viên (Student) */}
                      {isTeacher ? (
                        <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800">Mã lớp</span>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setCodeMenuOpen((prev) => !prev)}
                                aria-label="Tùy chọn mã lớp"
                                className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {codeMenuOpen && (
                                <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCodeMenuOpen(false);
                                      copyCode(selectedClass.classCode);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Clipboard size={14} className="text-[#1D4ED8]" />
                                    Sao chép mã lớp
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCodeMenuOpen(false);
                                      rotateJoinCode();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <RefreshCw size={14} className="text-amber-600" />
                                    Đổi mã tham gia
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCodeMenuOpen(false);
                                      setFullscreenCodeOpen(true);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    <Maximize2 size={14} className="text-slate-600" />
                                    Phóng to mã lớp
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => copyCode(selectedClass.classCode)}
                              title="Nhấn để sao chép mã lớp"
                              className="font-mono text-2xl font-bold tracking-wider text-[#1D4ED8] hover:underline"
                            >
                              {selectedClass.classCode}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFullscreenCodeOpen(true)}
                              title="Phóng to mã lớp trên màn hình"
                              className="grid h-8 w-8 place-items-center rounded-lg text-[#1D4ED8] hover:bg-[#EFF6FF]"
                            >
                              <Maximize2 size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setInviteModalOpen(true)}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-[#EFF6FF] px-3 py-2 text-xs font-bold text-[#1D4ED8] transition hover:bg-blue-100"
                          >
                            <UserPlus size={14} />
                            Mời học viên qua Gmail
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                          <span className="text-sm font-bold text-slate-800">Thành viên lớp</span>
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 font-mono text-xs font-bold text-[#1D4ED8]">
                            <UserCheck size={14} />
                            {statusLabels[selectedClass.status] || selectedClass.status}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Giáo viên: <strong className="text-slate-800">{selectedClass.teacherName}</strong>
                          </p>
                        </div>
                      )}

                      {/* Card 2: Sắp đến hạn (Upcoming Deadlines — Matching Screenshot) */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <h3 className="text-sm font-bold text-slate-800">Sắp đến hạn</h3>
                        {upcomingAssignments.length === 0 ? (
                          <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            Không có bài tập nào sắp đến hạn
                          </p>
                        ) : (
                          <ul className="mt-2.5 space-y-2.5">
                            {upcomingAssignments.map((item) => (
                              <li key={item.id} className="border-l-2 border-[#1D4ED8] pl-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('CLASSWORK');
                                    setSelectedAssignmentId(item.id);
                                  }}
                                  className="block text-left text-xs font-bold text-slate-800 hover:text-[#1D4ED8] hover:underline"
                                >
                                  {item.title}
                                </button>
                                <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
                                  Hạn: {formatVietnamDateTime(item.deadline)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveTab('CLASSWORK')}
                            className="text-xs font-bold text-[#1D4ED8] hover:underline"
                          >
                            Xem tất cả
                          </button>
                        </div>
                      </div>

                      {/* Card 3: Trợ giảng Nuna AI */}
                      <div className="rounded-xl border border-blue-100 bg-[#F8FAFC] p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={nunaLaptopImg}
                            alt="Trợ giảng Nuna"
                            className="h-12 w-12 shrink-0 rounded-full border border-blue-200 bg-white object-contain p-1"
                          />
                          <div>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                              Trợ giảng lớp học
                            </p>
                            <p className="text-xs font-bold text-slate-900">Cún Nuna đồng hành</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {isTeacher
                            ? 'Mẹo: Bạn có thể đăng thông báo nhắc lịch thi thử hoặc giao đề riêng cho lớp tại tab Bài tập trên lớp!'
                            : 'Cần giải thích ngữ pháp Part 5 hay mẹo nghe Part 3 trước khi nộp bài? Hỏi Nuna ngay nhé!'}
                        </p>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
                          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-[#1D4ED8] transition hover:bg-[#EFF6FF]"
                        >
                          <Sparkles size={14} />
                          Hỏi Trợ lý AI Nuna
                        </button>
                      </div>
                    </div>

                    {/* RIGHT MAIN STREAM COLUMN */}
                    <div className="space-y-4">
                      {/* Action Pills Row: "✏️ Thông báo mới" + "🔁 Đăng lại" + Filter */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {(isTeacher || selectedClass.status === 'APPROVED') && (
                            <button
                              type="button"
                              onClick={() => setComposerOpen((prev) => !prev)}
                              className="inline-flex items-center gap-2 rounded-full bg-[#D3E3FD] px-5 py-2.5 text-sm font-semibold text-[#0B57D0] shadow-2xs transition hover:bg-[#C2D7FC]"
                            >
                              <Pencil size={16} />
                              <span>Thông báo mới</span>
                            </button>
                          )}

                          {isTeacher && (
                            <button
                              type="button"
                              onClick={() => setRepostModalOpen(true)}
                              className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-semibold text-[#0B57D0] transition hover:bg-blue-50"
                            >
                              <Repeat size={16} />
                              <span>Đăng lại</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[
                            ['ALL', 'Tất cả'],
                            ['ANNOUNCEMENTS', 'Thông báo'],
                            ['CLASSWORK', 'Bài tập và PDF'],
                          ].map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setStreamFilter(key)}
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                streamFilter === key
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* INLINE STREAM ANNOUNCEMENT COMPOSER */}
                      {composerOpen && (
                        <form
                          onSubmit={handlePostAnnouncement}
                          className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              <Megaphone size={16} className="text-[#1D4ED8]" />
                              Đăng thông báo cho lớp {selectedClass.className}
                            </span>
                            <button
                              type="button"
                              onClick={() => setComposerOpen(false)}
                              className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="mt-3 space-y-3">
                            <input
                              maxLength={160}
                              value={announcementTitle}
                              onChange={(event) => setAnnouncementTitle(event.target.value)}
                              placeholder="Tiêu đề thông báo (ví dụ: Lịch chữa đề ETS 2026 tối thứ 6)"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-[#1D4ED8]"
                            />
                            <textarea
                              required
                              rows={4}
                              maxLength={3000}
                              value={announcementContent}
                              onChange={(event) => setAnnouncementContent(event.target.value)}
                              placeholder="Thông báo nội dung nào đó cho lớp học của bạn..."
                              className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1D4ED8] focus:bg-white"
                            />
                            {isTeacher && (
                              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={notifyStudentsOnPost}
                                  onChange={(event) => setNotifyStudentsOnPost(event.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 text-[#1D4ED8]"
                                />
                                <Bell size={13} className="text-[#1D4ED8]" />
                                Đồng thời gửi chuông thông báo hệ thống tới tất cả học viên đã duyệt trong lớp
                              </label>
                            )}
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setComposerOpen(false)}
                              className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={busy || !announcementContent.trim()}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                            >
                              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                              Đăng lên Bảng tin
                            </button>
                          </div>
                        </form>
                      )}

                      {/* STREAM FEED ITEMS */}
                      {unifiedStreamItems.length === 0 ? (
                        /* Google Classroom Empty Stream Welcome Box (Matching Screenshot!) */
                        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:p-8">
                          <img
                            src={nunaBookImg}
                            alt="Bảng tin lớp học"
                            className="h-28 w-28 shrink-0 object-contain"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                              Đây là nơi bạn giao tiếp với lớp học của mình
                            </h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                              Sử dụng bảng tin để thông báo, đăng bài tập, chia sẻ tài liệu PDF và trả lời câu hỏi của học viên.
                            </p>
                            {isTeacher && (
                              <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                                <button
                                  type="button"
                                  onClick={() => setCustomizeBannerOpen(true)}
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#1D4ED8] transition hover:bg-slate-50"
                                >
                                  <Settings size={15} />
                                  <span>Cài đặt bảng tin</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('CLASSWORK');
                                    setShowAssignmentFormModal(true);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-2 text-xs font-semibold text-[#1D4ED8] transition hover:bg-blue-100"
                                >
                                  <Plus size={15} />
                                  <span>Giao bài tập đầu tiên</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {unifiedStreamItems.map((item) => {
                            if (item.type === 'ANNOUNCEMENT') {
                              return (
                                <article
                                  key={item.id}
                                  className={`rounded-2xl border bg-white p-5 shadow-2xs transition ${
                                    item.pinned ? 'border-blue-300 bg-[#F8FAFC]' : 'border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1D4ED8] text-white">
                                        <Megaphone size={18} />
                                      </span>
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-sm font-bold text-slate-900">
                                            {item.authorName}
                                          </span>
                                          {item.pinned && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold text-[#1D4ED8]">
                                              <Pin size={11} /> Đã ghim
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-mono text-xs text-slate-500">
                                          {formatVietnamDateTime(item.createdAt)}
                                        </span>
                                      </div>
                                    </div>

                                    {isTeacher && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => togglePinAnnouncement(item.rawId)}
                                          title={item.pinned ? 'Bỏ ghim' : 'Ghim lên đầu Bảng tin'}
                                          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#1D4ED8]"
                                        >
                                          <Pin size={15} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteAnnouncement(item.rawId)}
                                          title="Xóa thông báo"
                                          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {item.title && (
                                    <h3 className="mt-3 text-base font-bold text-slate-900">{item.title}</h3>
                                  )}
                                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                    {item.content}
                                  </p>
                                </article>
                              );
                            }

                            if (item.type === 'ASSIGNMENT') {
                              const assign = item.assignment;
                              const deadlineExpired =
                                getDeadlineHint(assign.deadline, clockNow) === 'Đã quá hạn';
                              const canSubmit = !(
                                assign.latePolicy === 'REJECT_AFTER_DEADLINE' && deadlineExpired
                              );
                              return (
                                <article
                                  key={item.id}
                                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-300"
                                >
                                  <div className="flex min-w-0 items-center gap-3.5">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1D4ED8] text-white">
                                      <FileText size={18} />
                                    </span>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                                      <p className="mt-0.5 font-mono text-xs text-slate-500">{item.subtitle}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isTeacher ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedAssignmentId(assign.id);
                                          setActiveTab('GRADES');
                                        }}
                                        className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                      >
                                        Xem bài nộp và Chấm điểm
                                      </button>
                                    ) : (
                                      <>
                                        {assign.myLatestResultId && (
                                          <Link
                                            to={`/results/${assign.myLatestResultId}`}
                                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                          >
                                            Xem kết quả
                                          </Link>
                                        )}
                                        {canSubmit && (
                                          <Link
                                            to={`/courses/${assign.testId}/take?assignmentId=${assign.id}`}
                                            className="rounded-full bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                                          >
                                            {assign.myLatestResultId ? 'Làm lại' : 'Làm bài ngay'}
                                          </Link>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </article>
                              );
                            }

                            const mat = item.material;
                            return (
                              <article
                                key={item.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-300"
                              >
                                <div className="flex min-w-0 items-center gap-3.5">
                                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-700 text-white">
                                    <BookOpen size={18} />
                                  </span>
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => mat.downloadable && handlePreviewMaterial(mat)}
                                      className="truncate text-left text-sm font-bold text-slate-900 hover:text-[#1D4ED8] hover:underline"
                                    >
                                      {item.title}
                                    </button>
                                    <p className="mt-0.5 font-mono text-xs text-slate-500">{item.subtitle}</p>
                                  </div>
                                </div>

                                {mat.downloadable && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handlePreviewMaterial(mat)}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-bold text-[#1D4ED8] transition hover:bg-blue-100"
                                    >
                                      <Eye size={14} />
                                      Xem trước
                                    </button>
                                    <button
                                      type="button"
                                      disabled={downloadingMaterialId === mat.id}
                                      onClick={() => handleDownloadMaterial(mat)}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                    >
                                      <Download size={14} />
                                      Tải PDF
                                    </button>
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 2: BÀI TẬP TRÊN LỚP (CLASSWORK)
              ========================================================= */}
              {activeTab === 'CLASSWORK' && (
                <div>
                  {/* Teacher Creation Bar + Topic Filter */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    {isTeacher ? (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAssignmentId('');
                            setAssignmentForm({
                              title: '',
                              instructions: '',
                              testId: '',
                              deadline: '',
                              latePolicy: '',
                            });
                            setShowAssignmentFormModal((prev) => !prev);
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-800"
                        >
                          <Plus size={18} />
                          <span>Giao bài tập mới</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowMaterialUploadForm((prev) => !prev)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        >
                          <Upload size={15} />
                          <span>Tải tài liệu PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassroomTest(null);
                            setStudioOpen(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        >
                          <BookOpen size={15} />
                          <span>Soạn đề riêng của lớp</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Bài tập và Tài liệu trên lớp</h2>
                        <p className="text-xs text-slate-600">
                          Hoàn thành các bài tập đúng hạn và tải về tài liệu ôn tập PDF của lớp.
                        </p>
                      </div>
                    )}

                    {/* Topic Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        ['ALL', 'Tất cả chủ đề'],
                        ['ASSIGNMENTS', `Bài tập (${assignments.length})`],
                        ['MATERIALS', `Tài liệu PDF (${materials.length})`],
                        ...(isTeacher ? [['TESTS', `Đề riêng (${classroomTests.length})`]] : []),
                      ].map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setClassworkTopic(key)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                            classworkTopic === key
                              ? 'bg-[#EFF6FF] text-[#1D4ED8] ring-1 ring-[#1D4ED8]'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TEACHER ASSIGNMENT FORM PANEL */}
                  {isTeacher && (showAssignmentFormModal || editingAssignmentId) && (
                    <form
                      onSubmit={handleSaveAssignment}
                      className="mb-6 space-y-3.5 rounded-2xl border border-blue-200 bg-[#F8FAFC] p-5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold text-slate-900">
                          {editingAssignmentId ? 'Sửa bài tập / Gia hạn thời gian' : 'Giao bài tập TOEIC mới cho lớp'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAssignmentId('');
                            setShowAssignmentFormModal(false);
                            setAssignmentForm({
                              title: '',
                              instructions: '',
                              testId: '',
                              deadline: '',
                              latePolicy: '',
                            });
                          }}
                          className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 sm:col-span-2">
                          Tiêu đề bài tập
                          <input
                            required
                            maxLength={255}
                            value={assignmentForm.title}
                            onChange={(event) =>
                              setAssignmentForm((form) => ({ ...form, title: event.target.value }))
                            }
                            placeholder="Ví dụ: Tuần 3 — Full Test ETS 2026 Test 1"
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                          />
                        </label>

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 sm:col-span-2">
                          Đề thi áp dụng
                          <select
                            required
                            value={assignmentForm.testId}
                            onChange={(event) =>
                              setAssignmentForm((form) => ({ ...form, testId: event.target.value }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                          >
                            <option value="">Chọn đề đã phát hành cho lớp</option>
                            <optgroup label="Đề chung của hệ thống">
                              {assignmentTests
                                .filter((test) => !test.classroomId)
                                .map((test) => (
                                  <option key={test.id} value={test.id}>
                                    {test.titleTest}
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label="Đề riêng của lớp">
                              {assignmentTests
                                .filter((test) => test.classroomId === selectedClass?.id)
                                .map((test) => (
                                  <option key={test.id} value={test.id}>
                                    {test.titleTest}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                        </label>

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 sm:col-span-2">
                          Hướng dẫn làm bài (không bắt buộc)
                          <textarea
                            maxLength={5000}
                            rows={2}
                            value={assignmentForm.instructions}
                            onChange={(event) =>
                              setAssignmentForm((form) => ({ ...form, instructions: event.target.value }))
                            }
                            placeholder="Lưu ý cho học viên về mục tiêu điểm số, thời gian làm bài..."
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                          />
                        </label>

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Hạn nộp (Giờ Việt Nam, Asia/Ho_Chi_Minh)
                          <input
                            required
                            type="datetime-local"
                            value={assignmentForm.deadline}
                            onChange={(event) =>
                              setAssignmentForm((form) => ({ ...form, deadline: event.target.value }))
                            }
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                          />
                        </label>

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Chính sách nộp trễ
                          <select
                            required
                            value={assignmentForm.latePolicy}
                            onChange={(event) =>
                              setAssignmentForm((form) => ({ ...form, latePolicy: event.target.value }))
                            }
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                          >
                            <option value="">Chọn chính sách nộp trễ</option>
                            <option value="REJECT_AFTER_DEADLINE">Hết hạn thì từ chối bài nộp</option>
                            <option value="ACCEPT_AND_MARK_LATE">Vẫn nhận và đánh dấu nộp trễ</option>
                          </select>
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex gap-2">
                          <button
                            disabled={busy || assignmentTests.length === 0 || !assignmentForm.latePolicy}
                            className="editorial-button-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
                          >
                            {busy ? 'Đang lưu…' : editingAssignmentId ? 'Lưu thay đổi' : 'Giao bài tập'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAssignmentId('');
                              setShowAssignmentFormModal(false);
                              setAssignmentForm({
                                title: '',
                                instructions: '',
                                testId: '',
                                deadline: '',
                                latePolicy: '',
                              });
                            }}
                            className="editorial-button-secondary px-4 py-2 text-xs font-semibold"
                          >
                            Hủy
                          </button>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D4ED8]">
                          <Mail size={14} />
                          Tự động gửi thông báo bài tập tới Gmail của toàn bộ học viên trong lớp
                        </span>
                      </div>
                    </form>
                  )}

                  {/* TEACHER PDF UPLOAD FORM PANEL */}
                  {isTeacher && showMaterialUploadForm && (
                    <form
                      onSubmit={handleUploadMaterial}
                      className="mb-6 grid gap-3 rounded-2xl border border-blue-200 bg-[#F8FAFC] p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Tên tài liệu PDF
                        <input
                          required
                          maxLength={120}
                          value={materialTitle}
                          onChange={(event) => setMaterialTitle(event.target.value)}
                          placeholder="Ví dụ: Tổng hợp từ vựng Part 5–6"
                          className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-900"
                        />
                      </label>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Tệp PDF (Tối đa 10 MiB)
                        <input
                          ref={materialFileInputRef}
                          required
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(event) => setMaterialFile(event.target.files?.[0] || null)}
                          className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-normal normal-case text-slate-700 file:mr-2 file:border-0 file:bg-[#EFF6FF] file:px-2.5 file:py-1 file:font-semibold file:text-[#1D4ED8]"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={busy || !materialFile}
                          className="editorial-button-primary inline-flex min-h-10 items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50"
                        >
                          {busy ? <LoaderCircle className="animate-spin" size={15} /> : <Upload size={15} />}
                          Tải lên
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMaterialUploadForm(false)}
                          className="editorial-button-secondary min-h-10 px-3 py-2 text-xs font-semibold"
                        >
                          Đóng
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SECTION 1: BÀI TẬP TOEIC */}
                  {(classworkTopic === 'ALL' || classworkTopic === 'ASSIGNMENTS') && (
                    <section className="mb-8">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-[#1D4ED8]">
                          <FileText size={20} />
                          <span>Bài tập TOEIC</span>
                        </h3>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {assignments.length} bài tập
                        </span>
                      </div>

                      {assignmentsLoading ? (
                        <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          Đang tải danh sách bài tập…
                        </p>
                      ) : assignmentsError ? (
                        <div
                          role="alert"
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
                        >
                          <span>{assignmentsError}</span>
                          <button
                            type="button"
                            onClick={() => setAssignmentRetry((retry) => retry + 1)}
                            className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold"
                          >
                            Thử lại
                          </button>
                        </div>
                      ) : assignments.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          Chưa có bài tập nào được giao trong lớp.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {assignments.map((assignment) => {
                            const status = assignment.mySubmissionStatus;
                            const deadlineExpired =
                              getDeadlineHint(assignment.deadline, clockNow) === 'Đã quá hạn';
                            const displayStatus =
                              status === 'NOT_SUBMITTED' && deadlineExpired ? 'MISSING' : status;
                            const canSubmit = !(
                              assignment.latePolicy === 'REJECT_AFTER_DEADLINE' && deadlineExpired
                            );

                            return (
                              <article
                                key={assignment.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-blue-300 sm:p-5"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-3.5">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1D4ED8] text-white">
                                      <FileText size={18} />
                                    </span>
                                    <div>
                                      <h4 className="text-base font-bold text-slate-900">{assignment.title}</h4>
                                      <p className="mt-0.5 text-xs font-medium text-slate-600">
                                        Đề thi: <strong>{assignment.testTitle}</strong> · Hạn nộp:{' '}
                                        <span className="font-mono">
                                          {formatVietnamDateTime(assignment.deadline)}
                                        </span>
                                      </p>
                                      {assignment.instructions && (
                                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                          {assignment.instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {!isTeacher && (
                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                        assignment.myLatestSubmissionLate || displayStatus === 'LATE'
                                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                                          : displayStatus === 'MISSING'
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : displayStatus === 'GRADED' || displayStatus === 'SUBMITTED'
                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                              : 'border-slate-200 bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      {getAssignmentStatusLabel(displayStatus, assignment.myLatestSubmissionLate)}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                  <span className="font-mono text-xs text-slate-500">
                                    {getDeadlineHint(assignment.deadline, clockNow) || 'Đang mở'}
                                    {!isTeacher && assignment.myLatestScore != null
                                      ? ` · Điểm gần nhất: ${assignment.myLatestScore}`
                                      : ''}
                                  </span>

                                  {isTeacher ? (
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedAssignmentId(assignment.id);
                                          setActiveTab('GRADES');
                                        }}
                                        className="rounded-full bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-bold text-[#1D4ED8] hover:bg-blue-100"
                                      >
                                        Xem bài nộp và Nhận xét
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => editAssignment(assignment)}
                                        className="editorial-button-secondary rounded-full px-3.5 py-1.5 text-xs font-semibold"
                                      >
                                        Sửa / gia hạn
                                      </button>
                                      <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => archiveAssignment(assignment)}
                                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                      >
                                        <Trash2 size={13} /> Ẩn bài
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      {assignment.myLatestResultId && (
                                        <Link
                                          to={`/results/${assignment.myLatestResultId}`}
                                          className="text-xs font-bold text-[#1D4ED8] hover:underline"
                                        >
                                          Xem bài đã nộp{assignment.myLatestSubmissionLate ? ' (trễ)' : ''} →
                                        </Link>
                                      )}
                                      {canSubmit && (
                                        <Link
                                          to={`/courses/${assignment.testId}/take?assignmentId=${assignment.id}`}
                                          className="rounded-full bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                                        >
                                          {assignment.myLatestResultId ? 'Làm lại bài' : 'Bắt đầu làm'}
                                        </Link>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {/* SECTION 2: TÀI LIỆU HỌC TẬP PDF */}
                  {(classworkTopic === 'ALL' || classworkTopic === 'MATERIALS') && (
                    <section className="mb-8">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-[#1D4ED8]">
                          <BookOpen size={20} />
                          <span>Tài liệu lớp học (PDF)</span>
                        </h3>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {materials.length} tài liệu
                        </span>
                      </div>

                      {materialsLoading ? (
                        <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          Đang tải tài liệu…
                        </p>
                      ) : materialsError ? (
                        <div
                          role="alert"
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
                        >
                          <span>{materialsError}</span>
                          <button
                            type="button"
                            onClick={() => loadMaterials(selectedClass.id, true)}
                            className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold"
                          >
                            Thử lại
                          </button>
                        </div>
                      ) : materials.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          Chưa có tài liệu PDF nào trong lớp.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {materials.map((material) => (
                            <article
                              key={material.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                            >
                              <div className="flex min-w-0 items-start gap-3.5">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                                  <FileText size={18} />
                                </span>
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => material.downloadable && handlePreviewMaterial(material)}
                                    className="break-words text-left font-bold text-slate-900 hover:text-[#1D4ED8] hover:underline"
                                  >
                                    {material.title}
                                  </button>
                                  <p className="mt-0.5 break-all font-mono text-xs text-slate-500">
                                    {material.originalFileName || 'Tài liệu PDF'} ·{' '}
                                    {material.sizeBytes
                                      ? `${(material.sizeBytes / (1024 * 1024)).toFixed(1)} MiB`
                                      : 'Dung lượng cũ chưa có'}{' '}
                                    ·{' '}
                                    {material.createdAt
                                      ? new Date(material.createdAt).toLocaleDateString('vi-VN')
                                      : ''}
                                  </p>
                                  {!material.downloadable && (
                                    <p className="mt-1 text-xs font-medium text-red-700">
                                      Tệp cũ chưa có link tải riêng; giáo viên cần tải lại.
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {material.downloadable && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handlePreviewMaterial(material)}
                                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#EFF6FF] px-4 py-1.5 text-xs font-bold text-[#1D4ED8] transition hover:bg-blue-100"
                                    >
                                      <Eye size={14} />
                                      Xem trước
                                    </button>
                                    <button
                                      type="button"
                                      disabled={downloadingMaterialId === material.id}
                                      onClick={() => handleDownloadMaterial(material)}
                                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                                    >
                                      {downloadingMaterialId === material.id ? (
                                        <LoaderCircle className="animate-spin" size={14} />
                                      ) : (
                                        <Download size={14} />
                                      )}
                                      Tải PDF
                                    </button>
                                  </>
                                )}
                                {isTeacher && (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => handleHideMaterial(material)}
                                    className="min-h-9 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                  >
                                    Ẩn
                                  </button>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* SECTION 3: ĐỀ RIÊNG CỦA LỚP (TEACHER ONLY) */}
                  {isTeacher && (classworkTopic === 'ALL' || classworkTopic === 'TESTS') && (
                    <section>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div>
                          <h3 className="flex items-center gap-2 text-lg font-bold text-[#1D4ED8]">
                            <GraduationCap size={20} />
                            <span>Kho đề riêng của lớp</span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            Chỉ giáo viên lớp này và học viên đã duyệt mới có quyền mở đề.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassroomTest(null);
                            setStudioOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#1D4ED8] bg-[#EFF6FF] px-4 py-1.5 text-xs font-bold text-[#1D4ED8] hover:bg-blue-100"
                        >
                          <Plus size={14} /> Soạn đề riêng mới
                        </button>
                      </div>

                      {classroomTests.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          Lớp chưa có đề riêng nào. Nhấn “Soạn đề riêng mới” để mở Studio.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {classroomTests.map((test) => (
                            <article
                              key={test.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{test.titleTest}</p>
                                <p className="mt-0.5 text-xs font-medium text-slate-600">
                                  {test.status === 'PUBLISHED' ? 'Đã phát hành trong lớp' : 'Bản nháp'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingClassroomTest(test);
                                    setStudioOpen(true);
                                  }}
                                  className="editorial-button-secondary rounded-full px-3.5 py-1.5 text-xs font-semibold"
                                >
                                  Sửa đề
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={async () => {
                                    setBusy(true);
                                    setError('');
                                    try {
                                      const response = await examService.publishClassroomTest(
                                        selectedClass.id,
                                        test.id
                                      );
                                      if (response.code !== 1000) {
                                        throw new Error(response.message || 'Không phát hành được đề.');
                                      }
                                      setNotice('Đã phát hành đề cho học viên trong lớp.');
                                      await refreshClassTests();
                                    } catch (err) {
                                      setError(
                                        err.response?.data?.message ||
                                          err.message ||
                                          'Không phát hành được đề.'
                                      );
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="rounded-full border border-[#1D4ED8] bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-blue-100 disabled:opacity-50"
                                >
                                  {test.status === 'PUBLISHED' ? 'Đã phát hành' : 'Phát hành'}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={async () => {
                                    if (!window.confirm(`Xóa đề “${test.titleTest}” khỏi lớp?`)) return;
                                    setBusy(true);
                                    setError('');
                                    try {
                                      const response = await examService.deleteClassroomTest(
                                        selectedClass.id,
                                        test.id
                                      );
                                      if (response.code !== 1000) {
                                        throw new Error(response.message || 'Không xóa được đề.');
                                      }
                                      setNotice('Đã xóa đề riêng của lớp.');
                                      await refreshClassTests();
                                    } catch (err) {
                                      setError(
                                        err.response?.data?.message ||
                                          err.message ||
                                          'Đề đã giao hoặc đã có kết quả; dữ liệu được giữ nguyên.'
                                      );
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                >
                                  Xóa
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}

              {/* =========================================================
                  TAB 3: MỌI NGƯỜI (PEOPLE) — GOOGLE CLASSROOM ROSTER
              ========================================================= */}
              {activeTab === 'PEOPLE' && (
                <div className="mx-auto max-w-3xl space-y-10 py-2">
                  {/* Teacher Section (Google Classroom clean row layout) */}
                  <section>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-3.5">
                      <h2 className="text-[28px] font-normal tracking-tight text-slate-900">Giáo viên</h2>
                    </div>
                    <div className="divide-y divide-slate-200">
                      <div className="flex items-center justify-between gap-4 py-3.5">
                        <div className="flex items-center gap-4">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1D4ED8] font-mono text-sm font-bold text-white">
                            {(selectedClass.teacherName || 'G').trim().charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{selectedClass.teacherName}</p>
                            {selectedClass.teacherEmail && (
                              <p className="font-mono text-xs text-slate-500">{selectedClass.teacherEmail}</p>
                            )}
                          </div>
                        </div>
                        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 font-mono text-xs font-semibold text-[#1D4ED8]">
                          Chủ lớp học
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Students Section (Google Classroom clean row & empty state layout) */}
                  <section>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3.5">
                      <h2 className="text-[28px] font-normal tracking-tight text-slate-900">Học viên</h2>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {selectedClass.approvedMemberCount ?? 0} học viên
                        </span>
                        {isTeacher && (
                          <>
                            <button
                              type="button"
                              onClick={() => copyCode(selectedClass.classCode)}
                              title="Sao chép mã lớp"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 font-mono text-xs font-semibold text-[#1D4ED8] transition hover:bg-blue-100"
                            >
                              <Clipboard size={13} />
                              {selectedClass.classCode}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInviteModalOpen(true)}
                              title="Mời học viên qua Gmail"
                              aria-label="Mời học viên qua Gmail"
                              className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#1D4ED8]"
                            >
                              <UserPlus size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isTeacher ? (
                      <>
                        {/* Status Filter Tabs & Search */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              ['APPROVED', 'Đã duyệt'],
                              [
                                'PENDING',
                                `Chờ duyệt${selectedClass.pendingMemberCount ? ` (${selectedClass.pendingMemberCount})` : ''}`,
                              ],
                              ['BLOCKED', 'Đã chặn'],
                              ['REMOVED', 'Đã gỡ'],
                            ].map(([st, label]) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setFilterStatus(st)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                  filterStatus === st
                                    ? 'bg-[#1D4ED8] text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          <div className="relative min-w-[220px]">
                            <Search
                              size={15}
                              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={memberSearchQuery}
                              onChange={(event) => setMemberSearchQuery(event.target.value)}
                              placeholder="Tìm tên hoặc email học viên..."
                              className="w-full rounded-full border border-slate-300 bg-white py-1.5 pl-9 pr-3.5 text-xs text-slate-900 outline-none focus:border-[#1D4ED8]"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          {membersLoading ? (
                            <p role="status" className="py-6 text-sm text-slate-600">
                              Đang tải danh sách học viên…
                            </p>
                          ) : membersError ? (
                            <div
                              role="alert"
                              className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
                            >
                              <span>{membersError}</span>
                              <button
                                type="button"
                                onClick={() => loadMembers(selectedClass.id, filterStatus)}
                                className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold"
                              >
                                Thử lại
                              </button>
                            </div>
                          ) : filteredMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <img
                                src={nunaBookImg}
                                alt=""
                                className="h-28 w-28 object-contain opacity-90"
                              />
                              <p className="mt-3 text-sm font-medium text-slate-700">
                                {filterStatus === 'APPROVED' && !memberSearchQuery
                                  ? 'Thêm học viên vào lớp này'
                                  : 'Không có học viên nào trong danh sách này.'}
                              </p>
                              {filterStatus === 'APPROVED' && !memberSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setInviteModalOpen(true)}
                                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[#1D4ED8] transition hover:bg-[#EFF6FF]"
                                >
                                  <UserPlus size={16} />
                                  Mời học viên
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-200">
                              {filteredMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                                >
                                  <div className="flex items-center gap-3.5">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-sm font-bold text-slate-700">
                                      {(member.studentName || 'H').trim().charAt(0).toUpperCase()}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{member.studentName}</p>
                                      <p className="font-mono text-xs text-slate-500">{member.studentEmail}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                  {member.status === 'PENDING' && (
                                    <>
                                      <button
                                        disabled={busy}
                                        onClick={() => handleMemberStatus(member, 'APPROVED')}
                                        className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                      >
                                        <Check size={14} /> Duyệt vào lớp
                                      </button>
                                      <button
                                        disabled={busy}
                                        onClick={() => handleMemberStatus(member, 'REMOVED')}
                                        className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                      >
                                        <X size={14} /> Từ chối
                                      </button>
                                    </>
                                  )}
                                  {member.status === 'APPROVED' && (
                                    <>
                                      <button
                                        disabled={busy}
                                        onClick={() => handleMemberStatus(member, 'BLOCKED')}
                                        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                      >
                                        <ShieldAlert size={14} /> Chặn
                                      </button>
                                      <button
                                        disabled={busy}
                                        onClick={() => handleMemberStatus(member, 'REMOVED')}
                                        className="rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                      >
                                        Gỡ khỏi lớp
                                      </button>
                                    </>
                                  )}
                                  {member.status === 'BLOCKED' && (
                                    <button
                                      disabled={busy}
                                      onClick={() => handleMemberStatus(member, 'APPROVED')}
                                      className="inline-flex items-center gap-1 rounded-full border border-emerald-600 bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                      <Check size={14} /> Mở chặn
                                    </button>
                                  )}
                                </div>
                              </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EFF6FF] font-mono text-sm font-bold text-[#1D4ED8]">
                              {(user?.userName || user?.name || 'B').trim().charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{user?.userName || user?.name || 'Bạn'} (Bạn)</p>
                              <p className="font-mono text-xs text-slate-500">{user?.userEmail || user?.email || ''}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-800">
                            {statusLabels[selectedClass.status] || selectedClass.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* =========================================================
                  TAB 4: ĐIỂM (GRADES) — TEACHER & STUDENT GRADEBOOK
              ========================================================= */}
              {activeTab === 'GRADES' && (
                <div>
                  {isTeacher ? (
                    <div>
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">Sổ điểm và Nhận xét bài nộp</h2>
                          <p className="text-xs text-slate-600">
                            Chọn một bài tập để xem thống kê nộp bài, chấm điểm và gửi nhận xét cho từng học viên.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label="Chọn bài tập để xem điểm"
                            value={selectedAssignmentId}
                            onChange={(event) => setSelectedAssignmentId(event.target.value)}
                            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#1D4ED8]"
                          >
                            <option value="">-- Chọn bài tập --</option>
                            {assignments.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title} (Hạn: {formatVietnamDateTime(a.deadline)})
                              </option>
                            ))}
                          </select>

                          <select
                            aria-label="Sắp xếp danh sách bài nộp"
                            value={`${submissionSort.sortBy}:${submissionSort.direction}`}
                            onChange={(event) => {
                              const [sortBy, direction] = event.target.value.split(':');
                              setSubmissionSort({ sortBy, direction });
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1D4ED8]"
                          >
                            <option value="name:ASC">Tên A–Z</option>
                            <option value="name:DESC">Tên Z–A</option>
                            <option value="score:DESC">Điểm cao đến thấp</option>
                            <option value="score:ASC">Điểm thấp đến cao</option>
                          </select>
                        </div>
                      </div>

                      {!selectedAssignmentId ? (
                        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                          Hãy chọn một bài tập ở thanh phía trên để xem bảng điểm và bài làm của học viên.
                        </p>
                      ) : (
                        <>
                          {!submissionsLoading && !submissionsError && assignmentSummary && (
                            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                              {[
                                ['Đủ điều kiện', assignmentSummary.eligibleStudents],
                                ['Đã nộp', assignmentSummary.submittedCount],
                                ['Nộp trễ', assignmentSummary.lateCount],
                                ['Chưa nộp', assignmentSummary.notSubmittedCount],
                                ['Quá hạn', assignmentSummary.missingCount],
                                ['Đã nhận xét', assignmentSummary.reviewedCount],
                                [
                                  'Điểm TB đã nhận xét',
                                  assignmentSummary.averageScore == null
                                    ? '—'
                                    : Number(assignmentSummary.averageScore).toFixed(1),
                                ],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3"
                                >
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    {label}
                                  </span>
                                  <span className="mt-1 block font-mono text-xl font-bold text-slate-900">
                                    {value}
                                  </span>
                                  {label === 'Điểm TB đã nhận xét' && (
                                    <span className="mt-0.5 block text-[10px] text-slate-500">
                                      {assignmentSummary.averageScoreSubmissionCount} bài hợp lệ
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-3">
                            {submissionsLoading ? (
                              <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                                Đang tải bài nộp của học viên…
                              </p>
                            ) : submissionsError ? (
                              <div
                                role="alert"
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
                              >
                                <span>{submissionsError}</span>
                                <button
                                  type="button"
                                  onClick={() => setSubmissionRetry((retry) => retry + 1)}
                                  className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold"
                                >
                                  Thử lại
                                </button>
                              </div>
                            ) : submissions.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                Chưa có học viên đủ điều kiện trong danh sách này.
                              </p>
                            ) : (
                              submissions.map((submission) => (
                                <div
                                  key={submission.studentId}
                                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="font-bold text-slate-900">{submission.studentName}</p>
                                      <p className="font-mono text-xs text-slate-500">{submission.studentEmail}</p>
                                    </div>
                                    <span
                                      className={`h-fit rounded-full border px-3 py-0.5 text-xs font-semibold ${
                                        submission.late || submission.status === 'LATE'
                                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                                          : submission.status === 'MISSING'
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                      }`}
                                    >
                                      {getAssignmentStatusLabel(submission.status, submission.late)}
                                    </span>
                                  </div>

                                  {submission.resultId ? (
                                    <>
                                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3.5 py-2.5">
                                        <p className="font-mono text-sm font-bold text-slate-900">
                                          Điểm: <span className="text-[#1D4ED8]">{submission.score}</span> ·{' '}
                                          {submission.correctCount}/{submission.totalCount} câu đúng ·{' '}
                                          {submission.submittedAt
                                            ? formatVietnamDateTime(submission.submittedAt)
                                            : ''}
                                        </p>
                                        <Link
                                          to={`/results/${submission.resultId}?classroomReview=1`}
                                          className="text-xs font-bold text-[#1D4ED8] hover:underline"
                                        >
                                          Mở chi tiết bài làm →
                                        </Link>
                                      </div>

                                      <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                                        Nhận xét của giáo viên
                                        <textarea
                                          rows={2}
                                          maxLength={5000}
                                          value={
                                            feedbackDrafts[submission.resultId] ??
                                            submission.teacherComment ??
                                            ''
                                          }
                                          onChange={(event) =>
                                            setFeedbackDrafts((drafts) => ({
                                              ...drafts,
                                              [submission.resultId]: event.target.value,
                                            }))
                                          }
                                          placeholder="Nhập nhận xét chi tiết cho học viên..."
                                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
                                        />
                                      </label>
                                      <button
                                        disabled={
                                          busy ||
                                          !(
                                            feedbackDrafts[submission.resultId] ??
                                            submission.teacherComment ??
                                            ''
                                          ).trim()
                                        }
                                        onClick={() => saveFeedback(submission)}
                                        className="editorial-button-primary mt-2 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                                      >
                                        <MessageSquare size={13} /> Lưu nhận xét
                                      </button>
                                    </>
                                  ) : (
                                    <p className="mt-2 text-sm text-slate-500">Học viên chưa nộp bài.</p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* STUDENT PERSONAL GRADEBOOK */
                    <div>
                      <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Tổng số bài tập
                          </span>
                          <p className="mt-1 font-mono text-2xl font-bold text-slate-900">
                            {studentGradeSummary.total}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Đã hoàn thành
                          </span>
                          <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">
                            {studentGradeSummary.submitted} / {studentGradeSummary.total}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-[#EFF6FF] p-4">
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                            Điểm trung bình của bạn
                          </span>
                          <p className="mt-1 font-mono text-2xl font-bold text-[#1D4ED8]">
                            {studentGradeSummary.avgScore ?? '—'}
                          </p>
                        </div>
                      </div>

                      {assignments.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                          Chưa có bài tập nào để hiển thị điểm số.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {assignments.map((assignment) => {
                            const status = assignment.mySubmissionStatus;
                            const deadlineExpired =
                              getDeadlineHint(assignment.deadline, clockNow) === 'Đã quá hạn';
                            const displayStatus =
                              status === 'NOT_SUBMITTED' && deadlineExpired ? 'MISSING' : status;

                            return (
                              <article
                                key={assignment.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                                      {assignment.testTitle} · Hạn: {formatVietnamDateTime(assignment.deadline)}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {assignment.myLatestScore != null && (
                                      <span className="rounded-lg bg-[#EFF6FF] px-3 py-1 font-mono text-sm font-bold text-[#1D4ED8]">
                                        Điểm: {assignment.myLatestScore}
                                        {assignment.myTotalCount
                                          ? ` (${assignment.myCorrectCount}/${assignment.myTotalCount})`
                                          : ''}
                                      </span>
                                    )}
                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                        assignment.myLatestSubmissionLate || displayStatus === 'LATE'
                                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                                          : displayStatus === 'MISSING'
                                            ? 'border-red-200 bg-red-50 text-red-700'
                                            : displayStatus === 'GRADED' || displayStatus === 'SUBMITTED'
                                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                              : 'border-slate-200 bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      {getAssignmentStatusLabel(displayStatus, assignment.myLatestSubmissionLate)}
                                    </span>
                                  </div>
                                </div>

                                {assignment.myTeacherComment && (
                                  <div className="mt-3 rounded-xl border border-blue-100 bg-[#F8FAFC] p-3 text-xs text-slate-700">
                                    <strong className="text-[#1D4ED8]">Nhận xét của giáo viên:</strong>{' '}
                                    {assignment.myTeacherComment}
                                  </div>
                                )}

                                {assignment.myLatestResultId && (
                                  <div className="mt-3">
                                    <Link
                                      to={`/results/${assignment.myLatestResultId}`}
                                      className="text-xs font-bold text-[#1D4ED8] hover:underline"
                                    >
                                      Xem chi tiết bài nộp →
                                    </Link>
                                  </div>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          MODAL 1: CREATE OR JOIN CLASSROOM
      ========================================================= */}
      {createOrJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                {isTeacher ? (
                  <>
                    <Plus size={18} className="text-[#1D4ED8]" /> Tạo lớp học mới
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="text-[#1D4ED8]" /> Tham gia lớp học
                  </>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setCreateOrJoinModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={isTeacher ? handleCreate : handleJoin} className="mt-4">
              {isTeacher ? (
                <>
                  <label
                    htmlFor="modal-class-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Tên lớp học *
                  </label>
                  <input
                    id="modal-class-name"
                    maxLength={120}
                    required
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="Ví dụ: Luyện thi TOEIC 650+ — CTU"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                  />

                  <label
                    htmlFor="modal-class-description"
                    className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Mô tả / Phòng học / Mục tiêu{' '}
                    <span className="font-normal normal-case text-slate-500">(không bắt buộc)</span>
                  </label>
                  <textarea
                    id="modal-class-description"
                    rows={3}
                    maxLength={2000}
                    value={classDescription}
                    onChange={(event) => setClassDescription(event.target.value)}
                    placeholder="Lịch học, mục tiêu đầu ra hoặc lưu ý cho học viên"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                  />
                </>
              ) : (
                <>
                  <p className="mb-3 text-xs leading-relaxed text-slate-600">
                    Đề nghị giáo viên của bạn cung cấp mã lớp gồm 8 ký tự, sau đó nhập mã vào bên dưới.
                  </p>
                  <label
                    htmlFor="modal-class-code"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Mã lớp (8 ký tự)
                  </label>
                  <input
                    id="modal-class-code"
                    required
                    minLength={8}
                    maxLength={8}
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                    placeholder="Ví dụ: GGVCN5HX"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base uppercase tracking-widest text-slate-900 outline-none focus:border-[#1D4ED8]"
                  />
                </>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOrJoinModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {busy && <LoaderCircle size={14} className="animate-spin" />}
                  {isTeacher ? 'Tạo lớp học' : 'Gửi yêu cầu tham gia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: FULLSCREEN CLASS CODE PROJECTION (Like Google Classroom [ ⛶ ])
      ========================================================= */}
      {fullscreenCodeOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl sm:p-12">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="font-bold text-slate-700">{selectedClass.className}</span>
              <button
                type="button"
                onClick={() => setFullscreenCodeOpen(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-slate-500">
              Mã tham gia lớp học
            </p>
            <p className="my-6 select-all font-mono text-5xl font-bold tracking-[0.16em] text-[#1D4ED8] sm:text-7xl">
              {selectedClass.classCode}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => copyCode(selectedClass.classCode)}
                className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-5 py-2.5 text-sm font-bold text-[#1D4ED8] hover:bg-blue-100"
              >
                <Clipboard size={16} />
                Sao chép mã mời
              </button>
              <button
                type="button"
                onClick={() => setFullscreenCodeOpen(false)}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: REUSE / REPOST ANNOUNCEMENT ("🔁 Đăng lại")
      ========================================================= */}
      {repostModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Repeat size={18} className="text-[#1D4ED8]" />
                Sử dụng lại bài đăng trên Bảng tin
              </h2>
              <button
                type="button"
                onClick={() => setRepostModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {announcements.length === 0 ? (
              <p className="my-6 text-center text-sm text-slate-500">
                Chưa có thông báo cũ nào trong lớp này để sử dụng lại.
              </p>
            ) : (
              <div className="my-4 max-h-72 space-y-2 overflow-y-auto">
                {announcements.map((ann) => (
                  <button
                    key={ann.id}
                    type="button"
                    onClick={() => {
                      setAnnouncementTitle(ann.title || '');
                      setAnnouncementContent(ann.content || '');
                      setRepostModalOpen(false);
                      setComposerOpen(true);
                    }}
                    className="block w-full rounded-xl border border-slate-200 p-3.5 text-left transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"
                  >
                    <p className="text-sm font-bold text-slate-900">{ann.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{ann.content}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRepostModalOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: GOOGLE CLASSROOM PDF PREVIEWER MODAL
      ========================================================= */}
      {previewModal.open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-xs">
          {/* Top Viewer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 text-white sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-600 text-white">
                <FileText size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-white sm:text-base">
                  {previewModal.material?.title || 'Xem trước tài liệu PDF'}
                </h2>
                <p className="truncate font-mono text-[11px] text-slate-300">
                  {previewModal.material?.originalFileName || 'Tai-lieu.pdf'}
                  {previewModal.material?.sizeBytes
                    ? ` · ${(previewModal.material.sizeBytes / (1024 * 1024)).toFixed(1)} MiB`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {previewModal.blobUrl && previewModal.googleViewerUrl && (
                <div className="flex items-center rounded-full bg-slate-800 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModal((current) => ({ ...current, mode: 'DIRECT' }))
                    }
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      previewModal.mode === 'DIRECT'
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Trình xem trực tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModal((current) => ({ ...current, mode: 'GOOGLE' }))
                    }
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      previewModal.mode === 'GOOGLE'
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Google Viewer
                  </button>
                </div>
              )}

              {(previewModal.blobUrl || previewModal.googleViewerUrl) && (
                <a
                  href={
                    previewModal.mode === 'DIRECT' && previewModal.blobUrl
                      ? previewModal.blobUrl
                      : previewModal.googleViewerUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                >
                  <ExternalLink size={14} />
                  Mở tab mới
                </a>
              )}

              {previewModal.material?.downloadable && (
                <button
                  type="button"
                  onClick={() => handleDownloadMaterial(previewModal.material)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Download size={14} />
                  Tải PDF
                </button>
              )}

              <button
                type="button"
                onClick={closePreviewModal}
                aria-label="Đóng bản xem trước"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* PDF Iframe Content */}
          <div className="flex flex-1 items-center justify-center p-2 sm:p-5">
            {previewModal.loading ? (
              <div className="flex flex-col items-center gap-3 text-center text-white">
                <LoaderCircle size={32} className="animate-spin text-blue-400" />
                <p className="text-sm font-semibold">Đang tải bản xem trước tài liệu PDF…</p>
              </div>
            ) : previewModal.error ? (
              <div className="max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 text-center text-white">
                <p className="text-sm font-semibold text-red-300">{previewModal.error}</p>
                {previewModal.material?.downloadable && (
                  <button
                    type="button"
                    onClick={() => handleDownloadMaterial(previewModal.material)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <Download size={14} />
                    Tải trực tiếp tệp PDF
                  </button>
                )}
              </div>
            ) : (
              <iframe
                title={previewModal.material?.title || 'PDF Preview'}
                src={
                  previewModal.mode === 'DIRECT' && previewModal.blobUrl
                    ? previewModal.blobUrl
                    : previewModal.googleViewerUrl
                }
                className="h-full w-full max-w-6xl rounded-xl border border-slate-700 bg-white shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: GOOGLE CLASSROOM BULK GMAIL INVITATION MODAL ("👤+ Mời học viên")
      ========================================================= */}
      {inviteModalOpen && selectedClass && isTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                  <UserPlus size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mời học viên vào lớp học</h2>
                  <p className="text-xs text-slate-500">
                    Lớp: <strong className="text-slate-700">{selectedClass.className}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteStudents} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="invite-emails-input"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Danh sách địa chỉ Gmail học viên *
                </label>
                <p className="mb-2 text-xs leading-relaxed text-slate-500">
                  Nhập hoặc dán hàng loạt Gmail (cách nhau bằng dấu phẩy, khoảng trắng hoặc xuống dòng). Học viên đã có tài khoản sẽ được thêm thẳng vào lớp và nhận email thông báo qua Gmail.
                </p>

                <div className="min-h-[104px] rounded-xl border border-slate-300 bg-[#F8FAFC] p-2.5 focus-within:border-[#1D4ED8] focus-within:bg-white">
                  {inviteEmailChips.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {inviteEmailChips.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1 font-mono text-xs font-semibold text-[#1D4ED8]"
                        >
                          <Mail size={12} />
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => removeInviteChip(email)}
                            className="rounded-full p-0.5 text-[#1D4ED8] hover:bg-blue-200/60"
                            aria-label={`Xóa ${email}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    id="invite-emails-input"
                    rows={inviteEmailChips.length > 0 ? 2 : 3}
                    value={inviteEmailInput}
                    onChange={(event) => setInviteEmailInput(event.target.value)}
                    onKeyDown={handleInviteInputKeyDown}
                    onPaste={handleInviteInputPaste}
                    onBlur={() => {
                      if (inviteEmailInput.trim()) {
                        commitEmailInputToChips(inviteEmailInput);
                      }
                    }}
                    placeholder="Ví dụ: hocvien1@gmail.com, hocvien2@gmail.com, hocvien3@student.ctu.edu.vn..."
                    className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                {inviteEmailChips.length > 0 && (
                  <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Đã chọn <strong className="text-[#1D4ED8]">{inviteEmailChips.length}</strong> địa chỉ Gmail
                    </span>
                    <button
                      type="button"
                      onClick={() => setInviteEmailChips([])}
                      className="font-semibold text-red-600 hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="invite-custom-message"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Lời nhắn gửi kèm trong Gmail{' '}
                  <span className="font-normal normal-case text-slate-500">(không bắt buộc)</span>
                </label>
                <textarea
                  id="invite-custom-message"
                  rows={2}
                  maxLength={1000}
                  value={inviteMessage}
                  onChange={(event) => setInviteMessage(event.target.value)}
                  placeholder="Ví dụ: Chào các em, đây là lớp luyện đề TOEIC học kỳ này. Các em vào lớp để xem lịch học và làm bài tập tuần 1 nhé!"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div className="rounded-xl border border-blue-100 bg-[#F8FAFC] p-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Liên kết mời trực tiếp kèm mã lớp:</span>
                  <span className="font-mono font-bold text-[#1D4ED8]">{selectedClass.classCode}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    busy ||
                    (inviteEmailChips.length === 0 && parseEmailsFromRaw(inviteEmailInput).length === 0)
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#1D4ED8] px-5 py-2 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
                >
                  {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                  Gửi lời mời qua Gmail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =========================================================
          MODAL 6: GOOGLE CLASSROOM CUSTOMIZE APPEARANCE ("Tuỳ chỉnh giao diện")
      ========================================================= */}
      {customizeBannerOpen && selectedClass && isTeacher && (() => {
        const previewTheme = findBannerTheme(draftThemeColor, 'slate');
        const previewBannerSrc = resolveBannerImageSrc(draftBannerUrl);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
            <form
              onSubmit={handleSaveCustomizeModal}
              className="w-full max-w-[540px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">Tuỳ chỉnh giao diện</h2>
                <button
                  type="button"
                  onClick={() => setCustomizeBannerOpen(false)}
                  aria-label="Đóng hộp thoại tuỳ chỉnh giao diện"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Live Banner Preview (matching Google Classroom screenshot) */}
              <div
                style={
                  previewBannerSrc
                    ? {
                        backgroundImage: `linear-gradient(115deg, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.25) 100%), url(${previewBannerSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
                className={`relative mt-4 flex h-32 items-end overflow-hidden rounded-xl p-4 text-white ${
                  previewBannerSrc ? 'bg-slate-800' : previewTheme.bgClass
                }`}
              >
                {!previewBannerSrc && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 360 140"
                    className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-85"
                  >
                    <g transform="translate(135, 18) rotate(12)">
                      <rect x="0" y="18" width="52" height="72" rx="6" fill="#0F172A" opacity="0.25" />
                      <rect x="4" y="22" width="44" height="62" rx="3" fill="#E0F2FE" opacity="0.9" />
                    </g>
                    <g transform="translate(215, 14) rotate(-10)">
                      <rect x="0" y="0" width="110" height="76" rx="8" fill="#1E293B" opacity="0.25" />
                      <rect x="6" y="6" width="98" height="64" rx="4" fill="#BAE6FD" opacity="0.9" />
                      <circle cx="88" cy="54" r="18" fill="#FFFFFF" opacity="0.35" />
                    </g>
                  </svg>
                )}
                <div className="relative z-10 min-w-0">
                  <p className="truncate text-base font-bold text-white drop-shadow-xs">
                    {classEditForm.className || selectedClass.className}
                  </p>
                  <p className="truncate text-xs text-white/90">
                    GV: {selectedClass.teacherName}
                  </p>
                </div>
              </div>

              {/* Row 1: Select header image (Chọn ảnh / Tải ảnh lên) */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-normal text-slate-700">
                  Chọn hình ảnh tiêu đề cho bảng tin
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetPickerOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      presetPickerOpen
                        ? 'bg-[#1D4ED8] text-white'
                        : 'bg-[#D2E3FC]/75 text-[#1967D2] hover:bg-[#D2E3FC]'
                    }`}
                  >
                    <ImageIcon size={14} />
                    Chọn ảnh
                  </button>
                  <button
                    type="button"
                    disabled={bannerUploading}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#D2E3FC]/75 px-4 py-2 text-xs font-semibold text-[#1967D2] transition hover:bg-[#D2E3FC] disabled:opacity-50"
                  >
                    {bannerUploading ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {bannerUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                  </button>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerUploadFile}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preset Gallery Picker (shown when "Chọn ảnh" is clicked) */}
              {presetPickerOpen && (
                <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
                  {BANNER_PRESETS.map((preset) => {
                    const isSelected = (draftBannerUrl || '') === preset.id;
                    return (
                      <button
                        key={preset.id || 'default'}
                        type="button"
                        onClick={() => setDraftBannerUrl(preset.id)}
                        className={`group relative overflow-hidden rounded-lg border text-left transition ${
                          isSelected
                            ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/25'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {preset.image ? (
                          <img
                            src={preset.image}
                            alt={preset.label}
                            className="h-14 w-full object-cover"
                          />
                        ) : (
                          <div className={`h-14 w-full ${previewTheme.bgClass}`} />
                        )}
                        <span className="block truncate bg-white px-2 py-1 text-[11px] font-medium text-slate-700">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Row 2: 8 Circular Theme Color Swatches */}
              <div className="mt-5">
                <p className="text-sm font-normal text-slate-700">Chọn màu giao diện</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {BANNER_THEMES.map((theme) => {
                    const isSelected = draftThemeColor === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        title={theme.name}
                        aria-label={theme.name}
                        aria-pressed={isSelected}
                        onClick={() => setDraftThemeColor(theme.id)}
                        style={{
                          backgroundColor: theme.swatchBg,
                          borderColor: theme.swatchBorder,
                        }}
                        className={`grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                          isSelected ? 'scale-105 ring-2 ring-[#1967D2]/30 ring-offset-1' : 'hover:scale-105'
                        }`}
                      >
                        {isSelected && <Check size={18} style={{ color: theme.checkColor }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Collapsible Class Name & Description Editor */}
              <div className="mt-5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditInfoExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1D4ED8]"
                >
                  <Pencil size={13} />
                  <span>{editInfoExpanded ? 'Ẩn chỉnh sửa tên và mô tả lớp' : 'Chỉnh sửa tên và mô tả lớp học'}</span>
                </button>
                {editInfoExpanded && (
                  <div className="mt-3 space-y-2.5">
                    <input
                      required
                      maxLength={120}
                      value={classEditForm.className}
                      onChange={(event) =>
                        setClassEditForm((form) => ({ ...form, className: event.target.value }))
                      }
                      placeholder="Tên lớp học"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                    />
                    <textarea
                      rows={2}
                      maxLength={2000}
                      value={classEditForm.description}
                      onChange={(event) =>
                        setClassEditForm((form) => ({ ...form, description: event.target.value }))
                      }
                      placeholder="Mô tả hoặc lịch học của lớp..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer: Huỷ & Lưu */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={busy || bannerUploading}
                  onClick={() => setCustomizeBannerOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[#1967D2] transition hover:bg-blue-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={busy || bannerUploading}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1967D2] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#1557B0] disabled:opacity-50"
                >
                  {busy && <LoaderCircle size={14} className="animate-spin" />}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
};

export default ClassroomsPage;
