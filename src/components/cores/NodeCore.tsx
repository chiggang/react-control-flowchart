import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { DragControls, motion, PanInfo, useDragControls } from 'framer-motion';
import { DraggableData, Position, ResizableDelta, Rnd } from 'react-rnd';
// import Draggable, { DraggableEvent } from 'react-draggable';
import { ResizeDirection } from 're-resizable';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';

import {
  INodeCore,
  INodeInputPort,
  INodeOutputPort,
  IPosition,
} from '../../interfaces/rcf.interface';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import useNodeSWR from '../../swrs/node.swr';
import { RCFNode } from '../../classes/RCFNode';
import { EInOutput } from '../../enums/rcf.enum';

let mouseX: number = 0;
let mouseY: number = 0;

gsap.registerPlugin(Draggable);

/**
 * Node core
 * @constructor
 */
const NodeCore: React.FC<INodeCore> = memo((props) => {
  // 노드 SWR을 정의함
  const { nodeMutate, modifyNodeMutate, removeNodeMutate } = useNodeSWR();

  // 노드의 드래그 가능 영역을 정의함
  const dragControls: DragControls = useDragControls();

  // 드래그 중인 노드의 현재 위치를 정의함
  const [nodePositionOnDragging, setNodePositionOnDragging] =
    useState<IPosition>({
      x: 0,
      y: 0,
    });

  // 노드의 현재 위치를 불러옴
  const getNodeTransformPosition = (): IPosition | null => {
    const nodeElement = document.querySelector(
      `#${props.node.getNodeId()}`,
    ) as HTMLDivElement;

    // 노드 개체가 없으면 진행하지 않음
    if (nodeElement === undefined) {
      return null;
    }

    // 노드의 스타일을 불러옴
    let nodeStyle: CSSStyleDeclaration = window.getComputedStyle(nodeElement);

    // 노드의 상세 스타일(transform)을 불러옴
    let nodeTransformStyle: DOMMatrix = new WebKitCSSMatrix(
      nodeStyle.transform,
    );

    return {
      x: Math.round(nodeTransformStyle.m41 || 0),
      y: Math.round(nodeTransformStyle.m42 || 0),
    };
  };

  /**
   * 지정한 포트의 중심 위치를 불러옴
   * @param inOutput: 입출력 구분
   * @param portId: 포트 아이디
   * @return portExist: 포트의 존재 여부(true: 포트 있음, false: 포트 없음)
   * @return x: 포트의 중심 가로 위치
   * @return y: 포트의 중심 세로 위치
   */
  const getPortCenterPosition = (
    inOutput: EInOutput,
    portId: string,
  ): { portExist: boolean; x: number; y: number } => {
    // 포트의 존재 여부를 정의함(true: 포트 있음, false: 포트 없음)
    let portExist: boolean = false;

    // 포트의 중심 가로 위치를 정의함
    let x: number = 0;

    // 포트의 중심 세로 위치를 정의함
    let y: number = 0;

    // 지정한 포트를 불러옴
    let port = document.querySelectorAll(
      `#${props.node.getNodeId()} [data-port-type='${inOutput}'][data-port-id='${portId}']`,
    );

    if (port.length > 0) {
      // 포트가 존재함
      portExist = true;

      // 포트의 아이콘을 불러옴
      let portIcon = port[0].querySelector('svg');

      // 포트의 아이콘이 존재함
      if (portIcon) {
        // 포트의 중심 위치를 계산함
        x =
          portIcon.getBoundingClientRect().width / 2 +
          portIcon.getBoundingClientRect().x;
        y =
          portIcon.getBoundingClientRect().height / 2 +
          portIcon.getBoundingClientRect().y;
      }
    }

    return { portExist, x, y };
  };

  // 포트들의 중심 위치를 갱신함
  const setPortCenterPosition = () => {
    // 입력 포트의 중심 위치를 갱신함
    props.node.getInputPorts().map((data: INodeInputPort) => {
      // 지정한 포트의 중심 위치를 불러옴
      let port = getPortCenterPosition(EInOutput.INPUT, data.portId);

      // 지정한 입력 포트의 중심 위치를 변경함
      props.node.setInputPortCenterPosition(data.portId, port.x, port.y);
    });

    // 출력 포트의 중심 위치를 갱신함
    props.node.getOutputPorts().map((data: INodeOutputPort) => {
      // 지정한 포트의 중심 위치를 불러옴
      let port = getPortCenterPosition(EInOutput.OUTPUT, data.portId);

      // 지정한 출력 포트의 중심 위치를 변경함
      props.node.setOutputPortCenterPosition(data.portId, port.x, port.y);
    });

    // 노드를 수정함
    // (async () => {
    //   await modifyNodeMutate(props.node);
    // })();

    // 노드의 드래그를 진행함
    props.onDrag();
  };

  // 버튼을 클릭함
  const handleButton_onClick = (type: string, param: any = '') => {
    switch (type) {
      // 노드 활성화 여부 버튼
      case 'activate':
        props.node.setActivated(!props.node.getActivated());

        // 노드를 수정함
        (async () => {
          await modifyNodeMutate(props.node);
        })();
        break;

      // 노드 편집 버튼
      case 'modified':
        props.node.setModified(!props.node.getModified());

        // 노드를 수정함
        (async () => {
          await modifyNodeMutate(props.node);
        })();
        break;

      default:
        break;
    }
  };

  // 노드의 드래그를 시작함
  // const handleRnd_onDragStart = (
  //   event: DraggableEvent,
  //   data: DraggableData,
  // ) => {
  //   // 노드의 드래그를 시작함
  //   props.onDragStart();
  // };

  // 노드의 드래그를 진행함
  // const handleRnd_onDrag = (event: DraggableEvent, data: DraggableData) => {
  //   // 포트들의 중심 위치를 갱신함
  //   setPortCenterPosition();
  // };

  // 노드의 드래그를 시작함
  const handleNode_onDragStart = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // 노드의 드래그를 시작함
    props.onDragStart();
  };
  //
  // // 노드의 드래그를 진행함
  // const handleNode_onDrag = (
  //   event: MouseEvent | TouchEvent | PointerEvent,
  //   info: PanInfo,
  // ) => {
  //   // 노드의 현재 위치를 불러옴
  //   let nodeTransformPosition: IPosition | null = getNodeTransformPosition();
  //
  //   if (
  //     nodeTransformPosition === null ||
  //     (nodePositionOnDragging.x === nodeTransformPosition.x &&
  //       nodePositionOnDragging.y === nodeTransformPosition.y)
  //   ) {
  //     return;
  //   }
  //
  //   // 드래그 중인 노드의 현재 위치에 적용함
  //   setNodePositionOnDragging({
  //     x: nodeTransformPosition.x,
  //     y: nodeTransformPosition.y,
  //   });
  //
  //   console.log(
  //     '> xy:',
  //     nodePositionOnDragging.x,
  //     nodeTransformPosition.x,
  //     ':',
  //     nodePositionOnDragging.y,
  //     nodeTransformPosition.y,
  //   );
  //
  //   // 포트들의 중심 위치를 갱신함
  //   setPortCenterPosition();
  //
  //   // 노드의 드래그를 진행함
  //   props.onDrag();
  // };

  // 노드의 드래그를 진행함
  const handleNode_onDrag = (event: gsap.Callback) => {
    // 노드의 현재 위치를 불러옴
    let nodeTransformPosition: IPosition | null = getNodeTransformPosition();

    if (nodeTransformPosition === null) {
      return;
    }

    // // 드래그 중인 노드의 현재 위치에 적용함
    // setNodePositionOnDragging({
    //   x: nodeTransformPosition.x,
    //   y: nodeTransformPosition.y,
    // });

    // console.log(
    //   '> xy:',
    //   nodePositionOnDragging.x,
    //   nodeTransformPosition.x,
    //   ':',
    //   nodePositionOnDragging.y,
    //   nodeTransformPosition.y,
    // );

    // 노드의 위치를 변경함
    props.node.setPosition(nodeTransformPosition.x, nodeTransformPosition.y);

    // 포트들의 중심 위치를 갱신함
    setPortCenterPosition();

    // 노드의 드래그를 진행함
    props.onDrag();
  };

  // 노드의 드래그를 멈춤
  const handleNode_onDragEnd = (event: gsap.Callback) => {
    // 노드의 현재 위치를 불러옴
    let nodeTransformPosition: IPosition | null = getNodeTransformPosition();

    if (nodeTransformPosition === null) {
      return;
    }

    // 노드의 위치를 변경함
    props.node.setPosition(nodeTransformPosition.x, nodeTransformPosition.y);

    // 포트들의 중심 위치를 갱신함
    setPortCenterPosition();

    // 노드를 수정함
    (async () => {
      await modifyNodeMutate(props.node);
    })();

    // 노드의 드래그를 멈춤
    props.onDragStop();
  };

  // 노드의 드래그를 멈춤
  const handleNode_onDragTransitionEnd = () => {
    // 노드의 현재 위치를 불러옴
    let nodeTransformPosition: IPosition | null = getNodeTransformPosition();

    if (nodeTransformPosition === null) {
      return;
    }

    // 노드의 위치를 변경함
    props.node.setPosition(nodeTransformPosition.x, nodeTransformPosition.y);

    // 노드를 수정함
    (async () => {
      await modifyNodeMutate(props.node);
    })();

    // 노드의 드래그를 멈춤
    props.onDragStop();
  };

  // 노드의 드래그를 멈춤
  // const handleRnd_onDragStop = (event: DraggableEvent, data: DraggableData) => {
  //   props.node.setPosition(Math.round(data.x), Math.round(data.y));
  //   props.node.setHeaderTitle(`${Math.round(data.x)}:${Math.round(data.y)}`);
  //
  //   // 노드를 수정함
  //   (async () => {
  //     await modifyNodeMutate(props.node);
  //   })();
  //
  //   // 노드의 드래그를 멈춤
  //   props.onDragStop();
  // };

  // 노드의 크기가 변경된 후 멈춤
  const handleRnd_onResizeStop = (
    event: MouseEvent | TouchEvent,
    dir: ResizeDirection,
    elementRef: HTMLElement,
    delta: ResizableDelta,
    position: Position,
  ) => {
    // 노드의 최종 크기를 불러옴
    const tmpWidth = +elementRef.style.width.replace('px', '');
    const tmpHeight = +elementRef.style.height.replace('px', '');

    props.node.setSize(tmpWidth, tmpHeight);

    // 노드를 수정함
    (async () => {
      await modifyNodeMutate(props.node);
    })();
  };

  useEffect(() => {
    // 포트들의 중심 위치를 갱신함
    setPortCenterPosition();

    Draggable.create(`#${props.node.getNodeId()}`, {
      // bounds: document.getElementById("container"),
      // inertia: true,
      onDragStart: (event: gsap.Callback) => {
        console.log('> node onDragStart:', event);

        // 노드의 드래그를 시작함
        props.onDragStart();
      },
      onDrag: (event: gsap.Callback) => {
        console.log('> node onDrag:', event);

        // 노드의 드래그를 진행함
        handleNode_onDrag(event);
      },
      onDragEnd: (event: gsap.Callback) => {
        console.log('> node onDragEnd:', event);

        // 노드의 드래그를 멈춤
        handleNode_onDragEnd(event);
      },
    });

    return () => {};
  }, []);

  // 일반 div 레이어를 사용
  let divX: number = useMemo(() => props.node.getPosition().x, []);
  let divY: number = useMemo(() => props.node.getPosition().y, []);
  let mouseX: number = useMemo(() => 0, []);
  let mouseY: number = useMemo(() => 0, []);

  const tmpDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    // let mouseX: number = 0;
    // let mouseY: number = 0;
    console.log(event.currentTarget);
  }, []);

  const tmpDrag = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // console.log('> dragging:', event.pageX, event.pageY, event);
    // console.log((event.target as HTMLDivElement).id);

    if (mouseX === event.pageX && mouseY === event.pageY) {
      return;
    }

    mouseX = Math.ceil(event.pageX);
    mouseY = Math.ceil(event.pageY);

    let tmp = document.querySelector(
      `#${(event.target as HTMLDivElement).id}`,
    ) as HTMLDivElement;
    // tmp.style.left = `${event.pageX}px`;
    // tmp.style.top = `${event.pageY}px`;
    // tmp.style.transform = `translate(${event.pageX}px, ${event.pageY}px)`;

    tmp.style.transform = `translateX(${event.pageX}px) translateY(${event.pageY}px) translateZ(0)`;

    // tmp.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    // console.log('> position:', event.pageX, event.pageY);

    ////////////////////////
    ///////////////////////
    /////////////////////////
    //////////////////////////
    ///// GPU 가속??
    ///// translate로 가속 가능??
    ///// 느림!!!!!
    ///////////////////////////

    // let tmp2 = document.querySelectorAll(
    //   `div[data-title='Node.3']`,
    // ) as NodeListOf<HTMLDivElement>;

    // Array.prototype.forEach.call(tmp2, (divData: HTMLDivElement) => {
    //   // divData.style.opacity = '0.1';
    //   divData.style.display = 'none';
    // });
  }, []);

  return (
    <>
      {/*<div*/}
      {/*  id={props.node.getNodeId()}*/}
      {/*  data-title={props.node.getHeader().title}*/}
      {/*  style={{*/}
      {/*    width: `${props.node.getSize().width}px`,*/}
      {/*    height: `${props.node.getSize().height}px`,*/}
      {/*    minWidth: `${props.node.getMinSize().width}px`,*/}
      {/*    minHeight: `${props.node.getMinSize().height}px`,*/}
      {/*    // left: `${props.node.getPosition().x}px`,*/}
      {/*    // top: `${props.node.getPosition().y}px`,*/}
      {/*    left: '100px',*/}
      {/*    top: '100px',*/}
      {/*    // transform: `translate(${props.node.getPosition().x}px, ${*/}
      {/*    //   props.node.getPosition().y*/}
      {/*    // }px)`,*/}
      {/*    // transform: `translate(${props.node.getPosition().x}px, ${*/}
      {/*    //   props.node.getPosition().y*/}
      {/*    // }px)`,*/}
      {/*  }}*/}
      {/*  draggable={true}*/}
      {/*  onDragStart={tmpDragStart}*/}
      {/*  onDrag={tmpDrag}*/}
      {/*  className={`test-node-core absolute ${*/}
      {/*    props.node.getActivated() ? 'grayscale-0' : 'grayscale'*/}
      {/*  } outline ${*/}
      {/*    props.node.getSelected() ? 'outline-3' : 'outline-0'*/}
      {/*  } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900 overflow-hidden pointer-events-auto`}*/}
      {/*>*/}
      {/*  <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">*/}
      {/*    /!* Header *!/*/}
      {/*    <div className="relative">*/}
      {/*      <div*/}
      {/*        className={`drag-handle-${props.node.getNodeId()} flex-none w-full h-6 px-2 flex justify-between items-center ${*/}
      {/*          props.node.getHeader().backgroundColor*/}
      {/*        } rounded-lg ${props.node.getDraggable() && 'cursor-move'}`}*/}
      {/*      >*/}
      {/*        <div className="flex justify-start items-center space-x-1.5 truncate">*/}
      {/*          /!* Icon *!/*/}
      {/*          <div className="flex justify-center items-center">*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={props.node.getHeader().icon as IconProp}*/}
      {/*              className={`w-3.5 h-3.5 ${*/}
      {/*                props.node.getHeader().iconColor*/}
      {/*              } svg-shadow`}*/}
      {/*            />*/}
      {/*          </div>*/}

      {/*          /!* Text *!/*/}
      {/*          <span*/}
      {/*            className={`text-xs font-bold ${*/}
      {/*              props.node.getHeader().titleColor*/}
      {/*            } text-shadow-2 truncate`}*/}
      {/*          >*/}
      {/*            {props.node.getHeader().title}*/}
      {/*          </span>*/}
      {/*        </div>*/}
      {/*      </div>*/}

      {/*      /!* 확장 버튼 *!/*/}
      {/*      <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">*/}
      {/*        /!* 노드 편집 버튼 *!/*/}
      {/*        <div*/}
      {/*          onClick={() => handleButton_onClick('modified')}*/}
      {/*          className="button flex justify-center items-center"*/}
      {/*        >*/}
      {/*          {!props.node.getModified() && (*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={['fas', 'gear']}*/}
      {/*              className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*            />*/}
      {/*          )}*/}
      {/*        </div>*/}

      {/*        /!* 노드 활성화 여부 버튼 *!/*/}
      {/*        <div*/}
      {/*          onClick={() => handleButton_onClick('activate')}*/}
      {/*          className="button flex justify-center items-center"*/}
      {/*        >*/}
      {/*          <FontAwesomeIcon*/}
      {/*            icon={['fas', props.node.getActivated() ? 'play' : 'pause']}*/}
      {/*            className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*          />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}

      {/*    /!* Body *!/*/}
      {/*    <div className="flex-grow w-full h-full rounded-lg space-y-3">*/}
      {/*      /!* 노드 편집 결과 버튼 *!/*/}
      {/*      {props.node.getModified() && (*/}
      {/*        <div className="px-1 pt-1 pb-2 flex justify-end items-center border-b border-solid border-slate-700 space-x-1">*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button px-2 py-0.5 flex justify-center items-center bg-rose-400 rounded"*/}
      {/*          >*/}
      {/*            <span className="text-xs font-bold text-rose-800">*/}
      {/*              Cancel*/}
      {/*            </span>*/}
      {/*          </div>*/}

      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button px-2 py-0.5 flex justify-center items-center bg-gray-300 rounded"*/}
      {/*          >*/}
      {/*            <span className="text-xs font-bold text-gray-800">Apply</span>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      )}*/}

      {/*      /!* Ports *!/*/}
      {/*      <div className="pl-1 pr-0.5 py-2 w-full h-full flex justify-between items-start space-x-3">*/}
      {/*        /!* Input port *!/*/}
      {/*        <div className="h-full truncate space-y-2">*/}
      {/*          /!* Port *!/*/}
      {/*          {_.sortBy(props.node.getInputPorts(), 'sortOrder').map(*/}
      {/*            (portData: INodeInputPort) => (*/}
      {/*              <div*/}
      {/*                key={portData.portId}*/}
      {/*                data-port-type="input"*/}
      {/*                data-port-id={portData.portId}*/}
      {/*                className="flex justify-start items-center space-x-1 truncate"*/}
      {/*              >*/}
      {/*                /!* Port icon *!/*/}
      {/*                <div className="flex justify-center items-center">*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={*/}
      {/*                      (portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIcon*/}
      {/*                        : portData.connectedIcon) as IconProp*/}
      {/*                    }*/}
      {/*                    className={`w-3.5 h-3.5 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={['fas', 'chevron-right']}*/}
      {/*                    className={`w-2 h-2 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                </div>*/}

      {/*                /!* Port title *!/*/}
      {/*                <div className="pl-1.5 space-y-0.5 truncate border-l border-solid border-slate-700">*/}
      {/*                  <div className="flex justify-start items-center truncate">*/}
      {/*                    <span*/}
      {/*                      className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                    >*/}
      {/*                      {portData.portTitle}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}

      {/*                  {portData.inputForm && (*/}
      {/*                    <div className="input-form">{portData.inputForm}</div>*/}
      {/*                  )}*/}
      {/*                </div>*/}
      {/*              </div>*/}
      {/*            ),*/}
      {/*          )}*/}
      {/*        </div>*/}

      {/*        /!* Output port *!/*/}
      {/*        <div className="h-full truncate space-y-2">*/}
      {/*          /!* Port *!/*/}
      {/*          {_.sortBy(props.node.getOutputPorts(), 'sortOrder').map(*/}
      {/*            (portData: INodeOutputPort) => (*/}
      {/*              <div*/}
      {/*                key={portData.portId}*/}
      {/*                data-port-type="output"*/}
      {/*                data-port-id={portData.portId}*/}
      {/*                className="flex justify-end items-center space-x-1 truncate"*/}
      {/*              >*/}
      {/*                /!* Port title *!/*/}
      {/*                <div className="pr-1.5 space-y-0.5 truncate border-r border-solid border-slate-700">*/}
      {/*                  <div className="flex justify-end items-center truncate">*/}
      {/*                    <span*/}
      {/*                      className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                    >*/}
      {/*                      {portData.portTitle}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}

      {/*                  {portData.inputForm && (*/}
      {/*                    <div className="input-form">{portData.inputForm}</div>*/}
      {/*                  )}*/}
      {/*                </div>*/}

      {/*                /!* Port icon *!/*/}
      {/*                <div className="flex justify-center items-center">*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={*/}
      {/*                      (portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIcon*/}
      {/*                        : portData.connectedIcon) as IconProp*/}
      {/*                    }*/}
      {/*                    className={`w-3.5 h-3.5 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={['fas', 'chevron-right']}*/}
      {/*                    className={`w-2 h-2 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                </div>*/}
      {/*              </div>*/}
      {/*            ),*/}
      {/*          )}*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<Draggable*/}
      {/*  defaultPosition={props.node.getPosition()}*/}
      {/*  // dragHandleClassName={`drag-handle-${props.node.getNodeId()}`}*/}
      {/*  // onDrag={handleRnd_onDrag}*/}
      {/*  // onDragStart={handleRnd_onDragStart}*/}
      {/*  // onDragStop={handleRnd_onDragStop}*/}
      {/*  // onResizeStop={handleRnd_onResizeStop}*/}
      {/*  // enableResizing={{*/}
      {/*  //   top: false,*/}
      {/*  //   topRight: false,*/}
      {/*  //   right: props.node.getSizeChangeable(),*/}
      {/*  //   bottomRight: props.node.getSizeChangeable(),*/}
      {/*  //   bottom: props.node.getSizeChangeable(),*/}
      {/*  //   bottomLeft: false,*/}
      {/*  //   left: false,*/}
      {/*  //   topLeft: false,*/}
      {/*  // }}*/}
      {/*  // disableDragging={!props.node.getDraggable()}*/}
      {/*  scale={1}*/}
      {/*>*/}
      {/*  <div*/}
      {/*    id={props.node.getNodeId()}*/}
      {/*    style={{*/}
      {/*      width: props.node.getSize().width,*/}
      {/*      height: props.node.getSize().height,*/}
      {/*      minWidth: props.node.getMinSize().width,*/}
      {/*      minHeight: props.node.getMinSize().height,*/}
      {/*      zIndex: props.node.getZIndex(),*/}
      {/*    }}*/}
      {/*    className={`absolute ${*/}
      {/*      props.node.getActivated() ? 'grayscale-0' : 'grayscale'*/}
      {/*    } outline ${*/}
      {/*      props.node.getSelected() ? 'outline-3' : 'outline-0'*/}
      {/*    } outline-offset-2 outline-amber-500 bg-slate-900 overflow-hidden pointer-events-auto`}*/}
      {/*  >*/}
      {/*    <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">*/}
      {/*      /!* Header *!/*/}
      {/*      <div className="relative">*/}
      {/*        <div*/}
      {/*          className={`drag-handle-${props.node.getNodeId()} flex-none w-full h-6 px-2 flex justify-between items-center ${*/}
      {/*            props.node.getHeader().backgroundColor*/}
      {/*          } rounded-lg ${props.node.getDraggable() && 'cursor-move'}`}*/}
      {/*        >*/}
      {/*          <div className="flex justify-start items-center space-x-1.5 truncate">*/}
      {/*            /!* Icon *!/*/}
      {/*            <div className="flex justify-center items-center">*/}
      {/*              <FontAwesomeIcon*/}
      {/*                icon={props.node.getHeader().icon as IconProp}*/}
      {/*                className={`w-3.5 h-3.5 ${*/}
      {/*                  props.node.getHeader().iconColor*/}
      {/*                } svg-shadow`}*/}
      {/*              />*/}
      {/*            </div>*/}

      {/*            /!* Text *!/*/}
      {/*            <span*/}
      {/*              className={`text-xs font-bold ${*/}
      {/*                props.node.getHeader().titleColor*/}
      {/*              } text-shadow-2 truncate`}*/}
      {/*            >*/}
      {/*              {props.node.getHeader().title}*/}
      {/*            </span>*/}
      {/*          </div>*/}
      {/*        </div>*/}

      {/*        /!* 확장 버튼 *!/*/}
      {/*        <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">*/}
      {/*          /!* 노드 편집 버튼 *!/*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button flex justify-center items-center"*/}
      {/*          >*/}
      {/*            {!props.node.getModified() && (*/}
      {/*              <FontAwesomeIcon*/}
      {/*                icon={['fas', 'gear']}*/}
      {/*                className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*              />*/}
      {/*            )}*/}
      {/*          </div>*/}

      {/*          /!* 노드 활성화 여부 버튼 *!/*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('activate')}*/}
      {/*            className="button flex justify-center items-center"*/}
      {/*          >*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={['fas', props.node.getActivated() ? 'play' : 'pause']}*/}
      {/*              className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}

      {/*      /!* Body *!/*/}
      {/*      <div className="flex-grow w-full h-full rounded-lg space-y-3">*/}
      {/*        /!* 노드 편집 결과 버튼 *!/*/}
      {/*        {props.node.getModified() && (*/}
      {/*          <div className="px-1 pt-1 pb-2 flex justify-end items-center border-b border-solid border-slate-700 space-x-1">*/}
      {/*            <div*/}
      {/*              onClick={() => handleButton_onClick('modified')}*/}
      {/*              className="button px-2 py-0.5 flex justify-center items-center bg-rose-400 rounded"*/}
      {/*            >*/}
      {/*              <span className="text-xs font-bold text-rose-800">*/}
      {/*                Cancel*/}
      {/*              </span>*/}
      {/*            </div>*/}

      {/*            <div*/}
      {/*              onClick={() => handleButton_onClick('modified')}*/}
      {/*              className="button px-2 py-0.5 flex justify-center items-center bg-gray-300 rounded"*/}
      {/*            >*/}
      {/*              <span className="text-xs font-bold text-gray-800">*/}
      {/*                Apply*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*        )}*/}

      {/*        /!* Ports *!/*/}
      {/*        <div className="hidden pl-1 pr-0.5 py-2 w-full h-full flex justify-between items-start space-x-3">*/}
      {/*          /!* Input port *!/*/}
      {/*          <div className="h-full truncate space-y-2">*/}
      {/*            /!* Port *!/*/}
      {/*            {_.sortBy(props.node.getInputPorts(), 'sortOrder').map(*/}
      {/*              (portData: INodeInputPort) => (*/}
      {/*                <div*/}
      {/*                  key={portData.portId}*/}
      {/*                  data-port-type="input"*/}
      {/*                  data-port-id={portData.portId}*/}
      {/*                  className="flex justify-start items-center space-x-1 truncate"*/}
      {/*                >*/}
      {/*                  /!* Port icon *!/*/}
      {/*                  <div className="flex justify-center items-center">*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={*/}
      {/*                        (portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIcon*/}
      {/*                          : portData.connectedIcon) as IconProp*/}
      {/*                      }*/}
      {/*                      className={`w-3.5 h-3.5 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={['fas', 'chevron-right']}*/}
      {/*                      className={`w-2 h-2 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                  </div>*/}

      {/*                  /!* Port title *!/*/}
      {/*                  <div className="pl-1.5 space-y-0.5 truncate border-l border-solid border-slate-700">*/}
      {/*                    <div className="flex justify-start items-center truncate">*/}
      {/*                      <span*/}
      {/*                        className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                      >*/}
      {/*                        {portData.portTitle}*/}
      {/*                      </span>*/}
      {/*                    </div>*/}

      {/*                    {portData.inputForm && (*/}
      {/*                      <div className="input-form">*/}
      {/*                        {portData.inputForm}*/}
      {/*                      </div>*/}
      {/*                    )}*/}
      {/*                  </div>*/}
      {/*                </div>*/}
      {/*              ),*/}
      {/*            )}*/}
      {/*          </div>*/}

      {/*          /!* Output port *!/*/}
      {/*          <div className="h-full truncate space-y-2">*/}
      {/*            /!* Port *!/*/}
      {/*            {_.sortBy(props.node.getOutputPorts(), 'sortOrder').map(*/}
      {/*              (portData: INodeOutputPort) => (*/}
      {/*                <div*/}
      {/*                  key={portData.portId}*/}
      {/*                  data-port-type="output"*/}
      {/*                  data-port-id={portData.portId}*/}
      {/*                  className="flex justify-end items-center space-x-1 truncate"*/}
      {/*                >*/}
      {/*                  /!* Port title *!/*/}
      {/*                  <div className="pr-1.5 space-y-0.5 truncate border-r border-solid border-slate-700">*/}
      {/*                    <div className="flex justify-end items-center truncate">*/}
      {/*                      <span*/}
      {/*                        className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                      >*/}
      {/*                        {portData.portTitle}*/}
      {/*                      </span>*/}
      {/*                    </div>*/}

      {/*                    {portData.inputForm && (*/}
      {/*                      <div className="input-form">*/}
      {/*                        {portData.inputForm}*/}
      {/*                      </div>*/}
      {/*                    )}*/}
      {/*                  </div>*/}

      {/*                  /!* Port icon *!/*/}
      {/*                  <div className="flex justify-center items-center">*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={*/}
      {/*                        (portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIcon*/}
      {/*                          : portData.connectedIcon) as IconProp*/}
      {/*                      }*/}
      {/*                      className={`w-3.5 h-3.5 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={['fas', 'chevron-right']}*/}
      {/*                      className={`w-2 h-2 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                  </div>*/}
      {/*                </div>*/}
      {/*              ),*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</Draggable>*/}

      {/*{props.dragging && (*/}
      {/*  <div*/}
      {/*    id={props.node.getNodeId()}*/}
      {/*    style={{*/}
      {/*      width: props.node.getSize().width,*/}
      {/*      height: props.node.getSize().height,*/}
      {/*      left: props.node.getPosition().x,*/}
      {/*      top: props.node.getPosition().y,*/}
      {/*      transform: 'translateZ(0)',*/}
      {/*    }}*/}
      {/*    data-div-type="sample-div"*/}
      {/*    className="absolute border"*/}
      {/*  />*/}
      {/*)}*/}

      {/*{!props.dragging && (*/}
      <div
        id={props.node.getNodeId()}
        style={{
          width: props.node.getSize().width,
          height: props.node.getSize().height,
          transform: `translateX(${props.node.getPosition().x}px) translateY(${
            props.node.getPosition().y
          }px) translateZ(0)`,
        }}
        // drag
        // dragMomentum={false}
        // dragControls={dragControls}
        // dragListener={false}
        // onDragStart={handleNode_onDragStart}
        // onDrag={handleNode_onDrag}
        // onDragTransitionEnd={handleNode_onDragTransitionEnd}
        // style={{ scale: useMotionValue(0.5) }}
        // transition={{ type: '', bounce: 0 }}
        className={`test-node-core ${
          props.node.getActivated() ? 'grayscale-0' : 'grayscale'
        } outline ${
          props.node.getSelected() ? 'outline-3' : 'outline-0'
        } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900/90 rounded-xl shadow-md shadow-black/50 overflow-hidden pointer-events-auto`}
        // className={`test-node-core ${
        //   props.node.getActivated() ? 'grayscale-0' : 'grayscale'
        // } outline ${
        //   props.node.getSelected() ? 'outline-3' : 'outline-0'
        // } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900 rounded-xl overflow-hidden pointer-events-auto`}
      >
        <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">
          {/* Header */}
          <div className="relative">
            <div
              onPointerDown={(event: React.PointerEvent<HTMLDivElement>) =>
                dragControls.start(event)
              }
              className={`drag-handle-${props.node.getNodeId()} flex-none w-full h-6 px-2 flex justify-between items-center ${
                props.node.getHeader().backgroundColor
              } rounded-lg ${props.node.getDraggable() && 'cursor-move'}`}
            >
              <div className="flex justify-start items-center space-x-1.5 truncate">
                {/* Icon */}
                <div className="flex justify-center items-center">
                  <FontAwesomeIcon
                    icon={props.node.getHeader().icon as IconProp}
                    className={`w-3.5 h-3.5 ${
                      props.node.getHeader().iconColor
                    } svg-shadow`}
                  />
                </div>

                {/* Text */}
                <span
                  className={`text-xs font-bold ${
                    props.node.getHeader().titleColor
                  } text-shadow-2 truncate`}
                >
                  {props.node.getHeader().title}
                </span>
              </div>
            </div>

            {/* 확장 버튼 */}
            <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">
              {/* 노드 편집 버튼 */}
              <div
                onClick={() => handleButton_onClick('modified')}
                className="button flex justify-center items-center"
              >
                {!props.node.getModified() && (
                  <FontAwesomeIcon
                    icon={['fas', 'gear']}
                    className="w-3.5 h-3.5 text-gray-300 svg-shadow"
                  />
                )}
              </div>

              {/* 노드 활성화 여부 버튼 */}
              <div
                onClick={() => handleButton_onClick('activate')}
                className="button flex justify-center items-center"
              >
                <FontAwesomeIcon
                  icon={['fas', props.node.getActivated() ? 'play' : 'pause']}
                  className="w-3.5 h-3.5 text-gray-300 svg-shadow"
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow w-full h-full rounded-lg space-y-3">
            {/* 노드 편집 결과 버튼 */}
            {props.node.getModified() && (
              <div className="px-1 pt-1 pb-2 flex justify-end items-center border-b border-solid border-slate-700 space-x-1">
                <div
                  onClick={() => handleButton_onClick('modified')}
                  className="button px-2 py-0.5 flex justify-center items-center bg-rose-400 rounded"
                >
                  <span className="text-xs font-bold text-rose-800">
                    Cancel
                  </span>
                </div>

                <div
                  onClick={() => handleButton_onClick('modified')}
                  className="button px-2 py-0.5 flex justify-center items-center bg-gray-300 rounded"
                >
                  <span className="text-xs font-bold text-gray-800">Apply</span>
                </div>
              </div>
            )}

            {/* Ports */}
            <div className="pl-1 pr-0.5 py-2 w-full h-full flex justify-between items-start space-x-3">
              {/* Input port */}
              <div className="h-full truncate space-y-2">
                {/* Port */}
                {_.sortBy(props.node.getInputPorts(), 'sortOrder').map(
                  (portData: INodeInputPort) => (
                    <div
                      key={portData.portId}
                      data-port-type="input"
                      data-port-id={portData.portId}
                      className="flex justify-start items-center space-x-1 truncate"
                    >
                      {/* Port icon */}
                      <div className="flex justify-center items-center">
                        <FontAwesomeIcon
                          icon={
                            (portData.connectedNode.length === 0
                              ? portData.unconnectedIcon
                              : portData.connectedIcon) as IconProp
                          }
                          className={`w-3.5 h-3.5 ${
                            portData.connectedNode.length === 0
                              ? portData.unconnectedIconColor
                              : portData.connectedIconColor
                          }`}
                        />
                        <FontAwesomeIcon
                          icon={['fas', 'chevron-right']}
                          className={`w-2 h-2 ${
                            portData.connectedNode.length === 0
                              ? portData.unconnectedIconColor
                              : portData.connectedIconColor
                          }`}
                        />
                      </div>

                      {/* Port title */}
                      <div className="pl-1.5 space-y-0.5 truncate border-l border-solid border-slate-700">
                        <div className="flex justify-start items-center truncate">
                          <span
                            className={`text-xs font-semibold ${portData.portTitleColor} truncate`}
                          >
                            {portData.portTitle}
                          </span>
                        </div>

                        {portData.inputForm && (
                          <div className="input-form">{portData.inputForm}</div>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Output port */}
              <div className="h-full truncate space-y-2">
                {/* Port */}
                {_.sortBy(props.node.getOutputPorts(), 'sortOrder').map(
                  (portData: INodeOutputPort) => (
                    <div
                      key={portData.portId}
                      data-port-type="output"
                      data-port-id={portData.portId}
                      className="flex justify-end items-center space-x-1 truncate"
                    >
                      {/* Port title */}
                      <div className="pr-1.5 space-y-0.5 truncate border-r border-solid border-slate-700">
                        <div className="flex justify-end items-center truncate">
                          <span
                            className={`text-xs font-semibold ${portData.portTitleColor} truncate`}
                          >
                            {portData.portTitle}
                          </span>
                        </div>

                        {portData.inputForm && (
                          <div className="input-form">{portData.inputForm}</div>
                        )}
                      </div>

                      {/* Port icon */}
                      <div className="flex justify-center items-center">
                        <FontAwesomeIcon
                          icon={
                            (portData.connectedNode.length === 0
                              ? portData.unconnectedIcon
                              : portData.connectedIcon) as IconProp
                          }
                          className={`w-3.5 h-3.5 ${
                            portData.connectedNode.length === 0
                              ? portData.unconnectedIconColor
                              : portData.connectedIconColor
                          }`}
                        />
                        <FontAwesomeIcon
                          icon={['fas', 'chevron-right']}
                          className={`w-2 h-2 ${
                            portData.connectedNode.length === 0
                              ? portData.unconnectedIconColor
                              : portData.connectedIconColor
                          }`}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*)}*/}

      {/*{!props.dragging && (*/}
      {/*  <motion.div*/}
      {/*    id={props.node.getNodeId()}*/}
      {/*    drag*/}
      {/*    dragMomentum={false}*/}
      {/*    dragControls={dragControls}*/}
      {/*    dragListener={false}*/}
      {/*    onDragStart={handleNode_onDragStart}*/}
      {/*    onDrag={handleNode_onDrag}*/}
      {/*    onDragTransitionEnd={handleNode_onDragTransitionEnd}*/}
      {/*    animate={{*/}
      {/*      width: props.node.getSize().width,*/}
      {/*      height: props.node.getSize().height,*/}
      {/*      position: 'fixed',*/}
      {/*      x: props.node.getPosition().x,*/}
      {/*      y: props.node.getPosition().y,*/}
      {/*      // transitionEnd: {*/}
      {/*      //   display: 'none',*/}
      {/*      // },*/}
      {/*    }}*/}
      {/*    // style={{ scale: useMotionValue(0.5) }}*/}
      {/*    // transition={{ type: '', bounce: 0 }}*/}
      {/*    className={`test-node-core ${*/}
      {/*      props.node.getActivated() ? 'grayscale-0' : 'grayscale'*/}
      {/*    } outline ${*/}
      {/*      props.node.getSelected() ? 'outline-3' : 'outline-0'*/}
      {/*    } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900/90 rounded-xl shadow-md shadow-black/50 overflow-hidden pointer-events-auto`}*/}
      {/*    // className={`test-node-core ${*/}
      {/*    //   props.node.getActivated() ? 'grayscale-0' : 'grayscale'*/}
      {/*    // } outline ${*/}
      {/*    //   props.node.getSelected() ? 'outline-3' : 'outline-0'*/}
      {/*    // } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900 rounded-xl overflow-hidden pointer-events-auto`}*/}
      {/*  >*/}
      {/*    <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">*/}
      {/*      /!* Header *!/*/}
      {/*      <div className="relative">*/}
      {/*        <div*/}
      {/*          onPointerDown={(event: React.PointerEvent<HTMLDivElement>) =>*/}
      {/*            dragControls.start(event)*/}
      {/*          }*/}
      {/*          className={`drag-handle-${props.node.getNodeId()} flex-none w-full h-6 px-2 flex justify-between items-center ${*/}
      {/*            props.node.getHeader().backgroundColor*/}
      {/*          } rounded-lg ${props.node.getDraggable() && 'cursor-move'}`}*/}
      {/*        >*/}
      {/*          <div className="flex justify-start items-center space-x-1.5 truncate">*/}
      {/*            /!* Icon *!/*/}
      {/*            <div className="flex justify-center items-center">*/}
      {/*              <FontAwesomeIcon*/}
      {/*                icon={props.node.getHeader().icon as IconProp}*/}
      {/*                className={`w-3.5 h-3.5 ${*/}
      {/*                  props.node.getHeader().iconColor*/}
      {/*                } svg-shadow`}*/}
      {/*              />*/}
      {/*            </div>*/}

      {/*            /!* Text *!/*/}
      {/*            <span*/}
      {/*              className={`text-xs font-bold ${*/}
      {/*                props.node.getHeader().titleColor*/}
      {/*              } text-shadow-2 truncate`}*/}
      {/*            >*/}
      {/*              {props.node.getHeader().title}*/}
      {/*            </span>*/}
      {/*          </div>*/}
      {/*        </div>*/}

      {/*        /!* 확장 버튼 *!/*/}
      {/*        <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">*/}
      {/*          /!* 노드 편집 버튼 *!/*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button flex justify-center items-center"*/}
      {/*          >*/}
      {/*            {!props.node.getModified() && (*/}
      {/*              <FontAwesomeIcon*/}
      {/*                icon={['fas', 'gear']}*/}
      {/*                className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*              />*/}
      {/*            )}*/}
      {/*          </div>*/}

      {/*          /!* 노드 활성화 여부 버튼 *!/*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('activate')}*/}
      {/*            className="button flex justify-center items-center"*/}
      {/*          >*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={['fas', props.node.getActivated() ? 'play' : 'pause']}*/}
      {/*              className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*            />*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}

      {/*      /!* Body *!/*/}
      {/*      <div className="flex-grow w-full h-full rounded-lg space-y-3">*/}
      {/*        /!* 노드 편집 결과 버튼 *!/*/}
      {/*        {props.node.getModified() && (*/}
      {/*          <div className="px-1 pt-1 pb-2 flex justify-end items-center border-b border-solid border-slate-700 space-x-1">*/}
      {/*            <div*/}
      {/*              onClick={() => handleButton_onClick('modified')}*/}
      {/*              className="button px-2 py-0.5 flex justify-center items-center bg-rose-400 rounded"*/}
      {/*            >*/}
      {/*              <span className="text-xs font-bold text-rose-800">*/}
      {/*                Cancel*/}
      {/*              </span>*/}
      {/*            </div>*/}

      {/*            <div*/}
      {/*              onClick={() => handleButton_onClick('modified')}*/}
      {/*              className="button px-2 py-0.5 flex justify-center items-center bg-gray-300 rounded"*/}
      {/*            >*/}
      {/*              <span className="text-xs font-bold text-gray-800">*/}
      {/*                Apply*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*          </div>*/}
      {/*        )}*/}

      {/*        /!* Ports *!/*/}
      {/*        <div className="pl-1 pr-0.5 py-2 w-full h-full flex justify-between items-start space-x-3">*/}
      {/*          /!* Input port *!/*/}
      {/*          <div className="h-full truncate space-y-2">*/}
      {/*            /!* Port *!/*/}
      {/*            {_.sortBy(props.node.getInputPorts(), 'sortOrder').map(*/}
      {/*              (portData: INodeInputPort) => (*/}
      {/*                <div*/}
      {/*                  key={portData.portId}*/}
      {/*                  data-port-type="input"*/}
      {/*                  data-port-id={portData.portId}*/}
      {/*                  className="flex justify-start items-center space-x-1 truncate"*/}
      {/*                >*/}
      {/*                  /!* Port icon *!/*/}
      {/*                  <div className="flex justify-center items-center">*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={*/}
      {/*                        (portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIcon*/}
      {/*                          : portData.connectedIcon) as IconProp*/}
      {/*                      }*/}
      {/*                      className={`w-3.5 h-3.5 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={['fas', 'chevron-right']}*/}
      {/*                      className={`w-2 h-2 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                  </div>*/}

      {/*                  /!* Port title *!/*/}
      {/*                  <div className="pl-1.5 space-y-0.5 truncate border-l border-solid border-slate-700">*/}
      {/*                    <div className="flex justify-start items-center truncate">*/}
      {/*                      <span*/}
      {/*                        className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                      >*/}
      {/*                        {portData.portTitle}*/}
      {/*                      </span>*/}
      {/*                    </div>*/}

      {/*                    {portData.inputForm && (*/}
      {/*                      <div className="input-form">*/}
      {/*                        {portData.inputForm}*/}
      {/*                      </div>*/}
      {/*                    )}*/}
      {/*                  </div>*/}
      {/*                </div>*/}
      {/*              ),*/}
      {/*            )}*/}
      {/*          </div>*/}

      {/*          /!* Output port *!/*/}
      {/*          <div className="h-full truncate space-y-2">*/}
      {/*            /!* Port *!/*/}
      {/*            {_.sortBy(props.node.getOutputPorts(), 'sortOrder').map(*/}
      {/*              (portData: INodeOutputPort) => (*/}
      {/*                <div*/}
      {/*                  key={portData.portId}*/}
      {/*                  data-port-type="output"*/}
      {/*                  data-port-id={portData.portId}*/}
      {/*                  className="flex justify-end items-center space-x-1 truncate"*/}
      {/*                >*/}
      {/*                  /!* Port title *!/*/}
      {/*                  <div className="pr-1.5 space-y-0.5 truncate border-r border-solid border-slate-700">*/}
      {/*                    <div className="flex justify-end items-center truncate">*/}
      {/*                      <span*/}
      {/*                        className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                      >*/}
      {/*                        {portData.portTitle}*/}
      {/*                      </span>*/}
      {/*                    </div>*/}

      {/*                    {portData.inputForm && (*/}
      {/*                      <div className="input-form">*/}
      {/*                        {portData.inputForm}*/}
      {/*                      </div>*/}
      {/*                    )}*/}
      {/*                  </div>*/}

      {/*                  /!* Port icon *!/*/}
      {/*                  <div className="flex justify-center items-center">*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={*/}
      {/*                        (portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIcon*/}
      {/*                          : portData.connectedIcon) as IconProp*/}
      {/*                      }*/}
      {/*                      className={`w-3.5 h-3.5 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                    <FontAwesomeIcon*/}
      {/*                      icon={['fas', 'chevron-right']}*/}
      {/*                      className={`w-2 h-2 ${*/}
      {/*                        portData.connectedNode.length === 0*/}
      {/*                          ? portData.unconnectedIconColor*/}
      {/*                          : portData.connectedIconColor*/}
      {/*                      }`}*/}
      {/*                    />*/}
      {/*                  </div>*/}
      {/*                </div>*/}
      {/*              ),*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </motion.div>*/}
      {/*)}*/}

      {/*<Rnd*/}
      {/*  id={props.node.getNodeId()}*/}
      {/*  size={{*/}
      {/*    width: props.node.getSize().width,*/}
      {/*    height: props.node.getSize().height,*/}
      {/*  }}*/}
      {/*  // minWidth={props.node.getMinSize().width}*/}
      {/*  // minHeight={props.node.getMinSize().height}*/}
      {/*  position={props.node.getPosition()}*/}
      {/*  dragHandleClassName={`drag-handle-${props.node.getNodeId()}`}*/}
      {/*  onDrag={handleRnd_onDrag}*/}
      {/*  onDragStart={handleRnd_onDragStart}*/}
      {/*  onDragStop={handleRnd_onDragStop}*/}
      {/*  onResizeStop={handleRnd_onResizeStop}*/}
      {/*  enableResizing={{*/}
      {/*    top: false,*/}
      {/*    topRight: false,*/}
      {/*    right: props.node.getSizeChangeable(),*/}
      {/*    bottomRight: props.node.getSizeChangeable(),*/}
      {/*    bottom: props.node.getSizeChangeable(),*/}
      {/*    bottomLeft: false,*/}
      {/*    left: false,*/}
      {/*    topLeft: false,*/}
      {/*  }}*/}
      {/*  disableDragging={!props.node.getDraggable()}*/}
      {/*  // dragGrid={[1, 1]}*/}
      {/*  scale={1}*/}
      {/*  // style={{*/}
      {/*  //   zIndex: props.node.getZIndex(),*/}
      {/*  // }}*/}
      {/*  className={`test-node-core ${*/}
      {/*    props.node.getActivated() ? 'grayscale-0' : 'grayscale'*/}
      {/*  } outline ${*/}
      {/*    props.node.getSelected() ? 'outline-3' : 'outline-0'*/}
      {/*  } outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900/80 rounded-xl shadow-md shadow-black/50 overflow-hidden pointer-events-auto`}*/}
      {/*>*/}
      {/*  <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">*/}
      {/*    /!* Header *!/*/}
      {/*    <div className="relative">*/}
      {/*      <div*/}
      {/*        className={`drag-handle-${props.node.getNodeId()} flex-none w-full h-6 px-2 flex justify-between items-center ${*/}
      {/*          props.node.getHeader().backgroundColor*/}
      {/*        } rounded-lg ${props.node.getDraggable() && 'cursor-move'}`}*/}
      {/*      >*/}
      {/*        <div className="flex justify-start items-center space-x-1.5 truncate">*/}
      {/*          /!* Icon *!/*/}
      {/*          <div className="flex justify-center items-center">*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={props.node.getHeader().icon as IconProp}*/}
      {/*              className={`w-3.5 h-3.5 ${*/}
      {/*                props.node.getHeader().iconColor*/}
      {/*              } svg-shadow`}*/}
      {/*            />*/}
      {/*          </div>*/}

      {/*          /!* Text *!/*/}
      {/*          <span*/}
      {/*            className={`text-xs font-bold ${*/}
      {/*              props.node.getHeader().titleColor*/}
      {/*            } text-shadow-2 truncate`}*/}
      {/*          >*/}
      {/*            {props.node.getHeader().title}*/}
      {/*          </span>*/}
      {/*        </div>*/}
      {/*      </div>*/}

      {/*      /!* 확장 버튼 *!/*/}
      {/*      <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">*/}
      {/*        /!* 노드 편집 버튼 *!/*/}
      {/*        <div*/}
      {/*          onClick={() => handleButton_onClick('modified')}*/}
      {/*          className="button flex justify-center items-center"*/}
      {/*        >*/}
      {/*          {!props.node.getModified() && (*/}
      {/*            <FontAwesomeIcon*/}
      {/*              icon={['fas', 'gear']}*/}
      {/*              className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*            />*/}
      {/*          )}*/}
      {/*        </div>*/}

      {/*        /!* 노드 활성화 여부 버튼 *!/*/}
      {/*        <div*/}
      {/*          onClick={() => handleButton_onClick('activate')}*/}
      {/*          className="button flex justify-center items-center"*/}
      {/*        >*/}
      {/*          <FontAwesomeIcon*/}
      {/*            icon={['fas', props.node.getActivated() ? 'play' : 'pause']}*/}
      {/*            className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
      {/*          />*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}

      {/*    /!* Body *!/*/}
      {/*    <div className="flex-grow w-full h-full rounded-lg space-y-3">*/}
      {/*      /!* 노드 편집 결과 버튼 *!/*/}
      {/*      {props.node.getModified() && (*/}
      {/*        <div className="px-1 pt-1 pb-2 flex justify-end items-center border-b border-solid border-slate-700 space-x-1">*/}
      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button px-2 py-0.5 flex justify-center items-center bg-rose-400 rounded"*/}
      {/*          >*/}
      {/*            <span className="text-xs font-bold text-rose-800">*/}
      {/*              Cancel*/}
      {/*            </span>*/}
      {/*          </div>*/}

      {/*          <div*/}
      {/*            onClick={() => handleButton_onClick('modified')}*/}
      {/*            className="button px-2 py-0.5 flex justify-center items-center bg-gray-300 rounded"*/}
      {/*          >*/}
      {/*            <span className="text-xs font-bold text-gray-800">Apply</span>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      )}*/}

      {/*      /!* Ports *!/*/}
      {/*      <div className="pl-1 pr-0.5 py-2 w-full h-full flex justify-between items-start space-x-3">*/}
      {/*        /!* Input port *!/*/}
      {/*        <div className="h-full truncate space-y-2">*/}
      {/*          /!* Port *!/*/}
      {/*          {_.sortBy(props.node.getInputPorts(), 'sortOrder').map(*/}
      {/*            (portData: INodeInputPort) => (*/}
      {/*              <div*/}
      {/*                key={portData.portId}*/}
      {/*                data-port-type="input"*/}
      {/*                data-port-id={portData.portId}*/}
      {/*                className="flex justify-start items-center space-x-1 truncate"*/}
      {/*              >*/}
      {/*                /!* Port icon *!/*/}
      {/*                <div className="flex justify-center items-center">*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={*/}
      {/*                      (portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIcon*/}
      {/*                        : portData.connectedIcon) as IconProp*/}
      {/*                    }*/}
      {/*                    className={`w-3.5 h-3.5 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={['fas', 'chevron-right']}*/}
      {/*                    className={`w-2 h-2 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                </div>*/}

      {/*                /!* Port title *!/*/}
      {/*                <div className="pl-1.5 space-y-0.5 truncate border-l border-solid border-slate-700">*/}
      {/*                  <div className="flex justify-start items-center truncate">*/}
      {/*                    <span*/}
      {/*                      className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                    >*/}
      {/*                      {portData.portTitle}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}

      {/*                  {portData.inputForm && (*/}
      {/*                    <div className="input-form">{portData.inputForm}</div>*/}
      {/*                  )}*/}
      {/*                </div>*/}
      {/*              </div>*/}
      {/*            ),*/}
      {/*          )}*/}
      {/*        </div>*/}

      {/*        /!* Output port *!/*/}
      {/*        <div className="h-full truncate space-y-2">*/}
      {/*          /!* Port *!/*/}
      {/*          {_.sortBy(props.node.getOutputPorts(), 'sortOrder').map(*/}
      {/*            (portData: INodeOutputPort) => (*/}
      {/*              <div*/}
      {/*                key={portData.portId}*/}
      {/*                data-port-type="output"*/}
      {/*                data-port-id={portData.portId}*/}
      {/*                className="flex justify-end items-center space-x-1 truncate"*/}
      {/*              >*/}
      {/*                /!* Port title *!/*/}
      {/*                <div className="pr-1.5 space-y-0.5 truncate border-r border-solid border-slate-700">*/}
      {/*                  <div className="flex justify-end items-center truncate">*/}
      {/*                    <span*/}
      {/*                      className={`text-xs font-semibold ${portData.portTitleColor} truncate`}*/}
      {/*                    >*/}
      {/*                      {portData.portTitle}*/}
      {/*                    </span>*/}
      {/*                  </div>*/}

      {/*                  {portData.inputForm && (*/}
      {/*                    <div className="input-form">{portData.inputForm}</div>*/}
      {/*                  )}*/}
      {/*                </div>*/}

      {/*                /!* Port icon *!/*/}
      {/*                <div className="flex justify-center items-center">*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={*/}
      {/*                      (portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIcon*/}
      {/*                        : portData.connectedIcon) as IconProp*/}
      {/*                    }*/}
      {/*                    className={`w-3.5 h-3.5 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                  <FontAwesomeIcon*/}
      {/*                    icon={['fas', 'chevron-right']}*/}
      {/*                    className={`w-2 h-2 ${*/}
      {/*                      portData.connectedNode.length === 0*/}
      {/*                        ? portData.unconnectedIconColor*/}
      {/*                        : portData.connectedIconColor*/}
      {/*                    }`}*/}
      {/*                  />*/}
      {/*                </div>*/}
      {/*              </div>*/}
      {/*            ),*/}
      {/*          )}*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</Rnd>*/}
    </>
  );
});

export default NodeCore;
