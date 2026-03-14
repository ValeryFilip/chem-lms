import { api } from "../lib/api";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}