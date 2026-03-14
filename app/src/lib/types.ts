export type StepType = "video" | "text" | "task";

export interface Subject {
  id: string;
  slug: string;
  title: string;
}

export interface VideoStepContent {
  videoUrl: string;
}

export interface TextStepContent {
  html: string;
}

export type TaskType =
  | "text"
  | "multiple_choice"
  | "multi_select"
  | "numeric"
  | "essay"
  | "file_upload";

export interface TaskStepContent {
  prompt: string;
  taskType: TaskType;
  correctAnswer?: string;
  options?: string[];
}

export type StepContent =
  | VideoStepContent
  | TextStepContent
  | TaskStepContent;

export interface Step {
  id: string;
  lessonId: string;
  title: string;
  type: StepType;
  order: number;
  content: StepContent;
  isPublished: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  isPublished: boolean;
  steps: Step[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  subjectId: string;
  slug: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  subject: Subject;
  modules: Module[];
}

export interface Submission {
  id: string;
  userId: string;
  stepId: string;
  answerPayload: unknown;
  resultPayload?: unknown;
  isCorrect: boolean;
  score: number;
  createdAt: string;
}

export interface SubmissionResponse {
  isCorrect: boolean;
  submission: Submission;
}

export interface LessonProgressResponse {
  lessonId: string;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  completedStepIds: string[];
}

export interface CourseProgressResponse {
  courseId: string;
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  completedLessonIds: string[];
}

export interface MeStatsResponse {
  completedSteps: number;
  completedLessons: number;
  submissionsCount: number;
  correctSubmissions: number;
  averageScore: number;
}

export interface EnrollmentCourseItem {
  enrollmentId: string;
  accessType: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  course: Course;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count: {
    enrollments: number;
    submissions: number;
    stepProgresses: number;
  };
}

export interface AdminEnrollmentListItem {
  id: string;
  userId: string;
  courseId: string;
  accessType: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface AdminCourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  subject: {
    id: string;
    title: string;
    slug: string;
  };
  _count: {
    modules: number;
  };
}

export interface AdminCourseDetailStep {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  order: number;
  content: unknown;
  isPublished: boolean;
}

export interface AdminCourseDetailLesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  isPublished: boolean;
  steps: AdminCourseDetailStep[];
}

export interface AdminCourseDetailModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: AdminCourseDetailLesson[];
}

export interface AdminCourseDetail {
  id: string;
  subjectId: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  subject: {
    id: string;
    slug: string;
    title: string;
  };
  modules: AdminCourseDetailModule[];
}