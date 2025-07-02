import { atom, createStore } from "jotai";

const store = createStore();

const deviceAtom = atom({
  isConnected: false,
  isBusy: false,
  device: null as BluetoothDevice | null | string,
});

const refreshProgramsAtom = atom(false);

export { deviceAtom, store, refreshProgramsAtom };
