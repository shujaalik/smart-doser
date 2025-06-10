import { atom, createStore } from "jotai";

const store = createStore();

const deviceAtom = atom({
  isConnected: false,
  device: null as BluetoothDevice | null,
});

export { deviceAtom, store };
