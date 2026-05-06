import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await fetch("/api/users");
      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(event) {
    event.preventDefault();

    if (!form.name || !form.email) {
      alert("Preencha nome e email");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        alert("Erro ao criar usuário");
        return;
      }

      setForm({
        name: "",
        email: "",
      });

      await loadUsers();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="container">
      <section className="card">
        <h1>Usuários</h1>

        <p>
          Frontend com Vite + React consumindo uma API Express com PostgreSQL.
        </p>

        <form onSubmit={createUser} className="form">
          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
          />

          <button type="submit">Cadastrar</button>
        </form>

        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;