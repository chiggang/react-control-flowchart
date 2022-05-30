import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragControls, motion, PanInfo, useDragControls } from 'framer-motion';
import { Bezier } from 'bezier-js';
import { useResizeDetector } from 'react-resize-detector';
import { DraggableData, Position, ResizableDelta, Rnd } from 'react-rnd';
import { DraggableEvent } from 'react-draggable';
import NodeCore from './cores/NodeCore';
import WireCore from './cores/WireCore';
import { RCFNode } from '../classes/RCFNode';
import {
  INode,
  INodeContent,
  INodeContentCategoryCore,
  INodeContentCore,
  INodeInputPort,
  INodeOutputPort,
  IPosition,
  IRCFlowchart,
  ISize,
} from '../interfaces/rcf.interface';
import useNodeSWR from '../swrs/node.swr';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';

import '../styles/rcf.css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import _ from 'lodash';

gsap.registerPlugin(Draggable);

// 노드의 내용 분류를 정의함
const defaultNodeContentCategory: INodeContentCategoryCore[] = [
  {
    categoryId: 'value',
    categoryTitle: 'Value',
  },
  {
    categoryId: 'math',
    categoryTitle: 'Mathematics',
  },
  {
    categoryId: 'divide',
    categoryTitle: 'Divide',
  },
];

// 노드의 내용을 정의함
const defaultNodeContent: INodeContentCore[] = [
  {
    categoryId: 'value',
    contentId: 'string',
    contentTitle: 'String',
    description: 'This is a string node.',
    guideDescription: 'First, this is a string node.',
    inputPort: [],
    outputPort: [],
  },
  {
    categoryId: 'math',
    contentId: 'sum',
    contentTitle: 'Sum',
    description: 'This is a sum node.',
    guideDescription: 'First, this is a sum node.',
    inputPort: [],
    outputPort: [],
  },
  {
    categoryId: 'divide',
    contentId: 'if',
    contentTitle: 'If',
    description: 'This is a if node.',
    guideDescription: 'First, this is a if node.',
    inputPort: [],
    outputPort: [],
  },
];

let movedCavasPosition: IPosition = { x: 0, y: 0 };

const ReactControlFlowchart = forwardRef<IRCFlowchart | undefined>(
  (props, ref) => {
    // 노드 SWR을 정의함
    const { nodeMutate, addNodeMutate, modifyAllNodeMutate } = useNodeSWR();

    // // 순서도를 정의함
    // const [flowchart, setFlowchart] = useState<RCFlowchart>();

    // 임시!!
    // 드래그 중?
    const [draggingNode, setDraggingNode] = useState<boolean>(false);

    const divRef = useRef<HTMLDivElement>(null);

    // 노드의 내용 분류를 정의함
    const [nodeContentCategory, setNodeContentCategory] = useState<
      INodeContentCategoryCore[]
    >([]);

    // 노드의 내용을 정의함
    const [nodeContent, setNodeContent] = useState<INodeContentCore[]>([]);

    // 순서도의 활성화 여부를 정의함
    // true: 노드를 활성화함
    // false: 노드를 비활성화함
    const [activateNode, setActivateNode] = useState<boolean>(true);

    // 임시!
    // 순서도 Ref를 정의함
    const svgRef = useRef<SVGSVGElement>(null);

    //
    const [moveObject, setMoveObject] = useState({
      source: {
        x: 100,
        y: 100,
      },
      target: {
        x: 400,
        y: 350,
      },
    });

    // 순서도의 출력 영역을 정의함
    const {
      width: flowchartWidth,
      height: flowchartHeight,
      ref: flowchartRef,
    } = useResizeDetector();

    //
    const [moveObjectNode, setMoveObjectNode] = useState<string>('');

    // 순서도에서 제공할 함수를 정의함
    useImperativeHandle(ref, () => ({
      nodes: (): RCFNode[] => {
        return nodeMutate;
      },
      addNode: (node: RCFNode) => {
        addNode(node);
      },
    }));

    // 노드를 추가함
    const addNode = (node: RCFNode) => {
      (async () => {
        await addNodeMutate(node);
      })();
    };

    // 노드의 드래그를 시작함
    const handleNode_onDragStart = () => {
      console.log('> node drag start:', nodeMutate.length);
    };

    // 노드의 드래그를 진행함
    const handleNode_onDrag = () => {
      console.log('> node dragging');
    };

    // 노드의 드래그를 멈춤
    const handleNode_onDragStop = () => {
      console.log('> node drag stop');
    };

    // 레이어를 드래그한 후 멈춤
    const handleRnd_onDragStop = (
      event: DraggableEvent,
      data: DraggableData,
    ) => {
      setMoveObject({
        ...moveObject,
        source: {
          x: Math.round(data.x),
          y: Math.round(data.y),
        },
      });
    };

    useEffect(() => {
      // // 노드의 내용 분류에 적용함
      // setNodeContentCategory(defaultNodeContentCategory);
      //
      // // 노드의 내용에 적용함
      // setNodeContent(defaultNodeContent);

      // Draggable.create('.react-control-flowchart', {
      //   // type: 'y',
      //   // inertia: true,
      // });

      // setTimeout(() => {
      //   let tl = gsap.timeline();
      //   tl.to('.react-control-flowchart', { duration: 1, translateX: 200 });
      // }, 10000);

      return () => {};
    }, []);

    useEffect(() => {
      divRef.current?.addEventListener('mousedown', handleMouseDown);

      return () => {
        divRef.current?.removeEventListener('mousedown', handleMouseDown);
      };
    }, [nodeMutate]);

    const handleMouseMove = (event: MouseEvent) => {
      // console.log('> mouse down + move:', event);

      let movedMouse: IPosition = {
        x: event.pageX - movedCavasPosition.x,
        y: event.pageY - movedCavasPosition.y,
      };

      // 노드의 캔버스를 움직임
      // 노드의 스타일을 불러옴
      let nodeStyle: CSSStyleDeclaration = window.getComputedStyle(
        flowchartRef.current!,
      );

      // 노드의 상세 스타일(transform)을 불러옴
      let nodeTransformStyle: DOMMatrix = new WebKitCSSMatrix(
        nodeStyle.transform,
      );

      let tmpPosition: IPosition = {
        x: nodeTransformStyle.m41 + movedMouse.x,
        y: nodeTransformStyle.m42 + movedMouse.y,
      };

      // flowchartRef.current!.style.transform = `translateX(${tmpPosition.x}px) translateY(${tmpPosition.y}px) translateZ(0px)`;

      if (movedMouse.x === 0 && movedMouse.y === 0) {
        return;
      }

      console.log('> move listener:', movedMouse.x, movedMouse.y);

      // 노드 영역 html을 직접 수정함
      let nodeDiv = document.querySelector('#draw-node') as HTMLDivElement;

      // // 노드의 캔버스를 움직임
      // // 노드의 스타일을 불러옴
      // let nodeStyle2: CSSStyleDeclaration = window.getComputedStyle(nodeDiv);
      //
      // // 노드의 상세 스타일(transform)을 불러옴
      // let nodeTransformStyle2: DOMMatrix = new WebKitCSSMatrix(
      //   nodeStyle2.transform,
      // );
      //
      // let tmpPosition2: IPosition = {
      //   x: nodeTransformStyle2.m41 + movedMouse.x,
      //   y: nodeTransformStyle2.m42 + movedMouse.y,
      // };

      // nodeDiv.style.transform = `translateX(${tmpPosition2.x}px) translateY(${tmpPosition2.y}px) translateZ(0px)`;

      nodeDiv.style.left = `${
        +nodeDiv.style.left.replace('px', '') + movedMouse.x
      }px`;
      nodeDiv.style.top = `${
        +nodeDiv.style.top.replace('px', '') + movedMouse.y
      }px`;

      ///////////////////////////////////////

      // 노드 html을 직접 수정함
      let sampleDiv = document.querySelectorAll(
        '[data-div-type="sample-div"]',
      ) as NodeListOf<HTMLDivElement>;

      sampleDiv.forEach((element: HTMLDivElement) => {
        // 노드의 캔버스를 움직임
        // 노드의 스타일을 불러옴
        let nodeStyle2: CSSStyleDeclaration = window.getComputedStyle(element);

        // 노드의 상세 스타일(transform)을 불러옴
        let nodeTransformStyle2: DOMMatrix = new WebKitCSSMatrix(
          nodeStyle2.transform,
        );

        let tmpPosition2: IPosition = {
          x: nodeTransformStyle2.m41 + movedMouse.x,
          y: nodeTransformStyle2.m42 + movedMouse.y,
        };

        // element.style.transform = `translateX(${tmpPosition2.x}px) translateY(${tmpPosition2.y}px) translateZ(0)`;
      });

      // 노드를 직접 움직임
      // nodeMutate.map((data: RCFNode) => {
      //   const nodeElement = document.querySelector(
      //     `#${data.getNodeId()}`,
      //   ) as HTMLDivElement;
      //
      //   // 노드 개체가 없으면 진행하지 않음
      //   if (nodeElement === undefined) {
      //     return null;
      //   }
      //
      //   // console.log('> nodeElement:', nodeElement);
      //
      //   // 노드의 스타일을 불러옴
      //   let nodeStyle: CSSStyleDeclaration =
      //     window.getComputedStyle(nodeElement);
      //
      //   // 노드의 상세 스타일(transform)을 불러옴
      //   let nodeTransformStyle: DOMMatrix = new WebKitCSSMatrix(
      //     nodeStyle.transform,
      //   );
      //
      //   let tmpPosition: IPosition = {
      //     x: nodeTransformStyle.m41 + movedMouse.x,
      //     y: nodeTransformStyle.m42 + movedMouse.y,
      //   };
      //
      //   nodeElement.style.transform = `translateX(${tmpPosition.x}px) translateY(${tmpPosition.y}px) translateZ(0px)`;
      // });

      // 노드의 mutation을 직접 수정함
      (async () => {
        // await modifyAllNodeMutate({ x: movedMouse.x, y: movedMouse.y });
      })();

      // 노드의 mutation을 직접 수정함
      // let cloneNode: RCFNode[] = _.cloneDeep(nodeMutate);
      // cloneNode.map((data: RCFNode) => {
      //   data.setPosition(
      //     data.getPosition().x + movedMouse.x,
      //     data.getPosition().y + movedMouse.y,
      //   );
      // });
      //
      // (async () => {
      //   await modifyAllNodeMutate(cloneNode);
      // })();

      // // 노드의 mutation을 직접 수정함
      // (async () => {
      //   await modifyAllNodeMutate({ x: movedMouse.x, y: movedMouse.y });
      // })();

      //
      movedCavasPosition = {
        x: event.pageX,
        y: event.pageY,
      };
    };
    const handleMouseUp = () => {
      console.log('> mouse down + up');

      // .
      //   .
      //   .
      //   . setDraggingNode를 이용해서 true가 되면(드래그 시)
      //   . 모든 노드를 테두리만 남기는 모습으로 변경
      //   .!!!!!!!!!!!!!!!!!!!!!!!!!11
      //   .!!!!!!!!!!!!!!!!!!!!1
      //   .

      // 임시!
      setDraggingNode(false);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (event: MouseEvent) => {
      console.log('> mouse down');

      // 임시!
      setDraggingNode(true);

      document.addEventListener('mousemove', handleMouseMove);

      document.addEventListener('mouseup', handleMouseUp);

      //
      movedCavasPosition = {
        x: event.pageX,
        y: event.pageY,
      };
    };

    //
    // const getSvgCurve = useCallback(() => {
    //   // let sourcePoint = { x: 200, y: 100 };
    //   // let targetPoint = { x: 400, y: 300 };
    //
    //   let sourcePoint = {
    //     x: moveObject?.source?.x + 70,
    //     y: moveObject?.source?.y + 35,
    //   };
    //   let targetPoint = { x: 400, y: 300 };
    //
    //   let sourceControlPoint = { x: sourcePoint.x + 100, y: 100 };
    //   let targetControlPoint = { x: targetPoint.x - 100, y: 300 };
    //
    //   let tmpNode: string = `M${sourcePoint.x} ${sourcePoint.y} C${sourceControlPoint.x} ${sourceControlPoint.y}, ${targetControlPoint.x} ${targetControlPoint.y}, ${targetPoint.x} ${targetPoint.y}`;
    //
    //   setMoveObjectNode(tmpNode);
    // }, []);

    const getSvgCurve = (event: DraggableEvent, data: DraggableData) => {
      // let sourcePoint = { x: 200, y: 100 };
      // let targetPoint = { x: 400, y: 300 };

      let sourcePoint = {
        x: moveObject?.source?.x + 70,
        y: moveObject?.source?.y + 35,
      };
      let targetPoint = {
        x: moveObject?.target?.x,
        y: moveObject?.target?.y + 35,
      };

      let sourceControlPoint = {
        x: sourcePoint.x + 100,
        y: sourcePoint.y,
      };
      let targetControlPoint = { x: targetPoint.x - 100, y: targetPoint.y };

      let tmpNode: string = `M${sourcePoint.x} ${sourcePoint.y} C${sourceControlPoint.x} ${sourceControlPoint.y}, ${targetControlPoint.x} ${targetControlPoint.y}, ${targetPoint.x} ${targetPoint.y}`;

      setMoveObjectNode(tmpNode);

      setMoveObject({
        ...moveObject,
        source: {
          x: Math.round(data.x),
          y: Math.round(data.y),
        },
      });
    };

    const getSvgCurve2 = (event: DraggableEvent, data: DraggableData) => {
      // let sourcePoint = { x: 200, y: 100 };
      // let targetPoint = { x: 400, y: 300 };

      let sourcePoint = {
        x: moveObject?.source?.x + 70,
        y: moveObject?.source?.y + 35,
      };
      let targetPoint = {
        x: moveObject?.target?.x,
        y: moveObject?.target?.y + 35,
      };

      let sourceControlPoint = {
        x: sourcePoint.x + 100,
        y: sourcePoint.y,
      };
      let targetControlPoint = { x: targetPoint.x - 100, y: targetPoint.y };

      let tmpNode: string = `M${sourcePoint.x} ${sourcePoint.y} C${sourceControlPoint.x} ${sourceControlPoint.y}, ${targetControlPoint.x} ${targetControlPoint.y}, ${targetPoint.x} ${targetPoint.y}`;

      setMoveObjectNode(tmpNode);

      setMoveObject({
        ...moveObject,
        target: {
          x: Math.round(data.x),
          y: Math.round(data.y),
        },
      });
    };

    const getSvgCurve3 = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (
        moveObject.target.x === Math.round(info.point.x) &&
        moveObject.target.y === Math.round(info.point.y)
      ) {
        return;
      }

      console.log('> event:', info);
      // console.log('> event');

      // let sourcePoint = { x: 200, y: 100 };
      // let targetPoint = { x: 400, y: 300 };

      let sourcePoint = {
        x: moveObject?.source?.x + 70,
        y: moveObject?.source?.y + 35,
      };
      let targetPoint = {
        x: moveObject?.target?.x,
        y: moveObject?.target?.y + 35,
      };

      let sourceControlPoint = {
        x: sourcePoint.x + 100,
        y: sourcePoint.y,
      };
      let targetControlPoint = { x: targetPoint.x - 100, y: targetPoint.y };

      let tmpNode: string = `M${sourcePoint.x} ${sourcePoint.y} C${sourceControlPoint.x} ${sourceControlPoint.y}, ${targetControlPoint.x} ${targetControlPoint.y}, ${targetPoint.x} ${targetPoint.y}`;

      setMoveObjectNode(tmpNode);

      setMoveObject({
        ...moveObject,
        target: {
          x: Math.round(info.point.x),
          y: Math.round(info.point.y),
        },
      });
    };

    const handleButton_onClick = () => {
      let sourcePoint = {
        x: moveObject?.source?.x + 70,
        y: moveObject?.source?.y + 35,
      };
      let targetPoint = {
        x: moveObject?.target?.x,
        y: moveObject?.target?.y + 35,
      };

      let sourceControlPoint = {
        x: sourcePoint.x + 100,
        y: sourcePoint.y,
      };
      let targetControlPoint = { x: targetPoint.x - 100, y: targetPoint.y };

      const tmpBezier = new Bezier(
        sourcePoint.x,
        sourcePoint.y,
        sourceControlPoint.x,
        sourceControlPoint.y,
        targetControlPoint.x,
        targetControlPoint.y,
        targetPoint.x,
        targetPoint.y,
      );

      let tmpLut = tmpBezier.getLUT(100);

      const tmpMoveObject = document.querySelector(
        '#move-object',
      ) as HTMLDivElement;

      let count: number = 0;

      setInterval(() => {
        if (count >= tmpLut.length) {
          count = 0;
        }

        let data = tmpLut[count];

        // console.log('>', data);

        if (tmpMoveObject) {
          tmpMoveObject.style.left = `${data.x}px`;
          tmpMoveObject.style.top = `${data.y}px`;
        }

        count += 1;
      }, 20);
    };

    return (
      // <motion.div
      //   // id={props.node.getNodeId()}
      //   drag
      //   dragMomentum={false}
      //   // dragControls={dragControls}
      //   // dragListener={false}
      //   // onDragStart={handleNode_onDragStart}
      //   // onDrag={handleNode_onDrag}
      //   // onDragTransitionEnd={handleNode_onDragTransitionEnd}
      //   animate={{
      //     // width: props.node.getSize().width,
      //     // height: props.node.getSize().height,
      //     position: 'fixed',
      //     x: 0,
      //     y: 0,
      //   }}
      //   className="react-control-flowchart relative w-full h-full bg-gray-700 scale-100 pointer-events-none"
      // >
      <div
        ref={flowchartRef}
        // className="react-control-flowchart relative w-full h-full bg-gray-700 scale-100 overflow-hidden pointer-events-none"
        className="react-control-flowchart relative w-full h-full bg-gray-700 scale-100 pointer-events-none"
      >
        {/* 바탕 드래그? */}
        <div
          // onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
          //   console.log('> onMouseDown:', event); /* pageX, pageY*/
          // }}
          // onMouseMove={() => {
          //   console.log('> onMouseMove:');
          // }}
          // draggable={true}
          // onDragStart={(event: React.DragEvent<HTMLDivElement>) => {
          //   console.log('123:', event);
          // }}
          // onDrag={() => console.log(123)}
          ref={divRef}
          className="absolute left-0 top-0 w-full h-full border pointer-events-auto z-10"
        />

        {/* Sample */}
        {/*<div className="absolute left-0 top-0 w-full h-full z-60 pointer-events-none">*/}
        {/*  {_.range(0, 100).map((index: number) => (*/}
        {/*    <div*/}
        {/*      key={index}*/}
        {/*      data-div-type="sample-div"*/}
        {/*      // id={props.node.getNodeId()}*/}
        {/*      // data-title={props.node.getHeader().title}*/}
        {/*      style={{*/}
        {/*        width: `500px`,*/}
        {/*        height: `300px`,*/}
        {/*        // left: `${props.node.getPosition().x}px`,*/}
        {/*        // top: `${props.node.getPosition().y}px`,*/}
        {/*        left: `${100 + index}px`,*/}
        {/*        top: `${100 + index}px`,*/}
        {/*        // transform: `translate(${props.node.getPosition().x}px, ${*/}
        {/*        //   props.node.getPosition().y*/}
        {/*        // }px)`,*/}
        {/*        // transform: `translate(${props.node.getPosition().x}px, ${*/}
        {/*        //   props.node.getPosition().y*/}
        {/*        // }px)`,*/}
        {/*        transform: 'translateZ(0)',*/}
        {/*      }}*/}
        {/*      draggable={true}*/}
        {/*      // onDragStart={tmpDragStart}*/}
        {/*      // onDrag={tmpDrag}*/}
        {/*      className={`test-node-core absolute grayscale-0 outline outline-0 outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900 overflow-hidden pointer-events-auto`}*/}
        {/*    >*/}
        {/*      <div className="flex flex-col w-full h-full p-1 space-y-1 select-none">*/}
        {/*        /!* Header *!/*/}
        {/*        <div className="relative">*/}
        {/*          <div*/}
        {/*            className={`drag-handle-${index} flex-none w-full h-6 px-2 flex justify-between items-center bg-indigo-500 rounded-lg cursor-move`}*/}
        {/*          >*/}
        {/*            <div className="flex justify-start items-center space-x-1.5 truncate">*/}
        {/*              /!* Icon *!/*/}
        {/*              <div className="flex justify-center items-center">*/}
        {/*                <FontAwesomeIcon*/}
        {/*                  icon={['fas', 'star']}*/}
        {/*                  className={`w-3.5 h-3.5 text-white svg-shadow`}*/}
        {/*                />*/}
        {/*              </div>*/}

        {/*              /!* Text *!/*/}
        {/*              <span*/}
        {/*                className={`text-xs font-bold text-white text-shadow-2 truncate`}*/}
        {/*              >*/}
        {/*                Auto Node*/}
        {/*              </span>*/}
        {/*            </div>*/}
        {/*          </div>*/}

        {/*          /!* 확장 버튼 *!/*/}
        {/*          <div className="absolute right-0 top-0 h-6 px-1.5 flex justify-center items-center space-x-2 z-20">*/}
        {/*            /!* 노드 편집 버튼 *!/*/}
        {/*            <div className="button flex justify-center items-center">*/}
        {/*              <FontAwesomeIcon*/}
        {/*                icon={['fas', 'gear']}*/}
        {/*                className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
        {/*              />*/}
        {/*            </div>*/}

        {/*            /!* 노드 활성화 여부 버튼 *!/*/}
        {/*            <div className="button flex justify-center items-center">*/}
        {/*              <FontAwesomeIcon*/}
        {/*                icon={['fas', 'play']}*/}
        {/*                className="w-3.5 h-3.5 text-gray-300 svg-shadow"*/}
        {/*              />*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}

        {/*        /!* Body *!/*/}
        {/*        <div className="flex-grow w-full h-full rounded-lg space-y-3">*/}
        {/*          Body*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  ))}*/}
        {/*</div>*/}

        {/* Node */}
        <div
          id="draw-node"
          // className="absolute left-0 top-0 w-full h-full z-50 pointer-events-none"
          style={{ transform: 'translateZ(0)' }}
          className="absolute left-0 top-0 z-50 pointer-events-none"
        >
          {nodeMutate?.map((data: RCFNode) => (
            <NodeCore
              key={data.getNodeId()}
              node={data}
              onDragStart={handleNode_onDragStart}
              onDrag={handleNode_onDrag}
              onDragStop={handleNode_onDragStop}
              dragging={draggingNode}
            />
          ))}
        </div>

        {/*{_.range(1, 500).map((number: number) => (*/}
        {/*  <div className="absolute left-96 top-80 w-96 h-64 outline-offset-2 outline-amber-500 border border-solid border-black bg-slate-900/80 rounded-xl overflow-hidden pointer-events-auto" />*/}
        {/*))}*/}

        {/*그림을 그리는 부분은 이 파일에 있어야 함???*/}
        {/*어떤 노드의 드래그가 시작됐을 때, swr을 통해서 전체 노드를 불러옴*/}
        {/*해당 노드의 드래그가 진행 중일 때, 부모창의 콜백으로 자식 노드의*/}
        {/*좌표를 계속 받음*/}
        {/*js 수준에서 선을 계속 그림*/}
        {/*속도 향상 가능??*/}
        {/*선을 그리는 것도 html 태그를 직접 조정해서???*/}

        {/* Node wire */}
        {/*<div className="absolute left-0 top-0 w-full h-full z-20 pointer-events-none">*/}
        {/*  <WireCore flowchartWidth={flowchartWidth} flowchartHeight={flowchartHeight} />*/}
        {/*</div>*/}

        <div
          id="move-object"
          onClick={handleButton_onClick}
          className="button absolute left-5 top-5 w-10 h-10 flex justify-center items-center border border-solid border-gray-500 bg-indigo-800 cursor-pointer select-none z-40"
        >
          <span className="text-gray-300">흐름</span>
        </div>

        <Rnd
          id="move-object-source"
          size={{
            width: 70,
            height: 70,
          }}
          position={{
            x: moveObject?.source?.x || 0,
            y: moveObject?.source?.y || 0,
          }}
          // dragHandleClassName="drag-handle"
          // onDragStart={(event: DraggableEvent, data: DraggableData)=> setMoveObject({...moveObject, source})}
          onDrag={getSvgCurve}
          // onDragStop={handleRnd_onDragStop}
          className="border border-solid border-gray-500 bg-gray-600 z-40"
        >
          <div className="w-full h-full flex justify-center items-center">
            <span className="text-sm text-gray-300">시작점</span>
          </div>
        </Rnd>

        {/*<Rnd*/}
        {/*  id="move-object-target"*/}
        {/*  size={{*/}
        {/*    width: 70,*/}
        {/*    height: 70,*/}
        {/*  }}*/}
        {/*  position={{*/}
        {/*    x: moveObject?.target?.x || 0,*/}
        {/*    y: moveObject?.target?.y || 0,*/}
        {/*  }}*/}
        {/*  // dragHandleClassName="drag-handle"*/}
        {/*  // onDragStart={(event: DraggableEvent, data: DraggableData)=> setMoveObject({...moveObject, source})}*/}
        {/*  onDrag={getSvgCurve2}*/}
        {/*  // onDragStop={handleRnd_onDragStop2}*/}
        {/*  className="border border-solid border-gray-500 bg-gray-600 z-20"*/}
        {/*>*/}
        {/*  <div className="w-full h-full flex justify-center items-center">*/}
        {/*    <span className="text-sm text-gray-300">끝점</span>*/}
        {/*  </div>*/}
        {/*</Rnd>*/}

        {/* 끝점 */}
        <motion.div
          id="move-object-target"
          drag
          dragMomentum={false}
          animate={{
            width: 70,
            height: 70,
            x: moveObject?.target?.x || 0,
            y: moveObject?.target?.y || 0,
            position: 'fixed',
            // transitionEnd: {
            //   display: 'none',
            // },
          }}
          onDrag={getSvgCurve3}
          className="border border-solid border-gray-500 bg-gray-600 z-40"
        >
          <div className="w-full h-full flex justify-center items-center">
            <span className="text-sm text-gray-300">끝점</span>
          </div>
        </motion.div>

        <svg
          ref={svgRef}
          width={flowchartWidth}
          height={flowchartHeight}
          className="absolute z-30"
        >
          <g>
            {/*<path*/}
            {/*  stroke={'rgb(59, 122, 217)'}*/}
            {/*  strokeWidth="2"*/}
            {/*  fill="none"*/}
            {/*  d="M146.71875 133.5 C196.71875 133.5, 359.5 73.5, 409.5 73.5"*/}
            {/*/>*/}

            <path
              stroke={'rgb(59, 122, 217)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              // strokeDasharray="4 4"
              // strokeOpacity={0.5}
              fill="none"
              d={moveObjectNode}
              className="test"
            />
            <path
              stroke={'rgba(59, 122, 217, 0.2)'}
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
              d={moveObjectNode}
            />
          </g>
        </svg>
      </div>
      // </motion.div>
    );
  },
);

export default ReactControlFlowchart;

//
// -----
// HTML CANVAS로 화면 캡처 후 이동??
//   div의 전체 크기를 미리 지정해야 함
// or 현재 보이는 화면 크기까지만 캡처해서 사용함
// -----
//
