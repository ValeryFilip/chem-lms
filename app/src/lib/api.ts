import axios from "axios";
import type {
  Course,
  Lesson,
  Step,
  SubmissionResponse,
  LessonProgressResponse,
  CourseProgressResponse,
  MeStatsResponse,
  EnrollmentCourseItem,
  MeResponse,
  AdminUserListItem,
  AdminEnrollmentListItem,
  AdminCourseListItem,
  AdminCourseDetail,
} from "./types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export async function getCourses() {
  const { data } = await api.get<Course[]>("/courses");
  return data;
}

export async function getCourseBySlug(slug: string) {
  const { data } = await api.get<Course>(`/courses/${slug}`);
  return data;
}

export async function getLessonById(id: string) {
  const { data } = await api.get<Lesson>(`/lessons/${id}`);
  return data;
}

export async function getStepById(id: string) {
  const { data } = await api.get<Step>(`/steps/${id}`);
  return data;
}

export async function submitStepAnswer(stepId: string, answer: string) {
  const { data } = await api.post<SubmissionResponse>("/submissions", {
    stepId,
    answer,
  });

  return data;
}

export async function getLessonSteps(lessonId: string) {
  const { data } = await api.get<Step[]>(`/lessons/${lessonId}/steps`);
  return data;
}

export async function getLessonProgress(id: string) {
  const { data } = await api.get<LessonProgressResponse>(`/lessons/${id}/progress`);
  return data;
}

export async function completeStep(id: string) {
  const { data } = await api.post(`/steps/${id}/complete`);
  return data;
}

export async function getCourseProgress(id: string) {
  const { data } = await api.get<CourseProgressResponse>(`/courses/${id}/progress`);
  return data;
}

export async function getMeStats() {
  const { data } = await api.get<MeStatsResponse>("/me/stats");
  return data;
}

export async function getMyCourses() {
  const { data } = await api.get<EnrollmentCourseItem[]>("/enrollments/me/courses");
  return data;
}

export async function getMe() {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get<AdminUserListItem[]>("/admin/users");
  return data;
}

export async function getAdminEnrollments() {
  const { data } = await api.get<AdminEnrollmentListItem[]>("/admin/enrollments");
  return data;
}

export async function getAdminCourses() {
  const { data } = await api.get<AdminCourseListItem[]>("/admin/courses");
  return data;
}

export async function getAdminCourseById(id: string) {
  const { data } = await api.get<AdminCourseDetail>(`/admin/courses/${id}`);
  return data;
}

export async function publishAdminCourse(id: string) {
  const { data } = await api.post(`/admin/courses/${id}/publish`);
  return data;
}

export async function unpublishAdminCourse(id: string) {
  const { data } = await api.post(`/admin/courses/${id}/unpublish`);
  return data;
}

export async function createAdminModule(courseId: string, title: string) {
  const { data } = await api.post("/admin/modules", {
    courseId,
    title,
  });
  return data;
}

export async function createAdminLesson(moduleId: string, title: string) {
  const { data } = await api.post("/admin/lessons", {
    moduleId,
    title,
  });
  return data;
}

export async function createAdminStep(
  lessonId: string,
  title: string,
  type: string
) {
  const { data } = await api.post("/admin/steps", {
    lessonId,
    title,
    type,
  });
  return data;
}

export async function reorderAdminCourseModules(
  courseId: string,
  moduleIds: string[]
) {
  const { data } = await api.patch(`/admin/courses/${courseId}/modules/reorder`, {
    moduleIds,
  });
  return data;
}

export async function reorderAdminModuleLessons(
  moduleId: string,
  lessonIds: string[]
) {
  const { data } = await api.patch(`/admin/modules/${moduleId}/lessons/reorder`, {
    lessonIds,
  });
  return data;
}

export async function reorderAdminLessonSteps(
  lessonId: string,
  stepIds: string[]
) {
  const { data } = await api.patch(`/admin/lessons/${lessonId}/steps/reorder`, {
    stepIds,
  });
  return data;
}