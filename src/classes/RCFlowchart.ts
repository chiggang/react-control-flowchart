import { RCFNode } from './RCFNode';

/**
 * React Control Flowchart Class
 */
export class RCFlowchart {
  node: RCFNode[];

  constructor() {
    this.node = [];
  }

  // 노드들을 불러옴
  getNodes = (): RCFNode[] => {
    return this.node;
  };

  // 노드를 추가함
  addNode = (newNode: RCFNode) => {
    this.node.push(newNode);
  };
}
