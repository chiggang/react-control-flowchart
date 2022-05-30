import React, { useEffect, useRef, useState } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

import './styles/App.css';

import { ReactControlFlowchart } from './components';
import { IRCFlowchart } from './interfaces/rcf.interface';
import { RCFNSample } from './classes/nodes/RCFNSample';

function App() {
  // FontAwesome 아이콘을 불러옴
  library.add(fab, far, fas);

  // 순서도를 정의함
  const flowchartRef = useRef<IRCFlowchart>();

  const handleButton_onClick = () => {
    _.range(1, 100).map((number: number) => {
      // 순서도의 노드를 생성함
      const node3: RCFNSample = new RCFNSample();
      node3.setGroupId('abc');
      node3.setHeaderTitle('Node.3');
      node3.setSizeChangeable(false);
      node3.setPosition(10 + number * 2, 10 + number * 2);

      // 생성한 노드를 순서도에 추가함
      flowchartRef.current?.addNode(node3);
    });
  };

  const tmpNode = () => {
    // 순서도의 노드를 생성함
    const node1: RCFNSample = new RCFNSample();
    node1.setGroupId('abc');
    node1.setNodeId('rcf-node-a');
    node1.setHeaderTitle('Node.1');
    node1.setSizeChangeable(false);
    node1.setPosition(10, 10);

    // 생성한 노드를 순서도에 추가함
    flowchartRef.current?.addNode(node1);

    // 순서도의 노드를 생성함
    const node2: RCFNSample = new RCFNSample();
    node2.setGroupId('abc');
    node2.setNodeId('rcf-node-b');
    node2.setHeaderTitle('Node.2');
    node2.setHeaderBackgroundColor('bg-amber-600');
    node2.setPosition(600, 300);

    // 생성한 노드를 순서도에 추가함
    flowchartRef.current?.addNode(node2);
  };

  useEffect(() => {
    // 임시!
    tmpNode();

    return () => {};
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactControlFlowchart ref={flowchartRef} />

      {/* 임시! */}
      <div
        onClick={handleButton_onClick}
        className="button absolute right-2 top-2 px-3 py-1 flex justify-center items-center bg-gray-300 rounded select-none cursor-pointer z-50"
      >
        <span className="text-sm text-gray-900">Add Node</span>
      </div>
    </div>
  );
}

export default App;
