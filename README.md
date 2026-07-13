# CodeSync

**A real-time collaborative browser IDE.**

Write, run, and collaborate on code with your team — live.

---

## Features

| Feature | Status |
|---------|--------|
| Real-time collaborative editing | ✅ |
| Multi-language code execution (JS, Python, C, C++) | ✅ |
| Interactive Docker terminal | ✅ |
| VS Code-like file explorer (drag & drop, rename, delete, duplicate) | ✅ |
| Monaco editor with syntax highlighting | ✅ |
| Auto-save with dirty state indicators | ✅ |
| Breadcrumb navigation | ✅ |
| Remote cursor tracking | ✅ |
| Workspace management | ✅ |
| Authentication (JWT + cookies) | ✅ |

---

## Architecture

```
codesync/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/          # Login, Register, Dashboard, Workspace
│       ├── components/     # Navbar, FileTree, EditorPanel, TerminalPanel, OutputPanel
│       ├── context/        # AuthContext
│       ├── contexts/       # WorkspaceSessionContext
│       ├── socket/         # socket.io-client singleton
│       └── api/            # axios instance
│
└── server/          # Node.js + Express backend
    └── src/
        ├── controllers/    # auth, file, workspace, run
        ├── routes/         # Express routers
        ├── services/       # file.service, codeRunner, terminal.service
        ├── models/         # User, Workspace, File (Mongoose)
        ├── middleware/      # JWT auth middleware
        ├── sockets/         # socket.io event handlers
        └── config/          # DB connection, language config
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or remote)
- **Docker** (for code execution and interactive terminals)

### Required Docker Images

Build these images before running CodeSync. Dockerfiles are in `server/docker/`:

```bash
docker build -t codesync-js     ./server/docker/javascript
docker build -t codesync-python ./server/docker/python
docker build -t codesync-cpp    ./server/docker/cpp
docker build -t codesync-c      ./server/docker/c

# For interactive terminal sessions:
docker pull ubuntu:22.04
```

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-org/codesync.git
cd codesync

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/codesync
JWT_SECRET=your-strong-secret-here
JWT_EXPIRE=7d
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Start servers

```bash
# Terminal 1 — start the API server
cd server && npm run dev

# Terminal 2 — start the client
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Docker Deployment

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env with your production values
```

### 2. Start with Docker Compose

```bash
docker compose up -d
```

| Service | Port |
|---------|------|
| Client  | 80   |
| Server  | 5000 |
| MongoDB | 27017 (internal) |

> **Important**: The server container mounts `/var/run/docker.sock` from the host to spawn sibling containers for code execution. This is already configured in `docker-compose.yml`.

### 3. Build language runner images (on the host)

```bash
docker build -t codesync-js     ./server/docker/javascript
docker build -t codesync-python ./server/docker/python
docker build -t codesync-cpp    ./server/docker/cpp
docker build -t codesync-c      ./server/docker/c
```

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET  | `/api/auth/me` | Yes | Get current user |

### Workspaces

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/workspaces` | Yes | Create workspace |
| GET  | `/api/workspaces` | Yes | List user workspaces |

### Files

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/files` | Yes | Create file or folder |
| GET  | `/api/files/:workspaceId` | Yes | List all files in workspace |
| GET  | `/api/files/open/:fileId` | Yes | Get file content |
| PUT  | `/api/files/:fileId` | Yes | Update file content |
| PUT  | `/api/files/rename/:fileId` | Yes | Rename file |
| PUT  | `/api/files/:fileId/move` | Yes | Move file to new parent |
| POST | `/api/files/:fileId/duplicate` | Yes | Duplicate file or folder |
| DELETE | `/api/files/:fileId` | Yes | Delete file or folder (recursive) |

### Code Execution

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/run` | Yes | Run code in Docker sandbox |

**Request body:** `{ language: "javascript" | "python" | "c" | "cpp", code: string }`  
**Response:** `{ stdout, stderr, exitCode, executionTime }`

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-workspace` | `{ workspaceId, user }` | Join a workspace room |
| `leave-workspace` | `workspaceId` | Leave a workspace room |
| `file-update` | `{ workspaceId, fileId, content }` | Broadcast file change |
| `cursor-move` | `{ workspaceId, fileId, position, user }` | Broadcast cursor position |
| `terminal-start` | `{ sessionId }` | Start a Docker terminal session |
| `terminal-input` | `{ sessionId, data }` | Send input to terminal |
| `terminal-resize` | `{ sessionId, cols, rows }` | Resize terminal |
| `terminal-kill` | `{ sessionId }` | Kill terminal session |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `online-users` | `User[]` | Updated list of online workspace members |
| `file-updated` | `{ fileId, content }` | File content changed by another user |
| `file-created` | `File` | A new file was created |
| `file-renamed` | `File` | A file was renamed |
| `file-deleted` | `fileId` | A file was deleted |
| `file-moved` | `File` | A file was moved |
| `file-duplicated` | `File` | A file was duplicated |
| `receive-cursor-move` | `{ fileId, position, user }` | Another user's cursor moved |
| `terminal-data` | `{ sessionId, data }` | Terminal output from Docker |
| `terminal-exit` | `{ sessionId, code }` | Terminal process exited |

---

## Security

- JWT tokens stored in `httpOnly` cookies (XSS-resistant)
- All API endpoints require authentication except `/register` and `/login`
- Code execution runs in isolated Docker containers:
  - `--network none` (no outbound network)
  - `--memory=128m` memory limit
  - `--cpus=0.5` CPU limit
  - 5-second execution timeout
  - Temporary files cleaned up after each run
- Workspace permission checks on every file operation

---

## Known Limitations

1. **Terminal resize** — The `stty` resize command requires `stty` to be installed in the container (available in `ubuntu:22.04` by default). Resize accuracy depends on the container TTY configuration.
2. **Terminal TTY** — The Docker terminal uses `docker run -i` (without `-t`) due to Node.js `child_process.spawn` limitations. ANSI escape sequences work, but some terminal-aware programs (e.g., `vim`, `nano`) may behave differently than with a full pseudo-TTY.
3. **No Java execution** — Java support is scaffolded in the client language map but no Docker runner image is included.
4. **Single MongoDB** — No replication; for production, use a replica set or MongoDB Atlas.
5. **No rate limiting** — API endpoints are not rate-limited. Add `express-rate-limit` before public exposure.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: description"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT
