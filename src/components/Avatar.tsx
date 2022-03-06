import * as React from 'react';
import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

type Vector3WithNormal = THREE.Vector3 & { normal?: THREE.Vector3 };
type Fur = { points: Vector3WithNormal[]; mesh: THREE.LineSegments };

// Heart by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/8RA5hHU5gHK)

const DEFAULT_COLOR = 'crimson';
const HAIR_LENGTH = 1.2;
const HEARTBEAT_LENGTH = 200;

type AnimationContext = {
  renderer: THREE.Renderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  fur: Fur;
  skin: THREE.Mesh;
};

// todo - better colour, sizing config
export const Avatar = ({ color = DEFAULT_COLOR }: { color?: string; size?: number }) => {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    const loader = new GLTFLoader();
    const observer = new ResizeObserver(onResize.bind(null, camera, renderer));

    observer.observe(document.documentElement);

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 200;

    elementRef.current.replaceChildren(renderer.domElement);

    new OrbitControls(camera, renderer.domElement);

    loader.load('/assets/models/heart.glb', (data) => {
      console.info('Heart model by Poly by Google [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/8RA5hHU5gHK)');

      const skin = data.scene.children[0] as THREE.Mesh;
      const fur = setupFur(skin, { color });

      skin.material = new THREE.MeshBasicMaterial({ color: 'black' });

      scene.add(skin);
      scene.add(fur.mesh);

      requestAnimationFrame(animate.bind(null, { renderer, scene, camera, fur, skin }));
    });

    return () => {
      observer.disconnect();
      renderer.domElement.remove();
    };
  }, [elementRef]);

  return <div ref={elementRef} />;
};

const setupFur = (skin: THREE.Mesh, options: { color?: string } = {}): Fur => {
  const fur: Vector3WithNormal[] = [];
  const vector = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const sampler = new MeshSurfaceSampler(skin).build();

  // n.b. these are all 1px thick; it is not easy to make them thicker
  const furGeometry = new THREE.BufferGeometry();
  const furMaterial = new THREE.LineBasicMaterial({ color: options.color ?? DEFAULT_COLOR });
  const furMesh = new THREE.LineSegments(furGeometry, furMaterial);

  for (let i=0; i < 50000; i++) {
    // sample new data
    sampler.sample(vector, normal);

    const end: THREE.Vector3 & { normal?: THREE.Vector3 } = normal.clone();
    end.normal = vector.clone();

    // draw a line for the vector along the normal
    fur.push(vector.clone());
    end.multiplyScalar(HAIR_LENGTH).add(vector);
    fur.push(end);
  }

  furGeometry.setFromPoints(fur);

  return { points: fur, mesh: furMesh };
};

const simplex = new SimplexNoise();
const updateFur = (fur: Fur, frame: number, time: number) => {
  for (let i=0; i < fur.points.length; i+=2) {
    const p1 = fur.points[i];
    const p2 = fur.points[i+1];
    const furMeshPositions = fur.mesh.geometry.attributes.position.array as Array<number>;

    const angle = simplex.noise4D(p1.x, p1.y, p1.z, time * 0.001);
    const vector = p2.clone();

    vector.cross(p2.normal);

    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const intensity = 0.25;
    const radius1 = vector.multiplyScalar(x * intensity);
    const radius2 = vector.multiplyScalar(y * intensity);

    for (const p of [p1, p2]) {
      p.x = p.x * beatFrameMultiplier(frame);
      p.y = p.y * beatFrameMultiplier(frame);
      p.z = p.z * beatFrameMultiplier(frame);
    }

    // edit base x, y, z values
    furMeshPositions[(i) * 3] = p1.x;
    furMeshPositions[(i) * 3 + 1] = p1.y;
    furMeshPositions[(i) * 3 + 2] = p1.z;

    // edit tip x, y, z values
    furMeshPositions[(i+1) * 3] = p2.x + radius1.x + radius2.x;
    furMeshPositions[(i+1) * 3 + 1] = p2.y + radius1.y + radius2.y;
    furMeshPositions[(i+1) * 3 + 2] = p2.z + radius1.z + radius2.z;
  }

  fur.mesh.geometry.attributes.position.needsUpdate = true;
};

const updateSkin = (skin: THREE.Mesh, frame: number) => {
  const skinPositions = skin.geometry.attributes.position.array as Array<number>;

  for (let i = 0; i < skin.geometry.attributes.position.array.length; i += 1) {
    skinPositions[i] = skinPositions[i] * beatFrameMultiplier(frame);
  }

  skin.geometry.attributes.position.needsUpdate = true;
};

const beatFrameMultiplier = (frame: number) => {
  // shape roughly adopted from this ecg - https://svgsilh.com/image/1375322.html
  // todo - less "linear"

  if (frame < 26) {
    return 1.001;
  } else if (frame < 51) {
    return 1 / 1.001;
  } else if (frame < 76) {
    // 1*1.001^25*(1/1.001)^25*1.003^25
    // = 1.0777631377
    return 1.003;
  } else if (frame < 101) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25
    // = 0.9753949557
    return 1 / 1.004;
  } else if (frame < 121) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20
    // = 1.0356169876
    return 1.003;
  } else if (frame < 126) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20*(1/1.007)^5
    // = 1.0001193108
    return 1 / 1.007;
  } else if (frame < 151) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20*(1/1.007)^5*1.002^25
    // = 1.0513440258
    return 1.002;
  } else if (frame < 176) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20*(1/1.007)^5*1.002^25*(1/1.003)^25
    // = 0.975487089
    return 1 / 1.003;
  } else if (frame < 188) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20*(1/1.007)^5*1.002^25*(1/1.003)^25*1.003^12
    // = 1.0111898972
    return 1.003;
  } else if (frame < 200) {
    // 1*1.001^25*(1/1.001)^25*1.003^25*(1/1.004)^25*1.003^20*(1/1.007)^5*1.002^25*(1/1.003)^25*1.003^12*(1/1.001)^13
    // = 1.0111898972
    return 1/1.001;
  }

  return 1;
};

const animate = (context: AnimationContext, frame = 0, time: number) => {
  if (!context.renderer?.domElement.isConnected) {
    return;
  }

  updateSkin(context.skin, frame);
  updateFur(context.fur, frame, time);
  context.renderer.render(context.scene, context.camera);

  // resets at HEARTBEAT_LENGTH;
  const nextFrame = frame < HEARTBEAT_LENGTH ? frame + 1 : 0;
  requestAnimationFrame(animate.bind(null, context, nextFrame));
};

const onResize = (camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
