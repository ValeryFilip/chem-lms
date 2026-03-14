import { useEffect, useState } from "react";
import { getMe, getMeStats, getMyCourses } from "../lib/api";
import type {
  MeResponse,
  MeStatsResponse,
  EnrollmentCourseItem,
} from "../lib/types";
import LogoutButton from "../components/LogoutButton";

export default function Profile() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<MeStatsResponse | null>(null);
  const [courses, setCourses] = useState<EnrollmentCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await getMe();
        setUser(me);

        const statsData = await getMeStats();
        setStats(statsData);

        const myCourses = await getMyCourses();
        setCourses(myCourses);
      } catch (error: any) {
        const message =
          error?.response?.data?.error || "Failed to load profile";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading profile...</div>;
  }

  if (error) {
    return <div style={{ padding: 24 }}>{error}</div>;
  }

  if (!user || !stats) {
    return <div style={{ padding: 24 }}>No profile data available</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Profile</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>User info</h2>
        <p>
          <strong>Name:</strong> {user.name ?? "—"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>

        <div style={{ marginTop: 16 }}>
          <LogoutButton />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Completed steps</h3>
          <p>{stats.completedSteps}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Completed lessons</h3>
          <p>{stats.completedLessons}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Submissions</h3>
          <p>{stats.submissionsCount}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Correct submissions</h3>
          <p>{stats.correctSubmissions}</p>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3>Average score</h3>
          <p>{stats.averageScore.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>My courses</h2>

        {courses.length === 0 ? (
          <p>No available courses</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            {courses.map((item) => (
              <div
                key={item.enrollmentId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <h3>{item.course.title}</h3>

                <p>{item.course.subject.title}</p>
                <p>Status: {item.status}</p>
                <p>Access: {item.accessType}</p>

                <a href={`/courses/${item.course.slug}`}>Open course</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}