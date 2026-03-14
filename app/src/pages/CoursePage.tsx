import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams, Link } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  modules: Module[];
};

export default function CoursePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    api.get(`/courses/${slug}`).then((res) => {
      setCourse(res.data);
    });
  }, [slug]);

  if (!course) return <main style={{ padding: 40 }}>Loading...</main>;

  return (
    <main style={{ padding: 40 }}>
      <h1>{course.title}</h1>

      {course.modules.map((module) => (
        <div key={module.id} style={{ marginTop: 20 }}>
          <h2>{module.title}</h2>

          {module.lessons.map((lesson) => (
            <div key={lesson.id} style={{ marginLeft: 20 }}>
              <h3>
                <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
              </h3>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}