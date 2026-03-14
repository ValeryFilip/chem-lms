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