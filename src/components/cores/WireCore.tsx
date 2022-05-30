import React, { memo, ReactNode, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { DraggableData, Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableEvent } from 'react-draggable';
import { ResizeDirection } from 're-resizable';
import {
  INodeInputPort,
  INodeOutputPort,
  INodeOutputPortConnectedNode,
  IWireCore,
} from '../../interfaces/rcf.interface';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import useNodeSWR from '../../swrs/node.swr';
import { EInOutput } from '../../enums/rcf.enum';
import { RCFNode } from '../../classes/RCFNode';
import { configure } from '../../configurations/rcf.config';

/**
 * Node wire core
 * @constructor
 */
const WireCore: React.FC<IWireCore> = memo((props) => {
  // 노드 SWR을 정의함
  const { nodeMutate } = useNodeSWR();

  //
  const [wire, setWire] = useState<ReactNode[]>([]);

  // 노드의 포트끼리 선을 연결함
  const getSvgCurve = (
    sourceX: number = 0,
    sourceY: number = 0,
    targetX: number = 0,
    targetY: number = 0,
  ): string => {
    // 곡선의 휘어짐을 정의함
    const controlLine: number = configure.wire.controlLine;

    let svgCurve: string = `M${sourceX} ${sourceY} C${
      sourceX + controlLine
    } ${sourceY}, ${targetX - controlLine} ${targetY}, ${targetX} ${targetY}`;

    return svgCurve;
  };

  useEffect(() => {
    return () => {};
  }, []);

  /**
   * 지정한 노드의 포트 정보를 불러옴
   * @param nodeId: Node ID
   * @param portId: Node's port ID
   */
  const getNodeInputPort = (
    nodeId: string,
    portId: string,
  ): INodeInputPort | null => {
    let node = nodeMutate.filter(
      (filterData: RCFNode) => filterData.getNodeId() === nodeId,
    );

    if (node.length > 0) {
      return node[0].getInputPort(portId);
    } else {
      return null;
    }
  };

  // 노드의 정보가 변경되면 실행함
  useEffect(() => {
    let tmpWire: ReactNode[] = [];

    nodeMutate.map((data: RCFNode) => {
      data.getOutputPorts().map((portData: INodeOutputPort) => {
        // 출력 포트와 연결된 대상 노드가 있을 경우에만 처리함
        if (portData.connectedNode.length > 0) {
          portData.connectedNode.map(
            (targetNodePort: INodeOutputPortConnectedNode) => {
              // 지정한 노드의 포트 정보를 불러옴
              let targetInputPort: INodeInputPort | null = getNodeInputPort(
                targetNodePort.targetNodeId,
                targetNodePort.targetInputPortId,
              );

              if (targetInputPort) {
                let svgCurve: string = getSvgCurve(
                  portData.position.x,
                  portData.position.y,
                  targetInputPort.position.x,
                  targetInputPort.position.y,
                );

                tmpWire.push(
                  <svg
                    width={props.flowchartWidth}
                    height={props.flowchartHeight}
                    className="absolute z-10"
                  >
                    <g>
                      <path
                        stroke={'rgb(59, 122, 217)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        // strokeDasharray="4 4"
                        // strokeOpacity={0.5}
                        fill="none"
                        d={svgCurve}
                        // className="test"
                      />
                      <path
                        stroke={'rgba(59, 122, 217, 0.2)'}
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        d={svgCurve}
                      />
                    </g>
                  </svg>,
                );
              }
            },
          );
        }
      });
    });

    setWire(tmpWire);
  }, [nodeMutate]);

  return <>{wire}</>;
});

export default WireCore;
