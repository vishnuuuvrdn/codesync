import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);

  const [name, setName] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");

      setWorkspaces(res.data.workspaces);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async () => {
    if (!name) return;

    try {
      await api.post(
        "/workspaces",

        {
          name,
        },
      );

      setName("");

      fetchWorkspaces();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>My Workspaces</h1>

      <input
        placeholder="project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={createWorkspace}>Create</button>

      {workspaces.map((workspace) => (
        <div
          key={workspace._id}
          onClick={() => {
            navigate(`/workspace/${workspace._id}`);
          }}
        >
          📁 {workspace.name}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
