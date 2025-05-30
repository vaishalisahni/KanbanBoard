import { useState, useEffect } from "react";
import { Plus, X, Calendar, User, Tag, MoreVertical, Edit3, Trash2, Clock, Filter, Search } from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const priorityColors = {
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-white", 
  low: "bg-green-500 text-white"
};

const statusColors = {
  todo: "bg-[#F7F7F7] border-gray-300",
  progress: "bg-[#F7F7F7] border-gray-300",
  done: "bg-[#F7F7F7] border-gray-300"
};

function App() {
  const [stages, setStages] = useState({
    todo: [],
    progress: [],
    done: []
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const boardConfig = [
    { 
      id: "todo", 
      label: "To Do", 
      icon: "📋",
      color: "bg-[#F7F7F7] border-gray-300"
    },
    { 
      id: "progress", 
      label: "In Progress", 
      icon: "⚡",
      color: "bg-[#F7F7F7] border-gray-300"
    },
    { 
      id: "done", 
      label: "Completed", 
      icon: "✅",
      color: "bg-[#F7F7F7] border-gray-300"
    }
  ];

  const addTask = (stageId, newItem) => {
    if (!newItem) return;
    const task = {
      ...newItem,
      id: generateId(),
      parentId: stageId,
      createdAt: new Date().toISOString(),
      priority: newItem.priority || 'medium',
      dueDate: newItem.dueDate || null,
      estimatedHours: newItem.estimatedHours || null
    };
    
    setStages(prev => ({
      ...prev,
      [stageId]: [...prev[stageId], task]
    }));
  };

  const moveTask = (item, fromStageId, toStageId) => {
    if (fromStageId === toStageId) return;
    
    setStages(prev => ({
      ...prev,
      [fromStageId]: prev[fromStageId].filter(task => task.id !== item.id),
      [toStageId]: [...prev[toStageId], { ...item, parentId: toStageId }]
    }));
  };

  const deleteTask = (stageId, taskId) => {
    setStages(prev => ({
      ...prev,
      [stageId]: prev[stageId].filter(task => task.id !== taskId)
    }));
  };

  const updateTask = (stageId, taskId, updates) => {
    setStages(prev => ({
      ...prev,
      [stageId]: prev[stageId].map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  };

  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  };

  const getTotalTasks = () => {
    return Object.values(stages).reduce((total, stage) => total + stage.length, 0);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-300 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#1e1e1e]">
                Project Board
              </h1>
              <div className="bg-[#365EFF] text-white px-3 py-1 rounded-full text-sm font-medium">
                {getTotalTasks()} tasks
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent text-sm"
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters ? 'bg-[#365EFF] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Priority:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#365EFF]"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterPriority("");
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {boardConfig.map((config) => (
            <Stage
              key={config.id}
              {...config}
              tasks={getFilteredTasks(stages[config.id])}
              addTask={(newItem) => addTask(config.id, newItem)}
              moveTask={moveTask}
              deleteTask={(taskId) => deleteTask(config.id, taskId)}
              updateTask={(taskId, updates) => updateTask(config.id, taskId, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const Stage = ({ id, label, icon, color, tasks, addTask, moveTask, deleteTask, updateTask }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const item = JSON.parse(e.dataTransfer.getData("draggedItem"));
    if (item.parentId !== id) {
      moveTask(item, item.parentId, id);
    }
  };

  return (
    <div
      className={`${color} rounded-xl border-2 transition-all duration-200 ${
        isDragOver ? 'border-[#365EFF] shadow-lg scale-[1.02]' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
    >
      {/* Stage Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-800">{label}</h3>
            <span className="bg-white bg-opacity-80 text-[#1e1e1e] px-2 py-1 rounded-full text-sm font-medium">
              {tasks.length}
            </span>
          </div>
          <NewTaskButton addTask={addTask} />
        </div>
      </div>

      {/* Tasks */}
      <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No tasks yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={() => deleteTask(task.id)}
              updateTask={(updates) => updateTask(task.id, updates)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const NewTaskButton = ({ addTask }) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-lg text-sm font-medium text-[#1e1e1e] transition-all duration-200 hover:shadow-md"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>
      
      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onSubmit={(task) => {
            addTask(task);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

const TaskModal = ({ onClose, onSubmit, task = null }) => {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    content: task?.content || "",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate || "",
    estimatedHours: task?.estimatedHours || "",
    tags: task?.tags?.join(", ") || "",
    collabs: task?.collabs?.join(", ") || ""
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    
    onSubmit({
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      collabs: formData.collabs.split(",").map(collab => collab.trim()).filter(Boolean),
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {task ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Est. Hours
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
                  placeholder="Hours"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#365EFF] focus:border-transparent"
                placeholder="UI/UX, React, Design"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collaborators (comma separated emails)
              </label>
              <input
                type="text"
                value={formData.collabs}
                onChange={(e) => setFormData(prev => ({ ...prev, collabs: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john@example.com, jane@example.com"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-[#365EFF] text-white rounded-lg hover:bg-[#2547d6] transition-colors"
              >
                {task ? 'Update' : 'Add'} Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, deleteTask, updateTask }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData("draggedItem", JSON.stringify(task));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move group"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              {task.estimatedHours && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {task.estimatedHours}h
                </span>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      deleteTask();
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Title */}
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h4>
          
          {/* Content */}
          {task.content && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.content}
            </p>
          )}
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Collaborators */}
            <div className="flex -space-x-2">
              {task.collabs && task.collabs.slice(0, 3).map((collab, index) => (
                <div
                  key={index}
                  className="w-6 h-6 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-medium"
                  title={collab}
                >
                  {collab.charAt(0).toUpperCase()}
                </div>
              ))}
              {task.collabs && task.collabs.length > 3 && (
                <div className="w-6 h-6 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                  +{task.collabs.length - 3}
                </div>
              )}
            </div>
            
            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showEditModal && (
        <TaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updates) => {
            updateTask(updates);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
};

export default App;