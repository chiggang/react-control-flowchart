import { RCFNode } from '../RCFNode';
import {
  INodeInputPort,
  INodeOutputPort,
  ISize,
} from '../../interfaces/rcf.interface';
import { EStrokeAnimation } from '../../enums/rcf.enum';

export class RCFNSample extends RCFNode {
  // 노드의 크기를 정의함
  defineSize: ISize = {
    width: 400,
    height: 270,
  };

  // 입력 포트를 정의함
  defineInputPort: INodeInputPort[] = [
    {
      portId: 'test-data',
      portTitle: 'Test Data',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-lime-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-lime-400',
      inputForm: '',
      sortOrder: 1,
      connectedNode: [],
    },
    {
      portId: 'trigger',
      portTitle: 'Trigger',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-indigo-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-indigo-400',
      inputForm: (
        <div className="space-y-1">
          {/* Input form */}
          <div className="w-full h-6 flex justify-start items-center">
            <div className="h-full pl-2 pr-0.5 py-0.5 flex justify-center items-center bg-slate-700 space-x-2 rounded">
              <div className="flex justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Current
                </span>
              </div>

              <div className="h-full flex justify-end items-center">
                <input type="text" className="w-12" />
              </div>
            </div>
          </div>

          {/* Input form */}
          <div className="w-full h-6 flex justify-start items-center">
            <div className="h-full pl-2 pr-0.5 py-0.5 flex justify-center items-center bg-slate-700 space-x-2 rounded">
              <div className="flex justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Available
                </span>
              </div>

              <div className="h-full flex justify-end items-center">
                <input type="checkbox" className="mr-1" />
              </div>
            </div>
          </div>

          {/* Input form */}
          <div className="w-full h-6 flex justify-start items-center">
            <div className="h-full pl-2 pr-0.5 py-0.5 flex justify-center items-center bg-slate-700 space-x-2 rounded">
              <div className="flex justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Type
                </span>
              </div>

              <div className="h-full flex justify-end items-center">
                <select className="w-full">
                  <option value="a">Type.A</option>
                  <option value="b">Type.B</option>
                  <option value="c">Type.C</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ),
      sortOrder: 2,
      connectedNode: [],
    },
    {
      portId: 'delay-check',
      portTitle: 'Delay Check',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-pink-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-pink-400',
      inputForm: '',
      sortOrder: 3,
      connectedNode: [],
    },
    {
      portId: 'random-number',
      portTitle: 'Random Number',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-amber-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-amber-400',
      inputForm: '',
      sortOrder: 4,
      connectedNode: [],
    },
    {
      portId: 'enable-data',
      portTitle: 'Enable Data',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-indigo-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-indigo-400',
      inputForm: '',
      sortOrder: 5,
      connectedNode: [],
    },
  ];

  // 출력 포트를 정의함
  defineOutputPort: INodeOutputPort[] = [
    {
      portId: 'result',
      portTitle: 'Result',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-gray-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-gray-400',
      inputForm: (
        <div className="space-y-1">
          {/* Input form */}
          <div className="w-full h-6 flex justify-end items-center">
            <div className="h-full pl-2 pr-0.5 py-0.5 flex justify-center items-center bg-slate-700 space-x-2 rounded">
              <div className="flex justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Use Timer
                </span>
              </div>

              <div className="h-full flex justify-end items-center">
                <input type="checkbox" className="mr-1" />
              </div>
            </div>
          </div>

          {/* Input form */}
          <div className="w-full h-6 flex justify-end items-center">
            <div className="h-full pl-2 pr-0.5 py-0.5 flex justify-center items-center bg-slate-700 space-x-2 rounded">
              <div className="flex justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">
                  Timer interval(ms)
                </span>
              </div>

              <div className="h-full flex justify-end items-center">
                <input type="text" className="w-10" />
              </div>
            </div>
          </div>
        </div>
      ),
      sortOrder: 1,
      connectedNode: [
        {
          targetNodeId: 'rcf-node-b',
          targetInputPortId: 'enable-data',
          stroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
          backgroundStroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
        },
      ],
    },
    {
      portId: 'latest-data',
      portTitle: 'Latest Data',
      portTitleColor: 'text-gray-200',
      position: { x: 0, y: 0 },
      unconnectedIcon: ['far', 'circle'],
      unconnectedIconColor: 'text-amber-400',
      connectedIcon: ['fas', 'circle'],
      connectedIconColor: 'text-amber-400',
      inputForm: '',
      sortOrder: 2,
      connectedNode: [
        {
          targetNodeId: 'rcf-node-b',
          targetInputPortId: 'test-data',
          stroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
          backgroundStroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
        },
        {
          targetNodeId: 'rcf-node-b',
          targetInputPortId: 'delay-check',
          stroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
          backgroundStroke: {
            visible: true,
            width: 1,
            dash: '',
            color: '',
            opacity: 1,
            animation: EStrokeAnimation.NONE,
          },
        },
      ],
    },
  ];

  constructor() {
    super();

    this.addInputPorts(this.defineInputPort);
    this.addOutputPorts(this.defineOutputPort);
    this.setSize(this.defineSize.width, this.defineSize.height);
  }
}
