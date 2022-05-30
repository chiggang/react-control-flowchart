import useSWR from 'swr';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { INode, IPosition } from '../interfaces/rcf.interface';
import { RCFNode } from '../classes/RCFNode';

// 현재 출력되어 있는 노드를 정의함
let nodes: RCFNode[] = [];

/**
 * Node SWR
 */
const useNodeSWR = () => {
  const { data, mutate } = useSWR<RCFNode[]>(
    'react-control-flowchart-nodes',
    () => {
      return nodes;
    },
  );

  return {
    /* 노드를 불러옴 */
    nodeMutate: data || [],

    /* 노드를 추가함 */
    addNodeMutate: async (value: RCFNode) => {
      console.log('> node:', nodes.length, value);
      // 화면 렌더링을 위하여 개체를 복사함
      let cloneNodes: RCFNode[] = _.cloneDeep(nodes);

      // 노드의 고유 아이디를 정의함
      let nodeId = '';

      // 노드의 고유 아이디를 생성함
      while (true) {
        nodeId = 'rcf-node-' + nanoid(50);

        if (
          cloneNodes.filter(
            (filterData: RCFNode) => filterData.getNodeId() === nodeId,
          ).length === 0
        ) {
          break;
        }
      }

      // 새 zIndex를 정의함
      let newZIndex: number = 0;

      // zIndex의 가장 큰 값을 불러옴
      let maxZIndex: RCFNode | undefined = _.maxBy(cloneNodes);

      if (maxZIndex !== undefined) {
        newZIndex = maxZIndex.getZIndex() || 0;
      }

      newZIndex += 1;

      // 상태를 갱신함
      value.setNodeId(nodeId);
      value.setZIndex(newZIndex);
      cloneNodes.push(value);
      // cloneNodes.push({ ...value, nodeId, zIndex: newZIndex });
      nodes = cloneNodes;

      console.log('> cloneNodes:', cloneNodes);

      return mutate();
    },

    /* 전체 노드를 수정함 */
    modifyAllNodeMutate: async (value: IPosition) => {
      console.log('> node move!!');

      // // 화면 렌더링을 위하여 개체를 복사함
      // let cloneNodes: RCFNode[] = _.cloneDeep(nodes);
      //
      // cloneNodes.map((node2: RCFNode) => {
      //   node2.setPosition(
      //     node2.getPosition().x + value.x,
      //     node2.getPosition().y + value.y,
      //   );
      // });
      //
      // nodes = _.cloneDeep(cloneNodes);

      // 화면 렌더링을 위하여 개체를 복사함
      let cloneNodes: RCFNode[] = nodes;

      cloneNodes.map((node2: RCFNode) => {
        node2.setPosition(
          node2.getPosition().x + value.x,
          node2.getPosition().y + value.y,
        );
      });

      nodes = _.cloneDeep(cloneNodes);

      return mutate();
    },

    /* 노드를 수정함 */
    modifyNodeMutate: async (value: RCFNode) => {
      // // 수정할 노드의 원본 데이터를 불러옴
      // let cloneNodes: RCFNode = nodes.filter(
      //   (filterData: RCFNode) => filterData.getNodeId() === value.getNodeId(),
      // )[0];

      // 수정할 노드를 제외한 나머지 데이터를 불러옴
      let cloneNodes: RCFNode[] = nodes.filter(
        (filterData: RCFNode) => filterData.getNodeId() !== value.getNodeId(),
      );

      // // 노드를 새 값으로 수정함
      // preNode = {
      //   ...preNode,
      //   ...value,
      // };

      // 상태를 갱신함
      cloneNodes.push(value);
      nodes = _.cloneDeep(cloneNodes);

      return mutate();
    },

    /* 노드를 삭제함 */
    removeNodeMutate: async (value: string) => {
      // 삭제할 노드를 노드 목록에서 삭제함
      let cloneNodes: RCFNode[] = nodes.filter(
        (filterData: RCFNode) => filterData.getNodeId() !== value,
      );

      // 상태를 갱신함
      nodes = cloneNodes;

      return mutate();
    },
  };
};

export default useNodeSWR;
