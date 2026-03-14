import { NavLink, Outlet } from "react-router-dom";

const linkStyle = {
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  textDecoration: "none",
  color: "#111",
  marginBottom: 8,
};

export default function AdminLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: "#f7f7f8",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid #e5e7eb",
          padding: 20,
          background: "#fff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Admin</h2>

        <nav style={{ marginTop: 24 }}>
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#e5e7eb" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#e5e7eb" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/enrollments"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#e5e7eb" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Enrollments
          </NavLink>

          <NavLink
            to="/admin/courses"
            style={({ isActive }) => ({
              ...linkStyle,
              background: isActive ? "#e5e7eb" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Courses
          </NavLink>
        </nav>
      </aside>

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}