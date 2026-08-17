export interface RemoteJointState {
  name: string;
  position: number;
  velocity?: number;
  effort?: number;
}

const METHOD_PATH = '/baichuan.proto.api.al.robotics.arms.GeneralArmsControlService/GetLatestArmJointStates';

function encodeVarint(value: number) {
  const bytes: number[] = [];
  let remaining = value >>> 0;
  do {
    let byte = remaining & 0x7f;
    remaining >>>= 7;
    if (remaining) byte |= 0x80;
    bytes.push(byte);
  } while (remaining);
  return bytes;
}

function readVarint(bytes: Uint8Array, initialOffset: number) {
  let value = 0;
  let shift = 0;
  let offset = initialOffset;
  while (offset < bytes.length && shift < 35) {
    const byte = bytes[offset++];
    value += (byte & 0x7f) * (2 ** shift);
    if ((byte & 0x80) === 0) return { value, offset };
    shift += 7;
  }
  throw new Error('无效的 protobuf varint');
}

function skipField(bytes: Uint8Array, offset: number, wireType: number) {
  if (wireType === 0) return readVarint(bytes, offset).offset;
  if (wireType === 1) return offset + 8;
  if (wireType === 2) { const length = readVarint(bytes, offset); return length.offset + length.value; }
  if (wireType === 5) return offset + 4;
  throw new Error(`不支持的 protobuf wire type: ${wireType}`);
}

function decodeJointState(bytes: Uint8Array): RemoteJointState {
  const joint: RemoteJointState = { name: '', position: 0 };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.offset;
    const field = tag.value >>> 3;
    const wire = tag.value & 7;
    if (field === 1 && wire === 2) {
      const length = readVarint(bytes, offset);
      offset = length.offset;
      joint.name = new TextDecoder().decode(bytes.subarray(offset, offset + length.value));
      offset += length.value;
    } else if (field >= 2 && field <= 4 && wire === 5) {
      const value = view.getFloat32(offset, true);
      if (field === 2) joint.position = value;
      if (field === 3) joint.velocity = value;
      if (field === 4) joint.effort = value;
      offset += 4;
    } else offset = skipField(bytes, offset, wire);
  }
  return joint;
}

function decodeJointStates(bytes: Uint8Array) {
  const joints: RemoteJointState[] = [];
  let offset = 0;
  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.offset;
    const field = tag.value >>> 3;
    const wire = tag.value & 7;
    if (field === 1 && wire === 2) {
      const length = readVarint(bytes, offset);
      offset = length.offset;
      joints.push(decodeJointState(bytes.subarray(offset, offset + length.value)));
      offset += length.value;
    } else offset = skipField(bytes, offset, wire);
  }
  return joints;
}

function parseGrpcFrames(bytes: Uint8Array) {
  const joints: RemoteJointState[] = [];
  let offset = 0;
  while (offset < bytes.length) {
    if (offset + 5 > bytes.length) throw new Error('gRPC-Web 响应帧不完整');
    const flags = bytes[offset];
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset + 1, 4).getUint32(0, false);
    offset += 5;
    const payload = bytes.subarray(offset, offset + length);
    if ((flags & 0x80) === 0) joints.push(...decodeJointStates(payload));
    offset += length;
  }
  return joints;
}

export async function getLatestArmJointStates(baseUrl: string, armIndex: number, signal?: AbortSignal) {
  let normalized = baseUrl.trim().replace(/\/+$/, '');
  if (!normalized) throw new Error('请填写 gRPC-Web 网关地址');
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(normalized)) normalized = `http://${normalized}`;
  const url = normalized.endsWith(METHOD_PATH) ? normalized : normalized + METHOD_PATH;
  const payload = armIndex === 0 ? [] : [0x08, ...encodeVarint(armIndex)];
  const frame = new Uint8Array(5 + payload.length);
  new DataView(frame.buffer).setUint32(1, payload.length, false);
  frame.set(payload, 5);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/grpc-web+proto', 'x-grpc-web': '1', 'x-user-agent': 'grpc-web-javascript/0.1' },
    body: frame,
    signal,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
  let bytes = new Uint8Array(await response.arrayBuffer());
  if ((response.headers.get('content-type') || '').toLowerCase().includes('grpc-web-text')) {
    const binary = atob(new TextDecoder().decode(bytes).replace(/\s/g, ''));
    bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  }
  return parseGrpcFrames(bytes);
}
