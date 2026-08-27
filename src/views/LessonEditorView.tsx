import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  FileText, 
  Video, 
  Headphones, 
  Eye, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Sliders, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Play, 
  Pause, 
  ExternalLink,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Package,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Download,
  Hash,
  FileCheck,
  Copy,
  Check,
  Smartphone,
  HelpCircle,
  Award,
  Star,
  Compass,
  BookMarked,
  CheckCircle2,
  FolderPlus,
  FileUp,
  FileCheck2,
  CheckSquare,
  FileDown,
  FolderTree,
  Library,
  BookOpen,
  Volume2,
  VolumeX,
  Film,
  Music,
  Maximize2,
  FileAudio,
  FileVideo,
  RotateCcw,
  Pencil,
  X
} from 'lucide-react';
import { 
  Lesson, 
  SlideItem, 
  SlideSet,
  SlideSetStatus,
  ContentSection, 
  QuoteQuiz,
  VideoItem, 
  AudioItem, 
  PublishStatus,
  OfflinePackage,
  OfflineManifestFile,
  PptxProcessingJob,
  LessonSection,
  LessonItem,
  LessonQuestion,
  SourceDocument,
  QuestionType
} from '../types';
import { api } from '../services/api';
import { naturalSortFilenames } from '../utils/naturalSort';
import { DongSonDrum } from '../components/DongSonMotif';
import { parseDocumentFile, generateQuestionsForContent, ParsedDocumentResult } from '../utils/documentParser';

// Uncle Ho Navy / Military Teaching Templates for Quick-Fill
const UNCLE_HO_PRESETS = [
  {
    name: 'Lời dạy Bác Hồ tại Vạn Hoa (15/3/1961) về Biển đảo',
    title: '1. Lời dạy của Bác Hồ về giữ gìn chủ quyền biển, đảo',
    quote: 'Ngày trước ta chỉ có đêm và rừng, ngày nay ta có ngày, có trời, có biển. Bờ biển ta dài, tươi đẹp, ta phải biết giữ gìn lấy nó.',
    quoteAuthor: 'Chủ tịch Hồ Chí Minh (Ngày 15/3/1961 khi về thăm Bộ đội Hải quân tại Vạn Hoa, Hải Phòng)',
    quoteHistoricalContext: 'Lời căn dặn lịch sử của Bác Hồ khi về thăm Trường Sĩ quan Hải quân và Trung đoàn 171, trở thành kim chỉ nam cho mọi thế hệ cán bộ, chiến sĩ Hải quân.',
    bodyHtml: `<p>Chủ tịch Hồ Chí Minh khẳng định biển, đảo là một bộ phận lãnh thổ thiêng liêng của Tổ quốc có vị trí chiến lược đặc biệt quan trọng về kinh tế, chính trị, quốc phòng và an ninh.</p>
<p>Người căn dặn cán bộ, chiến sĩ phải ra sức học tập, nâng cao trình độ kỹ chiến thuật, làm chủ vũ khí trang bị kỹ thuật hiện đại để hoàn thành xuất sắc nhiệm vụ bảo vệ biển đảo quê hương.</p>`,
    quiz: {
      enabled: true,
      question: 'Câu nói: "Ngày trước ta chỉ có đêm và rừng, ngày nay ta có ngày, có trời, có biển. Bờ biển ta dài, tươi đẹp, ta phải biết giữ gìn lấy nó" được Bác Hồ căn dặn bộ đội Hải quân vào thời gian nào và mang ý nghĩa cốt lõi gì?',
      options: [
        'Ngày 15/3/1961 tại Vạn Hoa (Hải Phòng) - Khẳng định tầm nhìn chiến lược về biển đảo và trách nhiệm bảo vệ chủ quyền biển, thềm lục địa thiêng liêng của Tổ quốc',
        'Ngày 19/5/1955 tại Cửa Lò (Nghệ An) - Động viên thành lập Cục Phòng thủ bờ biển',
        'Ngày 22/12/1944 tại Cao Bằng - Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân',
        'Ngày 02/9/1945 tại Quảng trường Ba Đình - Đọc Tuyên ngôn Độc lập'
      ],
      correctOptionIndex: 0,
      explanation: 'Chính xác! Lời dạy lịch sử ngày 15/3/1961 tại Vạn Hoa là định hướng chiến lược to lớn, nhắc nhở mỗi cán bộ, chiến sĩ Vùng 4 Hải quân hôm nay phải luôn nêu cao tinh thần cảnh giác, rèn luyện làm chủ vùng biển được phân công.',
      rewardProgressPercent: 100
    }
  },
  {
    name: 'Lời dạy Bác Hồ về Xây dựng Đoàn kết nội bộ & Kỷ luật',
    title: '1. Lời Bác Hồ dạy về Đoàn kết và Kỷ luật quân đội',
    quote: 'Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.',
    quoteAuthor: 'Chủ tịch Hồ Chí Minh',
    quoteHistoricalContext: 'Bác Hồ luôn coi đoàn kết là sức mạnh vô địch, nhân tố quyết định mọi thắng lợi của cách mạng và quân đội.',
    bodyHtml: `<p>Trong môi trường hoạt động đặc thù trên các tàu chiến và điểm đảo xa xôi, tinh thần đoàn kết nội bộ, thương yêu đồng chí đồng đội gắn kết như ruột thịt là sức mạnh cội nguồn để chiến thắng mọi gian nan, thử thách.</p>`,
    quiz: {
      enabled: true,
      question: 'Hành động nào dưới đây thể hiện đúng nhất tinh thần thực hiện lời dạy của Bác Hồ về xây dựng đoàn kết trong đơn vị Hải quân?',
      options: [
        'Gương mẫu chấp hành nghiêm kỷ luật quân đội, thương yêu giúp đỡ đồng chí đồng đội cùng tiến bộ, hiệp đồng chặt chẽ trong huấn luyện và trực sẵn sàng chiến đấu',
        'Chỉ tập trung vào nhiệm vụ của cá nhân mình, không cần hỗ trợ đồng đội',
        'Tùy tiện chia sẻ thông tin đơn vị lên mạng xã hội',
        'Né tránh việc tự phê bình và phê bình trong chi bộ'
      ],
      correctOptionIndex: 0,
      explanation: 'Chính xác! Lời dạy của Bác đòi hỏi mỗi quân nhân phát huy cao độ tinh thần tương thân tương ái, kỷ luật tự giác và tinh thần trách nhiệm tập thể.',
      rewardProgressPercent: 100
    }
  },
  {
    name: 'Lời dạy Bác Hồ về Cần kiệm liêm chính, Giữ gìn vũ khí khí tài',
    title: '1. Lời Bác dạy về bảo quản, làm chủ VKTBKT',
    quote: 'Quân khí là đứa con thứ hai của người lính. Phải yêu xe như con, quý xăng như máu, giữ gìn vũ khí trang bị thật tốt.',
    quoteAuthor: 'Chủ tịch Hồ Chí Minh',
    quoteHistoricalContext: 'Lời căn dặn của Bác về công tác kỹ thuật quân sự, tiết kiệm của công và làm chủ trang thiết bị trong quân đội.',
    bodyHtml: `<p>Mỗi cán bộ, chiến sĩ Vùng 4 Hải quân phải thực hiện nghiêm Cuộc vận động 50 "Quản lý, khai thác VKTBKT tốt, bền, an toàn, tiết kiệm và an toàn giao thông".</p>`,
    quiz: {
      enabled: true,
      question: 'Để thực hiện tốt lời dạy của Bác về quản lý và làm chủ vũ khí trang bị kỹ thuật (VKTBKT), cán bộ chiến sĩ cần thực hiện phương châm nào?',
      options: [
        'Quản lý, khai thác VKTBKT tốt, bền, an toàn, tiết kiệm và an toàn giao thông',
        'Chỉ bảo dưỡng VKTBKT khi chuẩn bị đi biển kiểm tra',
        'Tự ý cải tiến vũ khí không thông qua cơ quan kỹ thuật',
        'Chỉ tập trung huấn luyện lý thuyết, hạn chế thực hành thao tác'
      ],
      correctOptionIndex: 0,
      explanation: 'Chính xác! Cuộc vận động 50 là sự cụ thể hóa sinh động lời dạy của Bác Hồ về công tác kỹ thuật trong toàn quân và Quân chủng Hải quân.',
      rewardProgressPercent: 100
    }
  }
];

interface LessonEditorViewProps {
  lesson: Lesson;
  onBack: () => void;
  onPreview: (lesson: Lesson) => void;
  onLessonUpdated: (updatedLesson: Lesson) => void;
}

export const LessonEditorView: React.FC<LessonEditorViewProps> = ({
  lesson,
  onBack,
  onPreview,
  onLessonUpdated,
}) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(lesson);
  const [activeModuleTab, setActiveModuleTab] = useState<'slides' | 'contents' | 'videos' | 'audios'>('slides');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lesson Title Inline Edit States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lessonTitle, setLessonTitle] = useState(lesson?.title || '');

  // Keep title in sync if currentLesson or initial lesson prop changes
  useEffect(() => {
    if (!isEditingTitle) {
      setLessonTitle(currentLesson?.title || '');
    }
  }, [currentLesson?.title, isEditingTitle]);

  // Slides data
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [isProcessingPptx, setIsProcessingPptx] = useState(false);
  const [isUploadingBatchImages, setIsUploadingBatchImages] = useState(false);

  // Contents data
  const [contents, setContents] = useState<ContentSection[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [contentFormData, setContentFormData] = useState<Partial<ContentSection>>({
    title: '',
    bodyHtml: '',
    quote: '',
    quoteAuthor: '',
    quoteHistoricalContext: '',
    isUncleHoTeaching: false,
    quoteQuiz: {
      enabled: false,
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      rewardProgressPercent: 100
    }
  });

  // Videos data
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Audios data
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loadingAudios, setLoadingAudios] = useState(true);

  // Slide Image Set Pipeline states
  const [slideSet, setSlideSet] = useState<SlideSet | null>(null);
  const [pendingSlideFiles, setPendingSlideFiles] = useState<{ id: string; file: File; name: string; previewUrl: string }[]>([]);
  const [slideSetNameInput, setSlideSetNameInput] = useState<string>('');
  const [hasUnnumberedWarning, setHasUnnumberedWarning] = useState<boolean>(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number; successCount: number; failCount: number; currentFileName?: string }>({ 
    current: 0, 
    total: 0, 
    percent: 0, 
    successCount: 0, 
    failCount: 0 
  });
  const [failedSlideBatchItems, setFailedSlideBatchItems] = useState<Array<{ order: number; file: File; fileName: string; error: string }>>([]);
  const [isPublishingSet, setIsPublishingSet] = useState<boolean>(false);
  const [showDeleteSlideSetConfirm, setShowDeleteSlideSetConfirm] = useState<boolean>(false);
  const [isDeletingSet, setIsDeletingSet] = useState<boolean>(false);
  const [replacingSlideId, setReplacingSlideId] = useState<string | null>(null);
  const [isReplacingSlide, setIsReplacingSlide] = useState<boolean>(false);

  // Modals & Form States
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [slideFormData, setSlideFormData] = useState<Partial<SlideItem>>({});

  // Video Management States
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState<Partial<VideoItem>>({ durationSeconds: 0 });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadStep, setVideoUploadStep] = useState<string>('');
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<VideoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [isReplacingVideo, setIsReplacingVideo] = useState(false);
  const [replacingVideoId, setReplacingVideoId] = useState<string | null>(null);

  // Audio Management States
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioFormData, setAudioFormData] = useState<Partial<AudioItem>>({ durationSeconds: 0 });
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadStep, setAudioUploadStep] = useState<string>('');
  const [selectedAudioForPlay, setSelectedAudioForPlay] = useState<AudioItem | null>(null);
  const [editingAudio, setEditingAudio] = useState<AudioItem | null>(null);
  const [audioToDelete, setAudioToDelete] = useState<AudioItem | null>(null);
  const [isDeletingAudio, setIsDeletingAudio] = useState(false);
  const [isReplacingAudio, setIsReplacingAudio] = useState(false);
  const [replacingAudioId, setReplacingAudioId] = useState<string | null>(null);

  const [offlinePackage, setOfflinePackage] = useState<any | null>(null);
  const [loadingOfflinePackage, setLoadingOfflinePackage] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [isRebuildingPackage, setIsRebuildingPackage] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  const [showPreUploadModal, setShowPreUploadModal] = useState(false);
  const [selectedPptxFile, setSelectedPptxFile] = useState<File | null>(null);
  const [duplicateJobWarning, setDuplicateJobWarning] = useState<any | null>(null);
  const [isUploadingPptxFile, setIsUploadingPptxFile] = useState(false);
  const [pptxJob, setPptxJob] = useState<any | null>(null);
  const [isRetryingPptx, setIsRetryingPptx] = useState(false);

  // New Document Structure & Hierarchy State (PHẦN -> MỤC -> CÂU HỎI)
  const [sections, setSections] = useState<LessonSection[]>([]);
  const [items, setItems] = useState<LessonItem[]>([]);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [sourceDoc, setSourceDoc] = useState<SourceDocument | null>(null);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [docUploadStepText, setDocUploadStepText] = useState<string>('');
  const [docErrorDetails, setDocErrorDetails] = useState<string | null>(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [parsedProposal, setParsedProposal] = useState<ParsedDocumentResult | null>(null);
  const [showPresetsLibrary, setShowPresetsLibrary] = useState(false);
  const [isSavingStructuredContent, setIsSavingStructuredContent] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveTitle = async () => {
    if (!lessonTitle.trim()) {
      showToast('Tiêu đề không được để trống!');
      return;
    }
    try {
      setIsSaving(true);
      const updated = await api.updateLessonTitle(currentLesson.id, lessonTitle.trim());
      const updatedLessonObj = { 
        ...currentLesson, 
        title: lessonTitle.trim(), 
        updatedAt: updated?.updatedAt || new Date().toISOString() 
      };
      setCurrentLesson(updatedLessonObj);
      if (onLessonUpdated) {
        onLessonUpdated(updatedLessonObj);
      }
      setIsEditingTitle(false);
      showToast('Đã cập nhật tiêu đề bài học thành công!');
    } catch (err: any) {
      showToast('❌ Lỗi cập nhật tiêu đề: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditTitle = () => {
    setLessonTitle(currentLesson?.title || '');
    setIsEditingTitle(false);
  };

  // Realtime Listeners for SlideSet & Slides
  useEffect(() => {
    if (!currentLesson?.id) return;
    const unsubSet = api.subscribeSlideSet(currentLesson.id, (set) => {
      setSlideSet(set);
    });
    const unsubSlides = api.subscribeSlides(currentLesson.id, (slideItems) => {
      setSlides(slideItems);
    });
    return () => {
      unsubSet();
      unsubSlides();
    };
  }, [currentLesson?.id]);

  const loadOfflinePackage = async () => {
    try {
      setLoadingOfflinePackage(true);
      const pkg = await api.getOfflinePackage(lesson.id);
      setOfflinePackage(pkg);
    } catch (e) {
      console.warn('Could not load offline package:', e);
    } finally {
      setLoadingOfflinePackage(false);
    }
  };

  // Load all module data including structured sections & items
  const loadStructuredData = async () => {
    try {
      const [docRes, secRes, itemsRes, qRes] = await Promise.all([
        api.getSourceDocument(lesson.id),
        api.getSections(lesson.id),
        api.getItems(lesson.id),
        api.getQuestions(lesson.id)
      ]);
      setSourceDoc(docRes);
      setSections(secRes);
      setItems(itemsRes);
      setQuestions(qRes);

      if (secRes.length > 0) {
        setActiveSectionId(secRes[0].id);
        const secItems = itemsRes.filter(i => i.sectionId === secRes[0].id);
        if (secItems.length > 0) {
          setActiveItemId(secItems[0].id);
        }
      }
    } catch (e) {
      console.warn('Lỗi khi tải cấu trúc tài liệu GDCT:', e);
    }
  };

  const loadModuleData = async () => {
    try {
      setLoadingSlides(true);
      setLoadingContents(true);
      setLoadingVideos(true);
      setLoadingAudios(true);

      const [slidesRes, contentsRes, videosRes, audiosRes] = await Promise.all([
        api.getSlides(lesson.id),
        api.getContents(lesson.id),
        api.getVideos(lesson.id),
        api.getAudios(lesson.id)
      ]);

      setSlides(slidesRes);
      setContents(contentsRes);
      setVideos(videosRes);
      setAudios(audiosRes);
      await loadStructuredData();
      loadOfflinePackage();
    } catch (err) {
      console.error('Error loading module data:', err);
    } finally {
      setLoadingSlides(false);
      setLoadingContents(false);
      setLoadingVideos(false);
      setLoadingAudios(false);
    }
  };

  const handleRebuildOfflinePackage = async () => {
    try {
      setIsRebuildingPackage(true);
      const res = await api.rebuildOfflinePackage(currentLesson.id);
      if (res.success && res.offlinePackage) {
        setOfflinePackage(res.offlinePackage);
        const updatedLesson = {
          ...currentLesson,
          version: res.offlinePackage.version
        };
        setCurrentLesson(updatedLesson);
        onLessonUpdated(updatedLesson);
        showToast(`Đã tái tạo gói Offline Package v${res.offlinePackage.version} thành công!`);
      }
    } catch (err) {
      showToast('Lỗi khi tái tạo gói offline');
    } finally {
      setIsRebuildingPackage(false);
    }
  };

  const copyChecksumToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
    showToast('Đã sao chép mã SHA-256 Checksum');
  };

  // Document Parser & Proposal Handlers
  const handleDocFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocErrorDetails(null);
    try {
      setIsParsingDoc(true);

      // STEP 1: Upload to Cloudinary
      setDocUploadStepText('① Đang upload Cloudinary...');
      const cloudResult = await api.uploadDocumentFile(file, currentLesson.id);
      if (!cloudResult || !cloudResult.secureUrl) {
        throw new Error('Upload lên Cloudinary không trả về secureUrl hợp lệ.');
      }

      // STEP 2: Save metadata to Firestore
      setDocUploadStepText('② Đã lưu Cloudinary ✓');
      const docExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase().replace('.', '');
      const docMeta: Partial<SourceDocument> = {
        name: file.name,
        fileName: file.name,
        originalName: file.name,
        type: (['pdf', 'doc', 'docx'].includes(docExt) ? docExt : 'docx') as any,
        size: file.size,
        fileSize: file.size,
        url: cloudResult.secureUrl,
        secureUrl: cloudResult.secureUrl,
        cloudinaryUrl: cloudResult.secureUrl,
        cloudinaryPublicId: cloudResult.publicId,
        assetFolder: cloudResult.assetFolder || `GDCT_V4/TAILIEU/${currentLesson.id}`,
        cloudinaryFolder: cloudResult.assetFolder || `GDCT_V4/TAILIEU/${currentLesson.id}`,
        resourceType: cloudResult.resourceType || 'raw',
        format: docExt,
        mimeType: file.type || 'application/octet-stream',
        status: 'READY',
        createdAt: new Date().toISOString()
      };

      const savedDoc = await api.saveSourceDocument(currentLesson.id, docMeta);
      setSourceDoc(savedDoc);

      // STEP 3 & 4: Read and Analyze Document
      setDocUploadStepText('③ Đang đọc tài liệu...');
      await new Promise(r => setTimeout(r, 100));
      setDocUploadStepText('④ Đang phân tích...');
      const res = await parseDocumentFile(file, (stage) => setDocUploadStepText(`④ ${stage}`));

      // Update pageCount if available
      if (res.pageCount && res.pageCount > 0) {
        savedDoc.pageCount = res.pageCount;
        await api.saveSourceDocument(currentLesson.id, savedDoc);
      }

      // STEP 5 & 6: Create Structure & Wait for Admin Confirmation
      setDocUploadStepText('⑤ Đã tạo cấu trúc');
      setParsedProposal(res);

      setDocUploadStepText('⑥ Chờ Admin xác nhận');
      setProposalModalOpen(true);
      showToast('Đã đọc tài liệu & tải lên Cloudinary thành công! Kiểm tra cấu trúc đề xuất.');
    } catch (err: any) {
      console.error('Error in handleDocFileSelect:', err);
      const errMsg = err?.message || 'Không thể đọc hoặc tải tệp tài liệu này';
      setDocErrorDetails(err?.stack || String(err));
      showToast('❌ Lỗi xử lý tài liệu: ' + errMsg);
    } finally {
      setIsParsingDoc(false);
      e.target.value = '';
    }
  };

  const handleParseExistingDoc = async () => {
    if (!sourceDoc) return;
    if (parsedProposal) {
      setProposalModalOpen(true);
      return;
    }
    const docUrl = sourceDoc.cloudinaryUrl || sourceDoc.secureUrl || sourceDoc.url;
    if (!docUrl) {
      showToast('⚠️ Không tìm thấy URL tài liệu trên Cloudinary');
      return;
    }
    try {
      setIsParsingDoc(true);
      setDocUploadStepText('③ Đang tải tệp từ Cloudinary...');
      const resp = await fetch(docUrl);
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' khi tải từ Cloudinary');
      const blob = await resp.blob();
      const docFile = new File([blob], sourceDoc.name || sourceDoc.fileName || 'document.docx', {
        type: sourceDoc.mimeType || blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      setDocUploadStepText('④ Đang phân tích cấu trúc...');
      const res = await parseDocumentFile(docFile, (stage) => setDocUploadStepText(`④ ${stage}`));
      setParsedProposal(res);
      setDocUploadStepText('⑥ Chờ Admin xác nhận');
      setProposalModalOpen(true);
      showToast('Đã đọc & phân tích tài liệu từ Cloudinary thành công!');
    } catch (err: any) {
      console.error('Lỗi khi đọc tài liệu từ Cloudinary:', err);
      showToast('❌ Lỗi đọc từ Cloudinary: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsParsingDoc(false);
    }
  };

  const [showDeleteDocModal, setShowDeleteDocModal] = useState(false);

  const handleExecuteDeleteSourceDoc = async () => {
    if (!sourceDoc) return;
    setShowDeleteDocModal(false);
    try {
      setIsParsingDoc(true);
      setDocUploadStepText('Đang xóa tài liệu & làm sạch bài học...');
      const res = await api.deleteSourceDocumentCascade(
        currentLesson.id,
        sourceDoc.id,
        sourceDoc.cloudinaryPublicId || (sourceDoc as any).storagePath || '',
        (sourceDoc.resourceType as any) || 'raw'
      );
      
      // Reset full document and lesson states to initial empty dropzone state
      setSourceDoc(null);
      setParsedProposal(null);
      setSections([]);
      setItems([]);
      setQuestions([]);
      setActiveSectionId(null);
      setActiveItemId(null);
      
      showToast(res?.message || 'Đã xóa tài liệu trên Cloudinary và toàn bộ cấu trúc bài học thành công!');
    } catch (err: any) {
      console.error('Error deleting source document cascade:', err);
      showToast('❌ Lỗi xóa tài liệu: ' + (err.message || 'Lỗi hệ thống'));
      await loadStructuredData();
    } finally {
      setIsParsingDoc(false);
      setDocUploadStepText('');
    }
  };

  const handleConfirmProposal = async () => {
    if (!parsedProposal) return;
    try {
      setIsSavingStructuredContent(true);
      setDocUploadStepText('⑦ Đang đưa vào bài học...');
      let secOrder = 1;
      let createdCountSec = 0;
      let createdCountItems = 0;

      const targetSections = parsedProposal.proposedSections || parsedProposal.sections || [];
      if (targetSections.length === 0) {
        showToast('⚠️ Không tìm thấy Phần/Mục nào trong tài liệu.');
        return;
      }

      for (const proposedSec of targetSections) {
        const newSec = await api.createSection(currentLesson.id, {
          title: proposedSec.title || `PHẦN ${secOrder}`,
          order: secOrder++,
          sourceDocumentId: sourceDoc?.id || `doc-${currentLesson.id}`
        });

        // Automatically create 1 essay question per section
        await api.createQuestion(currentLesson.id, '', {
          sectionId: newSec.id,
          type: 'essay',
          question: `Qua các nội dung đã học trong ${newSec.title}, đồng chí hãy trình bày những nội dung trọng tâm cần ghi nhớ liên quan đến tài liệu đã nghiên cứu.`,
          maxScore: 10,
          required: true,
          sourceDocumentId: sourceDoc?.id || `doc-${currentLesson.id}`,
          order: 99
        });

        let itemOrder = 1;
        const targetItems = proposedSec.items || [];
        for (const proposedItem of targetItems) {
          const newItem = await api.createItem(currentLesson.id, newSec.id, {
            title: proposedItem.title || `Mục ${itemOrder}`,
            content: proposedItem.bodyHtml || '<p>Nội dung đang cập nhật...</p>',
            bodyHtml: proposedItem.bodyHtml || '<p>Nội dung đang cập nhật...</p>',
            sourceDocumentId: sourceDoc?.id || `doc-${currentLesson.id}`,
            paragraphs: proposedItem.paragraphs || [],
            order: itemOrder++
          });
          createdCountItems++;
          if (proposedItem.questions && proposedItem.questions.length > 0) {
            let qOrder = 1;
            for (const pq of proposedItem.questions) {
              await api.createQuestion(currentLesson.id, newItem.id, {
                question: pq.question,
                type: (pq.type || 'single_choice') as QuestionType,
                options: pq.options || ['A', 'B', 'C', 'D'],
                correctAnswer: pq.correctAnswer ?? 0,
                explanation: pq.explanation || '',
                sourceDocumentId: sourceDoc?.id || `doc-${currentLesson.id}`,
                order: qOrder++,
                points: 10
              });
            }
          }
        }
        createdCountSec++;
      }

      // Update source document status to 'published'
      if (sourceDoc) {
        const updatedDoc = await api.saveSourceDocument(currentLesson.id, {
          ...sourceDoc,
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setSourceDoc(updatedDoc);
      }

      setDocUploadStepText('⑦ Đã đưa vào bài học ✓');
      setProposalModalOpen(false);
      showToast(`Đã đưa toàn bộ vào bài học thành công: ${createdCountSec} phần, ${createdCountItems} mục!`);
      await loadStructuredData();
    } catch (err: any) {
      console.error('Error confirming proposal:', err);
      showToast('Lỗi khi lưu cấu trúc đề xuất: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsSavingStructuredContent(false);
    }
  };

  // Structured CRUD Handlers
  const handleAddSection = async () => {
    try {
      const nextOrder = sections.length + 1;
      const newSec = await api.createSection(currentLesson.id, {
        title: `PHẦN ${nextOrder}: NỘI DUNG GIÁO DỤC CHÍNH TRỊ`,
        order: nextOrder
      });
      setSections([...sections, newSec]);
      setActiveSectionId(newSec.id);
      showToast('Đã thêm Phần mới');
    } catch (e) {
      showToast('Lỗi khi thêm Phần mới');
    }
  };

  const handleUpdateSectionTitle = async (secId: string, newTitle: string) => {
    setSections(sections.map(s => s.id === secId ? { ...s, title: newTitle } : s));
    await api.updateSection(secId, { title: newTitle });
  };

  const handleClearAllStructure = async () => {
    if (!confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ CẤU TRÚC BÀI HỌC VÀ CÁC CÂU HỎI LIÊN QUAN KHÔNG?\n\n- Toàn bộ các Phần, Mục, nội dung giảng dạy và câu hỏi kiểm tra sẽ bị xóa hoàn toàn.\n- Trả giao diện về trạng thái ban đầu (Chưa có Phần nào trong bài học).')) {
      return;
    }

    try {
      setIsParsingDoc(true);
      const res = await api.deleteAllLessonContent(currentLesson.id);
      setSections([]);
      setItems([]);
      setQuestions([]);
      setSourceDoc(null);
      setParsedProposal(null);
      setActiveSectionId(null);
      setActiveItemId(null);
      showToast(res?.message || 'Đã xóa toàn bộ cấu trúc bài học thành công!');
    } catch (err: any) {
      console.error('Error clearing all structure:', err);
      showToast('❌ Lỗi khi xóa toàn bộ cấu trúc: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setIsParsingDoc(false);
    }
  };

  const handleDeleteSection = async (secId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const sec = sections.find(s => s.id === secId);
    const secItems = items.filter(i => i.sectionId === secId);
    const secItemIds = new Set(secItems.map(i => i.id));
    const secQuestions = questions.filter(q => q.sectionId === secId || (q.itemId && secItemIds.has(q.itemId)));
    if (!confirm(`XÓA PHẦN "${sec?.title || 'Này'}"?\nThao tác này sẽ xóa ${secItems.length} mục nội dung và ${secQuestions.length} câu hỏi kiểm tra cuối phần cùng tiến độ học tập liên quan.`)) return;

    // Cập nhật State bất biến (Immutability) chuẩn React
    setSections(prevSections => {
      const filtered = prevSections.filter(s => s.id !== secId);
      return filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
    setItems(prevItems => prevItems.filter(i => i.sectionId !== secId));
    setQuestions(prevQuestions => prevQuestions.filter(q => q.sectionId !== secId && (!q.itemId || !secItemIds.has(q.itemId))));

    if (activeSectionId === secId) {
      const remainingSections = sections.filter(s => s.id !== secId);
      if (remainingSections.length > 0) {
        const nextSec = remainingSections[0];
        setActiveSectionId(nextSec.id);
        const nextSecItems = items.filter(i => i.sectionId === nextSec.id);
        setActiveItemId(nextSecItems.length > 0 ? nextSecItems[0].id : null);
      } else {
        setActiveSectionId(null);
        setActiveItemId(null);
      }
    }

    try {
      await api.deleteSectionCascade(currentLesson.id, secId);
      showToast('Đã xóa Phần và toàn bộ nội dung liên quan thành công!');
    } catch (err: any) {
      console.error('Error deleting section:', err);
      showToast('❌ Lỗi xóa Phần: ' + (err.message || 'Lỗi hệ thống'));
      await loadStructuredData();
    }
  };

  const handleAddItem = async (secId: string) => {
    try {
      const secItems = items.filter(i => i.sectionId === secId);
      const nextOrder = secItems.length + 1;
      const newItem = await api.createItem(currentLesson.id, secId, {
        title: `Mục ${nextOrder}. Tiêu đề nội dung giáo dục`,
        bodyHtml: '<p>Nhập nội dung giảng dạy chi tiết tại đây...</p>',
        order: nextOrder
      });
      setItems([...items, newItem]);
      setActiveItemId(newItem.id);
      showToast('Đã thêm Mục mới');
    } catch (e) {
      showToast('Lỗi khi thêm Mục mới');
    }
  };

  const handleUpdateActiveItem = async (updates: Partial<LessonItem>) => {
    if (!activeItemId) return;
    setItems(items.map(i => i.id === activeItemId ? { ...i, ...updates } : i));
    await api.updateItem(activeItemId, updates);
  };

  const handleDeleteItem = async (itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const item = items.find(i => i.id === itemId);
    if (!confirm(`Bạn có chắc chắn muốn xóa mục "${item?.title || 'này'}" không?`)) return;

    // Cập nhật State bất biến (Immutability) chuẩn React
    setItems(prevItems => prevItems.filter(i => i.id !== itemId));
    setQuestions(prevQuestions => prevQuestions.filter(q => q.itemId !== itemId));

    if (activeItemId === itemId) {
      const remainingInSameSec = items.filter(i => i.sectionId === activeSectionId && i.id !== itemId);
      if (remainingInSameSec.length > 0) {
        setActiveItemId(remainingInSameSec[0].id);
      } else {
        setActiveItemId(null);
      }
    }

    try {
      await api.deleteItemCascade(itemId);
      showToast('Đã xóa Mục thành công!');
    } catch (err: any) {
      console.error('Error deleting item:', err);
      showToast('❌ Lỗi xóa Mục: ' + (err.message || 'Lỗi hệ thống'));
      await loadStructuredData();
    }
  };

  const handleAddQuestionToItem = async (itemId: string) => {
    try {
      const itemQs = questions.filter(q => q.itemId === itemId);
      const nextOrder = itemQs.length + 1;
      const newQ = await api.createQuestion(currentLesson.id, itemId, {
        question: `Câu hỏi đánh giá nhận thức số ${nextOrder}?`,
        type: 'single_choice',
        options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
        correctAnswer: 0,
        explanation: 'Giải thích ý nghĩa tư tưởng và bài học thực tiễn.',
        order: nextOrder,
        points: 10
      });
      setQuestions([...questions, newQ]);
      showToast('Đã thêm câu hỏi đánh giá mới');
    } catch (e) {
      showToast('Lỗi khi thêm câu hỏi');
    }
  };

  const handleQuestionTypeChange = async (qId: string, newType: QuestionType) => {
    const currentQ = questions.find(q => q.id === qId);
    if (!currentQ) return;

    let updates: Partial<LessonQuestion> = { type: newType };

    if (newType === 'short_answer' || newType === 'essay') {
      // Clear multiple choice options to avoid validation errors and clutter
      updates.options = [];
      updates.correctAnswer = typeof currentQ.correctAnswer === 'string' ? currentQ.correctAnswer : (currentQ.explanation || '');
    } else if (newType === 'true_false') {
      updates.options = ['Đúng', 'Sai'];
      updates.correctAnswer = typeof currentQ.correctAnswer === 'number' && currentQ.correctAnswer <= 1 ? currentQ.correctAnswer : 0;
    } else if (newType === 'multiple_choice') {
      updates.options = (currentQ.options && currentQ.options.length >= 2)
        ? currentQ.options
        : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
      updates.correctAnswer = Array.isArray(currentQ.correctAnswer)
        ? currentQ.correctAnswer
        : [typeof currentQ.correctAnswer === 'number' ? currentQ.correctAnswer : 0];
    } else {
      // single_choice
      updates.options = (currentQ.options && currentQ.options.length >= 2)
        ? currentQ.options
        : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
      updates.correctAnswer = typeof currentQ.correctAnswer === 'number'
        ? currentQ.correctAnswer
        : (Array.isArray(currentQ.correctAnswer) && currentQ.correctAnswer.length > 0 ? currentQ.correctAnswer[0] : 0);
    }

    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updates } : q));
    try {
      await api.updateQuestion(qId, updates);
    } catch (err) {
      console.error('Error updating question type:', err);
    }
  };

  const handleUpdateQuestion = async (qId: string, updates: Partial<LessonQuestion>) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q));
    await api.updateQuestion(qId, updates);
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await api.deleteQuestion(qId);
      setQuestions(questions.filter(q => q.id !== qId));
      showToast('Đã xóa câu hỏi');
    } catch (err: any) {
      console.error('Error deleting question:', err);
      showToast('❌ Lỗi xóa câu hỏi: ' + (err.message || 'Lỗi hệ thống'));
    }
  };

  const handleAiSuggestQuestions = async (item: LessonItem) => {
    try {
      const generated = generateQuestionsForContent(item.title, item.bodyHtml);
      let qOrder = questions.filter(q => q.itemId === item.id).length + 1;
      const createdQs: LessonQuestion[] = [];
      for (const gq of generated) {
        const newQ = await api.createQuestion(currentLesson.id, item.id, {
          question: gq.question,
          type: gq.type as QuestionType,
          options: gq.options,
          correctAnswer: gq.correctAnswer ?? 0,
          explanation: gq.explanation,
          order: qOrder++,
          points: 10
        });
        createdQs.push(newQ);
      }
      setQuestions([...questions, ...createdQs]);
      showToast(`Đã tự động khởi tạo ${createdQs.length} câu hỏi đánh giá theo chuẩn GDCT!`);
    } catch (e) {
      showToast('Lỗi khi tạo câu hỏi tự động');
    }
  };

  useEffect(() => {
    setCurrentLesson(lesson);
    loadModuleData();
  }, [lesson.id]);

  // Handle Module Toggle (Realtime Sync)
  const handleToggleModule = async (key: keyof Lesson['moduleConfig']) => {
    try {
      const updatedConfig = {
        ...currentLesson.moduleConfig,
        [key]: !currentLesson.moduleConfig[key]
      };
      const updated = await api.updateModuleConfig(currentLesson.id, updatedConfig);
      setCurrentLesson(updated);
      onLessonUpdated(updated);
      showToast(`Đã ${updatedConfig[key] ? 'BẬT' : 'TẮT'} module ${key.replace('show', '')} và đồng bộ realtime!`);
    } catch {
      showToast('Lỗi khi cập nhật cấu hình module');
    }
  };

  // Handle Status & Version Change (Publish / Unpublish)
  const handleChangeStatus = async (newStatus: PublishStatus) => {
    try {
      setIsSaving(true);
      const updated = await api.updateLesson(currentLesson.id, {
        status: newStatus
      });
      setCurrentLesson(updated);
      onLessonUpdated(updated);
      showToast(`Đã chuyển trạng thái thành "${newStatus}". Phiên bản bài học tăng lên v${updated.version}`);
    } catch {
      showToast('Lỗi cập nhật trạng thái');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // SLIDE MODULE HANDLERS (Image Folder Batch Pipeline)
  // -------------------------------------------------------------
  const handleSelectSlideImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files) as File[];

    // Reject PPT/PPTX immediately with explicit requirement message
    const hasPptx = fileArray.some(f => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      return ext === '.ppt' || ext === '.pptx';
    });

    if (hasPptx) {
      showToast('❌ Vui lòng xuất PowerPoint thành bộ ảnh trước khi tải lên.');
      if (e.target) e.target.value = '';
      return;
    }

    // Filter valid image files (.png, .jpg, .jpeg, .webp)
    const validImageFiles = fileArray.filter(f => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });

    if (validImageFiles.length === 0) {
      showToast('Không tìm thấy tệp ảnh slide hợp lệ (.png, .jpg, .jpeg, .webp) trong thư mục.');
      if (e.target) e.target.value = '';
      return;
    }

    // Apply natural sorting on filenames
    const { sorted, hasUnnumbered } = naturalSortFilenames(validImageFiles);
    setHasUnnumberedWarning(hasUnnumbered);

    // Create preview objects
    const staged = sorted.map((file: File, idx: number) => ({
      id: `pending-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    }));

    setPendingSlideFiles(staged);
    if (!slideSetNameInput) {
      setSlideSetNameInput(`Bộ Slide: ${currentLesson.title}`);
    }

    showToast(`Đã nhận ${staged.length} slide. Vui lòng kiểm tra danh sách xem trước trước khi bấm "XÁC NHẬN & TẢI LÊN".`);
    if (e.target) e.target.value = '';
  };

  const handleAddMorePendingSlides = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files) as File[];
    const validImages = fileArray.filter(f => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });

    if (validImages.length === 0) {
      showToast('Vui lòng chọn ảnh hợp lệ (.png, .jpg, .jpeg, .webp).');
      return;
    }

    const newStaged = validImages.map((file: File, idx: number) => ({
      id: `pending-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    }));

    const combined = [...pendingSlideFiles, ...newStaged];
    setPendingSlideFiles(combined);
    showToast(`Đã thêm ${newStaged.length} slide mới vào danh sách xem trước.`);
    if (e.target) e.target.value = '';
  };

  const handleMovePendingSlide = (index: number, direction: 'up' | 'down') => {
    const newArr = [...pendingSlideFiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setPendingSlideFiles(newArr);
  };

  const handleDeletePendingSlide = (index: number) => {
    setPendingSlideFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplacePendingSlide = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      showToast('Vui lòng chọn ảnh PNG, JPG, JPEG hoặc WEBP.');
      return;
    }

    const updatedItem = {
      id: `pending-${Date.now()}-${index}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file)
    };

    setPendingSlideFiles(prev => {
      const arr = [...prev];
      arr[index] = updatedItem;
      return arr;
    });
    showToast(`Đã thay thế slide số ${index + 1}.`);
    if (e.target) e.target.value = '';
  };

  const handleConfirmUploadBatch = async () => {
    if (pendingSlideFiles.length === 0) return;

    try {
      setIsUploadingBatch(true);
      setFailedSlideBatchItems([]);
      setUploadProgress({ current: 0, total: pendingSlideFiles.length, percent: 0, successCount: 0, failCount: 0 });

      const filesToUpload = pendingSlideFiles.map(p => p.file);

      const result = await api.uploadSlideSetBatch({
        courseId: currentLesson.courseId || 'general_course',
        lessonId: currentLesson.id,
        setName: slideSetNameInput || `Bộ Slide: ${currentLesson.title}`,
        files: filesToUpload,
        concurrency: 4,
        onProgress: (info) => {
          setUploadProgress({
            current: info.completed,
            total: info.total,
            percent: info.percent,
            successCount: info.successCount,
            failCount: info.failCount,
            currentFileName: info.currentFileName
          });
        }
      });

      if (result.failCount > 0) {
        setFailedSlideBatchItems(result.failedSlides.map(f => ({ order: f.order, file: f.file, fileName: f.fileName, error: f.error })));
        showToast(`Tải lên hoàn tất: ${result.successCount} thành công, ${result.failCount} thất bại. Có thể nhấn "THỬ LẠI CÁC SLIDE THẤT BẠI".`);
      } else {
        setPendingSlideFiles([]);
        setFailedSlideBatchItems([]);
        showToast(`🚀 Tải lên thành công 100% (${result.successCount} slide)! Trạng thái: CHỜ XUẤT BẢN.`);
      }

      setSlideSet(result.slideSet);
      if (result.slides && result.slides.length > 0) {
        setSlides(result.slides);
      }
    } catch (err: any) {
      showToast(`Lỗi tải lên bộ slide: ${err.message || 'Lỗi xử lý'}`);
    } finally {
      setIsUploadingBatch(false);
    }
  };

  const handleRetryFailedBatch = async () => {
    if (failedSlideBatchItems.length === 0 || !slideSet) return;

    try {
      setIsUploadingBatch(true);
      const retryList = [...failedSlideBatchItems];
      setUploadProgress({ current: 0, total: retryList.length, percent: 0, successCount: 0, failCount: 0 });

      const result = await api.retryFailedSlidesBatch({
        courseId: currentLesson.courseId || 'general_course',
        lessonId: currentLesson.id,
        slideSetId: slideSet.id,
        failedItems: retryList.map(i => ({ order: i.order, file: i.file, fileName: i.fileName })),
        concurrency: 4,
        onProgress: (info) => {
          setUploadProgress({
            current: info.completed,
            total: info.total,
            percent: info.percent,
            successCount: info.successCount,
            failCount: info.failCount
          });
        }
      });

      if (result.remainingFailed.length > 0) {
        setFailedSlideBatchItems(result.remainingFailed);
        showToast(`Đã thử lại: ${result.retriedSlides.length} thành công, ${result.remainingFailed.length} vẫn thất bại.`);
      } else {
        setFailedSlideBatchItems([]);
        setPendingSlideFiles([]);
        showToast('🚀 Đã tải lên lại thành công toàn bộ slide bị thất bại trước đó!');
      }
    } catch (err: any) {
      showToast(`Lỗi khi thử lại slide: ${err.message || 'Lỗi xử lý'}`);
    } finally {
      setIsUploadingBatch(false);
    }
  };

  const handlePublishSlideSet = async () => {
    if (!slideSet) return;
    try {
      setIsPublishingSet(true);
      const updatedSet = await api.publishSlideSet(slideSet.id, currentLesson.id, slideSet.version);
      setSlideSet(updatedSet);
      showToast('🚀 Đã xuất bản Bộ Slide bài giảng! Học viên trên app GDCT có thể xem ngay bây giờ.');
    } catch (err: any) {
      showToast(`Lỗi xuất bản bộ slide: ${err.message}`);
    } finally {
      setIsPublishingSet(false);
    }
  };

  const handleReplaceSingleSlide = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      showToast('Định dạng tệp không hợp lệ! Vui lòng chọn tệp ảnh PNG, JPG, JPEG hoặc WEBP.');
      if (e.target) e.target.value = '';
      return;
    }

    try {
      setIsReplacingSlide(true);
      setReplacingSlideId(slideId);
      showToast(`Đang tải ảnh slide mới (${file.name}) lên Cloudinary...`);

      const updated = await api.replaceSlideImage(
        slideId,
        currentLesson.id,
        currentLesson.courseId || 'general_course',
        file
      );

      setSlides(prev => prev.map(s => s.id === slideId ? updated : s));
      showToast('Đã thay thế slide thành công!');
    } catch (err: any) {
      showToast(`Lỗi thay thế slide: ${err.message}`);
    } finally {
      setIsReplacingSlide(false);
      setReplacingSlideId(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteSlideSetConfirm = async () => {
    if (!slideSet) return;
    try {
      setIsDeletingSet(true);
      await api.deleteSlideSet(slideSet.id, currentLesson.id);
      setSlideSet(null);
      setSlides([]);
      setShowDeleteSlideSetConfirm(false);
      showToast('Đã xóa bộ slide bài giảng.');
    } catch (err: any) {
      showToast(`Lỗi xóa bộ slide: ${err.message}`);
    } finally {
      setIsDeletingSet(false);
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.imageUrl) return;
    try {
      const newSlide = await api.createSlide(currentLesson.id, {
        ...slideFormData,
        order: slides.length + 1
      });
      setSlides([...slides, newSlide]);
      setIsSlideModalOpen(false);
      setSlideFormData({ title: '', imageUrl: '', notes: '', width: 1920, height: 1080 });
      showToast('Đã thêm slide bài giảng mới');
    } catch {
      showToast('Lỗi thêm slide');
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa slide này?')) return;
    try {
      await api.deleteSlide(id);
      setSlides(slides.filter((s) => s.id !== id));
      showToast('Đã xóa slide thành công');
    } catch {
      showToast('Lỗi xóa slide');
    }
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);
    await api.reorderSlides(currentLesson.id, newSlides.map((s) => s.id));
    showToast('Đã cập nhật thứ tự slide');
  };

  // -------------------------------------------------------------
  // CONTENT MODULE HANDLERS (With Uncle Ho Teachings & Quiz)
  // -------------------------------------------------------------
  const handleOpenNewContent = () => {
    setEditingContentId(null);
    setContentFormData({
      title: `${contents.length + 1}. Lời dạy của Bác Hồ đối với Bộ đội Hải quân`,
      bodyHtml: '<p>Quán triệt sâu sắc lời căn dặn của Chủ tịch Hồ Chí Minh vào từng nhiệm vụ huấn luyện, trực sẵn sàng chiến đấu, làm chủ vùng biển đảo thiêng liêng của Tổ quốc.</p>',
      quote: 'Ngày trước ta chỉ có đêm và rừng, ngày nay ta có ngày, có trời, có biển. Bờ biển ta dài, tươi đẹp, ta phải biết giữ gìn lấy nó.',
      quoteAuthor: 'Chủ tịch Hồ Chí Minh (Ngày 15/3/1961 khi về thăm Bộ đội Hải quân tại Vạn Hoa, Hải Phòng)',
      quoteHistoricalContext: 'Lời căn dặn lịch sử của Bác Hồ khi về thăm Trường Sĩ quan Hải quân và Trung đoàn 171, trở thành kim chỉ nam cho mọi thế hệ cán bộ, chiến sĩ Hải quân.',
      isUncleHoTeaching: true,
      quoteQuiz: {
        enabled: true,
        question: 'Câu nói: "Ngày trước ta chỉ có đêm và rừng, ngày nay ta có ngày, có trời, có biển. Bờ biển ta dài, tươi đẹp, ta phải biết giữ gìn lấy nó" được Bác Hồ căn dặn bộ đội Hải quân vào thời gian nào và mang ý nghĩa cốt lõi gì?',
        options: [
          'Ngày 15/3/1961 tại Vạn Hoa (Hải Phòng) - Khẳng định tầm nhìn chiến lược về biển đảo và trách nhiệm bảo vệ chủ quyền biển, thềm lục địa thiêng liêng của Tổ quốc',
          'Ngày 19/5/1955 tại Cửa Lò (Nghệ An) - Động viên thành lập Cục Phòng thủ bờ biển',
          'Ngày 22/12/1944 tại Cao Bằng - Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân',
          'Ngày 02/9/1945 tại Quảng trường Ba Đình - Đọc Tuyên ngôn Độc lập'
        ],
        correctOptionIndex: 0,
        explanation: 'Chính xác! Lời dạy lịch sử ngày 15/3/1961 tại Vạn Hoa là định hướng chiến lược to lớn, nhắc nhở mỗi cán bộ, chiến sĩ Vùng 4 Hải quân hôm nay phải luôn nêu cao tinh thần cảnh giác, rèn luyện làm chủ vùng biển được phân công.',
        rewardProgressPercent: 100
      }
    });
  };

  const handleApplyUncleHoPreset = (presetIndex: number) => {
    const p = UNCLE_HO_PRESETS[presetIndex];
    if (!p) return;
    setContentFormData(prev => ({
      ...prev,
      title: p.title,
      quote: p.quote,
      quoteAuthor: p.quoteAuthor,
      quoteHistoricalContext: p.quoteHistoricalContext,
      bodyHtml: p.bodyHtml,
      isUncleHoTeaching: true,
      quoteQuiz: {
        enabled: p.quiz.enabled,
        question: p.quiz.question,
        options: [...p.quiz.options],
        correctOptionIndex: p.quiz.correctOptionIndex,
        explanation: p.quiz.explanation,
        rewardProgressPercent: p.quiz.rewardProgressPercent
      }
    }));
    showToast(`Đã áp dụng mẫu: ${p.name}`);
  };

  const handleEditContent = (content: ContentSection) => {
    setEditingContentId(content.id);
    setContentFormData({
      title: content.title,
      bodyHtml: content.bodyHtml,
      quote: content.quote || '',
      quoteAuthor: content.quoteAuthor || '',
      quoteHistoricalContext: content.quoteHistoricalContext || '',
      isUncleHoTeaching: content.isUncleHoTeaching ?? (!!content.quote),
      quoteQuiz: content.quoteQuiz ? {
        enabled: content.quoteQuiz.enabled ?? true,
        question: content.quoteQuiz.question || '',
        options: content.quoteQuiz.options && content.quoteQuiz.options.length >= 4 
          ? [...content.quoteQuiz.options]
          : [
              content.quoteQuiz.options?.[0] || '',
              content.quoteQuiz.options?.[1] || '',
              content.quoteQuiz.options?.[2] || '',
              content.quoteQuiz.options?.[3] || ''
            ],
        correctOptionIndex: content.quoteQuiz.correctOptionIndex ?? 0,
        explanation: content.quoteQuiz.explanation || '',
        rewardProgressPercent: content.quoteQuiz.rewardProgressPercent ?? 100
      } : {
        enabled: false,
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        rewardProgressPercent: 100
      }
    });
  };

  const handleSaveContent = async () => {
    if (!contentFormData.title?.trim()) return;

    try {
      if (editingContentId) {
        const updated = await api.updateContent(editingContentId, contentFormData);
        setContents(contents.map((c) => (c.id === editingContentId ? updated : c)));
        showToast('Đã cập nhật mục nội dung & trắc nghiệm');
      } else {
        const created = await api.createContent(currentLesson.id, {
          ...contentFormData,
          order: contents.length + 1
        });
        setContents([...contents, created]);
        showToast('Đã thêm mục nội dung mới');
      }
      setEditingContentId(null);
      setContentFormData({
        title: '',
        bodyHtml: '',
        quote: '',
        quoteAuthor: '',
        quoteHistoricalContext: '',
        isUncleHoTeaching: false,
        quoteQuiz: {
          enabled: false,
          question: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          explanation: '',
          rewardProgressPercent: 100
        }
      });
    } catch {
      showToast('Lỗi lưu nội dung');
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục nội dung này?')) return;
    try {
      await api.deleteContent(id);
      setContents(contents.filter((c) => c.id !== id));
      showToast('Đã xóa mục nội dung');
    } catch {
      showToast('Lỗi xóa nội dung');
    }
  };

  // Helper to extract media duration client-side
  const getMediaDurationClient = (file: File, type: 'video' | 'audio'): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const element = document.createElement(type);
        element.preload = 'metadata';
        element.onloadedmetadata = () => {
          const dur = element.duration;
          URL.revokeObjectURL(url);
          resolve(isNaN(dur) ? 0 : Math.round(dur));
        };
        element.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };
        element.src = url;
      } catch {
        resolve(0);
      }
    });
  };

  const formatMediaDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // VIDEO MODULE HANDLERS
  // -------------------------------------------------------------
  // Direct Upload Video from Local Computer
  const handleUploadVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setVideoUploadStep('① Đang tải file Video lên Cloudinary (GDCT_V4/VIDEOS)...');

      const clientDur = await getMediaDurationClient(file, 'video');
      const cloudRes = await api.uploadVideoFile(file, currentLesson.id);

      setVideoUploadStep('② Đang lưu thông tin vào cơ sở dữ liệu...');
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').trim();
      const dur = (cloudRes.duration && cloudRes.duration > 0) ? Math.round(cloudRes.duration) : clientDur;
      const sizeMb = Math.round((cloudRes.bytes / (1024 * 1024)) * 100) / 100;

      const created = await api.createVideo(currentLesson.id, {
        title: cleanTitle || 'Video tư liệu mới',
        description: `Video tư liệu giáo dục chính trị: ${file.name}`,
        videoUrl: cloudRes.secureUrl,
        cloudinaryUrl: cloudRes.secureUrl,
        cloudinaryPublicId: cloudRes.publicId,
        storagePath: cloudRes.publicId,
        assetFolder: cloudRes.assetFolder || `GDCT_V4/VIDEOS/${currentLesson.id}`,
        mimeType: cloudRes.mimeType,
        fileSize: cloudRes.bytes,
        fileSizeMb: sizeMb,
        resourceType: 'video',
        thumbnail: cloudRes.thumbnailUrl,
        durationSeconds: dur,
        order: videos.length + 1
      });

      setVideos(prev => [...prev, created]);
      showToast(`Đã tải lên và lưu video "${created.title}" thành công!`);
    } catch (err: any) {
      console.error('Error uploading video:', err);
      showToast(`❌ Lỗi tải video: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadStep('');
      if (e.target) e.target.value = '';
    }
  };

  // Replace Video File
  const handleReplaceVideoFile = async (e: React.ChangeEvent<HTMLInputElement>, videoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetVideo = videos.find(v => v.id === videoId);
    if (!targetVideo) return;

    try {
      setIsReplacingVideo(true);
      setReplacingVideoId(videoId);
      showToast(`Đang thay thế tệp video "${targetVideo.title}"...`);

      const updated = await api.replaceVideoFile(videoId, currentLesson.id, file, targetVideo.cloudinaryPublicId);
      setVideos(prev => prev.map(v => v.id === videoId ? updated : v));
      showToast(`Đã thay thế tệp video thành công!`);
    } catch (err: any) {
      console.error('Error replacing video:', err);
      showToast(`❌ Lỗi thay thế video: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsReplacingVideo(false);
      setReplacingVideoId(null);
      if (e.target) e.target.value = '';
    }
  };

  // Save Edit Video Info (Rename & Description)
  const handleSaveEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    try {
      const updated = await api.updateVideo(editingVideo.id, {
        title: editingVideo.title,
        description: editingVideo.description
      });
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? updated : v));
      setEditingVideo(null);
      showToast('Đã cập nhật thông tin video');
    } catch (err: any) {
      showToast('Lỗi cập nhật thông tin video');
    }
  };

  // Execute Delete Video
  const handleExecuteDeleteVideo = async () => {
    if (!videoToDelete) return;
    try {
      setIsDeletingVideo(true);
      await api.deleteVideoCascade(currentLesson.id, videoToDelete.id, videoToDelete.cloudinaryPublicId);
      setVideos(prev => prev.filter(v => v.id !== videoToDelete.id));
      showToast(`Đã xóa video "${videoToDelete.title}" khỏi Cloudinary và bài học`);
      setVideoToDelete(null);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      showToast(`❌ Lỗi xóa video: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title || !videoFormData.videoUrl) return;
    try {
      const created = await api.createVideo(currentLesson.id, {
        ...videoFormData,
        order: videos.length + 1
      });
      setVideos([...videos, created]);
      setIsVideoModalOpen(false);
      setVideoFormData({ title: '', description: '', videoUrl: '', thumbnail: '', durationSeconds: 600 });
      showToast('Đã thêm video tư liệu');
    } catch {
      showToast('Lỗi thêm video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    const v = videos.find(item => item.id === id);
    if (v) {
      setVideoToDelete(v);
    }
  };

  // -------------------------------------------------------------
  // AUDIO MODULE HANDLERS
  // -------------------------------------------------------------
  // Direct Upload Audio from Local Computer
  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAudio(true);
      setAudioUploadStep('① Đang tải file Audio lên Cloudinary (GDCT_V4/AUDIO)...');

      const clientDur = await getMediaDurationClient(file, 'audio');
      const cloudRes = await api.uploadAudioFile(file, currentLesson.id);

      setAudioUploadStep('② Đang lưu thông tin vào cơ sở dữ liệu...');
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').trim();
      const dur = (cloudRes.duration && cloudRes.duration > 0) ? Math.round(cloudRes.duration) : clientDur;
      const sizeMb = Math.round((cloudRes.bytes / (1024 * 1024)) * 100) / 100;

      const created = await api.createAudio(currentLesson.id, {
        title: cleanTitle || 'Audio bài giảng mới',
        description: `Audio phát thanh & giảng dạy: ${file.name}`,
        audioUrl: cloudRes.secureUrl,
        cloudinaryUrl: cloudRes.secureUrl,
        cloudinaryPublicId: cloudRes.publicId,
        storagePath: cloudRes.publicId,
        assetFolder: cloudRes.assetFolder || `GDCT_V4/AUDIO/${currentLesson.id}`,
        mimeType: cloudRes.mimeType,
        fileSize: cloudRes.bytes,
        fileSizeMb: sizeMb,
        resourceType: 'video',
        durationSeconds: dur,
        order: audios.length + 1
      });

      setAudios(prev => [...prev, created]);
      showToast(`Đã tải lên và lưu audio "${created.title}" thành công!`);
    } catch (err: any) {
      console.error('Error uploading audio:', err);
      showToast(`❌ Lỗi tải audio: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsUploadingAudio(false);
      setAudioUploadStep('');
      if (e.target) e.target.value = '';
    }
  };

  // Replace Audio File
  const handleReplaceAudioFile = async (e: React.ChangeEvent<HTMLInputElement>, audioId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetAudio = audios.find(a => a.id === audioId);
    if (!targetAudio) return;

    try {
      setIsReplacingAudio(true);
      setReplacingAudioId(audioId);
      showToast(`Đang thay thế tệp audio "${targetAudio.title}"...`);

      const updated = await api.replaceAudioFile(audioId, currentLesson.id, file, targetAudio.cloudinaryPublicId);
      setAudios(prev => prev.map(a => a.id === audioId ? updated : a));
      showToast(`Đã thay thế tệp audio thành công!`);
    } catch (err: any) {
      console.error('Error replacing audio:', err);
      showToast(`❌ Lỗi thay thế audio: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsReplacingAudio(false);
      setReplacingAudioId(null);
      if (e.target) e.target.value = '';
    }
  };

  // Save Edit Audio Info (Rename & Description)
  const handleSaveEditAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAudio) return;
    try {
      const updated = await api.updateAudio(editingAudio.id, {
        title: editingAudio.title,
        description: editingAudio.description
      });
      setAudios(prev => prev.map(a => a.id === editingAudio.id ? updated : a));
      setEditingAudio(null);
      showToast('Đã cập nhật thông tin audio');
    } catch (err: any) {
      showToast('Lỗi cập nhật thông tin audio');
    }
  };

  // Execute Delete Audio
  const handleExecuteDeleteAudio = async () => {
    if (!audioToDelete) return;
    try {
      setIsDeletingAudio(true);
      await api.deleteAudioCascade(currentLesson.id, audioToDelete.id, audioToDelete.cloudinaryPublicId);
      setAudios(prev => prev.filter(a => a.id !== audioToDelete.id));
      showToast(`Đã xóa audio "${audioToDelete.title}" khỏi Cloudinary và bài học`);
      setAudioToDelete(null);
    } catch (err: any) {
      console.error('Error deleting audio:', err);
      showToast(`❌ Lỗi xóa audio: ${err.message || 'Lỗi hệ thống'}`);
    } finally {
      setIsDeletingAudio(false);
    }
  };

  const handleCreateAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFormData.title || !audioFormData.audioUrl) return;
    try {
      const created = await api.createAudio(currentLesson.id, {
        ...audioFormData,
        order: audios.length + 1
      });
      setAudios([...audios, created]);
      setIsAudioModalOpen(false);
      setAudioFormData({ title: '', description: '', audioUrl: '', durationSeconds: 900 });
      showToast('Đã thêm audio bài giảng');
    } catch {
      showToast('Lỗi thêm audio');
    }
  };

  const handleDeleteAudio = async (id: string) => {
    const a = audios.find(item => item.id === id);
    if (a) {
      setAudioToDelete(a);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl z-50 flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Navigation & Core Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0 mt-0.5 sm:mt-0 cursor-pointer"
            title="Quay lại danh sách bài học"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {currentLesson.courseTitle || 'Chuyên đề GDCT'}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                v{currentLesson.version}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Cập nhật: {new Date(currentLesson.updatedAt).toLocaleTimeString('vi-VN')}
              </span>
            </div>

            {/* Inline Title Edit Section */}
            {isEditingTitle ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSaveTitle(); }} 
                className="flex items-center gap-2 mt-1.5 max-w-xl"
              >
                <div className="relative flex-1">
                  <input
                    id="input-edit-lesson-title"
                    type="text"
                    autoFocus
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancelEditTitle();
                    }}
                    placeholder="Nhập tiêu đề bài học / chuyên đề..."
                    className="w-full bg-slate-50 border-2 border-blue-500 rounded-xl px-3.5 py-1.5 text-sm font-bold text-slate-800 focus:outline-hidden focus:bg-white shadow-xs"
                  />
                </div>
                <button
                  id="btn-save-lesson-title"
                  type="submit"
                  disabled={isSaving}
                  title="Lưu tiêu đề (Enter)"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu'}</span>
                </button>
                <button
                  id="btn-cancel-lesson-title"
                  type="button"
                  onClick={handleCancelEditTitle}
                  title="Hủy chỉnh sửa (Esc)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                  <span>Hủy</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 mt-1 group">
                <h2 
                  onClick={() => setIsEditingTitle(true)}
                  title="Bấm để đổi tên bài học"
                  className="text-lg font-bold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {currentLesson.title}
                </h2>
                <button
                  id="btn-start-edit-lesson-title"
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  title="Chỉnh sửa tiêu đề bài học"
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status & Preview Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Status Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">Trạng thái:</span>
            <select
              value={currentLesson.status}
              onChange={(e) => handleChangeStatus(e.target.value as PublishStatus)}
              className="bg-white text-slate-800 text-xs font-semibold rounded-lg px-2 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="REVIEW">Chờ thẩm định</option>
              <option value="PUBLISHED">Đã phát hành</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </div>

          <button
            id="editor-preview-lesson-btn"
            onClick={() => onPreview(currentLesson)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Mô phỏng giao diện chiến sĩ</span>
          </button>
        </div>
      </div>

      {/* OFFLINE PACKAGE STATUS & CONTROL PANEL (Android WorkManager & Room Cache) */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-4 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Gói Học Offline (Android Room & WorkManager Package)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                SẴN SÀNG ĐỒNG BỘ
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                Dung lượng ước tính: <strong className="text-slate-800 font-semibold">{offlinePackage?.totalSizeMb ?? 0} MB</strong>
              </span>
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                Tệp cấu thành: <strong className="text-slate-800 font-semibold">{offlinePackage?.fileCount ?? (slides.length + videos.length + audios.length + 1)} tệp</strong>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Hash className="w-3 h-3 text-slate-400" />
                SHA-256: <code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{offlinePackage?.packageChecksum ? `${offlinePackage.packageChecksum.substring(0, 10)}...` : 'calc...'}</code>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="btn-inspect-manifest"
            onClick={() => setIsManifestModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-all"
            title="Kiểm tra danh sách tệp đính kèm và mã checksum SHA-256"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Kiểm tra Manifest Tệp</span>
          </button>

          <button
            id="btn-rebuild-offline-pkg"
            onClick={handleRebuildOfflinePackage}
            disabled={isRebuildingPackage}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            title="Tính toán lại mã băm checksum và nâng version gói offline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebuildingPackage ? 'animate-spin' : ''}`} />
            <span>{isRebuildingPackage ? 'Đang tái tạo...' : 'Tái tạo Gói Offline'}</span>
          </button>
        </div>
      </div>

      {/* Module Visibility Toggle Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Bật / Tắt thành phần nội dung (Đồng bộ thời gian thực)
            </span>
            <span className="text-[11px] text-slate-500">
              Phần bị tắt sẽ tự động ẩn trên thiết bị của chiến sĩ mà không cần cập nhật ứng dụng
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleToggleModule('showSlides')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center space-x-1.5 ${
              currentLesson.moduleConfig.showSlides
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Slide bài giảng ({slides.length})</span>
          </button>

          <button
            onClick={() => handleToggleModule('showContents')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center space-x-1.5 ${
              currentLesson.moduleConfig.showContents
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nội dung bài học ({contents.length})</span>
          </button>

          <button
            onClick={() => handleToggleModule('showVideos')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center space-x-1.5 ${
              currentLesson.moduleConfig.showVideos
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video tư liệu ({videos.length})</span>
          </button>

          <button
            onClick={() => handleToggleModule('showAudios')}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-all flex items-center space-x-1.5 ${
              currentLesson.moduleConfig.showAudios
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Audio bài giảng ({audios.length})</span>
          </button>
        </div>
      </div>

      {/* Dedicated Section Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          <button
            id="tab-btn-slides"
            onClick={() => setActiveModuleTab('slides')}
            className={`flex items-center space-x-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeModuleTab === 'slides'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Slide bài giảng ({slides.length})</span>
          </button>

          <button
            id="tab-btn-contents"
            onClick={() => setActiveModuleTab('contents')}
            className={`flex items-center space-x-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeModuleTab === 'contents'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Nội dung bài học ({contents.length})</span>
          </button>

          <button
            id="tab-btn-videos"
            onClick={() => setActiveModuleTab('videos')}
            className={`flex items-center space-x-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeModuleTab === 'videos'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Video tư liệu ({videos.length})</span>
          </button>

          <button
            id="tab-btn-audios"
            onClick={() => setActiveModuleTab('audios')}
            className={`flex items-center space-x-2 px-6 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeModuleTab === 'audios'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>Audio bài giảng ({audios.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* ========================================================= */}
          {/* TAB 1: SLIDE HÌNH ẢNH (BỘ SLIDE XUẤT TỪ POWERPOINT) */}
          {/* ========================================================= */}
          {activeModuleTab === 'slides' && (
            <div className="space-y-6">

              {/* HƯỚNG DẪN 5 BƯỚC XUẤT SLIDE HÌNH ẢNH TỪ POWERPOINT */}
              <div className="bg-slate-900 border border-amber-500/40 p-5 rounded-2xl shadow-xl space-y-3.5 text-xs text-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 font-bold text-amber-400 text-sm">
                    <FileText className="w-5 h-5 shrink-0 text-amber-400" />
                    <span>HƯỚNG DẪN XUẤT FOLDER SLIDE HÌNH ẢNH TỪ POWERPOINT (BẮT BUỘC)</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2.5 py-1 rounded-full border border-amber-500/30">
                    QUY TRÌNH MỚI CHUẨN ĐỊNH DẠNG
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Web Admin không nhận file `.pptx` trực tiếp. Quản trị viên tự xuất PowerPoint thành <strong>Folder chứa toàn bộ ảnh Slide (PNG / JPEG)</strong> và tải Folder đó lên Web. Hệ thống sẽ tự động sắp xếp theo thứ tự số tự nhiên (Natural Sort).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block text-xs">Bước 1</span>
                    <span className="text-[11px] text-slate-300">Mở bài giảng trong phần mềm Microsoft PowerPoint.</span>
                  </div>
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block text-xs">Bước 2</span>
                    <span className="text-[11px] text-slate-300">Chọn menu <strong>File → Export / Save As</strong> (Xuất / Lưu thành).</span>
                  </div>
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block text-xs">Bước 3</span>
                    <span className="text-[11px] text-slate-300">Chọn định dạng <strong>PNG File Interchange Format</strong> hoặc <strong>JPEG</strong>.</span>
                  </div>
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block text-xs">Bước 4</span>
                    <span className="text-[11px] text-slate-300">Nhấp chọn <strong>“Every Slide”</strong> (Tất cả các slide).</span>
                  </div>
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400 block text-xs">Bước 5</span>
                    <span className="text-[11px] text-slate-300">PowerPoint tự động tạo Folder ảnh (`Slide1`, `Slide2`...). Bấm nút <strong>[ + CHỌN FOLDER BỘ SLIDE ]</strong> bên dưới để chọn Folder đó.</span>
                  </div>
                </div>
              </div>

              {/* ACTION TOOLBAR & FOLDER SELECTION */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>📁 TẢI LÊN BỘ SLIDE HÌNH ẢNH</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Chọn thư mục ảnh hoặc chọn nhiều file ảnh slide cùng lúc (.png, .jpg, .jpeg, .webp).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select Folder Button */}
                  <label className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>+ CHỌN FOLDER BỘ SLIDE</span>
                    <input
                      type="file"
                      // @ts-ignore
                      webkitdirectory=""
                      directory=""
                      multiple
                      accept="image/*"
                      onChange={handleSelectSlideImages}
                      className="hidden"
                    />
                  </label>

                  {/* Select Multiple Files Button */}
                  <label className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95">
                    <Layers className="w-4 h-4" />
                    <span>+ CHỌN NHIỀU FILE ẢNH</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleSelectSlideImages}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* PENDING / STAGED SLIDE FILES PREVIEW (PRE-UPLOAD PANEL) */}
              {pendingSlideFiles.length > 0 && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-blue-500/40 shadow-2xl space-y-5 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span>XEM TRƯỚC VÀ SẮP XẾP BỘ SLIDE SẮP TẢI LÊN ({pendingSlideFiles.length} SLIDE)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Hệ thống đã tự động sắp xếp tên file theo quy tắc thứ tự số tự nhiên (Natural Sort: Slide1, Slide2, Slide10...). Bạn có thể kéo/đổi vị trí trước khi tải lên Cloudinary CDN.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <label className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-slate-700">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm slide ảnh</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleAddMorePendingSlides}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setPendingSlideFiles([])}
                        className="px-3 py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 rounded-xl text-xs font-semibold transition-all border border-slate-700"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </div>

                  {/* Warning if unnumbered filenames detected */}
                  {hasUnnumberedWarning && (
                    <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-xl flex items-center space-x-2 text-xs text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Phát hiện tên file không chứa chữ số tự nhiên. Vui lòng sử dụng các nút di chuyển (⬆ / ⬇) để sắp xếp đúng thứ tự slide giảng dạy.</span>
                    </div>
                  )}

                  {/* Set Name Input */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                    <label className="text-xs font-bold text-slate-300 shrink-0">Tên Bộ Slide:</label>
                    <input
                      type="text"
                      value={slideSetNameInput}
                      onChange={(e) => setSlideSetNameInput(e.target.value)}
                      placeholder="Nhập tên bộ slide (VD: Bộ Slide Bài Giảng Chính Thức)..."
                      className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Staged Slide Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 max-h-[460px] overflow-y-auto p-1 scrollbar-thin">
                    {pendingSlideFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col group relative hover:border-blue-500 transition-all shadow-md"
                      >
                        <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                            #{String(idx + 1).padStart(2, '0')}
                          </div>
                          <div className="absolute top-1.5 right-1.5 flex items-center space-x-1 opacity-90 group-hover:opacity-100">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMovePendingSlide(idx, 'up')}
                              title="Lên"
                              className="p-1 rounded bg-black/70 hover:bg-blue-600 text-white disabled:opacity-30"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === pendingSlideFiles.length - 1}
                              onClick={() => handleMovePendingSlide(idx, 'down')}
                              title="Xuống"
                              className="p-1 rounded bg-black/70 hover:bg-blue-600 text-white disabled:opacity-30"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-300 font-mono truncate block" title={item.name}>
                            {item.name}
                          </span>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                            <label className="text-blue-400 hover:text-blue-300 cursor-pointer font-bold">
                              Đổi ảnh
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleReplacePendingSlide(idx, e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              onClick={() => handleDeletePendingSlide(idx)}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Execution Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Tổng số: <strong className="text-amber-400 font-mono text-sm">{pendingSlideFiles.length} slide</strong>
                    </span>
                    <button
                      disabled={isUploadingBatch}
                      onClick={handleConfirmUploadBatch}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>XÁC NHẬN & TẢI LÊN (BỘ SLIDE {pendingSlideFiles.length} ẢNH)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* UPLOAD PROGRESS OVERLAY MODAL */}
              {isUploadingBatch && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-blue-500 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">Đang tải bộ slide trực tiếp lên Cloudinary CDN (Unsigned Upload)...</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Xử lý song song (Concurrency: 4 worker) • Tự động xếp hàng thứ tự tự nhiên (Natural Sort).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300">
                      <span>Đang tải slide: <strong className="text-white">{uploadProgress.current}</strong> / {uploadProgress.total}</span>
                      <span className="text-amber-400 font-extrabold text-sm">{uploadProgress.percent}%</span>
                    </div>

                    <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.max(2, uploadProgress.percent)}%` }}
                      />
                    </div>

                    {/* Stats counters */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t border-slate-800 font-mono">
                      <span className="text-emerald-400 font-bold">✅ Thành công: {uploadProgress.successCount}</span>
                      {uploadProgress.failCount > 0 && (
                        <span className="text-red-400 font-bold">❌ Thất bại: {uploadProgress.failCount}</span>
                      )}
                      {uploadProgress.currentFileName && (
                        <span className="text-slate-400 truncate max-w-[200px]" title={uploadProgress.currentFileName}>
                          📄 {uploadProgress.currentFileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* FAILED SLIDES RETRY CARD */}
              {!isUploadingBatch && failedSlideBatchItems.length > 0 && (
                <div className="bg-red-950/80 border border-red-500/60 p-5 rounded-2xl shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Phát hiện {failedSlideBatchItems.length} slide tải lên không thành công</h4>
                        <p className="text-xs text-red-200 mt-0.5">
                          Các slide thành công đã được lưu an toàn. Bạn chỉ cần bấm thử lại để tải nốt các slide bị ngắt kết nối mà không cần tải lại từ đầu.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleRetryFailedBatch}
                      className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95 shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>THỬ LẠI CÁC SLIDE THẤT BẠI ({failedSlideBatchItems.length})</span>
                    </button>
                  </div>

                  {/* Failed items list */}
                  <div className="bg-slate-900/90 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 text-[11px] font-mono border border-red-900/50">
                    {failedSlideBatchItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>Slide #{item.order}: {item.fileName}</span>
                        <span className="text-red-400 font-sans text-[10px]">{item.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVE SLIDE SET METADATA & ATOMIC PUBLISH CONTROL CARD */}
              {slideSet && (
                <div className={`p-5 rounded-2xl border shadow-lg space-y-4 transition-all ${
                  slideSet.status === 'PUBLISHED'
                    ? 'bg-slate-900 text-white border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-100 border-amber-500/50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl border ${
                        slideSet.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                      }`}>
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white">{slideSet.name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
                            v{slideSet.version}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            slideSet.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {slideSet.status === 'PUBLISHED' ? 'ĐÃ XUẤT BẢN (PUBLISHED)' : 'CHỜ XUẤT BẢN (READY)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Tổng số {slideSet.totalSlides} slide chuẩn hình ảnh 16:9 • Ngày cập nhật: {new Date(slideSet.updatedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {slideSet.status !== 'PUBLISHED' && (
                        <button
                          disabled={isPublishingSet}
                          onClick={handlePublishSlideSet}
                          className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>{isPublishingSet ? 'Đang xuất bản...' : '🚀 XUẤT BẢN BỘ SLIDE (PUBLISH)'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setShowDeleteSlideSetConfirm(true)}
                        className="bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        🗑️ Xóa bộ slide
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVE SLIDES LIST / GRID */}
              {loadingSlides ? (
                <div className="py-12 text-center text-slate-400 text-xs">Đang tải danh sách slide bài giảng...</div>
              ) : slides.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm text-slate-700">Chưa có bộ slide nào cho bài học này</p>
                  <p className="text-xs text-slate-400">Vui lòng sử dụng nút <strong>[ + CHỌN FOLDER BỘ SLIDE ]</strong> ở trên để tải bộ slide hình ảnh từ PowerPoint.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {slides.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs group hover:border-blue-400 transition-all flex flex-col"
                    >
                      {/* Slide Thumbnail */}
                      <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/20">
                          Slide #{String(idx + 1).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Slide Details */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                            {slide.title || `Slide ${idx + 1}`}
                          </h4>
                        </div>

                        {/* Slide Card Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <label className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                            <span>{isReplacingSlide && replacingSlideId === slide.id ? 'Đang thay...' : 'Thay ảnh'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isReplacingSlide}
                              onChange={(e) => handleReplaceSingleSlide(slide.id, e)}
                              className="hidden"
                            />
                          </label>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDeleteSlide(slide.id)}
                              title="Xóa slide"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DELETE SLIDE SET CONFIRMATION MODAL */}
              {showDeleteSlideSetConfirm && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-md w-full border border-red-500/40 shadow-2xl space-y-4">
                    <div className="flex items-center space-x-3 text-red-400">
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <h4 className="text-base font-bold text-white">Xác nhận xóa bộ slide bài giảng</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Bạn có chắc chắn muốn xóa bộ slide này? Mọi hình ảnh slide sẽ bị gỡ khỏi ứng dụng. Học viên sẽ không thể xem slide của bài học này nữa.
                    </p>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => setShowDeleteSlideSetConfirm(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                      >
                        Hủy
                      </button>
                      <button
                        disabled={isDeletingSet}
                        onClick={handleDeleteSlideSetConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeletingSet ? 'Đang xóa...' : 'XÁC NHẬN XÓA'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: STRUCTURED LESSON CONTENT (TÀI LIỆU GDCT -> PHẦN -> MỤC -> NỘI DUNG -> CÂU HỎI) */}
          {/* ========================================================= */}
          {activeModuleTab === 'contents' && (
            <div className="space-y-6">
              {/* TOP HEADER & DOCUMENT FILE UPLOAD ZONE */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 rounded-2xl border border-blue-900/60 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <DongSonDrum className="w-3.5 h-3.5" color="#020617" /> Mô hình Cấu trúc Chuẩn GDCT
                    </span>
                    <span className="text-blue-300 text-xs font-mono">Tài liệu GDCT → Phần → Mục → Nội dung → Câu hỏi</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <span>Quản lý & Phân chia Nội dung Bài giảng GDCT</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                    Nhập file tài liệu bài giảng (.docx, .doc, .pdf) để tự động đọc cấu trúc các Phần & Mục, hoặc tự biên soạn bài giảng chuẩn chính trị quân đội.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-60">
                    <FileUp className={`w-4 h-4 ${isParsingDoc ? 'animate-bounce' : ''}`} />
                    <span>{isParsingDoc ? (docUploadStepText || 'Đang xử lý...') : 'TẢI TÀI LIỆU (DOCX, PDF, RTF)'}</span>
                    <input
                      type="file"
                      accept=".docx,.doc,.pdf,.docm,.dot,.dotx,.dotm,.rtf"
                      disabled={isParsingDoc}
                      onChange={handleDocFileSelect}
                      className="hidden"
                    />
                  </label>

                  {sourceDoc && (
                    <button
                      onClick={() => {
                        if (sourceDoc) {
                          setShowPresetsLibrary(true);
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all"
                    >
                      <Library className="w-4 h-4" />
                      <span>Thư viện Mẫu</span>
                    </button>
                  )}
                </div>
              </div>

              {/* TECHNICAL ERROR DETAILS FOR ADMIN */}
              {docErrorDetails && (
                <div className="bg-red-950/90 border border-red-500/50 p-4 rounded-xl text-red-100 text-xs space-y-2 shadow-lg">
                  <div className="flex items-center justify-between font-bold text-red-300">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>LỖI ĐỌC TÀI LIỆU — CHI TIẾT KỸ THUẬT QUẢN TRỊ VIÊN</span>
                    </div>
                    <button
                      onClick={() => setDocErrorDetails(null)}
                      className="text-red-400 hover:text-white font-mono text-xs px-2 py-0.5 rounded bg-red-900/50"
                    >
                      Đóng
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 text-red-200 font-mono text-[10px] rounded-lg overflow-x-auto border border-red-900/40 max-h-40 whitespace-pre-wrap">
                    {docErrorDetails}
                  </pre>
                </div>
              )}

              {/* ATTACHED SOURCE DOCUMENT BADGE */}
              {sourceDoc && (
                <div className="bg-slate-900 text-white p-4 rounded-xl border border-blue-800/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">{sourceDoc.name || sourceDoc.fileName}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-900 text-blue-300 rounded font-bold">
                          {(sourceDoc.type || 'DOCX').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({sourceDoc.size ? (sourceDoc.size > 1024 * 1024 ? `${(sourceDoc.size / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(sourceDoc.size / 1024)} KB`) : '---'})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Đã lưu Cloudinary ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tải lên: {new Date(sourceDoc.createdAt || (sourceDoc as any).uploadedAt || Date.now()).toLocaleString('vi-VN')}
                        {sourceDoc.pageCount ? ` • Số trang: ${sourceDoc.pageCount}` : ''}
                        {sourceDoc.assetFolder ? ` • Thư mục: ${sourceDoc.assetFolder}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleParseExistingDoc}
                      disabled={isParsingDoc}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isParsingDoc ? 'animate-spin' : ''}`} />
                      <span>{isParsingDoc ? (docUploadStepText || 'Đang đọc...') : 'ĐỌC & PHÂN TÍCH'}</span>
                    </button>

                    {(sourceDoc.cloudinaryUrl || sourceDoc.url || (sourceDoc as any).secureUrl) && (
                      <button
                        onClick={() => {
                          const docUrl = sourceDoc.cloudinaryUrl || sourceDoc.url || (sourceDoc as any).secureUrl;
                          window.open(docUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5 rotate-90" />
                        <span>MỞ TÀI LIỆU</span>
                      </button>
                    )}

                    <button
                      onClick={() => setShowDeleteDocModal(true)}
                      className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                      title="Xóa tài liệu và toàn bộ cấu trúc bài học"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>XÓA TÀI LIỆU</span>
                    </button>
                  </div>
                </div>
              )}

              {/* INLINE PARSED PROPOSAL CARD (📖 NỘI DUNG ĐÃ PHÂN TÍCH) */}
              {parsedProposal && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-amber-500/50 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">📖 NỘI DUNG ĐÃ PHÂN TÍCH</h4>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/30 font-bold">
                      {(parsedProposal.proposedSections || parsedProposal.sections || []).length} Phần đã cấu trúc
                    </span>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono max-h-64 overflow-y-auto">
                    {(parsedProposal.proposedSections || parsedProposal.sections || []).map((sec, idx) => (
                      <div key={idx} className="space-y-1.5 border-b border-slate-800/80 pb-2.5 last:border-0 last:pb-0">
                        <div className="font-bold text-amber-300 flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>📘 {sec.title || `PHẦN ${idx + 1}`}</span>
                        </div>
                        <div className="pl-6 space-y-1 text-slate-300 text-[11px]">
                          {(sec.items || []).map((item, iIdx) => (
                            <div key={iIdx} className="flex items-center justify-between py-0.5">
                              <span>├─ {item.title || `Mục ${iIdx + 1}`}</span>
                              <span className="text-slate-500 font-mono">({(item.bodyHtml || '').length} ký tự)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={isSavingStructuredContent}
                      onClick={handleConfirmProposal}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSavingStructuredContent ? 'Đang đưa vào bài học...' : 'ĐƯA TOÀN BỘ VÀO BÀI HỌC'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2-COLUMN WORKSPACE: LEFT TREE + RIGHT CONTENT EDITOR */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: DANH SÁCH PHẦN & MỤC (DOCUMENT HIERARCHY TREE) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <FolderTree className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Cấu trúc Bài học ({sections.length} Phần)
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {sections.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllStructure}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-2.5 py-1 rounded-lg border border-red-200 flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                            title="Xóa toàn bộ cấu trúc bài học"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                            <span>Xóa tất cả</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAddSection}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-200 flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm Phần</span>
                        </button>
                      </div>
                    </div>

                    {/* SECTIONS & ITEMS TREE */}
                    {sections.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-2">
                        <FolderPlus className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">Chưa có Phần nào trong bài học</p>
                        <p className="text-[11px] text-slate-400">Tải file tài liệu hoặc bấm <strong>"Thêm Phần"</strong> để tạo thủ công.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                        {sections.map((sec, secIdx) => {
                          const secItems = items.filter(i => i.sectionId === sec.id);
                          const isSecActive = activeSectionId === sec.id;

                          return (
                            <div
                              key={sec.id}
                              className={`rounded-xl border transition-all ${
                                isSecActive
                                   ? 'border-blue-500 bg-blue-50/30 shadow-2xs'
                                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                              }`}
                            >
                              {/* Section Header */}
                              <div 
                                onClick={() => {
                                  setActiveSectionId(sec.id);
                                  if (secItems.length > 0 && (!activeItemId || !secItems.some(i => i.id === activeItemId))) {
                                    setActiveItemId(secItems[0].id);
                                  }
                                }}
                                className="p-3 flex items-center justify-between gap-2 border-b border-slate-200/60 cursor-pointer"
                              >
                                <div className="flex-1 flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded bg-blue-900 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                    {secIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={sec.title}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                                    className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none focus:bg-white rounded px-1.5 py-0.5 border border-transparent focus:border-blue-400"
                                  />
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddItem(sec.id);
                                    }}
                                    title="Thêm Mục vào Phần này"
                                    className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold flex items-center space-x-0.5 px-1.5 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Mục</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSection(sec.id, e)}
                                    title="Xóa Phần này"
                                    className="p-1.5 rounded text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Items List inside Section */}
                              <div className="p-2 space-y-1 bg-white rounded-b-xl">
                                {secItems.length === 0 ? (
                                  <div className="text-[11px] text-slate-400 italic text-center py-2">
                                    Chưa có Mục nào trong Phần này. Bấm "+ Mục" để thêm.
                                  </div>
                                ) : (
                                  secItems.map((item) => {
                                    const isItemActive = activeItemId === item.id;
                                    const itemQuestionsCount = questions.filter(q => q.itemId === item.id).length;

                                    return (
                                      <div
                                        key={item.id}
                                        onClick={() => {
                                          setActiveSectionId(sec.id);
                                          setActiveItemId(item.id);
                                        }}
                                        className={`group p-2.5 rounded-lg cursor-pointer flex items-center justify-between border text-xs transition-all ${
                                          isItemActive
                                            ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50/50 hover:border-blue-300'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isItemActive ? 'text-amber-400' : 'text-slate-400'}`} />
                                          <span className="font-semibold truncate">
                                            {item.title}
                                          </span>
                                        </div>

                                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                          {itemQuestionsCount > 0 && (
                                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                              isItemActive ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                              {itemQuestionsCount} CH
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => handleDeleteItem(item.id, e)}
                                            title="Xóa Mục này"
                                            className={`p-1 rounded transition-opacity cursor-pointer ${
                                              isItemActive 
                                                ? 'text-red-300 hover:text-white hover:bg-red-800/60' 
                                                : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                            }`}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: BIÊN SOẠN NỘI DUNG MỤC ĐƯỢC CHỌN & CÂU HỎI ĐÁNH GIÁ */}
                <div className="lg:col-span-8 space-y-6">
                  {(() => {
                    const selectedItem = items.find(i => i.id === activeItemId);
                    const itemQuestions = questions.filter(q => q.itemId === activeItemId);

                    if (!selectedItem) {
                      return (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                          <h4 className="text-sm font-bold text-slate-700">Vui lòng chọn hoặc tạo một Mục để biên soạn nội dung</h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Chọn một Mục từ cây cấu trúc ở cột bên trái để chỉnh sửa văn bản bài giảng và tạo các câu hỏi đánh giá nhận thức tương tác.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 shadow-lg space-y-6 animate-fadeIn">
                        {/* ITEM HEADER & TITLE INPUT */}
                        <div className="border-b border-slate-200 pb-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase font-mono">
                              ĐANG BIÊN SOẠN MỤC NỘI DUNG
                            </span>
                            <span className="text-xs font-mono text-slate-600">
                              ID: {selectedItem.id}
                            </span>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tiêu đề Mục nội dung <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={selectedItem.title}
                              onChange={(e) => handleUpdateActiveItem({ title: e.target.value })}
                              placeholder="Ví dụ: Mục 1.1: Vị trí, vai trò của công tác Giáo dục chính trị tại đơn vị"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        {/* ITEM BODY CONTENT EDITOR */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Nội dung bài giảng Giáo dục chính trị (Văn bản chuẩn)</span>
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateActiveItem({ bodyHtml: selectedItem.bodyHtml + '\n<p><strong>Nội dung trọng tâm:</strong> ...</p>' })}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold border border-slate-200"
                              >
                                + Đoạn in đậm
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateActiveItem({ bodyHtml: selectedItem.bodyHtml + '\n<ul>\n  <li>Ý thứ nhất...</li>\n  <li>Ý thứ hai...</li>\n</ul>' })}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold border border-slate-200"
                              >
                                + Danh sách
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={10}
                            value={selectedItem.bodyHtml}
                            onChange={(e) => handleUpdateActiveItem({ bodyHtml: e.target.value })}
                            placeholder="Nhập toàn bộ nội dung chi tiết bài giảng cho Mục này (hỗ trợ văn bản thuần và định dạng HTML)..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 text-xs font-sans leading-relaxed focus:outline-none focus:border-blue-500 focus:bg-white shadow-2xs font-mono"
                          />
                        </div>

                        {/* ASSESSMENT QUESTIONS SECTION FOR THIS ITEM */}
                        <div className="p-5 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border-2 border-blue-200 rounded-2xl space-y-4 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Award className="w-5 h-5 text-blue-700" />
                                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                                  CÂU HỎI ĐÁNH GIÁ CUỐI MỤC ({itemQuestions.length} CÂU HỎI)
                                </h4>
                              </div>
                              <p className="text-[11px] text-blue-800 mt-0.5">
                                Các câu hỏi kiểm tra nhận thức bắt buộc chiến sĩ trả lời để hoàn thành Mục bài học này.
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAiSuggestQuestions(selectedItem)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-2xs transition-all"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>GỢI Ý CÂU HỎI TỰ ĐỘNG</span>
                              </button>
                              <button
                                onClick={() => handleAddQuestionToItem(selectedItem.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-2xs transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Thêm Câu hỏi</span>
                              </button>
                            </div>
                          </div>

                          {/* QUESTIONS LIST */}
                          {itemQuestions.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 text-xs bg-white rounded-xl border border-dashed border-slate-300 space-y-1">
                              <HelpCircle className="w-6 h-6 mx-auto text-slate-400" />
                              <p className="font-bold text-slate-700">Chưa có câu hỏi đánh giá nào cho Mục này</p>
                              <p className="text-[11px] text-slate-400">Bấm <strong>"GỢI Ý CÂU HỎI TỰ ĐỘNG"</strong> hoặc <strong>"Thêm Câu hỏi"</strong> để bổ sung.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {itemQuestions.map((q, qIdx) => (
                                <div
                                  key={q.id}
                                  className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3"
                                >
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                        {qIdx + 1}
                                      </span>
                                      <span>Câu hỏi #{qIdx + 1}</span>
                                    </span>

                                    <div className="flex items-center space-x-2">
                                      <select
                                        value={q.type || 'single_choice'}
                                        onChange={(e) => handleQuestionTypeChange(q.id, e.target.value as QuestionType)}
                                        className="bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-800 p-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                                      >
                                        <option value="single_choice">Trắc nghiệm 1 đáp án</option>
                                        <option value="multiple_choice">Trắc nghiệm nhiều đáp án</option>
                                        <option value="true_false">Đúng / Sai</option>
                                        <option value="short_answer">Câu trả lời ngắn</option>
                                        <option value="essay">Tự luận / Trả lời mở</option>
                                      </select>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteQuestion(q.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Xóa câu hỏi này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Question Input */}
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Nội dung câu hỏi:</label>
                                    <input
                                      type="text"
                                      value={q.question}
                                      onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                                      placeholder="Nhập nội dung câu hỏi kiểm tra / nhận thức..."
                                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                                    />
                                  </div>

                                  {/* CONDITIONAL RENDERING: Short Answer / Essay vs Multiple Choice Options */}
                                  {(q.type === 'short_answer' || q.type === 'essay') ? (
                                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-700">
                                          Đáp án gợi ý / Từ khóa chuẩn / Hướng dẫn chấm:
                                        </label>
                                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                                          {q.type === 'essay' ? 'Câu hỏi tự luận' : 'Câu trả lời ngắn'}
                                        </span>
                                      </div>
                                      <textarea
                                        rows={3}
                                        value={typeof q.correctAnswer === 'string' ? q.correctAnswer : (q.explanation || '')}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleUpdateQuestion(q.id, {
                                            correctAnswer: val,
                                            explanation: val
                                          });
                                        }}
                                        placeholder="Nhập nội dung câu trả lời chuẩn, các từ khóa trọng tâm hoặc barem hướng dẫn chấm cho học viên..."
                                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                                      />
                                      <p className="text-[10px] text-slate-500 italic">
                                        * Đối với dạng câu hỏi này, học viên sẽ làm bài bằng cách gõ văn bản câu trả lời hoặc cán bộ chấm trực tiếp.
                                      </p>
                                    </div>
                                  ) : (
                                    /* Options List for Single Choice, Multiple Choice, True/False */
                                    <div className="space-y-1.5">
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                        <span>Các phương án & Chọn đáp án đúng:</span>
                                        <span className="text-[10px] font-normal text-slate-500">
                                          {q.type === 'multiple_choice'
                                            ? '(Bấm chữ cái để chọn nhiều đáp án đúng)'
                                            : q.type === 'true_false'
                                            ? '(Chọn Đúng hoặc Sai)'
                                            : '(Bấm chữ cái để chọn 1 đáp án đúng)'}
                                        </span>
                                      </label>
                                      {(q.options && q.options.length > 0 ? q.options : (q.type === 'true_false' ? ['Đúng', 'Sai'] : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'])).map((opt, optIdx) => {
                                        const isCorrect = Array.isArray(q.correctAnswer)
                                          ? q.correctAnswer.includes(optIdx)
                                          : q.correctAnswer === optIdx;
                                        return (
                                          <div
                                            key={optIdx}
                                            className={`flex items-center space-x-2 p-2 rounded-lg border text-xs transition-all ${
                                              isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                                            }`}
                                          >
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (q.type === 'multiple_choice') {
                                                  const currentList = Array.isArray(q.correctAnswer)
                                                    ? q.correctAnswer
                                                    : [typeof q.correctAnswer === 'number' ? q.correctAnswer : 0];
                                                  const nextList = isCorrect
                                                    ? currentList.filter(c => c !== optIdx)
                                                    : [...currentList, optIdx];
                                                  handleUpdateQuestion(q.id, { correctAnswer: nextList.length > 0 ? nextList : [optIdx] });
                                                } else {
                                                  handleUpdateQuestion(q.id, { correctAnswer: optIdx });
                                                }
                                              }}
                                              className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                                isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                              }`}
                                              title={isCorrect ? 'Đáp án đúng' : 'Bấm để đặt làm đáp án đúng'}
                                            >
                                              {q.type === 'true_false' ? (optIdx === 0 ? 'Đ' : 'S') : String.fromCharCode(65 + optIdx)}
                                            </button>

                                            <input
                                              type="text"
                                              value={opt}
                                              onChange={(e) => {
                                                const baseOpts = q.options && q.options.length > 0
                                                  ? [...q.options]
                                                  : (q.type === 'true_false' ? ['Đúng', 'Sai'] : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D']);
                                                baseOpts[optIdx] = e.target.value;
                                                handleUpdateQuestion(q.id, { options: baseOpts });
                                              }}
                                              placeholder={`Nội dung phương án ${String.fromCharCode(65 + optIdx)}`}
                                              className="flex-1 bg-transparent border-0 text-xs text-slate-800 focus:outline-none font-medium"
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Explanation (for all question types) */}
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-600 mb-0.5 block">Lời giải thích chi tiết / Căn cứ tài liệu:</label>
                                    <input
                                      type="text"
                                      value={q.explanation || ''}
                                      onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                                      placeholder="Giải thích lý do lựa chọn đáp án hoặc trích dẫn tài liệu..."
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-800 focus:outline-none focus:border-blue-400"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* STRUCTURE PROPOSAL MODAL (ĐỀ XUẤT CẤU TRÚC AI/DOC PARSER) */}
              {proposalModalOpen && parsedProposal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl max-w-2xl w-full border border-amber-500/50 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h4 className="text-base font-bold text-white">ĐỀ XUẤT CẤU TRÚC TÀI LIỆU BÀI GIẢNG</h4>
                      </div>
                      <span className="text-xs font-mono text-amber-400">
                        Phát hiện: {(parsedProposal.proposedSections || parsedProposal.sections || []).length} Phần
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Hệ thống đã phân tích file tài liệu và tạo đề xuất cấu trúc phân chia bài giảng theo chuẩn GDCT. Bạn có thể chấp nhận cấu trúc này hoặc hủy để biên soạn thủ công.
                    </p>

                    <div className="flex-1 overflow-y-auto space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                      {(parsedProposal.proposedSections || parsedProposal.sections || []).map((sec, idx) => (
                        <div key={idx} className="space-y-1.5 border-b border-slate-800/80 pb-2">
                          <div className="font-bold text-amber-300">
                            {sec.title || `PHẦN ${idx + 1}`}
                          </div>
                          <div className="pl-4 space-y-1 text-slate-300 text-[11px]">
                            {(sec.items || []).map((item, iIdx) => (
                              <div key={iIdx} className="flex items-center justify-between">
                                <span>• {item.title || `Mục ${iIdx + 1}`}</span>
                                <span className="text-slate-500">({(item.bodyHtml || '').length} ký tự)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setProposalModalOpen(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                      >
                        Hủy & Biên soạn thủ công
                      </button>
                      <button
                        disabled={isSavingStructuredContent}
                        onClick={handleConfirmProposal}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSavingStructuredContent ? 'Đang áp dụng...' : 'CHẤP NHẬN & ÁP DỤNG CẤU TRÚC NÀY'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PRESETS LIBRARY MODAL (MẪU KINH ĐIỂN VÀ LỜI BÁC DẠY) */}
              {showPresetsLibrary && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white text-slate-900 p-6 rounded-2xl max-w-lg w-full border border-slate-300 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <Library className="w-5 h-5 text-blue-600" />
                        <h4 className="text-base font-bold text-slate-900">Thư viện Mẫu Bài giảng & Lời Bác dạy</h4>
                      </div>
                      <button onClick={() => setShowPresetsLibrary(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                    </div>

                    <p className="text-xs text-slate-600">
                      Chọn một mẫu chuẩn có sẵn để thêm nhanh vào cấu trúc bài học hiện tại:
                    </p>

                    <div className="space-y-2">
                      {UNCLE_HO_PRESETS.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={async () => {
                            const newSec = await api.createSection(currentLesson.id, {
                              title: `PHẦN ${sections.length + 1}: LỜI DẠY CỦA CHỦ TỊCH HỒ CHÍ MINH`,
                              order: sections.length + 1
                            });
                            const newItem = await api.createItem(currentLesson.id, newSec.id, {
                              title: preset.title,
                              bodyHtml: `<blockquote style="background:#fef3c7;padding:12px;border-left:4px solid #f59e0b;">"${preset.quote}"</blockquote>` + preset.bodyHtml,
                              order: 1
                            });
                            if (preset.quiz?.enabled) {
                              await api.createQuestion(currentLesson.id, newItem.id, {
                                question: preset.quiz.question,
                                type: 'single_choice',
                                options: preset.quiz.options,
                                correctAnswer: preset.quiz.correctOptionIndex,
                                explanation: preset.quiz.explanation,
                                order: 1,
                                points: 10
                              });
                            }
                            setShowPresetsLibrary(false);
                            showToast('Đã thêm bài giảng mẫu thành công!');
                            await loadStructuredData();
                          }}
                          className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer transition-all space-y-1"
                        >
                          <h5 className="text-xs font-bold text-blue-900">{preset.name}</h5>
                          <p className="text-[11px] text-slate-600 line-clamp-2">"{preset.quote}"</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setShowPresetsLibrary(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: VIDEOS */}
          {/* ========================================================= */}
          {activeModuleTab === 'videos' && (
            <div className="space-y-6">
              {/* Video Module Header & Actions */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Video Tư liệu & Phóng sự Giáo dục Chính trị
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Lưu trữ trên Cloudinary (Folder: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px]">GDCT_V4/VIDEOS/{currentLesson.id}</code>) • Hỗ trợ phát trực tuyến và đồng bộ gói Offline
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-600 font-mono">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                      Số lượng: {videos.length} video
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      Tổng dung lượng: {videos.reduce((acc, v) => acc + (v.fileSize ? v.fileSize / (1024 * 1024) : (v.fileSizeMb || 0)), 0).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all">
                    <Upload className="w-4 h-4" />
                    <span>+ TẢI VIDEO TỪ MÁY TÍNH</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mkv,video/*"
                      onChange={handleUploadVideoFile}
                      disabled={isUploadingVideo}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhập URL thủ công</span>
                  </button>
                </div>
              </div>

              {/* Upload Progress Banner */}
              {isUploadingVideo && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center space-x-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-blue-900">Đang xử lý tải video lên Cloudinary...</p>
                    <p className="text-[11px] text-blue-700 font-mono mt-0.5">{videoUploadStep || 'Vui lòng chờ trong giây lát...'}</p>
                  </div>
                </div>
              )}

              {loadingVideos ? (
                <div className="py-12 text-center text-slate-400 text-xs">Đang tải danh sách video tư liệu...</div>
              ) : videos.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Film className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Chưa có video tư liệu nào trong bài học</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Bấm nút <strong>"+ TẢI VIDEO TỪ MÁY TÍNH"</strong> để tải trực tiếp các phóng sự, phim tài liệu quân sự phục vụ bài giảng.
                    </p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp Video từ máy</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mkv,video/*"
                      onChange={handleUploadVideoFile}
                      disabled={isUploadingVideo}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {videos.map((vid, idx) => (
                    <div
                      key={vid.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Video Thumbnail / Preview Banner */}
                        <div 
                          onClick={() => setSelectedVideoForPlay(vid)}
                          className="relative aspect-video bg-slate-950 flex items-center justify-center cursor-pointer group overflow-hidden"
                        >
                          {vid.thumbnail ? (
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 group-hover:bg-slate-800 transition-colors">
                              <Film className="w-10 h-10 mb-2 opacity-50" />
                              <span className="text-xs font-mono">Video Player</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                              <Play className="w-7 h-7 ml-1 fill-current" />
                            </div>
                          </div>

                          {/* Badges on Thumbnail */}
                          <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                            <span className="bg-slate-900/90 backdrop-blur-xs text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono border border-slate-700">
                              #{idx + 1}
                            </span>
                            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                              {vid.mimeType ? vid.mimeType.replace('video/', '').toUpperCase() : 'MP4'}
                            </span>
                          </div>

                          <span className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded font-mono border border-slate-700">
                            {formatMediaDuration(vid.durationSeconds)}
                          </span>
                        </div>

                        {/* Metadata Info */}
                        <div className="p-4 space-y-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {vid.title}
                          </h4>
                          {vid.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {vid.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              📦 {(vid.fileSize ? (vid.fileSize / (1024 * 1024)).toFixed(1) : (vid.fileSizeMb ? vid.fileSizeMb.toFixed(1) : '0.0'))} MB
                            </span>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]" title={vid.assetFolder || `GDCT_V4/VIDEOS/${currentLesson.id}`}>
                              📁 {vid.assetFolder || `GDCT_V4/VIDEOS/${currentLesson.id}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedVideoForPlay(vid)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Xem video</span>
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingVideo(vid)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            title="Đổi tên & chỉnh sửa mô tả"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <label className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer ${isReplacingVideo && replacingVideoId === vid.id ? 'opacity-50' : ''}`} title="Thay thế bằng file video khác">
                            <RefreshCw className={`w-4 h-4 ${isReplacingVideo && replacingVideoId === vid.id ? 'animate-spin' : ''}`} />
                            <input
                              type="file"
                              accept="video/*"
                              disabled={isReplacingVideo}
                              onChange={(e) => handleReplaceVideoFile(e, vid.id)}
                              className="hidden"
                            />
                          </label>

                          <button
                            onClick={() => setVideoToDelete(vid)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Xóa video khỏi hệ thống và Cloudinary"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: AUDIOS */}
          {/* ========================================================= */}
          {activeModuleTab === 'audios' && (
            <div className="space-y-6">
              {/* Audio Module Header & Actions */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Headphones className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Audio Bài giảng & Phát thanh Tuyên truyền
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Lưu trữ trên Cloudinary (Folder: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono text-[11px]">GDCT_V4/AUDIO/{currentLesson.id}</code>) • Phục vụ cán bộ chiến sĩ nghe giảng trên tàu trực và điểm đảo
                  </p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-600 font-mono">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                      Số lượng: {audios.length} audio
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      Tổng dung lượng: {audios.reduce((acc, a) => acc + (a.fileSize ? a.fileSize / (1024 * 1024) : (a.fileSizeMb || 0)), 0).toFixed(1)} MB
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all">
                    <Upload className="w-4 h-4" />
                    <span>+ TẢI AUDIO TỪ MÁY TÍNH</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/aac,audio/flac,audio/*"
                      onChange={handleUploadAudioFile}
                      disabled={isUploadingAudio}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setIsAudioModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhập URL thủ công</span>
                  </button>
                </div>
              </div>

              {/* Upload Progress Banner */}
              {isUploadingAudio && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center space-x-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-blue-900">Đang xử lý tải audio lên Cloudinary...</p>
                    <p className="text-[11px] text-blue-700 font-mono mt-0.5">{audioUploadStep || 'Vui lòng chờ trong giây lát...'}</p>
                  </div>
                </div>
              )}

              {loadingAudios ? (
                <div className="py-12 text-center text-slate-400 text-xs">Đang tải audio bài giảng...</div>
              ) : audios.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Music className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Chưa có audio bài giảng nào trong bài học</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Bấm nút <strong>"+ TẢI AUDIO TỪ MÁY TÍNH"</strong> để tải trực tiếp các bài ghi âm, băng phát thanh chính trị.
                    </p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Chọn tệp Audio từ máy</span>
                    <input
                      type="file"
                      accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/aac,audio/flac,audio/*"
                      onChange={handleUploadAudioFile}
                      disabled={isUploadingAudio}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {audios.map((aud, idx) => (
                    <div
                      key={aud.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs flex items-center justify-center shrink-0">
                              <Headphones className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                                  #{idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {aud.title}
                                </h4>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                <span>⏱ {formatMediaDuration(aud.durationSeconds)}</span>
                                <span>•</span>
                                <span>📦 {(aud.fileSize ? (aud.fileSize / (1024 * 1024)).toFixed(1) : (aud.fileSizeMb ? aud.fileSizeMb.toFixed(1) : '0.0'))} MB</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => setEditingAudio(aud)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Đổi tên & chỉnh sửa mô tả"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <label className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer ${isReplacingAudio && replacingAudioId === aud.id ? 'opacity-50' : ''}`} title="Thay thế bằng file audio khác">
                              <RefreshCw className={`w-4 h-4 ${isReplacingAudio && replacingAudioId === aud.id ? 'animate-spin' : ''}`} />
                              <input
                                type="file"
                                accept="audio/*"
                                disabled={isReplacingAudio}
                                onChange={(e) => handleReplaceAudioFile(e, aud.id)}
                                className="hidden"
                              />
                            </label>

                            <button
                              onClick={() => setAudioToDelete(aud)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Xóa audio khỏi hệ thống và Cloudinary"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {aud.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {aud.description}
                          </p>
                        )}

                        {/* Interactive HTML5 Audio Player */}
                        <div className="pt-2">
                          <audio
                            controls
                            preload="metadata"
                            src={aud.audioUrl}
                            className="w-full h-10 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="truncate max-w-[260px]" title={aud.assetFolder || `GDCT_V4/AUDIO/${currentLesson.id}`}>
                          📁 {aud.assetFolder || `GDCT_V4/AUDIO/${currentLesson.id}`}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {aud.mimeType ? aud.mimeType.replace('audio/', '').toUpperCase() : 'MP3'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Slide */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Thêm Slide Bài Giảng</h3>
            <form onSubmit={handleCreateSlide} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề slide</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Slide 5: Trách nhiệm của cán bộ chiến sĩ"
                  value={slideFormData.title || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đường dẫn ảnh slide (PNG/JPG 16:9) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={slideFormData.imageUrl || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Ghi chú giảng viên</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú nội dung cần nhấn mạnh khi trình chiếu..."
                  value={slideFormData.notes || ''}
                  onChange={(e) => setSlideFormData({ ...slideFormData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Thêm slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Video */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Thêm Video Tư Liệu</h3>
            <form onSubmit={handleCreateVideo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề Video *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phóng sự: Huấn luyện làm chủ tàu chiến đấu..."
                  value={videoFormData.title || ''}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đường dẫn Video (URL) *</label>
                <input
                  type="text"
                  required
                  value={videoFormData.videoUrl || ''}
                  onChange={(e) => setVideoFormData({ ...videoFormData, videoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Thời lượng (giây)</label>
                  <input
                    type="number"
                    value={videoFormData.durationSeconds}
                    onChange={(e) => setVideoFormData({ ...videoFormData, durationSeconds: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Ảnh bìa (URL)</label>
                  <input
                    type="text"
                    value={videoFormData.thumbnail || ''}
                    onChange={(e) => setVideoFormData({ ...videoFormData, thumbnail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Thêm video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Audio */}
      {isAudioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Thêm Audio Bài Giảng</h3>
            <form onSubmit={handleCreateAudio} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề Audio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Băng ghi âm bài giảng chính trị số 01..."
                  value={audioFormData.title || ''}
                  onChange={(e) => setAudioFormData({ ...audioFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Đường dẫn Audio (MP3 URL) *</label>
                <input
                  type="text"
                  required
                  value={audioFormData.audioUrl || ''}
                  onChange={(e) => setAudioFormData({ ...audioFormData, audioUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Thời lượng (giây)</label>
                <input
                  type="number"
                  value={audioFormData.durationSeconds}
                  onChange={(e) => setAudioFormData({ ...audioFormData, durationSeconds: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAudioModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Thêm audio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Video Player Lightbox / Modal */}
      {selectedVideoForPlay && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {selectedVideoForPlay.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Cloudinary: {selectedVideoForPlay.assetFolder || `GDCT_V4/VIDEOS/${currentLesson.id}`} • {selectedVideoForPlay.fileSizeMb || 0} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideoForPlay(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold text-xs transition-colors"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="bg-black flex items-center justify-center relative flex-1 min-h-[300px]">
              <video
                controls
                autoPlay
                src={selectedVideoForPlay.videoUrl}
                className="w-full max-h-[60vh] object-contain"
              >
                Trình duyệt của đồng chí không hỗ trợ xem video trực tiếp.
              </video>
            </div>

            {selectedVideoForPlay.description && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white mb-1">Mô tả nội dung:</p>
                <p>{selectedVideoForPlay.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Edit Video Metadata */}
      {editingVideo && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chỉnh sửa thông tin Video</h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingVideo.cloudinaryPublicId || editingVideo.id}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditVideo} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề Video *</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả chi tiết nội dung</label>
                <textarea
                  rows={3}
                  value={editingVideo.description || ''}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Video Confirmation */}
      {videoToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa Video</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Đồng chí có chắc chắn muốn xóa video <strong className="text-slate-900">"{videoToDelete.title}"</strong> không?
              </p>
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-[11px] space-y-1">
                <p>• File video sẽ bị xóa vĩnh viễn trên Cloudinary (Folder: <code className="font-mono">{videoToDelete.assetFolder || 'GDCT_V4/VIDEOS'}</code>).</p>
                <p>• Dữ liệu bài giảng và liên kết trên thiết bị của chiến sĩ sẽ được tự động đồng bộ gỡ bỏ.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setVideoToDelete(null)}
                disabled={isDeletingVideo}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteVideo}
                disabled={isDeletingVideo}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingVideo ? 'Đang xóa...' : 'Xóa vĩnh viễn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Audio Metadata */}
      {editingAudio && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chỉnh sửa thông tin Audio</h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingAudio.cloudinaryPublicId || editingAudio.id}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditAudio} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề Audio *</label>
                <input
                  type="text"
                  required
                  value={editingAudio.title}
                  onChange={(e) => setEditingAudio({ ...editingAudio, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả chi tiết nội dung</label>
                <textarea
                  rows={3}
                  value={editingAudio.description || ''}
                  onChange={(e) => setEditingAudio({ ...editingAudio, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAudio(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Audio Confirmation */}
      {audioToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa Audio</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>
                Đồng chí có chắc chắn muốn xóa audio <strong className="text-slate-900">"{audioToDelete.title}"</strong> không?
              </p>
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-[11px] space-y-1">
                <p>• File âm thanh sẽ bị xóa vĩnh viễn trên Cloudinary (Folder: <code className="font-mono">{audioToDelete.assetFolder || 'GDCT_V4/AUDIO'}</code>).</p>
                <p>• Dữ liệu bài giảng và phát thanh trên tàu sẽ được tự động đồng bộ gỡ bỏ.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setAudioToDelete(null)}
                disabled={isDeletingAudio}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteAudio}
                disabled={isDeletingAudio}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAudio ? 'Đang xóa...' : 'Xóa vĩnh viễn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Offline Manifest & Integrity Inspector */}
      {isManifestModalOpen && offlinePackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Manifest Gói Học Offline Android — Bài học: {currentLesson.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gói nạp tự động cho Android WorkManager / Room Database với mã kiểm tra toàn vẹn SHA-256
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Package Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Phiên bản gói</span>
                  <span className="text-sm font-bold text-blue-700 font-mono">v{offlinePackage.packageVersion}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tổng dung lượng</span>
                  <span className="text-sm font-bold text-slate-800">{offlinePackage.totalSizeMb} MB</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Số lượng tệp</span>
                  <span className="text-sm font-bold text-slate-800">{offlinePackage.fileCount} tệp</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Trạng thái</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {offlinePackage.packageStatus}
                  </span>
                </div>
              </div>

              {/* Master Checksum */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-blue-900 block">Mã băm SHA-256 Tổng (Bundle Checksum):</span>
                  <code className="text-[11px] text-blue-700 font-mono break-all select-all block mt-0.5">
                    {offlinePackage.packageChecksum}
                  </code>
                </div>
                <button
                  onClick={() => copyChecksumToClipboard(offlinePackage.packageChecksum)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 transition-all"
                >
                  {copiedChecksum ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedChecksum ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Manifest File Table */}
              <div>
                <h4 className="font-bold text-slate-700 text-xs mb-2">Danh Sách Tệp Trong Gói (WorkManager File Queue):</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Tên tệp</th>
                        <th className="p-2.5">Loại tệp</th>
                        <th className="p-2.5">Dung lượng</th>
                        <th className="p-2.5">SHA-256 Checksum</th>
                        <th className="p-2.5 text-center">Bắt buộc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {offlinePackage.manifestFiles.map((file, idx) => (
                        <tr key={file.id || idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-800">
                            <div className="font-semibold text-slate-700">{file.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{file.storagePath}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {file.type}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-700 whitespace-nowrap">
                            {file.sizeMb > 0 ? `${file.sizeMb} MB` : `${Math.round(file.sizeBytes / 1024)} KB`}
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-500">
                            <span title={file.checksum}>{file.checksum.substring(0, 16)}...</span>
                          </td>
                          <td className="p-2.5 text-center">
                            {file.isMandatory ? (
                              <span className="text-emerald-600 font-bold">Có</span>
                            ) : (
                              <span className="text-slate-400">Tùy chọn</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Source Document Confirmation */}
      {showDeleteDocModal && sourceDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 text-red-600 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">XÁC NHẬN XÓA TÀI LIỆU</h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{sourceDoc.name || sourceDoc.fileName}</p>
              </div>
            </div>

            <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-xs text-slate-800 leading-relaxed space-y-2">
              <p className="font-semibold text-red-950">
                Hành động này sẽ xóa hoàn toàn file gốc trên Cloudinary cùng toàn bộ Phần, Mục, nội dung bài giảng và câu hỏi đã tạo từ tài liệu này (đưa về trạng thái chưa đăng tài liệu). Bạn có chắc chắn muốn xóa?
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteDocModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteSourceDoc}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs text-xs cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
