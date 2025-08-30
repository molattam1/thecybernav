"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";

/* -------- Public API -------- */

export function useHasWebGL() {
    const [ok, setOk] = React.useState(true);
    React.useEffect(() => {
        try {
            const c = document.createElement("canvas");
            const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
            setOk(!!gl);
        } catch {
            setOk(false);
        }
    }, []);
    return ok;
}

export function FullBleedModelStage(props: {
    progress: number;        // 0..1 from your UI scroll spring
    invalidateKey: number;   // bump to force a demand-frame render
    reducedMotion: boolean;  // respect prefers-reduced-motion
}) {
    const { progress, invalidateKey, reducedMotion } = props;

    return (
        <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
            camera={{ position: [0.15, 0.25, 1.8], fov: 32 }}
            frameloop="demand"
            onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0); // transparent — blends with gradients
            }}
        >
            <InvalidateOnChange value={invalidateKey} />
            <ambientLight intensity={0.35} />
            <directionalLight intensity={1.2} position={[2.5, 3, 2]} />
            <Environment preset="warehouse" />
            <RigFree progress={progress} reducedMotion={reducedMotion} />
            <ProductFree progress={progress} reducedMotion={reducedMotion} />
        </Canvas>
    );
}

/* -------- Internals (kept private to the module) -------- */

// Custom hook that ensures loaders are configured before loading
function useConfiguredGLTF(url: string) {
    const { gl } = useThree();
    const [loader, setLoader] = React.useState<GLTFLoader | null>(null);
    
    useEffect(() => {
        const gltfLoader = new GLTFLoader();
        
        // DRACO loader for compressed geometry
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        gltfLoader.setDRACOLoader(dracoLoader);
        
        // KTX2 loader for compressed textures
        const ktx2Loader = new KTX2Loader();
        ktx2Loader.setTranscoderPath('/basis/');
        ktx2Loader.detectSupport(gl);
        gltfLoader.setKTX2Loader(ktx2Loader);
        
        setLoader(gltfLoader);
    }, [gl]);
    
    // Use the configured loader directly instead of useGLTF
    const [gltf, setGltf] = React.useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [loading, setLoading] = React.useState(true);
    
    useEffect(() => {
        if (!loader) return;
        
        setLoading(true);
        loader.load(
            url,
            (result) => {
                setGltf(result);
                setLoading(false);
            },
            undefined,
            (error) => {
                console.error('GLTF loading error:', error);
                setLoading(false);
            }
        );
    }, [loader, url]);
    
    return { ...gltf, loading };
}

// Note: Preloading removed to avoid loader configuration issues

function InvalidateOnChange({ value }: { value: number }) {
    const { invalidate } = useThree();
    const last = React.useRef<number>(value);
    useFrame(() => {
        if (last.current !== value) {
            last.current = value;
            invalidate();
        }
    });
    return null;
}

function RigFree({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
    const { camera } = useThree();
    const target = new THREE.Vector3(0, 0, 0);

    useFrame((_, dt) => {
        if (reducedMotion) return;
        const t = THREE.MathUtils.clamp(progress, 0, 1);

        // Subtle camera arc
        const px = THREE.MathUtils.lerp(0.22, -0.12, t);
        const py = THREE.MathUtils.lerp(0.18, 0.10, t);
        const pz = THREE.MathUtils.lerp(1.9, 1.6, t);

        camera.position.lerp(new THREE.Vector3(px, py, pz), 1 - Math.pow(0.001, dt));
        camera.lookAt(target);
    });

    return null;
}

function ProductFree({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
    const group = useRef<THREE.Group>(null);
    const glb = useConfiguredGLTF("/product.glb");
    
    // KNOBS
    const START_Y_DEG = 300;
    const START_X_DEG = 8;
    const SPIN_TURNS = 5;
    const BASE_POS = new THREE.Vector3(1.5, -0.04, 0);
    const END_X = -0.08;
    const END_Y = 0.06;
    const baseScale = 0.05;

    const ease = (x: number) => THREE.MathUtils.smoothstep(x, 0, 1);

    useFrame((_, dt) => {
        if (reducedMotion || !group.current || glb.loading || !glb.scene) return;
        const t = ease(THREE.MathUtils.clamp(progress, 0, 1));

        // Position path (slight right -> centered-ish)
        const pathX = THREE.MathUtils.lerp(BASE_POS.x, END_X, t);
        const pathY = THREE.MathUtils.lerp(BASE_POS.y, END_Y, t);

        // Rotation: start ~45° yaw then spin over scroll
        const startYaw = THREE.MathUtils.degToRad(START_Y_DEG);
        const startPitch = THREE.MathUtils.degToRad(START_X_DEG);
        const spin = t * (Math.PI * 2) * SPIN_TURNS;

        // Tiny “rock”
        const rock = Math.sin(t * Math.PI * 2) * 0.05;

        const targetRot = new THREE.Euler(startPitch + rock, startYaw + spin, 0);
        const targetPos = new THREE.Vector3(pathX, pathY, 0);

        const k = 1 - Math.pow(0.0005, dt); // critically-damped-ish
        group.current.rotation.x += (targetRot.x - group.current.rotation.x) * k;
        group.current.rotation.y += (targetRot.y - group.current.rotation.y) * k;
        group.current.position.lerp(targetPos, k);
    });

    // Don't render if still loading - moved after all hooks
    if (glb.loading || !glb.scene) {
        return null;
    }

    return (
        <group ref={group} position={BASE_POS.toArray()} scale={baseScale}>
            <primitive object={glb.scene} dispose={null} />
        </group>
    );
}
