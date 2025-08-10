import { atom, createStore } from "jotai";

const store = createStore();

const deviceAtom = atom({
  isConnected: false,
  isBusy: false,
  device: null as BluetoothDevice | null | string,
  macAddress: "",
});

const refreshProgramsAtom = atom(false);
const refreshLogsAtom = atom(false);

export { deviceAtom, store, refreshProgramsAtom, refreshLogsAtom };
