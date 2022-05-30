// 환경설정을 정의함
import { IConfigure } from '../interfaces/rcf.interface';

export let configure: IConfigure = {
  flowchart: {},
  node: {
    header: {
      title: 'Node',
      titleColor: 'text-gray-300',
      icon: ['fas', 'splotch'],
      iconColor: 'text-gray-300',
      backgroundColor: 'bg-rose-500/60',
    },
    size: {
      minWidth: 100,
      minHeight: 34,
      width: 250,
      height: 150,
    },
  },
  wire: {
    controlLine: 300,
  },
};
