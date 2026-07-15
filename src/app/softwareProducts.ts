export interface SoftwareProduct {
  id: string;
  name: string;
  description: string;
  key: string;
}

export const INITIAL_SOFTWARE_PRODUCTS: SoftwareProduct[] = [
  { id: 'sw1', name: '墨影控制器驱动', description: '', key: 'SW-EVEX-Y2R3' },
  { id: 'sw2', name: '仙工控制器驱动', description: '', key: 'SW-KXMZ-A7B1' },
  { id: 'sw3', name: '节卡机械臂驱动', description: '', key: 'SW-PLQN-D9F6' },
];
