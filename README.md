# HR Workflow Designer

A visual workflow designer module for HR processes built with **React**, **TypeScript**, and **React Flow**. This application allows HR admins to create, configure, and test internal workflows such as employee onboarding, leave approval, or document verification.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![React Flow](https://img.shields.io/badge/React%20Flow-12.4-FF0072)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)

---

## 🎯 Features

### Workflow Canvas
- **Drag-and-drop** nodes from the sidebar palette onto the canvas
- **Connect nodes** with edges to define workflow paths
- **Select and edit** nodes by clicking or double-clicking
- **Delete** nodes and edges
- **Pan and zoom** controls for canvas navigation
- **MiniMap** for workflow overview

### Node Types
| Node | Purpose | Configuration |
|------|---------|---------------|
| **Start** | Workflow entry point | Title, metadata key-value pairs |
| **Task** | Human task/activity | Title, description, assignee, due date, custom fields |
| **Approval** | Requires approval to proceed | Title, approver role, auto-approve threshold |
| **Automated** | System-triggered action | Title, action selection, dynamic parameters |
| **End** | Workflow completion | Title, message, summary flag |

### Workflow Validation
- Detects **cycles** (workflows must be acyclic DAGs)
- Validates **connectivity** (finds disconnected nodes)
- Ensures **required fields** are filled
- Warns about missing **Start/End nodes**

### Sandbox Testing
- **Simulate** workflow execution with mock API
- View **step-by-step execution logs**
- **Validate** workflow structure before simulation
- Preview workflow as **JSON**

### Import/Export
- **Export** workflow as JSON file
- **Import** previously saved workflows
- **Clear** canvas to start fresh

---

## 🏗️ Architecture

```
hr-workflow-designer/
├── src/
│   ├── api/                    # API layer
│   │   ├── client.ts           # Axios client configuration
│   │   └── msw/                # Mock Service Worker handlers
│   │       ├── browser.ts      # MSW browser setup
│   │       └── handlers.ts     # API endpoint mocks
│   │
│   ├── components/             # React components
│   │   ├── Canvas/             # Workflow canvas components
│   │   │   ├── WorkflowCanvas.tsx
│   │   │   └── nodes/          # Custom node components
│   │   │       ├── StartNode.tsx
│   │   │       ├── TaskNode.tsx
│   │   │       ├── ApprovalNode.tsx
│   │   │       ├── AutomatedNode.tsx
│   │   │       └── EndNode.tsx
│   │   │
│   │   ├── NodeFormPanel/      # Node configuration panel
│   │   │   ├── NodeFormPanel.tsx
│   │   │   └── forms/          # Node-specific forms
│   │   │       ├── StartForm.tsx
│   │   │       ├── TaskForm.tsx
│   │   │       ├── ApprovalForm.tsx
│   │   │       ├── AutomatedForm.tsx
│   │   │       └── EndForm.tsx
│   │   │
│   │   ├── Sidebar.tsx         # Node palette & actions
│   │   └── SandboxPanel.tsx    # Testing & validation panel
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useWorkflow.ts      # Workflow state management
│   │   ├── useGraphValidation.ts # Graph validation logic
│   │   └── index.ts
│   │
│   ├── models/                 # TypeScript types
│   │   └── types.ts            # All type definitions
│   │
│   ├── utils/                  # Utility functions
│   │   └── graph.ts            # Graph algorithms (cycle detection, etc.)
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── public/
│   └── mockServiceWorker.js    # MSW service worker
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

### Key Design Decisions

#### 1. **State Management: React Context + Hooks**
Instead of Redux or Zustand, the app uses a lightweight context-based approach with `useWorkflow` hook. This keeps the bundle small while providing centralized state management for nodes and edges.

```typescript
// WorkflowContext provides all workflow operations
const { nodes, edges, addNode, updateNodeData, exportWorkflow } = useWorkflow();
```

#### 2. **Form Management: react-hook-form**
All node configuration forms use `react-hook-form` for:
- Performant re-renders (uncontrolled components)
- Built-in validation
- Dynamic field arrays (metadata, custom fields)
- Type-safe form values

#### 3. **Graph Utilities: Custom Implementation**
The `utils/graph.ts` module provides:
- **Adjacency list** construction
- **Cycle detection** using DFS
- **Topological sort** for execution order
- **Connectivity analysis** for finding disconnected nodes

#### 4. **Mock API: MSW (Mock Service Worker)**
MSW intercepts network requests at the service worker level, providing:
- Realistic API behavior
- No code changes needed for real API integration
- Works in browser DevTools network tab

#### 5. **Styling: CSS Variables + Custom Design System**
A cohesive dark theme with:
- CSS custom properties for colors, spacing, shadows
- Consistent component styling
- React Flow style overrides for seamless integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hr-workflow-designer

# Install dependencies
npm install

# Initialize MSW service worker
npm run msw:init

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run msw:init` | Initialize MSW service worker |

---

## 🔌 Mock API Endpoints

### GET `/automations`
Returns available automation actions for the Automated node type.

```json
[
  {
    "id": "send_email",
    "label": "Send Email",
    "description": "Send an email notification to specified recipients",
    "params": [
      { "name": "to", "type": "string", "required": true },
      { "name": "subject", "type": "string", "required": true },
      { "name": "body", "type": "string", "required": false }
    ]
  },
  {
    "id": "generate_doc",
    "label": "Generate Document",
    "params": [...]
  }
]
```

### POST `/simulate`
Accepts a workflow JSON and returns step-by-step execution results.

**Request:**
```json
{
  "workflow": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "execution": [
    {
      "nodeId": "start-abc123",
      "nodeType": "start",
      "status": "completed",
      "message": "Workflow started: \"Start Onboarding\"",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

---

## 📋 Deliverables Checklist

### Core Requirements

- [x] **React application** (Vite + TypeScript)
- [x] **React Flow canvas** with custom nodes
- [x] **5 Node types**: Start, Task, Approval, Automated, End
- [x] **Drag-and-drop** from sidebar palette
- [x] **Connect/delete** nodes and edges
- [x] **Node editing forms** with react-hook-form
- [x] **Dynamic form fields** (metadata, custom fields, action params)
- [x] **Form validation** (required fields, type checking)
- [x] **Mock API** with MSW (GET /automations, POST /simulate)
- [x] **Sandbox panel** with validation and simulation
- [x] **Graph validation** (cycles, connectivity, constraints)
- [x] **Execution log** display

### Bonus Features

- [x] **Export/Import** workflow as JSON
- [x] **MiniMap** for canvas overview
- [x] **Zoom controls**
- [x] **Clear canvas** functionality
- [x] **JSON preview** in sandbox panel
- [ ] Undo/Redo
- [ ] Auto-layout
- [ ] Node templates
- [ ] Validation errors on nodes visually

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **@xyflow/react** | Workflow canvas (React Flow) |
| **react-hook-form** | Form state management |
| **Axios** | HTTP client |
| **MSW** | API mocking |
| **Lucide React** | Icons |
| **nanoid** | Unique ID generation |
| **Vite** | Build tool & dev server |

---

## 💡 Design Decisions & Trade-offs

### Why React Flow (@xyflow/react)?
- **Mature ecosystem** with extensive documentation
- **Built-in features**: drag, connect, select, delete, zoom, pan
- **Custom node support** for unique visual designs
- **Performance optimized** for large graphs

### Why react-hook-form over Formik?
- **Better performance** (uncontrolled components, fewer re-renders)
- **Smaller bundle size** (~9kb vs ~15kb)
- **Simpler API** for dynamic field arrays
- **TypeScript-first** design

### Why MSW over JSON Server?
- **No separate process** to run
- **Browser-native** interception
- **TypeScript support** for handlers
- **Visible in DevTools** network tab

### Why Context API over Redux/Zustand?
- **Simpler setup** for this scope
- **No additional dependencies**
- **Sufficient for prototype** needs
- Easy to migrate to Zustand if needed

### Styling Approach
- **CSS variables** for theming flexibility
- **No CSS-in-JS** to keep bundle small
- **Dark theme** matching modern design tools
- **Custom scrollbars** for consistent look

---

## 🔮 Future Enhancements

With more time, the following features could be added:

1. **Undo/Redo** - Track state history for reversible actions
2. **Auto-layout** - Dagre or ELK.js for automatic node positioning
3. **Node templates** - Pre-configured node combinations for common workflows
4. **Visual validation** - Show errors directly on affected nodes
5. **Workflow versioning** - Track changes over time
6. **Real-time collaboration** - Multi-user editing
7. **Conditional branching** - Decision nodes with multiple paths
8. **Workflow library** - Save and reuse workflow templates
9. **Advanced simulation** - Timing, parallel execution, failure scenarios
10. **Accessibility** - Keyboard navigation, screen reader support

---

## 📝 Example Workflow

Here's a sample Employee Onboarding workflow JSON:

```json
{
  "nodes": [
    {
      "id": "start-001",
      "type": "start",
      "position": { "x": 50, "y": 200 },
      "data": { "title": "Start Onboarding" }
    },
    {
      "id": "task-001",
      "type": "task",
      "position": { "x": 300, "y": 200 },
      "data": {
        "title": "Collect Documents",
        "assignee": "HR Team",
        "description": "Gather required documents from new hire"
      }
    },
    {
      "id": "approval-001",
      "type": "approval",
      "position": { "x": 550, "y": 200 },
      "data": {
        "title": "Manager Approval",
        "approverRole": "Manager",
        "autoApproveThreshold": 0
      }
    },
    {
      "id": "automated-001",
      "type": "automated",
      "position": { "x": 800, "y": 200 },
      "data": {
        "title": "Send Welcome Email",
        "actionId": "send_email",
        "actionParams": {
          "to": "new.employee@company.com",
          "subject": "Welcome to the team!"
        }
      }
    },
    {
      "id": "end-001",
      "type": "end",
      "position": { "x": 1050, "y": 200 },
      "data": {
        "title": "Onboarding Complete",
        "message": "Employee has been successfully onboarded",
        "summary": true
      }
    }
  ],
  "edges": [
    { "id": "e1", "source": "start-001", "target": "task-001" },
    { "id": "e2", "source": "task-001", "target": "approval-001" },
    { "id": "e3", "source": "approval-001", "target": "automated-001" },
    { "id": "e4", "source": "automated-001", "target": "end-001" }
  ]
}
```

---

## 📄 License

This project was created as a technical assessment prototype.

---

## 👤 Author

Built with ❤️ using React and React Flow
