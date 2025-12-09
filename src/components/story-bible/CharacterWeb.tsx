'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Plus, Save, User, Crown, Skull, Heart, Swords, 
  Users, X, Edit2, Trash2, Link2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'deuteragonist' | 'mentor' | 'love-interest' | 'sidekick' | 'supporting' | 'minor';
  isDeceased: boolean;
  avatar?: string;
  color?: string;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'family' | 'romantic' | 'former-romantic' | 'friendship' | 'professional' | 'antagonistic' | 'mentor-student' | 'rivals' | 'secret';
  bidirectional: boolean;
}

interface CharacterWebProps {
  bookId: string;
  characters: Character[];
  relationships: Relationship[];
  onAddCharacter: (character: Omit<Character, 'id'>) => void;
  onUpdateCharacter: (id: string, updates: Partial<Character>) => void;
  onDeleteCharacter: (id: string) => void;
  onAddRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  onUpdateRelationship: (id: string, updates: Partial<Relationship>) => void;
  onDeleteRelationship: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

// ============================================================================
// ROLE CONFIG
// ============================================================================

const roleConfig: Record<Character['role'], { color: string; icon: typeof Crown; label: string }> = {
  protagonist: { color: '#f59e0b', icon: Crown, label: 'Protagonist' },
  antagonist: { color: '#ef4444', icon: Swords, label: 'Antagonist' },
  deuteragonist: { color: '#8b5cf6', icon: Crown, label: 'Deuteragonist' },
  mentor: { color: '#3b82f6', icon: User, label: 'Mentor' },
  'love-interest': { color: '#ec4899', icon: Heart, label: 'Love Interest' },
  sidekick: { color: '#10b981', icon: Users, label: 'Sidekick' },
  supporting: { color: '#6366f1', icon: User, label: 'Supporting' },
  minor: { color: '#9ca3af', icon: User, label: 'Minor' },
};

const relationshipColors: Record<Relationship['type'], string> = {
  family: '#3b82f6',
  romantic: '#ec4899',
  'former-romantic': '#f472b6',
  friendship: '#10b981',
  professional: '#6366f1',
  antagonistic: '#ef4444',
  'mentor-student': '#8b5cf6',
  rivals: '#f97316',
  secret: '#1f2937',
};

// ============================================================================
// CHARACTER NODE COMPONENT
// ============================================================================

function CharacterNode({ data, selected }: NodeProps) {
  const config = roleConfig[data.role as Character['role']];
  const Icon = config.icon;
  
  return (
    <div className={`
      relative group cursor-pointer
      transition-all duration-200
      ${selected ? 'scale-110' : 'hover:scale-105'}
    `}>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      {/* Node content */}
      <div className={`
        w-20 h-20 rounded-2xl
        flex flex-col items-center justify-center
        shadow-lg transition-shadow duration-200
        ${selected ? 'shadow-xl ring-2 ring-teal-500' : 'group-hover:shadow-xl'}
        ${data.isDeceased ? 'opacity-60' : ''}
      `}
        style={{ backgroundColor: config.color + '20', borderColor: config.color, borderWidth: 2 }}
      >
        {/* Avatar or icon */}
        {data.avatar ? (
          <img 
            src={data.avatar} 
            alt={data.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: config.color }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        
        {/* Deceased indicator */}
        {data.isDeceased && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center">
            <Skull className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Name label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 px-2 py-0.5 rounded-full shadow-sm">
          {data.name}
        </span>
      </div>
      
      {/* Role badge */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <span 
          className="text-[10px] font-medium text-white px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.color }}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CharacterWeb({
  bookId,
  characters,
  relationships,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onAddRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  onPositionChange
}: CharacterWebProps) {
  // State
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  
  // New character form
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: 'supporting' as Character['role'],
    isDeceased: false
  });
  
  // New relationship form
  const [newRelationship, setNewRelationship] = useState({
    source: '',
    target: '',
    label: '',
    type: 'friendship' as Relationship['type'],
    bidirectional: true
  });
  
  // Convert characters to React Flow nodes
  const initialNodes: Node[] = useMemo(() => 
    characters.map((char, index) => ({
      id: char.id,
      type: 'character',
      position: { x: 100 + (index % 4) * 150, y: 100 + Math.floor(index / 4) * 150 },
      data: char,
      draggable: true
    })),
    [characters]
  );
  
  // Convert relationships to React Flow edges
  const initialEdges: Edge[] = useMemo(() =>
    relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      label: rel.label,
      type: 'smoothstep',
      animated: rel.type === 'secret',
      style: { 
        stroke: relationshipColors[rel.type],
        strokeWidth: 2
      },
      labelStyle: {
        fontSize: 10,
        fontWeight: 500,
        fill: '#374151'
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.9
      },
      markerEnd: rel.bidirectional ? undefined : {
        type: MarkerType.ArrowClosed,
        color: relationshipColors[rel.type]
      }
    })),
    [relationships]
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Node types
  const nodeTypes = useMemo(() => ({
    character: CharacterNode
  }), []);
  
  // Handle connection
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      setNewRelationship(prev => ({
        ...prev,
        source: params.source!,
        target: params.target!
      }));
      setShowAddRelationship(true);
    }
  }, []);
  
  // Handle node drag
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    onPositionChange(node.id, node.position);
  }, [onPositionChange]);
  
  // Handle node click
  const onNodeClick = useCallback((event: any, node: Node) => {
    setSelectedCharacter(node.id);
    setSelectedEdge(null);
  }, []);
  
  // Handle edge click
  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    setSelectedEdge(edge.id);
    setSelectedCharacter(null);
  }, []);
  
  // Add character
  const handleAddCharacter = () => {
    if (newCharacter.name.trim()) {
      onAddCharacter(newCharacter);
      setNewCharacter({ name: '', role: 'supporting', isDeceased: false });
      setShowAddCharacter(false);
    }
  };
  
  // Add relationship
  const handleAddRelationship = () => {
    if (newRelationship.source && newRelationship.target && newRelationship.label) {
      onAddRelationship(newRelationship);
      setNewRelationship({
        source: '',
        target: '',
        label: '',
        type: 'friendship',
        bidirectional: true
      });
      setShowAddRelationship(false);
    }
  };

  return (
    <div className="h-full relative">
      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-stone-50 dark:bg-stone-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d4d4d4" />
        <Controls className="!bg-white dark:!bg-stone-800 !border-stone-200 dark:!border-stone-700 !rounded-xl !shadow-lg" />
      </ReactFlow>
      
      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setShowAddCharacter(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <Plus className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Add Character</span>
        </button>
        
        <button
          onClick={() => setShowAddRelationship(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <Link2 className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Add Relationship</span>
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-4 rounded-xl bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700">
        <h4 className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-3">Character Roles</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(roleConfig).slice(0, 6).map(([role, config]) => (
            <div key={role} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-xs text-stone-600 dark:text-stone-400">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Character Modal */}
      {showAddCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Add Character</h3>
              <button onClick={() => setShowAddCharacter(false)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Character name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Role
                </label>
                <select
                  value={newCharacter.role}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, role: e.target.value as Character['role'] }))}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Object.entries(roleConfig).map(([role, config]) => (
                    <option key={role} value={role}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCharacter.isDeceased}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, isDeceased: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">Deceased</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddCharacter(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCharacter}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                Add Character
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Relationship Modal */}
      {showAddRelationship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Add Relationship</h3>
              <button onClick={() => setShowAddRelationship(false)} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    From
                  </label>
                  <select
                    value={newRelationship.source}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select...</option>
                    {characters.map(char => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                    To
                  </label>
                  <select
                    value={newRelationship.target}
                    onChange={(e) => setNewRelationship(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select...</option>
                    {characters.filter(c => c.id !== newRelationship.source).map(char => (
                      <option key={char.id} value={char.id}>{char.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={newRelationship.label}
                  onChange={(e) => setNewRelationship(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., siblings, rivals, mentor"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Type
                </label>
                <select
                  value={newRelationship.type}
                  onChange={(e) => setNewRelationship(prev => ({ ...prev, type: e.target.value as Relationship['type'] }))}
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="family">Family</option>
                  <option value="romantic">Romantic</option>
                  <option value="former-romantic">Former Romantic</option>
                  <option value="friendship">Friendship</option>
                  <option value="professional">Professional</option>
                  <option value="antagonistic">Antagonistic</option>
                  <option value="mentor-student">Mentor-Student</option>
                  <option value="rivals">Rivals</option>
                  <option value="secret">Secret</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newRelationship.bidirectional}
                  onChange={(e) => setNewRelationship(prev => ({ ...prev, bidirectional: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">Bidirectional (mutual relationship)</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddRelationship(false)}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRelationship}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                Add Relationship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
