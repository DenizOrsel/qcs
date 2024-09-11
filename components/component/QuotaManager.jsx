import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    data: { label: "Hello" },
    position: { x: 0, y: 0 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "World" },
    position: { x: 100, y: 100 },
  },
];

const initialEdges = [];

export default function  QuotaEditor({ quotaFrame }) {
  
  const [elements, setElements] = useState([]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  useEffect(() => {
    if (quotaFrame) {
      const transformQuotaFrameToVariables = (quotaFrame) => {
        return quotaFrame.VariableDefinitions.map((variable, index) => ({
          id: `${index + 1}`,
          data: { label: variable.Name },
          position: { x: 100 * index, y: 50 * index },
          labelItems: quotaFrame.FrameVariables.filter(
            (fv) => fv.DefinitionId === variable.Id
          ).flatMap((fv) =>
            fv.Levels.map((level) => ({
              id: level.Id,
              name: level.Name,
              minTarget: level.Target,
              maxTarget: level.MaxTarget,
            }))
          ),
        }));
      };

      const initialElements = transformQuotaFrameToVariables(quotaFrame);
      setElements(initialElements);
    }
  }, [quotaFrame]);

  return (
    <div style={{ width: '100vw', height: '95vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

