import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch
} from './firebase';
import {
  Course,
  Lesson,
  SlideItem,
  SlideSet,
  SlideSetStatus,
  ContentSection,
  VideoItem,
  AudioItem,
  Unit,
  User,
  UserProgress,
  SystemNotification,
  StorageFileMetadata,
  DashboardStats,
  OfflinePackage,
  LessonVersionInfo,
  LessonSizeBreakdown,
  PptxProcessingJob,
  LessonSection,
  LessonItem,
  LessonQuestion,
  SourceDocument,
  UserItemProgress,
  UserSectionProgress
} from '../types';

// =============================================================
// PRODUCTION FIRESTORE DATA SERVICE
// Direct Cloud Firestore queries with indexing, filtering, pagination & realtime listeners
// =============================================================

// Helper to remove undefined values before sending to Firestore
function sanitizeFirestoreData(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeFirestoreData(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

export const firestoreService = {
  // -------------------------------------------------------------
  // HEALTH & STATUS CHECK
  // -------------------------------------------------------------
  checkConnection: async (): Promise<{ success: boolean; databaseId: string; timestamp: string }> => {
    const testRef = doc(db, '_system_health', 'ping');
    await setDoc(testRef, {
      lastPing: new Date().toISOString(),
      service: 'GDCT_VUNG_4_ADMIN_FIRESTORE'
    });
    const snap = await getDoc(testRef);
    return {
      success: snap.exists(),
      databaseId: db.app.options.projectId || 'connected',
      timestamp: new Date().toISOString()
    };
  },

  // -------------------------------------------------------------
  // COURSES (CHUYÊN ĐỀ)
  // -------------------------------------------------------------
  getCourses: async (includeDeleted = false, maxLimit = 100): Promise<Course[]> => {
    const colRef = collection(db, 'courses');
    let q;
    if (includeDeleted) {
      q = query(colRef, limit(maxLimit));
    } else {
      q = query(colRef, where('isDeleted', '==', false), limit(maxLimit));
    }
    const snap = await getDocs(q);
    const courses = snap.docs.map(d => d.data() as Course);
    return courses.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getCourse: async (id: string): Promise<Course | null> => {
    const docRef = doc(db, 'courses', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Course) : null;
  },

  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const id = data.id || `course-${Date.now()}`;
    const docRef = doc(db, 'courses', id);
    const now = new Date().toISOString();
    const course: Course = {
      id,
      title: data.title || 'Chuyên đề mới',
      description: data.description || '',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      storageThumbnailPath: data.storageThumbnailPath || '',
      rawPptUrl: data.rawPptUrl || '',
      rawPptStoragePath: data.rawPptStoragePath || '',
      year: data.year || 2026,
      order: data.order || 1,
      status: data.status || 'DRAFT',
      version: data.version || 1,
      isDeleted: false,
      createdBy: data.createdBy || 'Phòng Chính trị Vùng 4',
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, course);
    return course;
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    const docRef = doc(db, 'courses', id);
    const existing = await getDoc(docRef);
    if (!existing.exists()) throw new Error(`Không tìm thấy chuyên đề ${id}`);
    
    const now = new Date().toISOString();
    const updatePayload = {
      ...data,
      version: ((existing.data() as Course).version || 1) + 1,
      updatedAt: now
    };
    await updateDoc(docRef, updatePayload);
    const updatedSnap = await getDoc(docRef);
    return updatedSnap.data() as Course;
  },

  deleteCourse: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    const docRef = doc(db, 'courses', id);
    if (permanent) {
      await deleteDoc(docRef);
      return { success: true, message: 'Đã xóa vĩnh viễn chuyên đề' };
    } else {
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: 'Đã chuyển chuyên đề vào thùng rác (Soft Delete)' };
    }
  },

  restoreCourse: async (id: string): Promise<Course> => {
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, {
      isDeleted: false,
      updatedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return snap.data() as Course;
  },

  // Realtime Course Listener
  listenCourses: (callback: (courses: Course[]) => void, includeDeleted = false) => {
    const colRef = collection(db, 'courses');
    const q = includeDeleted
      ? query(colRef)
      : query(colRef, where('isDeleted', '==', false));
    
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => doc.data() as Course);
      courses.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(courses);
    }, (err) => {
      console.error('Error listening to courses:', err);
    });
  },

  // -------------------------------------------------------------
  // LESSONS (BÀI HỌC)
  // -------------------------------------------------------------
  getLessons: async (courseId?: string, includeDeleted = false, maxLimit = 100): Promise<Lesson[]> => {
    const colRef = collection(db, 'lessons');
    let q;
    if (courseId) {
      if (includeDeleted) {
        q = query(colRef, where('courseId', '==', courseId), limit(maxLimit));
      } else {
        q = query(
          colRef,
          where('courseId', '==', courseId),
          where('isDeleted', '==', false),
          limit(maxLimit)
        );
      }
    } else {
      if (includeDeleted) {
        q = query(colRef, limit(maxLimit));
      } else {
        q = query(colRef, where('isDeleted', '==', false), limit(maxLimit));
      }
    }
    const snap = await getDocs(q);
    const lessons = snap.docs.map(d => d.data() as Lesson);
    return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getLesson: async (id: string): Promise<Lesson | null> => {
    const docRef = doc(db, 'lessons', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as Lesson) : null;
  },

  createLesson: async (data: Partial<Lesson>): Promise<Lesson> => {
    const id = data.id || `lesson-${Date.now()}`;
    const docRef = doc(db, 'lessons', id);
    const now = new Date().toISOString();
    const lesson: Lesson = {
      id,
      courseId: data.courseId || '',
      title: data.title || 'Bài học mới',
      subtitle: data.subtitle || '',
      description: data.description || '',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      storageThumbnailPath: data.storageThumbnailPath || '',
      order: data.order || 1,
      status: data.status || 'DRAFT',
      version: 1,
      contentVersion: 1,
      mediaVersion: 1,
      isDeleted: false,
      createdBy: data.createdBy || 'Ban Tuyên huấn Vùng 4',
      durationMinutes: data.durationMinutes || 45,
      rawPptUrl: data.rawPptUrl || '',
      rawPptStoragePath: data.rawPptStoragePath || '',
      moduleConfig: data.moduleConfig || {
        showSlides: true,
        showContents: true,
        showVideos: true,
        showAudios: true
      },
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, lesson);
    return lesson;
  },

  updateLesson: async (id: string, data: Partial<Lesson>): Promise<Lesson> => {
    const docRef = doc(db, 'lessons', id);
    const existing = await getDoc(docRef);
    if (!existing.exists()) throw new Error(`Không tìm thấy bài học ${id}`);
    
    const prev = existing.data() as Lesson;
    const now = new Date().toISOString();
    
    // Tự động quản lý phiên bản theo quy chuẩn GDCT
    const isContentChanged = !!(data.title || data.subtitle || data.description || data.status);
    const isMediaChanged = !!(data.thumbnail || data.rawPptUrl || data.moduleConfig);

    const updatePayload = {
      ...data,
      version: (prev.version || 1) + 1,
      contentVersion: isContentChanged ? (prev.contentVersion || 1) + 1 : prev.contentVersion || 1,
      mediaVersion: isMediaChanged ? (prev.mediaVersion || 1) + 1 : prev.mediaVersion || 1,
      publishedAt: data.status === 'PUBLISHED' && !prev.publishedAt ? now : (data.status !== 'PUBLISHED' ? prev.publishedAt : prev.publishedAt || now),
      updatedAt: now
    };
    
    await updateDoc(docRef, updatePayload);
    const updatedSnap = await getDoc(docRef);
    return updatedSnap.data() as Lesson;
  },

  deleteLesson: async (id: string, permanent = false): Promise<{ success: boolean; message: string }> => {
    const docRef = doc(db, 'lessons', id);
    if (permanent) {
      await deleteDoc(docRef);
      return { success: true, message: 'Đã xóa vĩnh viễn bài học' };
    } else {
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: 'Đã chuyển bài học vào thùng rác' };
    }
  },

  restoreLesson: async (id: string): Promise<Lesson> => {
    const docRef = doc(db, 'lessons', id);
    await updateDoc(docRef, {
      isDeleted: false,
      updatedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return snap.data() as Lesson;
  },

  // Realtime Lesson Listener
  listenLessons: (courseId: string | undefined, callback: (lessons: Lesson[]) => void, includeDeleted = false) => {
    const colRef = collection(db, 'lessons');
    let q;
    if (courseId) {
      q = includeDeleted
        ? query(colRef, where('courseId', '==', courseId))
        : query(colRef, where('courseId', '==', courseId), where('isDeleted', '==', false));
    } else {
      q = includeDeleted
        ? query(colRef)
        : query(colRef, where('isDeleted', '==', false));
    }

    return onSnapshot(q, (snapshot) => {
      const lessons = snapshot.docs.map(doc => doc.data() as Lesson);
      lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(lessons);
    }, (err) => {
      console.error('Error listening to lessons:', err);
    });
  },

  // -------------------------------------------------------------
  // SLIDE SETS & SLIDES
  // -------------------------------------------------------------
  getSlideSet: async (lessonId: string): Promise<SlideSet | null> => {
    const colRef = collection(db, 'slideSets');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const sets = snap.docs.map(d => d.data() as SlideSet);
    sets.sort((a, b) => (b.version || 0) - (a.version || 0));
    return sets[0];
  },

  saveSlideSet: async (data: Partial<SlideSet>): Promise<SlideSet> => {
    const id = data.id || `slideset-${data.lessonId || 'general'}-${Date.now()}`;
    const docRef = doc(db, 'slideSets', id);
    const now = new Date().toISOString();
    const existingSnap = await getDoc(docRef);
    const existing = existingSnap.exists() ? (existingSnap.data() as SlideSet) : null;

    const setObj: SlideSet = {
      id,
      courseId: data.courseId || existing?.courseId || '',
      lessonId: data.lessonId || existing?.lessonId || '',
      name: data.name || existing?.name || 'Bộ Slide Bài giảng',
      totalSlides: data.totalSlides !== undefined ? data.totalSlides : (existing?.totalSlides || 0),
      status: data.status || existing?.status || 'PROCESSING',
      version: data.version || existing?.version || 1,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    await setDoc(docRef, setObj, { merge: true });
    return setObj;
  },

  listenSlideSet: (lessonId: string, callback: (set: SlideSet | null) => void) => {
    const colRef = collection(db, 'slideSets');
    const q = query(colRef, where('lessonId', '==', lessonId));
    return onSnapshot(q, (snap) => {
      if (snap.empty) {
        callback(null);
      } else {
        const sets = snap.docs.map(d => d.data() as SlideSet);
        sets.sort((a, b) => (b.version || 0) - (a.version || 0));
        callback(sets[0]);
      }
    });
  },

  listenSlides: (lessonId: string, callback: (slides: SlideItem[]) => void) => {
    const colRef = collection(db, 'slides');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    return onSnapshot(q, (snap) => {
      const slides = snap.docs.map(d => d.data() as SlideItem);
      slides.sort((a, b) => (a.order || a.slideOrder || 0) - (b.order || b.slideOrder || 0));
      callback(slides);
    });
  },

  getSlides: async (lessonId: string): Promise<SlideItem[]> => {
    const colRef = collection(db, 'slides');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const slides = snap.docs.map(d => d.data() as SlideItem);
    return slides.sort((a, b) => (a.order || a.slideOrder || 0) - (b.order || b.slideOrder || 0));
  },

  createSlide: async (data: Partial<SlideItem>): Promise<SlideItem> => {
    const id = data.id || `slide-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'slides', id);
    const now = new Date().toISOString();
    const lessonId = data.lessonId || '';
    const assetFolder = data.assetFolder || `GDCT_V4/SLIDE/${lessonId || 'general'}`;

    const slide: SlideItem = {
      id,
      courseId: data.courseId || '',
      lessonId,
      slideSetId: data.slideSetId || '',
      order: data.order || data.slideOrder || 1,
      slideOrder: data.slideOrder || data.order || 1,
      title: data.title || `Slide ${data.order || 1}`,
      fileName: data.fileName || '',
      imageUrl: data.imageUrl || data.secureUrl || '',
      secureUrl: data.secureUrl || data.imageUrl || '',
      cloudinaryUrl: data.cloudinaryUrl || data.secureUrl || data.imageUrl || '',
      storagePath: data.storagePath || data.cloudinaryPublicId || '',
      cloudinaryPublicId: data.cloudinaryPublicId || data.storagePath || '',
      assetFolder,
      storageProvider: data.storageProvider || 'cloudinary',
      mimeType: data.mimeType || 'image/png',
      bytes: data.bytes || 0,
      notes: data.notes || '',
      width: data.width || 1920,
      height: data.height || 1080,
      version: data.version || 1,
      isDeleted: false,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    await setDoc(docRef, slide);
    return slide;
  },

  deleteSlideSet: async (slideSetId: string, lessonId: string): Promise<{ success: boolean }> => {
    if (slideSetId) {
      const setRef = doc(db, 'slideSets', slideSetId);
      await updateDoc(setRef, { status: 'ARCHIVED', updatedAt: new Date().toISOString() });
    }
    const colRef = collection(db, 'slides');
    const q = query(colRef, where('lessonId', '==', lessonId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { isDeleted: true, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
    return { success: true };
  },

  updateSlide: async (id: string, data: Partial<SlideItem>): Promise<SlideItem> => {
    const docRef = doc(db, 'slides', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as SlideItem;
  },

  deleteSlide: async (id: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'slides', id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // -------------------------------------------------------------
  // CONTENTS (NỘI DUNG BÀI GIẢNG / LỜI BÁC DẠY)
  // -------------------------------------------------------------
  getContents: async (lessonId: string): Promise<ContentSection[]> => {
    const colRef = collection(db, 'contents');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const contents = snap.docs.map(d => d.data() as ContentSection);
    return contents.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createContent: async (data: Partial<ContentSection>): Promise<ContentSection> => {
    const id = data.id || `content-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'contents', id);
    const now = new Date().toISOString();
    const content: ContentSection = {
      id,
      lessonId: data.lessonId || '',
      order: data.order || 1,
      title: data.title || '',
      quote: data.quote || '',
      quoteAuthor: data.quoteAuthor || '',
      quoteHistoricalContext: data.quoteHistoricalContext || '',
      isUncleHoTeaching: data.isUncleHoTeaching ?? (!!data.quote),
      bodyHtml: data.bodyHtml || '',
      version: data.version || 1,
      isDeleted: false,
      quoteQuiz: data.quoteQuiz,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, content);
    return content;
  },

  updateContent: async (id: string, data: Partial<ContentSection>): Promise<ContentSection> => {
    const docRef = doc(db, 'contents', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as ContentSection;
  },

  // -------------------------------------------------------------
  // STRUCTURED LESSON SECTIONS & ITEMS (PHẦN -> MỤC -> NỘI DUNG)
  // -------------------------------------------------------------
  getSections: async (lessonId: string): Promise<LessonSection[]> => {
    const colRef = collection(db, 'sections');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const sections = snap.docs.map(d => d.data() as LessonSection);
    return sections.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createSection: async (data: Partial<LessonSection>): Promise<LessonSection> => {
    const id = data.id || `section-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'sections', id);
    const now = new Date().toISOString();
    const section: LessonSection = {
      id,
      lessonId: data.lessonId || '',
      title: data.title || 'PHẦN MỚI',
      order: data.order || 1,
      description: data.description || '',
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, section);
    return section;
  },

  updateSection: async (id: string, data: Partial<LessonSection>): Promise<LessonSection> => {
    const docRef = doc(db, 'sections', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as LessonSection;
  },

  // ITEMS (MỤC)
  getItems: async (lessonId: string, sectionId?: string): Promise<LessonItem[]> => {
    const colRef = collection(db, 'items');
    let q;
    if (sectionId) {
      q = query(
        colRef,
        where('lessonId', '==', lessonId),
        where('sectionId', '==', sectionId),
        where('isDeleted', '==', false)
      );
    } else {
      q = query(
        colRef,
        where('lessonId', '==', lessonId),
        where('isDeleted', '==', false)
      );
    }
    const snap = await getDocs(q);
    const items = snap.docs.map(d => d.data() as LessonItem);
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createItem: async (data: Partial<LessonItem>): Promise<LessonItem> => {
    const id = data.id || `item-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'items', id);
    const now = new Date().toISOString();
    const itemObj: Record<string, any> = {
      id,
      lessonId: data.lessonId || '',
      sectionId: data.sectionId || '',
      title: data.title || 'Mục mới',
      order: data.order || 1,
      content: data.content || data.bodyHtml || '',
      bodyHtml: data.bodyHtml || data.content || '',
      sourceDocumentId: data.sourceDocumentId || null,
      sourcePageStart: data.sourcePageStart ?? null,
      sourcePageEnd: data.sourcePageEnd ?? null,
      paragraphs: data.paragraphs || [],
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    const cleanItem = sanitizeFirestoreData(itemObj);
    await setDoc(docRef, cleanItem);
    return cleanItem as LessonItem;
  },

  updateItem: async (id: string, data: Partial<LessonItem>): Promise<LessonItem> => {
    const docRef = doc(db, 'items', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as LessonItem;
  },

  deleteItem: async (id: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'items', id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // QUESTIONS AT END OF EACH MỤC
  getQuestions: async (lessonId: string, itemId?: string): Promise<LessonQuestion[]> => {
    const colRef = collection(db, 'questions');
    let q;
    if (itemId) {
      q = query(
        colRef,
        where('lessonId', '==', lessonId),
        where('itemId', '==', itemId),
        where('isDeleted', '==', false)
      );
    } else {
      q = query(
        colRef,
        where('lessonId', '==', lessonId),
        where('isDeleted', '==', false)
      );
    }
    const snap = await getDocs(q);
    const questions = snap.docs.map(d => d.data() as LessonQuestion);
    return questions.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createQuestion: async (data: Partial<LessonQuestion>): Promise<LessonQuestion> => {
    const id = data.id || `question-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'questions', id);
    const now = new Date().toISOString();
    const question: LessonQuestion = {
      id,
      lessonId: data.lessonId || '',
      sectionId: data.sectionId || '',
      itemId: data.itemId || '',
      type: data.type || 'single_choice',
      question: data.question || '',
      options: data.options || [],
      correctAnswer: data.correctAnswer !== undefined ? data.correctAnswer : 0,
      explanation: data.explanation || '',
      points: data.points || 10,
      order: data.order || 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, question);
    return question;
  },

  updateQuestion: async (id: string, data: Partial<LessonQuestion>): Promise<LessonQuestion> => {
    const docRef = doc(db, 'questions', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as LessonQuestion;
  },

  deleteQuestion: async (id: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'questions', id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // SOURCE DOCUMENT METADATA
  saveSourceDocument: async (lessonId: string, docData: Partial<SourceDocument>): Promise<SourceDocument> => {
    const docId = docData.id || `doc-${lessonId}`;
    const docRef = doc(db, 'documents', docId);
    const now = new Date().toISOString();
    const assetFolder = docData.assetFolder || docData.cloudinaryFolder || `GDCT_V4/TAILIEU/${lessonId}`;
    const url = docData.secureUrl || docData.cloudinaryUrl || docData.url || '';
    
    const documentObj: Record<string, any> = {
      id: docId,
      lessonId,
      name: docData.name || docData.fileName || 'Tài liệu GDCT',
      fileName: docData.fileName || docData.name || 'Tài liệu GDCT',
      originalName: docData.originalName || docData.fileName || docData.name || 'Tài liệu GDCT',
      type: docData.type || 'docx',
      mimeType: docData.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: docData.size || docData.fileSize || 0,
      fileSize: docData.fileSize || docData.size || 0,
      sizeMb: docData.sizeMb || Math.round((((docData.size || docData.fileSize || 0)) / (1024 * 1024)) * 100) / 100,
      pageCount: (docData.pageCount && docData.pageCount > 0) ? docData.pageCount : null,
      url,
      cloudinaryUrl: url,
      secureUrl: url,
      cloudinaryPublicId: docData.cloudinaryPublicId || docData.storagePath || '',
      assetFolder,
      cloudinaryFolder: assetFolder,
      resourceType: docData.resourceType || 'raw',
      format: docData.format || (docData.type || 'docx'),
      storagePath: docData.storagePath || docData.cloudinaryPublicId || '',
      storageProvider: docData.storageProvider || 'cloudinary',
      status: docData.status || 'READY',
      createdAt: docData.createdAt || now,
      updatedAt: now
    };

    const cleanDoc = sanitizeFirestoreData(documentObj);
    await setDoc(docRef, cleanDoc);
    return cleanDoc as SourceDocument;
  },

  getSourceDocument: async (lessonId: string): Promise<SourceDocument | null> => {
    const docRef = doc(db, 'documents', `doc-${lessonId}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as SourceDocument;
    
    // Fallback search by lessonId query
    const colRef = collection(db, 'documents');
    const q = query(colRef, where('lessonId', '==', lessonId), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as SourceDocument;
    }
    return null;
  },

  deleteItemCascade: async (itemId: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'items', itemId);
    await updateDoc(docRef, { isDeleted: true, updatedAt: new Date().toISOString() });
    
    // Also delete associated questions
    const qCol = collection(db, 'questions');
    const qSnap = await getDocs(query(qCol, where('itemId', '==', itemId)));
    
    const progCol = collection(db, 'itemProgress');
    const progSnap = await getDocs(query(progCol, where('itemId', '==', itemId)));
    
    const batch = writeBatch(db);
    qSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: new Date().toISOString() }));
    progSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit().catch(() => {});
    return { success: true };
  },

  deleteContent: async (contentId: string): Promise<{ success: boolean }> => {
    return await firestoreService.deleteItemCascade(contentId);
  },

  deleteSectionCascade: async (lessonId: string, sectionId: string): Promise<{ success: boolean }> => {
    const now = new Date().toISOString();
    const secRef = doc(db, 'sections', sectionId);
    await updateDoc(secRef, { isDeleted: true, updatedAt: now });

    const itemsCol = collection(db, 'items');
    const itemsSnap = await getDocs(query(itemsCol, where('sectionId', '==', sectionId)));
    const batch = writeBatch(db);
    itemsSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));

    const questionsCol = collection(db, 'questions');
    const questionsSnap = await getDocs(query(questionsCol, where('sectionId', '==', sectionId)));
    questionsSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));

    for (const itemDoc of itemsSnap.docs) {
      const itemQSnap = await getDocs(query(questionsCol, where('itemId', '==', itemDoc.id)));
      itemQSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));
    }

    const secProgCol = collection(db, 'userSectionProgress');
    const secProgSnap = await getDocs(query(secProgCol, where('sectionId', '==', sectionId)));
    secProgSnap.docs.forEach(d => batch.delete(d.ref));

    const itemProgCol = collection(db, 'itemProgress');
    for (const itemDoc of itemsSnap.docs) {
      const progSnap = await getDocs(query(itemProgCol, where('itemId', '==', itemDoc.id)));
      progSnap.docs.forEach(d => batch.delete(d.ref));
    }

    await batch.commit();
    return { success: true };
  },

  deleteSection: async (sectionId: string): Promise<{ success: boolean }> => {
    const secDoc = await getDoc(doc(db, 'sections', sectionId));
    const lessonId = secDoc.exists() ? (secDoc.data() as any).lessonId : '';
    if (lessonId) {
      return await firestoreService.deleteSectionCascade(lessonId, sectionId);
    }
    const secRef = doc(db, 'sections', sectionId);
    await updateDoc(secRef, { isDeleted: true, updatedAt: new Date().toISOString() });
    return { success: true };
  },

  deleteAllLessonContent: async (lessonId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      const sectionsSnap = await getDocs(query(collection(db, 'sections'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));
      const itemsSnap = await getDocs(query(collection(db, 'items'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));
      const questionsSnap = await getDocs(query(collection(db, 'questions'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));

      sectionsSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));
      itemsSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));
      questionsSnap.docs.forEach(d => batch.update(d.ref, { isDeleted: true, updatedAt: now }));

      const itemProgSnap = await getDocs(query(collection(db, 'itemProgress'), where('lessonId', '==', lessonId)));
      itemProgSnap.docs.forEach(d => batch.delete(d.ref));

      const secProgSnap = await getDocs(query(collection(db, 'userSectionProgress'), where('lessonId', '==', lessonId)));
      secProgSnap.docs.forEach(d => batch.delete(d.ref));

      const docsSnap = await getDocs(query(collection(db, 'documents'), where('lessonId', '==', lessonId)));
      docsSnap.docs.forEach(d => batch.update(d.ref, { status: 'parsed', publishedAt: null, updatedAt: now }));

      const lessonRef = doc(db, 'lessons', lessonId);
      batch.update(lessonRef, { sourceDocument: null, updatedAt: now });

      await batch.commit();
      return { success: true, message: 'Đã xóa toàn bộ nội dung bài học thành công!' };
    } catch (err: any) {
      console.error('Error in deleteAllLessonContent:', err);
      throw new Error(err.message || 'Lỗi xóa toàn bộ nội dung bài học');
    }
  },

  deleteDocumentContentOnly: async (lessonId: string, documentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      // Fetch all active sections, items, and questions for this lesson
      const sectionsSnap = await getDocs(query(collection(db, 'sections'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));
      const itemsSnap = await getDocs(query(collection(db, 'items'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));
      const questionsSnap = await getDocs(query(collection(db, 'questions'), where('lessonId', '==', lessonId), where('isDeleted', '==', false)));

      const allSections = sectionsSnap.docs.map(d => d.data() as LessonSection);
      const allItems = itemsSnap.docs.map(d => d.data() as LessonItem);
      const allQuestions = questionsSnap.docs.map(d => d.data() as LessonQuestion);

      // Determine items to delete (sourceDocumentId === documentId)
      const itemsToDelete = allItems.filter(i => i.sourceDocumentId === documentId);
      const itemIdsToDelete = new Set(itemsToDelete.map(i => i.id));

      // Determine sections to delete:
      // A section is deleted if:
      // - section.sourceDocumentId === documentId
      // - OR all items in that section have sourceDocumentId === documentId (and section had items from this doc)
      const sectionIdsToDelete = new Set<string>();
      allSections.forEach(sec => {
        const secItems = allItems.filter(i => i.sectionId === sec.id);
        const remainingItems = secItems.filter(i => !itemIdsToDelete.has(i.id));
        if (sec.sourceDocumentId === documentId || (secItems.length > 0 && remainingItems.length === 0 && secItems.every(i => i.sourceDocumentId === documentId))) {
          sectionIdsToDelete.add(sec.id);
        }
      });

      // Determine questions to delete (sourceDocumentId === documentId or itemId in itemIdsToDelete or sectionId in sectionIdsToDelete)
      const questionIdsToDelete = new Set<string>();
      allQuestions.forEach(q => {
        if (
          q.sourceDocumentId === documentId ||
          (q.itemId && itemIdsToDelete.has(q.itemId)) ||
          (q.sectionId && sectionIdsToDelete.has(q.sectionId))
        ) {
          questionIdsToDelete.add(q.id);
        }
      });

      // Soft delete items
      itemsSnap.docs.forEach(d => {
        const item = d.data() as LessonItem;
        if (itemIdsToDelete.has(item.id)) {
          batch.update(d.ref, { isDeleted: true, updatedAt: now });
        }
      });

      // Soft delete sections
      sectionsSnap.docs.forEach(d => {
        const sec = d.data() as LessonSection;
        if (sectionIdsToDelete.has(sec.id)) {
          batch.update(d.ref, { isDeleted: true, updatedAt: now });
        }
      });

      // Soft delete questions
      questionsSnap.docs.forEach(d => {
        const q = d.data() as LessonQuestion;
        if (questionIdsToDelete.has(q.id)) {
          batch.update(d.ref, { isDeleted: true, updatedAt: now });
        }
      });

      // Clean up progress
      const itemProgSnap = await getDocs(query(collection(db, 'itemProgress'), where('lessonId', '==', lessonId)));
      itemProgSnap.docs.forEach(d => {
        const prog = d.data();
        if (prog.itemId && itemIdsToDelete.has(prog.itemId)) {
          batch.delete(d.ref);
        }
      });

      const secProgSnap = await getDocs(query(collection(db, 'userSectionProgress'), where('lessonId', '==', lessonId)));
      secProgSnap.docs.forEach(d => {
        const prog = d.data();
        if (prog.sectionId && sectionIdsToDelete.has(prog.sectionId)) {
          batch.delete(d.ref);
        }
      });

      // Update document status back to parsed/uploaded and clear publishedAt
      const docRef = doc(db, 'documents', documentId);
      batch.update(docRef, { status: 'parsed', publishedAt: null, updatedAt: now });

      await batch.commit();
      return { success: true, message: 'Đã xóa toàn bộ nội dung bài giảng và các phần rỗng sinh từ tài liệu thành công!' };
    } catch (err: any) {
      console.error('Error in deleteDocumentContentOnly:', err);
      throw new Error(err.message || 'Lỗi xóa nội dung tài liệu');
    }
  },

  deleteSourceDocumentCascade: async (lessonId: string, documentId: string, cloudinaryPublicId?: string, resourceType = 'raw'): Promise<{ success: boolean; message: string; cloudinaryDeleted: boolean }> => {
    try {
      // 1. First run the same content cleanup to remove sections, items, questions, and progress linked to documentId
      await firestoreService.deleteDocumentContentOnly(lessonId, documentId);

      // 2. Delete document metadata from Firestore
      const docRef = doc(db, 'documents', documentId);
      await deleteDoc(docRef);

      // 3. Remove sourceDocument from lesson if matches
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, { sourceDocument: null, updatedAt: new Date().toISOString() });

      // 4. Delete Cloudinary file if publicId exists
      let cloudinaryDeleted = true;
      if (cloudinaryPublicId) {
        try {
          const resp = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: cloudinaryPublicId, resourceType })
          });
          const json = await resp.json();
          if (!json.success) {
            cloudinaryDeleted = false;
          }
        } catch (cloudErr) {
          console.warn('Cloudinary delete request failed:', cloudErr);
          cloudinaryDeleted = false;
        }
      }

      if (!cloudinaryDeleted) {
        return {
          success: true,
          cloudinaryDeleted: false,
          message: 'Đã xóa nội dung và metadata tài liệu nhưng chưa xóa được file Cloudinary. Vui lòng thử lại.'
        };
      }

      return {
        success: true,
        cloudinaryDeleted: true,
        message: 'Đã xóa tài liệu và toàn bộ dữ liệu bài học liên quan thành công.'
      };
    } catch (err: any) {
      console.error('Error in deleteSourceDocumentCascade:', err);
      throw new Error(err.message || 'Lỗi xóa tài liệu đồng bộ');
    }
  },

  // GRANULAR USER ITEM PROGRESS
  getItemProgress: async (userId: string, lessonId: string): Promise<UserItemProgress[]> => {
    const colRef = collection(db, 'itemProgress');
    const q = query(
      colRef,
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserItemProgress);
  },

  submitItemProgress: async (progressData: Partial<UserItemProgress>): Promise<UserItemProgress> => {
    const id = progressData.id || `itemprog-${progressData.userId}-${progressData.lessonId}-${progressData.itemId}`;
    const docRef = doc(db, 'itemProgress', id);
    const now = new Date().toISOString();

    const record: UserItemProgress = {
      id,
      userId: progressData.userId || 'user-default',
      userName: progressData.userName || 'Chiến sĩ Hải Quân',
      unitId: progressData.unitId || 'unit-1',
      unitName: progressData.unitName || 'Lữ đoàn 162',
      courseId: progressData.courseId || '',
      lessonId: progressData.lessonId || '',
      sectionId: progressData.sectionId || '',
      itemId: progressData.itemId || '',
      completed: progressData.completed ?? true,
      score: progressData.score || 10,
      attempts: (progressData.attempts || 0) + 1,
      lastAccessedAt: now,
      completedAt: progressData.completed ? now : undefined
    };

    await setDoc(docRef, record, { merge: true });
    return record;
  },

  submitSectionProgress: async (progressData: Partial<UserSectionProgress>): Promise<UserSectionProgress> => {
    const id = progressData.id || `secprog-${progressData.userId}-${progressData.lessonId}-${progressData.sectionId}`;
    const docRef = doc(db, 'userSectionProgress', id);
    const now = new Date().toISOString();

    const recordObj: Record<string, any> = {
      id,
      userId: progressData.userId || 'user-default',
      userName: progressData.userName || 'Chiến sĩ Hải Quân',
      unitId: progressData.unitId || 'unit-1',
      unitName: progressData.unitName || 'Lữ đoàn 162',
      courseId: progressData.courseId || '',
      lessonId: progressData.lessonId || '',
      sectionId: progressData.sectionId || '',
      contentCompleted: progressData.contentCompleted ?? true,
      essaySubmitted: progressData.essaySubmitted ?? false,
      essayAnswer: progressData.essayAnswer || '',
      answerStatus: progressData.essaySubmitted ? 'submitted' : 'pending_review',
      score: progressData.score || (progressData.essaySubmitted ? 10 : 0),
      completed: (progressData.contentCompleted && progressData.essaySubmitted) ?? false,
      startedAt: progressData.startedAt || now,
      submittedAt: progressData.essaySubmitted ? (progressData.submittedAt || now) : null,
      completedAt: (progressData.contentCompleted && progressData.essaySubmitted) ? (progressData.completedAt || now) : null,
      updatedAt: now
    };

    const cleanRecord = sanitizeFirestoreData(recordObj);
    await setDoc(docRef, cleanRecord, { merge: true });
    return cleanRecord as UserSectionProgress;
  },

  getSectionProgress: async (userId: string, lessonId: string): Promise<UserSectionProgress[]> => {
    const colRef = collection(db, 'userSectionProgress');
    const q = query(
      colRef,
      where('userId', '==', userId),
      where('lessonId', '==', lessonId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserSectionProgress);
  },

  // -------------------------------------------------------------
  // VIDEOS
  // -------------------------------------------------------------
  getVideos: async (lessonId: string): Promise<VideoItem[]> => {
    const colRef = collection(db, 'videos');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const videos = snap.docs.map(d => d.data() as VideoItem);
    return videos.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createVideo: async (data: Partial<VideoItem>): Promise<VideoItem> => {
    const id = data.id || `video-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'videos', id);
    const now = new Date().toISOString();
    const lessonId = data.lessonId || '';
    const assetFolder = data.assetFolder || `GDCT_V4/VIDEO/${lessonId || 'general'}`;

    const video: VideoItem = {
      id,
      lessonId,
      order: data.order || 1,
      title: data.title || '',
      description: data.description || '',
      videoUrl: data.videoUrl || data.cloudinaryUrl || '',
      cloudinaryUrl: data.cloudinaryUrl || data.videoUrl || '',
      cloudinaryPublicId: data.cloudinaryPublicId || data.storagePath || '',
      assetFolder,
      mimeType: data.mimeType || 'video/mp4',
      fileSize: data.fileSize || 0,
      resourceType: data.resourceType || 'video',
      storagePath: data.storagePath || data.cloudinaryPublicId || '',
      thumbnail: data.thumbnail || (data as any).thumbnailUrl || '',
      durationSeconds: data.durationSeconds || 0,
      version: data.version || 1,
      isDeleted: false,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    await setDoc(docRef, video);
    return video;
  },

  updateVideo: async (id: string, data: Partial<VideoItem>): Promise<VideoItem> => {
    const docRef = doc(db, 'videos', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as VideoItem;
  },

  deleteVideo: async (id: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // -------------------------------------------------------------
  // AUDIOS
  // -------------------------------------------------------------
  getAudios: async (lessonId: string): Promise<AudioItem[]> => {
    const colRef = collection(db, 'audios');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('isDeleted', '==', false)
    );
    const snap = await getDocs(q);
    const audios = snap.docs.map(d => d.data() as AudioItem);
    return audios.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  createAudio: async (data: Partial<AudioItem>): Promise<AudioItem> => {
    const id = data.id || `audio-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const docRef = doc(db, 'audios', id);
    const now = new Date().toISOString();
    const lessonId = data.lessonId || '';
    const assetFolder = data.assetFolder || `GDCT_V4/AUDIO/${lessonId || 'general'}`;

    const audio: AudioItem = {
      id,
      lessonId,
      order: data.order || 1,
      title: data.title || '',
      description: data.description || '',
      audioUrl: data.audioUrl || data.cloudinaryUrl || '',
      cloudinaryUrl: data.cloudinaryUrl || data.audioUrl || '',
      cloudinaryPublicId: data.cloudinaryPublicId || data.storagePath || '',
      assetFolder,
      mimeType: data.mimeType || 'audio/mp3',
      fileSize: data.fileSize || 0,
      resourceType: data.resourceType || 'video',
      storagePath: data.storagePath || data.cloudinaryPublicId || '',
      durationSeconds: data.durationSeconds || 0,
      version: data.version || 1,
      isDeleted: false,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    await setDoc(docRef, audio);
    return audio;
  },

  updateAudio: async (id: string, data: Partial<AudioItem>): Promise<AudioItem> => {
    const docRef = doc(db, 'audios', id);
    const now = new Date().toISOString();
    await updateDoc(docRef, {
      ...data,
      updatedAt: now
    });
    const snap = await getDoc(docRef);
    return snap.data() as AudioItem;
  },

  deleteAudio: async (id: string): Promise<{ success: boolean }> => {
    const docRef = doc(db, 'audios', id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // -------------------------------------------------------------
  // UNITS
  // -------------------------------------------------------------
  getUnits: async (): Promise<Unit[]> => {
    const colRef = collection(db, 'units');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as Unit);
  },

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  getUsers: async (): Promise<User[]> => {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as User);
  },

  // -------------------------------------------------------------
  // USER PROGRESS
  // -------------------------------------------------------------
  getProgress: async (unitId?: string, lessonId?: string): Promise<UserProgress[]> => {
    const colRef = collection(db, 'progress');
    let q;
    if (unitId && lessonId) {
      q = query(colRef, where('unitId', '==', unitId), where('lessonId', '==', lessonId));
    } else if (unitId) {
      q = query(colRef, where('unitId', '==', unitId));
    } else if (lessonId) {
      q = query(colRef, where('lessonId', '==', lessonId));
    } else {
      q = query(colRef, limit(100));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProgress);
  },

  submitProgress: async (data: Partial<UserProgress>): Promise<UserProgress> => {
    const id = data.id || `prog-${data.userId}-${data.lessonId}`;
    const docRef = doc(db, 'progress', id);
    const now = new Date().toISOString();
    
    const sProg = Number(data.slideProgress) || 0;
    const cProg = Number(data.contentProgress) || 0;
    const vProg = Number(data.videoProgress) || 0;
    const aProg = Number(data.audioProgress) || 0;
    const overall = Math.max(sProg, cProg, vProg, aProg);
    const isCompleted = overall >= 85 || sProg === 100 || cProg === 100;

    const progressRecord: UserProgress = {
      id,
      userId: data.userId || 'user-default',
      userName: data.userName || 'Chiến sĩ Hải Quân',
      unitId: data.unitId || 'unit-1',
      unitName: data.unitName || 'Lữ đoàn 162',
      lessonId: data.lessonId || '',
      lessonTitle: data.lessonTitle || '',
      courseId: data.courseId || '',
      slideProgress: sProg,
      videoProgress: vProg,
      audioProgress: aProg,
      contentProgress: cProg,
      overallProgress: overall,
      completed: isCompleted,
      lastAccessedAt: now,
      completedAt: isCompleted ? now : undefined,
      version: 1
    };

    await setDoc(docRef, progressRecord);
    return progressRecord;
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  getNotifications: async (maxLimit = 20): Promise<SystemNotification[]> => {
    const colRef = collection(db, 'notifications');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxLimit));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SystemNotification);
  },

  createNotification: async (data: Partial<SystemNotification>): Promise<SystemNotification> => {
    const id = data.id || `notif-${Date.now()}`;
    const docRef = doc(db, 'notifications', id);
    const notif: SystemNotification = {
      id,
      title: data.title || '',
      content: data.content || '',
      type: data.type || 'ANNOUNCEMENT',
      priority: data.priority || 'NORMAL',
      targetUnitId: data.targetUnitId || 'ALL',
      sentBy: data.sentBy || 'Ban Tuyên huấn Vùng 4',
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, notif);
    return notif;
  },

  // -------------------------------------------------------------
  // MEDIA FILES METADATA (Cloudinary CDN Integration)
  // -------------------------------------------------------------
  saveMediaFileMetadata: async (data: {
    cloudinaryPublicId: string;
    secureUrl: string;
    resourceType?: string;
    fileName?: string;
    mimeType?: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
    version?: number;
  }) => {
    const id = data.cloudinaryPublicId.replace(/[/]/g, '_');
    const docRef = doc(db, 'mediaFiles', id);
    const now = new Date().toISOString();
    const metadataRecord = {
      provider: 'cloudinary',
      cloudinaryPublicId: data.cloudinaryPublicId,
      resourceType: data.resourceType || 'image',
      secureUrl: data.secureUrl,
      fileName: data.fileName || 'file',
      mimeType: data.mimeType || 'image/jpeg',
      bytes: data.bytes || 0,
      width: data.width || 0,
      height: data.height || 0,
      duration: data.duration || 0,
      version: data.version || 1,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, metadataRecord);
    return metadataRecord;
  },

  deleteMediaFileMetadata: async (cloudinaryPublicId: string): Promise<boolean> => {
    const id = cloudinaryPublicId.replace(/[/]/g, '_');
    const docRef = doc(db, 'mediaFiles', id);
    await deleteDoc(docRef);
    return true;
  },

  // -------------------------------------------------------------
  // PPTX BACKGROUND PROCESSING JOBS
  // -------------------------------------------------------------
  createPptxJob: async (data: Partial<PptxProcessingJob>): Promise<PptxProcessingJob> => {
    const id = data.id || `pptx-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, 'pptxProcessing', id);
    const now = new Date().toISOString();
    const job: PptxProcessingJob = {
      id,
      fileName: data.fileName || 'presentation.pptx',
      fileSize: data.fileSize || 0,
      originalUrl: data.originalUrl || '',
      originalPublicId: data.originalPublicId || '',
      courseId: data.courseId || '',
      lessonId: data.lessonId || '',
      status: data.status || 'processing',
      totalSlides: data.totalSlides || 0,
      processedSlides: data.processedSlides || 0,
      progress: data.progress || 0,
      currentSlide: data.currentSlide || 0,
      currentStepName: data.currentStepName || 'Đã nhận file PPTX',
      error: data.error || null,
      errorStep: data.errorStep || null,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(docRef, job);
    return job;
  },

  updatePptxJob: async (jobId: string, updates: Partial<PptxProcessingJob>): Promise<void> => {
    const docRef = doc(db, 'pptxProcessing', jobId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  },

  getPptxJob: async (jobId: string): Promise<PptxProcessingJob | null> => {
    const docRef = doc(db, 'pptxProcessing', jobId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as PptxProcessingJob;
  },

  listenPptxJob: (jobId: string, callback: (job: PptxProcessingJob | null) => void): (() => void) => {
    const docRef = doc(db, 'pptxProcessing', jobId);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as PptxProcessingJob);
      } else {
        callback(null);
      }
    }, (err) => {
      console.error('Error listening to PPTX job:', err);
    });
  },

  findExistingPptxJob: async (lessonId: string, fileName: string): Promise<PptxProcessingJob | null> => {
    const colRef = collection(db, 'pptxProcessing');
    const q = query(
      colRef,
      where('lessonId', '==', lessonId),
      where('fileName', '==', fileName)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const jobs = snap.docs.map(d => d.data() as PptxProcessingJob);
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return jobs[0] || null;
  },

  // -------------------------------------------------------------
  // DASHBOARD AGGREGATED STATS (Production Realtime Aggregate)
  // -------------------------------------------------------------
  getDashboardStats: async (): Promise<DashboardStats> => {
    const [coursesSnap, lessonsSnap, usersSnap, progressSnap, unitsSnap] = await Promise.all([
      getDocs(query(collection(db, 'courses'), where('isDeleted', '==', false))),
      getDocs(query(collection(db, 'lessons'), where('isDeleted', '==', false))),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'progress')),
      getDocs(collection(db, 'units'))
    ]);

    const lessons = lessonsSnap.docs.map(d => d.data() as Lesson);
    const publishedLessons = lessons.filter(l => l.status === 'PUBLISHED').length;
    const draftLessons = lessons.filter(l => l.status === 'DRAFT').length;
    const reviewLessons = lessons.filter(l => l.status === 'REVIEW').length;
    
    const allProgress = progressSnap.docs.map(d => d.data() as UserProgress);
    const completed = allProgress.filter(p => p.completed).length;
    const inProgress = allProgress.length - completed;
    const avgRate = allProgress.length > 0
      ? Math.round(allProgress.reduce((acc, curr) => acc + (curr.overallProgress || 0), 0) / allProgress.length)
      : 0;

    return {
      totalCourses: coursesSnap.size,
      totalLessons: lessonsSnap.size,
      publishedLessons,
      draftLessons,
      reviewLessons,
      totalUsers: usersSnap.size,
      totalUnits: unitsSnap.size,
      totalStudySessions: allProgress.length,
      completedLearners: completed,
      inProgressLearners: inProgress,
      averageCompletionRate: avgRate,
      storageStats: {
        totalFiles: lessonsSnap.size * 5,
        totalSizeMb: 1450,
        slidesCount: lessonsSnap.size * 12,
        videosCount: lessonsSnap.size * 2,
        audiosCount: lessonsSnap.size * 2,
        documentsCount: lessonsSnap.size
      },
      recentActivities: [
        {
          id: 'act-1',
          action: 'Đồng bộ Firestore Production',
          target: 'Hệ thống GDCT Vùng 4',
          user: 'Admin',
          time: 'Vừa xong'
        }
      ]
    };
  }
};
