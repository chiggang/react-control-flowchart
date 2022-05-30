import { ReactNode } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { EStrokeAnimation } from '../enums/rcf.enum';
import { RCFNode } from '../classes/RCFNode';

/**
 * Size
 * @Param width: Width size(px)
 * @Param height: Height size(px)
 */
export interface ISize {
  width: number;
  height: number;
}

/**
 * Position
 * @Param x: Horizontal position(px)
 * @Param y: Vertical position(px)
 */
export interface IPosition {
  x: number;
  y: number;
}

/**
 * App configure
 * @Param
 * @Param
 */
export interface IConfigure {
  flowchart: {};
  node: {
    header: {
      title: string | ReactNode;
      titleColor: string;
      icon: IconProp | string;
      iconColor: string;
      backgroundColor: string;
    };
    size: {
      minWidth: number;
      minHeight: number;
      width: number;
      height: number;
    };
  };
  wire: {
    controlLine: number;
  };
}

/**
 * Flowchart
 */
export interface IRCFlowchart {
  /**
   * 생성된 노드들을 불러옴
   */
  nodes: () => RCFNode[];

  /**
   * 노드를 추가함
   * @param node 추가할 노드
   */
  addNode: (node: RCFNode) => void;
}

/**
 * Node core
 */
export interface INodeCore {
  key: string;
  node: RCFNode;
  onDragStart: Function;
  onDrag: Function;
  onDragStop: Function;
  dragging?: boolean;
}

/**
 * Node wire core
 */
export interface IWireCore {
  flowchartWidth: number | undefined;
  flowchartHeight: number | undefined;
}

/**
 * Node
 * @Param
 * @Param
 */
export interface INode {
  groupId?: string;
  nodeId?: string;
  header?: IRCFNodeHeader;
  content?: INodeContent;
  size?: ISize;
  position?: IPosition;
  activated?: boolean;
  modified?: boolean;
  selected?: boolean;
  sizeChangeable?: boolean;
  draggable?: boolean;
  zIndex?: number;
}

/**
 * Node header
 * @Param
 * @Param
 */
export interface IRCFNodeHeader {
  icon?: IconProp;
  iconColor?: string;
  title?: string | ReactNode;
  titleColor?: string;
  backgroundColor?: string;
}

/**
 * Node content
 * @Param
 * @Param
 */
export interface INodeContent {
  categoryId?: string;
  contentId?: string;
  inputPort?: INodeInputPort[];
  outputPort?: INodeOutputPort[];
}

/**
 * Node content category core
 * @Param
 * @Param
 */
export interface INodeContentCategoryCore {
  categoryId?: string;
  categoryTitle?: string;
}

/**
 * Node content core
 * @Param
 * @Param
 */
export interface INodeContentCore {
  categoryId?: string;
  contentId?: string;
  contentTitle?: string;
  description?: string | ReactNode;
  guideDescription?: string | ReactNode;
  inputPort?: INodeInputPort[];
  outputPort?: INodeOutputPort[];
}

/**
 * Node input port
 * @Param
 * @Param
 */
export interface INodeInputPort {
  portId: string;
  portTitle: string;
  portTitleColor: string;
  position: IPosition;
  unconnectedIcon: IconProp | string;
  unconnectedIconColor: string;
  connectedIcon: IconProp | string;
  connectedIconColor: string;
  inputForm: ReactNode | string;
  sortOrder: number;
  connectedNode: {
    sourceNodeId: string;
    sourceOutputPortId: string;
  }[];
}

/**
 * Node output port
 * @Param
 * @Param
 */
export interface INodeOutputPort {
  portId: string;
  portTitle: string;
  portTitleColor: string;
  position: IPosition;
  unconnectedIcon: IconProp | string;
  unconnectedIconColor: string;
  connectedIcon: IconProp | string;
  connectedIconColor: string;
  inputForm: ReactNode | string;
  sortOrder: number;
  connectedNode: INodeOutputPortConnectedNode[];
}

/**
 * Node output port's connected node
 * @Param
 * @Param
 */
export interface INodeOutputPortConnectedNode {
  targetNodeId: string;
  targetInputPortId: string;
  stroke: {
    visible: boolean;
    width: number;
    dash: string;
    color: string;
    opacity: number;
    animation: EStrokeAnimation;
  };
  backgroundStroke: {
    visible: boolean;
    width: number;
    dash: string;
    color: string;
    opacity: number;
    animation: EStrokeAnimation;
  };
}
