import _ from 'lodash';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  IConfigure,
  INodeInputPort,
  INodeOutputPort,
  IPosition,
  IRCFNodeHeader,
  ISize,
} from '../interfaces/rcf.interface';
import { configure } from '../configurations/rcf.config';
import { ReactNode } from 'react';

/**
 * React Control Flowchart Node Class
 */
export class RCFNode {
  protected configure: IConfigure;
  protected groupId: string;
  protected nodeId: string;
  protected categoryId: string;
  protected contentId: string;
  protected header: IRCFNodeHeader;
  protected inputPort: INodeInputPort[];
  protected outputPort: INodeOutputPort[];
  protected size: ISize;
  protected minSize: ISize;
  protected position: IPosition;
  protected activated: boolean;
  protected modified: boolean;
  protected selected: boolean;
  protected sizeChangeable: boolean;
  protected draggable: boolean;
  protected zIndex: number;

  constructor() {
    this.configure = configure;
    this.groupId = '';
    this.nodeId = '';
    this.categoryId = '';
    this.contentId = '';
    this.header = {
      icon: this.configure?.node.header.icon as IconProp,
      iconColor: this.configure?.node.header.iconColor,
      title: this.configure?.node.header.title,
      titleColor: this.configure?.node.header.titleColor,
      backgroundColor: this.configure?.node.header.backgroundColor,
    };
    this.inputPort = [];
    this.outputPort = [];
    this.size = {
      width: this.configure?.node.size.width || 0,
      height: this.configure?.node.size.height || 0,
    };
    this.minSize = {
      width: this.configure?.node.size.minWidth || 0,
      height: this.configure?.node.size.minHeight || 0,
    };
    this.position = { x: 0, y: 0 };
    this.activated = true;
    this.modified = false;
    this.selected = false;
    this.sizeChangeable = true;
    this.draggable = true;
    this.zIndex = 0;
  }

  // 그룹의 아이디를 반환함
  getGroupId = (): string => {
    return this.groupId;
  };

  // 그룹의 아이디를 변경함
  setGroupId = (value: string) => {
    this.groupId = value;
  };

  // 노드의 아이디를 반환함
  getNodeId = (): string => {
    return this.nodeId;
  };

  // 노드의 아이디를 변경함
  setNodeId = (value: string = '') => {
    if (!this.nodeId) {
      this.nodeId = value;
    }
  };

  // 노드의 헤더를 반환함
  getHeader = (): IRCFNodeHeader => {
    return this.header;
  };

  // 노드의 헤더 아이콘을 변경함
  setHeaderIcon = (value: IconProp) => {
    this.header.icon = value;
  };

  // 노드의 헤더 아이콘 색상을 변경함
  setHeaderIconColor = (value: string) => {
    this.header.iconColor = value;
  };

  // 노드의 헤더 제목을 변경함
  setHeaderTitle = (value: string | ReactNode) => {
    this.header.title = value;
  };

  // 노드의 헤더 제목 색상을 변경함
  setHeaderTitleColor = (value: string) => {
    this.header.titleColor = value;
  };

  // 노드의 헤더 배경 색상을 변경함
  setHeaderBackgroundColor = (value: string) => {
    this.header.backgroundColor = value;
  };

  // 입력 포트들을 반환함
  getInputPorts = (): INodeInputPort[] => {
    return this.inputPort;
  };

  // 지정한 입력 포트를 반환함
  getInputPort = (portId: string): INodeInputPort | null => {
    let port = this.inputPort.filter(
      (filterData: INodeInputPort) => filterData.portId === portId,
    );

    if (port.length > 0) {
      return port[0];
    } else {
      return null;
    }
  };

  // 입력 포트를 추가함
  addInputPort = (port: INodeInputPort) => {
    //
  };

  // 입력 포트들을 추가함
  addInputPorts = (ports: INodeInputPort[]) => {
    this.inputPort = _.concat(this.inputPort, ports);
  };

  // 입력 포트를 삭제함
  removeInputPort = () => {
    //
  };

  // 지정한 입력 포트의 중심 위치를 변경함
  setInputPortCenterPosition = (portId: string, x: number, y: number) => {
    let portWithoutThisPort = this.inputPort.filter(
      (filterData: INodeInputPort) => filterData.portId !== portId,
    );

    let port = this.inputPort.filter(
      (filterData: INodeInputPort) => filterData.portId === portId,
    );

    if (port.length > 0) {
      port[0].position = { x, y };

      // 포트의 새 위치를 적용함
      portWithoutThisPort.push(port[0]);
    }

    this.inputPort = portWithoutThisPort;
  };

  // 입력 포트의 순서를 변경함
  changeInputPortOrder = () => {
    //
  };

  // 출력 포트들을 반환함
  getOutputPorts = (): INodeOutputPort[] => {
    return this.outputPort;
  };

  // 지정한 출력 포트를 반환함
  getOutputPort = (portId: string): INodeOutputPort | null => {
    let port = this.outputPort.filter(
      (filterData: INodeOutputPort) => filterData.portId === portId,
    );

    if (port.length > 0) {
      return port[0];
    } else {
      return null;
    }
  };

  // 출력 포트를 추가함
  addOutputPort = (port: INodeOutputPort) => {
    //
  };

  // 출력 포트들을 추가함
  addOutputPorts = (ports: INodeOutputPort[]) => {
    this.outputPort = _.concat(this.outputPort, ports);
  };

  // 출력 포트를 삭제함
  removeOutputPort = () => {
    //
  };

  // 지정한 출력 포트의 중심 위치를 변경함
  setOutputPortCenterPosition = (portId: string, x: number, y: number) => {
    let portWithoutThisPort = this.outputPort.filter(
      (filterData: INodeOutputPort) => filterData.portId !== portId,
    );

    let port = this.outputPort.filter(
      (filterData: INodeOutputPort) => filterData.portId === portId,
    );

    if (port.length > 0) {
      port[0].position = { x, y };

      // 포트의 새 위치를 적용함
      portWithoutThisPort.push(port[0]);
    }

    this.outputPort = portWithoutThisPort;
  };

  // 출력 포트의 순서를 변경함
  changeOutputPortOrder = () => {
    //
  };

  // 노드의 크기를 반환함
  getSize = (): ISize => {
    return this.size;
  };

  // 노드의 크기를 변경함
  setSize = (width: number, height: number) => {
    this.size = { width, height };
  };

  // 노드의 최소 크기를 반환함
  getMinSize = (): ISize => {
    return this.size;
  };

  // 노드의 최소 크기를 변경함
  setMinSize = (width: number, height: number) => {
    this.size = { width, height };
  };

  // 노드의 위치를 반환함
  getPosition = (): IPosition => {
    return this.position;
  };

  // 노드의 위치를 변경함
  setPosition = (x: number, y: number) => {
    this.position = { x, y };
  };

  // 노드의 활성화 여부를 반환함
  getActivated = (): boolean => {
    return this.activated;
  };

  // 노드의 활성화 여부를 변경함
  setActivated = (value: boolean) => {
    this.activated = value;
  };

  // 노드의 편집 활성화 여부를 반환함
  getModified = (): boolean => {
    return this.modified;
  };

  // 노드의 편집 활성화 여부를 변경함
  setModified = (value: boolean) => {
    this.modified = value;
  };

  // 노드의 선택 여부를 반환함
  getSelected = (): boolean => {
    return this.selected;
  };

  // 노드의 선택 여부를 변경함
  setSelected = (value: boolean) => {
    this.selected = value;
  };

  // 노드의 크기 변경 가능 여부를 반환함
  getSizeChangeable = (): boolean => {
    return this.sizeChangeable;
  };

  // 노드의 크기 변경 가능 여부를 변경함
  setSizeChangeable = (value: boolean) => {
    this.sizeChangeable = value;
  };

  // 노드의 드래그 가능 여부를 반환함
  getDraggable = (): boolean => {
    return this.draggable;
  };

  // 노드의 드래그 가능 여부를 변경함
  setDraggable = (value: boolean) => {
    this.draggable = value;
  };

  // 노드의 zIndex를 반환함
  getZIndex = (): number => {
    return this.zIndex;
  };

  // 노드의 zIndex를 변경함
  setZIndex = (value: number = 0) => {
    this.zIndex = value;
  };
}
