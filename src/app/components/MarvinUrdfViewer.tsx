import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelSelectionInfo {
  name: string;
  sourceName: string;
  type: string;
  meshes: number;
  vertices: number;
  materials: number;
  size: [number, number, number];
  worldPosition: [number, number, number];
}

interface JointDefinition {
  name: string;
  modelNodeName?: string;
  axis: { x: number; y: number; z: number };
  rotationReference?: 'absolute' | 'relative';
  rotationSpace?: 'local' | 'parent';
}

interface JointRuntime extends JointDefinition {
  node: THREE.Object3D;
  initialQuaternion: THREE.Quaternion;
}

interface HighlightedMesh {
  mesh: THREE.Mesh;
  originalMaterial: THREE.Material | THREE.Material[];
  highlightMaterial: THREE.Material | THREE.Material[];
}

interface MarvinUrdfViewerProps {
  ariaLabel: string;
  modelUrl: string;
  mappingUrl: string;
  selectedNode: string;
  jointValues: Record<string, number>;
  hiddenNodes: string[];
  showGrid: boolean;
  resetViewToken: number;
  viewPreset: 'iso' | 'x' | 'y' | 'z';
  viewPresetToken: number;
  onSelectNode: (name: string) => void;
  onSelectionInfo: (info: ModelSelectionInfo) => void;
  onLoadState: (state: 'loading' | 'ready' | 'error') => void;
}

function editorToGlbName(name: string) {
  if (name === 'Link_Base' || name === 'Link_Stand' || name === 'Base_L' || name === 'Base_R') return 'Marvin-Dual-Arm';
  const link = name.match(/^Link([1-7])_([LR])$/);
  if (link) return `joint${link[1]}_${link[2] === 'L' ? 'left' : 'right'}`;
  const joint = name.match(/^Joint([1-7])_([LR])$/);
  if (joint) return `joint${joint[1]}_${joint[2] === 'L' ? 'left' : 'right'}`;
  return name;
}

function glbToEditorName(name: string) {
  if (name === 'base') return 'Link_Base';
  const link = name.match(/^([lr])([1-7])$/);
  if (link) return `Link${link[2]}_${link[1] === 'l' ? 'L' : 'R'}`;
  const joint = name.match(/^joint([1-7])_(left|right)$/);
  if (joint) return `Joint${joint[1]}_${joint[2] === 'left' ? 'L' : 'R'}`;
  return name;
}

function extractAxisTwist(quaternion: THREE.Quaternion, axis: THREE.Vector3) {
  const projected = quaternion.x * axis.x + quaternion.y * axis.y + quaternion.z * axis.z;
  const twist = new THREE.Quaternion(axis.x * projected, axis.y * projected, axis.z * projected, quaternion.w);
  const lengthSq = twist.x * twist.x + twist.y * twist.y + twist.z * twist.z + twist.w * twist.w;
  return lengthSq < 1e-12 ? new THREE.Quaternion() : twist.normalize();
}

function applyJointValue(joint: JointRuntime, radians: number) {
  const axis = new THREE.Vector3(joint.axis.x || 0, joint.axis.y || 0, joint.axis.z || 0).normalize();
  if (!axis.lengthSq()) return;
  const jointQ = new THREE.Quaternion().setFromAxisAngle(axis, radians);
  if (joint.rotationReference !== 'relative') {
    const bindTwist = extractAxisTwist(joint.initialQuaternion, axis);
    if (joint.rotationSpace === 'parent') {
      const fixedSwing = bindTwist.clone().invert().multiply(joint.initialQuaternion);
      joint.node.quaternion.copy(jointQ).multiply(fixedSwing);
    } else {
      const fixedSwing = joint.initialQuaternion.clone().multiply(bindTwist.clone().invert());
      joint.node.quaternion.copy(fixedSwing).multiply(jointQ);
    }
  } else if (joint.rotationSpace === 'parent') {
    joint.node.quaternion.copy(jointQ).multiply(joint.initialQuaternion);
  } else {
    joint.node.quaternion.copy(joint.initialQuaternion).multiply(jointQ);
  }
}

export function MarvinUrdfViewer({ ariaLabel, modelUrl, mappingUrl, selectedNode, jointValues, hiddenNodes, showGrid, resetViewToken, viewPreset, viewPresetToken, onSelectNode, onSelectionInfo, onLoadState }: MarvinUrdfViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const nodesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const jointsRef = useRef<Map<string, JointRuntime>>(new Map());
  const highlightedMeshesRef = useRef<HighlightedMesh[]>([]);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const originMarkerRef = useRef<THREE.Group | null>(null);
  const fitViewRef = useRef<() => void>(() => {});
  const setViewPresetRef = useRef<(preset: 'iso' | 'x' | 'y' | 'z') => void>(() => {});
  const jointValuesRef = useRef(jointValues);
  const hiddenNodesRef = useRef(hiddenNodes);
  const selectedNodeRef = useRef(selectedNode);
  jointValuesRef.current = jointValues;
  hiddenNodesRef.current = hiddenNodes;
  selectedNodeRef.current = selectedNode;

  const updateSelection = (editorName: string) => {
    highlightedMeshesRef.current.forEach(({ mesh, originalMaterial, highlightMaterial }) => {
      mesh.material = originalMaterial;
      (Array.isArray(highlightMaterial) ? highlightMaterial : [highlightMaterial]).forEach(material => material.dispose());
    });
    highlightedMeshesRef.current = [];
    const sourceName = editorToGlbName(editorName);
    const selected = nodesRef.current.get(sourceName);
    transformControlsRef.current?.detach();
    if (originMarkerRef.current) {
      originMarkerRef.current.removeFromParent();
      originMarkerRef.current.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        }
      });
      originMarkerRef.current = null;
    }
    if (!selected) return;
    const shouldHighlightJoint = /^Joint[1-7]_[LR]$/.test(editorName);
    const selectedMeshes: THREE.Mesh[] = [];
    modelRef.current?.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      if (sourceName === 'Marvin-Dual-Arm' || object.userData.selectableName === sourceName) selectedMeshes.push(object);
    });
    let meshes = 0;
    let vertices = 0;
    const materials = new Set<THREE.Material>();
    const bounds = new THREE.Box3();
    selectedMeshes.forEach(object => {
      meshes += 1;
      vertices += object.geometry.attributes.position?.count ?? 0;
      const originals = Array.isArray(object.material) ? object.material : [object.material];
      originals.forEach(material => materials.add(material));
      if (shouldHighlightJoint) {
        const highlighted = originals.map(material => {
          const clone = material.clone();
          if ('color' in clone) (clone as THREE.MeshStandardMaterial).color.set(0x5582ff);
          if ('emissive' in clone) {
            (clone as THREE.MeshStandardMaterial).emissive.set(0x000000);
            (clone as THREE.MeshStandardMaterial).emissiveIntensity = 0;
          }
          return clone;
        });
        const highlightMaterial = Array.isArray(object.material) ? highlighted : highlighted[0];
        highlightedMeshesRef.current.push({ mesh: object, originalMaterial: object.material, highlightMaterial });
        object.material = highlightMaterial;
      }
      bounds.expandByObject(object);
    });
    const size = bounds.getSize(new THREE.Vector3());
    const worldPosition = selected.getWorldPosition(new THREE.Vector3());
    onSelectionInfo({
      name: editorName,
      sourceName,
      type: sourceName.startsWith('joint') ? 'Joint' : 'Link',
      meshes,
      vertices,
      materials: materials.size,
      size: [size.x, size.y, size.z],
      worldPosition: [worldPosition.x, worldPosition.y, worldPosition.z],
    });
    const originMarker = new THREE.Group();
    originMarker.name = 'selection-origin-helper';
    const axes = new THREE.AxesHelper(Math.max(size.length() * 0.12, 0.12));
    const origin = new THREE.Mesh(new THREE.SphereGeometry(Math.max(size.length() * 0.012, 0.012), 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
    origin.renderOrder = 1000;
    originMarker.add(axes, origin);
    selected.add(originMarker);
    originMarkerRef.current = originMarker;
    transformControlsRef.current?.attach(selected);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    onLoadState('loading');
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.up.set(0, 0, 1);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 30;
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('translate');
    transformControls.setSpace('local');
    transformControls.setSize(0.72);
    transformControls.addEventListener('dragging-changed', event => { controls.enabled = !event.value; });
    transformControlsRef.current = transformControls;
    scene.add(transformControls.getHelper());

    scene.add(new THREE.HemisphereLight(0xf4f6ff, 0x151a2a, 2.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(5, -5, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.normalBias = 0.06;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x8ea1ff, 2.1);
    rimLight.position.set(-5, 4, 4);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(12, 48, 0x56618a, 0x282e40);
    grid.rotation.x = Math.PI / 2;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    grid.visible = showGrid;
    gridRef.current = grid;
    scene.add(grid);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), new THREE.ShadowMaterial({ color: 0x080b12, opacity: 0.32 }));
    floor.receiveShadow = true;
    floor.position.z = -0.003;
    scene.add(floor);

    const setViewPreset = (preset: 'iso' | 'x' | 'y' | 'z') => {
      const model = modelRef.current;
      if (!model) return;
      const bounds = new THREE.Box3().setFromObject(model);
      const sphere = bounds.getBoundingSphere(new THREE.Sphere());
      const radius = Math.max(sphere.radius, 0.8);
      const directions = {
        iso: new THREE.Vector3(1.75, -2.35, 1.35),
        x: new THREE.Vector3(1, 0, 0),
        y: new THREE.Vector3(0, -1, 0),
        z: new THREE.Vector3(0, 0, 1),
      };
      const direction = directions[preset].normalize();
      controls.target.copy(sphere.center);
      camera.up.set(0, preset === 'z' ? 1 : 0, preset === 'z' ? 0 : 1);
      camera.position.copy(sphere.center).add(direction.multiplyScalar(radius * 3.2));
      camera.near = Math.max(radius / 100, 0.01);
      camera.far = radius * 50;
      camera.updateProjectionMatrix();
      controls.update();
    };
    setViewPresetRef.current = setViewPreset;
    const fitView = () => setViewPreset('iso');
    fitViewRef.current = fitView;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/gltf/`);
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    Promise.all([
      gltfLoader.loadAsync(modelUrl),
      fetch(mappingUrl).then(response => response.json()),
    ]).then(([gltf, mapping]) => {
      const model = gltf.scene;
      model.name = 'Marvin-Dual-Arm';
      model.rotation.x = Math.PI / 2;
      model.updateMatrixWorld(true);
      modelRef.current = model;
      nodesRef.current.set('Marvin-Dual-Arm', model);
      const selectable = /^joint[1-7]_(left|right)$/;
      model.traverse(object => {
        if (object.name && selectable.test(object.name)) nodesRef.current.set(object.name, object);
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          // The imported Marvin meshes contain many close, overlapping surfaces.
          // Let them cast onto the floor, but avoid self-shadow acne on the model.
          object.receiveShadow = false;
          let cursor: THREE.Object3D | null = object;
          while (cursor && !selectable.test(cursor.name)) cursor = cursor.parent;
          object.userData.selectableName = cursor?.name ?? '';
          const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
          sourceMaterials.forEach(material => {
            if ('roughness' in material) (material as THREE.MeshStandardMaterial).roughness = 0.46;
            if ('metalness' in material) (material as THREE.MeshStandardMaterial).metalness = Math.max((material as THREE.MeshStandardMaterial).metalness, 0.12);
          });
        }
      });
      const definitions = (mapping?.urdf?.joints ?? []) as JointDefinition[];
      definitions.forEach(definition => {
        const node = model.getObjectByName(definition.modelNodeName || definition.name);
        if (node) {
          const hasAxis = Boolean(definition.axis.x || definition.axis.y || definition.axis.z);
          jointsRef.current.set(definition.name, {
            ...definition,
            axis: hasAxis ? definition.axis : { x: 0, y: 0, z: 1 },
            node,
            initialQuaternion: node.quaternion.clone(),
          });
        }
      });
      scene.add(model);
      Object.entries(jointValuesRef.current).forEach(([name, value]) => {
        const runtime = jointsRef.current.get(editorToGlbName(name));
        if (runtime) applyJointValue(runtime, value);
      });
      hiddenNodesRef.current.forEach(name => { const object = nodesRef.current.get(editorToGlbName(name)); if (object) object.visible = false; });
      fitView();
      updateSelection(selectedNodeRef.current);
      onLoadState('ready');
    }).catch(() => onLoadState('error'));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectFromPointer = (event: PointerEvent) => {
      const model = modelRef.current;
      if (!model || Math.abs(event.movementX) > 3 || Math.abs(event.movementY) > 3) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(model, true).find(item => item.object.userData.selectableName);
      if (hit) onSelectNode(glbToEditorName(String(hit.object.userData.selectableName)));
    };
    renderer.domElement.addEventListener('click', selectFromPointer);

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    let animationFrame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('click', selectFromPointer);
      controls.dispose();
      transformControls.detach();
      transformControls.dispose();
      transformControls.getHelper().removeFromParent();
      transformControlsRef.current = null;
      if (originMarkerRef.current) {
        originMarkerRef.current.removeFromParent();
        originMarkerRef.current = null;
      }
      highlightedMeshesRef.current.forEach(({ mesh, originalMaterial, highlightMaterial }) => {
        mesh.material = originalMaterial;
        (Array.isArray(highlightMaterial) ? highlightMaterial : [highlightMaterial]).forEach(material => material.dispose());
      });
      highlightedMeshesRef.current = [];
      modelRef.current?.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        }
      });
      dracoLoader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
      nodesRef.current.clear();
      jointsRef.current.clear();
      sceneRef.current = null;
    };
  }, [mappingUrl, modelUrl, onLoadState, onSelectNode, onSelectionInfo]);

  useEffect(() => {
    Object.entries(jointValues).forEach(([name, value]) => {
      const runtime = jointsRef.current.get(editorToGlbName(name));
      if (runtime) applyJointValue(runtime, value);
    });
  }, [jointValues]);

  useEffect(() => {
    nodesRef.current.forEach(object => { object.visible = true; });
    hiddenNodes.forEach(name => { const object = nodesRef.current.get(editorToGlbName(name)); if (object) object.visible = false; });
  }, [hiddenNodes]);

  useEffect(() => { updateSelection(selectedNode); }, [selectedNode]);
  useEffect(() => { if (gridRef.current) gridRef.current.visible = showGrid; }, [showGrid]);
  useEffect(() => { if (resetViewToken) fitViewRef.current(); }, [resetViewToken]);
  useEffect(() => { if (viewPresetToken) setViewPresetRef.current(viewPreset); }, [viewPreset, viewPresetToken]);

  return <div ref={hostRef} className="urdf-three-viewer" aria-label={ariaLabel} />;
}
