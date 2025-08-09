import { deviceAtom, store } from "@/components/others/jotai";
import mqtt, { type IClientOptions } from "mqtt";

const connectToBluetoothDevice = async () => {
  return navigator.bluetooth
    .requestDevice({
      acceptAllDevices: true,
      optionalServices: [0x0001, 0x0002, 0x0003],
    })
    .then(async (device) => {
      console.log("Connecting to Bluetooth device:", device);
      device.removeEventListener("gattserverdisconnected", () => {
        disconnectFromBluetoothDevice(device);
      });
      device.addEventListener("gattserverdisconnected", () => {
        disconnectFromBluetoothDevice(device);
      });
      store.set(deviceAtom, (prev) => ({
        ...prev,
        isConnected: true,
        device: device,
      }));
      return device;
    });
};

const verifyBluetoothDevice = async () => {
  const resp = await transaction({
    action: "SYNC",
  });
  if (resp === "ACK") return true;
  throw new Error("Device verification failed");
};

const disconnectFromBluetoothDevice = async (
  device?: BluetoothDevice | null | string,
) => {
  if (!device) device = store.get(deviceAtom).device;
  if (typeof device === "string") {
    console.warn("Device is a string, not a BluetoothDevice instance");
    return;
  }
  if (device?.gatt?.connected) {
    device.gatt.disconnect();
  }
  store.set(deviceAtom, (prev) => ({
    ...prev,
    isConnected: false,
    device: null,
  }));
};

const transaction = (message: {
  action: string;
  data?: object | string;
}): Promise<string> => {
  const { device } = store.get(deviceAtom);
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    if (!device) {
      reject(new Error("No device connected"));
      return;
    }
    if (typeof device === "string") {
      const options: IClientOptions = {
        clientId: "react_mqtt_" + Math.random().toString(16).substr(2, 8),
        protocol: "wss",
        port: 8884,
      };
      const client = mqtt.connect("wss://mqtt.industrialpmr.com/mqtt", options);
      client.on("connect", () => {
        console.log("MQTT Client Connected");
        client.subscribe(`doser_to_client/${device}`, (err) => {
          if (err) {
            reject(err);
            return;
          }
          client.publish(
            `client_to_doser/${device}`,
            JSON.stringify(message),
            {},
            (err) => {
              if (err) {
                reject(err);
                return;
              }
              client.on("message", (topic, msg) => {
                if (topic === `doser_to_client/${device}`) {
                  const response = msg.toString();
                  client.end();
                  resolve(response);
                }
              });
            },
          );
        });
      });
    } else {
      try {
        let timeout: NodeJS.Timeout;
        let data = "";
        const restartTimer = (end = false) => {
          clearTimeout(timeout);
          if (end) return;
          timeout = setTimeout(async () => {
            reject({ message: "Timeout" });
            readChar.removeEventListener(
              "characteristicvaluechanged",
              handleRead,
            );
          }, 8000);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleRead = (event: any) => {
          const value = event.target.value;
          const msg = new TextDecoder("UTF-8").decode(value);
          // if msg ends with & then it is not the last chunk
          if (msg.includes("WAIT")) {
            restartTimer();
          } else if (msg.endsWith("&")) {
            data += msg.slice(0, -1);
            restartTimer();
          } else {
            data += msg;
            restartTimer(true);
            setTimeout(() => resolve(data), 100);
          }
        };
        if (!device.gatt) {
          reject(new Error("Device not connected"));
          return;
        }
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(0x0001);
        const writeChar = await service.getCharacteristic(0x0003);
        const readChar = await service.getCharacteristic(0x0002);
        restartTimer();
        if (readChar.properties.notify) {
          await readChar.startNotifications();
          readChar.addEventListener("characteristicvaluechanged", handleRead);
        }
        if (message.data === undefined) message.data = "";
        const coded = new TextEncoder().encode(JSON.stringify(message));
        await writeChar.writeValueWithResponse(coded);
      } catch (error) {
        reject(error);
      }
    }
  });
};

// const transaction2 = (message: string | object): Promise<string> => {
//   const { device } = store.get(deviceAtom);
//   // eslint-disable-next-line no-async-promise-executor
//   return new Promise(async (resolve, reject) => {
//     if (!device) {
//       reject(new Error("No device connected"));
//       return;
//     }
//     if (typeof device === "string") {
//       const options: IClientOptions = {
//         clientId: "react_mqtt_" + Math.random().toString(16).substr(2, 8),
//         protocol: "wss",
//         port: 8884,
//       };
//       const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", options);
//       client.on("connect", () => {
//         console.log("MQTT Client Connected");
//         client.subscribe(`doser_to_client/${device}`, (err) => {
//           if (err) {
//             reject(err);
//             return;
//           }
//           if (typeof message === "object") {
//             message = JSON.stringify(message);
//           }
//           client.publish(`client_to_doser/${device}`, message, {}, (err) => {
//             if (err) {
//               reject(err);
//               return;
//             }
//             client.on("message", (topic, msg) => {
//               if (topic === `doser_to_client/${device}`) {
//                 const response = msg.toString();
//                 client.end();
//                 resolve(response);
//               }
//             });
//           });
//         });
//       });
//     } else {
//       try {
//         let timeout: NodeJS.Timeout;
//         let response: Array<string> | null | string = null;
//         const restartTimer = (end = false) => {
//           clearTimeout(timeout);
//           if (end) return;
//           timeout = setTimeout(async () => {
//             reject({ message: "Timeout" });
//             readChar.removeEventListener(
//               "characteristicvaluechanged",
//               handleRead,
//             );
//           }, 3000);
//         };
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const handleRead = (event: any) => {
//           if (event.target === null) return;
//           const value = event.target.value;
//           const decoded = new TextDecoder("UTF-8").decode(value);
//           if (decoded === "START") {
//             restartTimer();
//             response = [];
//           } else if (Array.isArray(response)) {
//             if (decoded === "END") {
//               restartTimer(true);
//               resolve(response.join(""));
//             } else {
//               restartTimer();
//               response.push(decoded);
//             }
//           } else {
//             restartTimer(true);
//             resolve(decoded);
//           }
//         };
//         if (!device.gatt) {
//           reject(new Error("Device not connected"));
//           return;
//         }
//         const server = await device.gatt.connect();
//         const service = await server.getPrimaryService(
//           "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
//         );
//         const writeChar = await service.getCharacteristic(
//           "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
//         );
//         const readChar = await service.getCharacteristic(
//           "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
//         );
//         restartTimer();
//         if (readChar.properties.notify) {
//           await readChar.startNotifications();
//           readChar.addEventListener("characteristicvaluechanged", handleRead);
//         }
//         if (typeof message === "object") {
//           message = JSON.stringify(message);
//         }
//         if (message.length > 10) {
//           const chunks = message.match(/.{1,10}/g);
//           if (!chunks) {
//             reject(new Error("Message is too short"));
//             return;
//           }
//           for await (let chunk of chunks) {
//             // if not last
//             if (chunk !== chunks[chunks.length - 1]) chunk += "&";
//             await writeChar.writeValueWithResponse(
//               new TextEncoder().encode(chunk),
//             );
//           }
//         } else {
//           const coded = new TextEncoder().encode(message);
//           await writeChar.writeValueWithResponse(coded);
//         }
//       } catch (error) {
//         reject(error);
//       }
//     }
//   });
// };

export {
  connectToBluetoothDevice,
  disconnectFromBluetoothDevice,
  transaction,
  verifyBluetoothDevice,
};
