import { deviceAtom, store } from "@/components/others/jotai";

const connectToBluetoothDevice = async () => {
  return navigator.bluetooth
    .requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
        "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
        "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
      ],
    })
    .then(async (device) => {
      device.addEventListener("gattserverdisconnected", () => {
        disconnectFromBluetoothDevice(device);
      });
      store.set(deviceAtom, {
        isConnected: true,
        device: device,
      });
      return device;
    });
};

const disconnectFromBluetoothDevice = async (device: BluetoothDevice) => {
  if (device.gatt?.connected) {
    device.gatt.disconnect();
  }
  store.set(deviceAtom, {
    isConnected: false,
    device: null,
  });
};

export { connectToBluetoothDevice, disconnectFromBluetoothDevice };
