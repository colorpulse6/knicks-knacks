"use client";

import { useState, useMemo, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import { getLatticeForCharacter, getPassiveById } from "../../data/lattices";
import { canUnlockNode, unlockNode } from "../../engine/levelingEngine";
import type { LatticeNode, CharacterLattice } from "../../types/lattice";
import type { Character } from "../../types/character";

// Node visual states
type NodeState = "locked" | "available" | "unlocked";

// Grid cell size for positioning
const CELL_SIZE = 60;
const GRID_OFFSET_X = 40;
const GRID_OFFSET_Y = 20;

export default function LatticeScreen() {
  const { party, updateCharacter } = useGameStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    party[0]?.id ?? "kai"
  );
  const [selectedNode, setSelectedNode] = useState<LatticeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<LatticeNode | null>(null);

  const selectedCharacter = party.find((c) => c.id === selectedCharacterId);
  const lattice = useMemo(
    () => getLatticeForCharacter(selectedCharacterId),
    [selectedCharacterId]
  );

  // Get node state based on character progress
  const getNodeState = useCallback(
    (node: LatticeNode, character: Character): NodeState => {
      if (character.latticeProgress.unlockedNodes.includes(node.id)) {
        return "unlocked";
      }
      const { canUnlock } = canUnlockNode(character, node, lattice!);
      return canUnlock ? "available" : "locked";
    },
    [lattice]
  );

  // Handle node unlock
  const handleUnlock = useCallback(() => {
    if (!selectedNode || !selectedCharacter || !lattice) return;

    const updated = unlockNode(selectedCharacter, selectedNode.id, lattice);
    if (updated) {
      updateCharacter(selectedCharacter.id, updated);
      setSelectedNode(null);
    }
  }, [selectedNode, selectedCharacter, lattice, updateCharacter]);

  if (!selectedCharacter || !lattice) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No lattice data available.
      </div>
    );
  }

  // Calculate grid bounds
  const maxX = Math.max(...lattice.nodes.map((n) => n.position.x)) + 1;
  const maxY = Math.max(...lattice.nodes.map((n) => n.position.y)) + 1;
  const gridWidth = maxX * CELL_SIZE + GRID_OFFSET_X * 2;
  const gridHeight = maxY * CELL_SIZE + GRID_OFFSET_Y * 2;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-amber-400 font-bold">{lattice.name}</h3>
          <p className="text-xs text-gray-400">
            System Awareness: {selectedCharacter.systemAwareness}%
          </p>
        </div>
        <div className="text-right">
          <div className="text-cyan-400 font-bold">
            {selectedCharacter.optimizationPoints} OP
          </div>
          <div className="text-xs text-gray-500">Available Points</div>
        </div>
      </div>

      {/* Character selector (if multiple party members) */}
      {party.length > 1 && (
        <div className="flex gap-2 mb-3">
          {party.map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setSelectedCharacterId(member.id);
                setSelectedNode(null);
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                member.id === selectedCharacterId
                  ? "bg-amber-700/50 text-amber-300 border border-amber-500/50"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {member.name}
            </button>
          ))}
        </div>
      )}

      {/* Lattice Grid */}
      <div className="flex-1 overflow-auto bg-gray-900/50 rounded border border-gray-700/50">
        <svg
          width={gridWidth}
          height={gridHeight}
          className="mx-auto"
          style={{ minWidth: gridWidth, minHeight: gridHeight }}
        >
          {/* Connection lines */}
          {lattice.connections.map(([fromId, toId], idx) => {
            const fromNode = lattice.nodes.find((n) => n.id === fromId);
            const toNode = lattice.nodes.find((n) => n.id === toId);
            if (!fromNode || !toNode) return null;

            const fromState = getNodeState(fromNode, selectedCharacter);
            const toState = getNodeState(toNode, selectedCharacter);
            const isActive =
              fromState === "unlocked" || toState === "unlocked";

            const x1 = fromNode.position.x * CELL_SIZE + GRID_OFFSET_X + 20;
            const y1 = fromNode.position.y * CELL_SIZE + GRID_OFFSET_Y + 20;
            const x2 = toNode.position.x * CELL_SIZE + GRID_OFFSET_X + 20;
            const y2 = toNode.position.y * CELL_SIZE + GRID_OFFSET_Y + 20;

            return (
              <line
                key={`${fromId}-${toId}-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? "#f59e0b" : "#374151"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? undefined : "4,4"}
              />
            );
          })}

          {/* Nodes */}
          {lattice.nodes.map((node) => {
            const state = getNodeState(node, selectedCharacter);
            const x = node.position.x * CELL_SIZE + GRID_OFFSET_X;
            const y = node.position.y * CELL_SIZE + GRID_OFFSET_Y;
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <NodeShape
                  node={node}
                  state={state}
                  isSelected={isSelected}
                  isHovered={isHovered}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node details panel */}
      <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-700/50 min-h-[100px]">
        {selectedNode ? (
          <NodeDetails
            node={selectedNode}
            state={getNodeState(selectedNode, selectedCharacter)}
            character={selectedCharacter}
            lattice={lattice}
            onUnlock={handleUnlock}
          />
        ) : hoveredNode ? (
          <NodeDetails
            node={hoveredNode}
            state={getNodeState(hoveredNode, selectedCharacter)}
            character={selectedCharacter}
            lattice={lattice}
            onUnlock={() => {}}
            isPreview
          />
        ) : (
          <div className="text-gray-500 text-sm text-center">
            Select a node to view details
          </div>
        )}
      </div>
    </div>
  );
}

// Node shape component
function NodeShape({
  node,
  state,
  isSelected,
  isHovered,
}: {
  node: LatticeNode;
  state: NodeState;
  isSelected: boolean;
  isHovered: boolean;
}) {
  // Colors based on state
  const colors = {
    locked: { fill: "#1f2937", stroke: "#374151", text: "#6b7280" },
    available: { fill: "#1e3a5f", stroke: "#3b82f6", text: "#93c5fd" },
    unlocked: { fill: "#422006", stroke: "#f59e0b", text: "#fcd34d" },
  };

  const { fill, stroke, text } = colors[state];
  const size = node.type === "core" ? 24 : node.type === "stat" ? 16 : 20;
  const highlightStroke = isSelected
    ? "#ffffff"
    : isHovered
      ? "#a1a1aa"
      : stroke;
  const strokeWidth = isSelected || isHovered ? 3 : 2;

  // Different shapes for different node types
  if (node.type === "core") {
    // Star shape for core nodes
    return (
      <>
        <polygon
          points="20,0 24,14 40,14 27,23 32,38 20,28 8,38 13,23 0,14 16,14"
          fill={fill}
          stroke={highlightStroke}
          strokeWidth={strokeWidth}
          transform="translate(0, 2)"
        />
        {state === "unlocked" && (
          <text
            x={20}
            y={24}
            textAnchor="middle"
            fill={text}
            fontSize={10}
            fontWeight="bold"
          >
            ★
          </text>
        )}
      </>
    );
  }

  if (node.type === "passive") {
    // Diamond shape for passive nodes
    return (
      <>
        <polygon
          points="20,2 38,20 20,38 2,20"
          fill={fill}
          stroke={highlightStroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={20}
          y={24}
          textAnchor="middle"
          fill={text}
          fontSize={10}
        >
          P
        </text>
      </>
    );
  }

  if (node.type === "tech") {
    // Hexagon shape for tech nodes
    return (
      <>
        <polygon
          points="20,2 35,10 35,30 20,38 5,30 5,10"
          fill={fill}
          stroke={highlightStroke}
          strokeWidth={strokeWidth}
        />
        <text
          x={20}
          y={24}
          textAnchor="middle"
          fill={text}
          fontSize={10}
        >
          T
        </text>
      </>
    );
  }

  // Circle for stat nodes (default)
  return (
    <>
      <circle
        cx={20}
        cy={20}
        r={size}
        fill={fill}
        stroke={highlightStroke}
        strokeWidth={strokeWidth}
      />
      {node.statBoosts && (
        <text
          x={20}
          y={24}
          textAnchor="middle"
          fill={text}
          fontSize={9}
        >
          {node.statBoosts[0]?.stat.slice(0, 2).toUpperCase()}
        </text>
      )}
    </>
  );
}

// Node details panel
function NodeDetails({
  node,
  state,
  character,
  lattice,
  onUnlock,
  isPreview = false,
}: {
  node: LatticeNode;
  state: NodeState;
  character: Character;
  lattice: CharacterLattice;
  onUnlock: () => void;
  isPreview?: boolean;
}) {
  const { canUnlock, reason } = canUnlockNode(character, node, lattice);

  // Get passive details if this is a passive node
  const passive = node.passiveId ? getPassiveById(node.passiveId) : null;

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-amber-300 font-bold">{node.name}</h4>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              node.type === "core"
                ? "bg-purple-900/50 text-purple-300"
                : node.type === "tech"
                  ? "bg-green-900/50 text-green-300"
                  : node.type === "passive"
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-gray-700/50 text-gray-300"
            }`}
          >
            {node.type.toUpperCase()}
          </span>
          {node.requiredLevel && (
            <span className="text-xs text-gray-500">
              Lv.{node.requiredLevel}+
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300 mb-2">{node.description}</p>

        {/* Stat boosts preview */}
        {node.statBoosts && node.statBoosts.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {node.statBoosts.map((boost, idx) => (
              <span key={idx} className="text-green-400">
                +{boost.value} {formatStatName(boost.stat)}
              </span>
            ))}
          </div>
        )}

        {/* Passive effect */}
        {passive && (
          <div className="text-xs text-cyan-400 mt-1">
            Effect: {passive.description}
          </div>
        )}

        {/* Unlock reason */}
        {state !== "unlocked" && reason && (
          <div className="text-xs text-red-400 mt-1">{reason}</div>
        )}
      </div>

      {/* Action area */}
      <div className="ml-4 text-right">
        <div className="text-cyan-400 font-bold mb-1">{node.cost} OP</div>
        {state === "unlocked" ? (
          <span className="text-xs text-amber-400">Unlocked</span>
        ) : state === "available" && !isPreview ? (
          <button
            onClick={onUnlock}
            className="px-3 py-1 text-sm bg-cyan-700/50 hover:bg-cyan-600/50 border border-cyan-500/50 rounded transition-colors"
          >
            Unlock
          </button>
        ) : (
          <span className="text-xs text-gray-500">
            {state === "locked" ? "Locked" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// Format stat name for display
function formatStatName(stat: string): string {
  const names: Record<string, string> = {
    maxHp: "HP",
    maxMp: "MP",
    strength: "STR",
    magic: "MAG",
    defense: "DEF",
    magicDefense: "MDEF",
    speed: "SPD",
    luck: "LUCK",
  };
  return names[stat] ?? stat;
}
