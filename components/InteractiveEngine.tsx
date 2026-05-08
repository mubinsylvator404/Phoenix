import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

// Engine constants
const CRANK_RADIUS = 1;
const ROD_LENGTH = 3;

const EngineScene = ({ rpm, onPhaseChange, onTelemetryUpdate }: any) => {
  const crankRef = useRef<THREE.Group>(null);
  const rodRef = useRef<THREE.Group>(null);
  const pistonRef = useRef<THREE.Group>(null);
  const chamberRef = useRef<THREE.Mesh>(null);
  const sparkRef = useRef<THREE.PointLight>(null);
  const bulbRef = useRef<THREE.Mesh>(null);
  const bulbLightRef = useRef<THREE.PointLight>(null);
  const intakeValveRef = useRef<THREE.Group>(null);
  const exhaustValveRef = useRef<THREE.Group>(null);

  const angleRef = useRef(0);

  useFrame((state, delta) => {
    // Update angle based on RPM
    const speed = (rpm / 60) * Math.PI * 2;
    angleRef.current = (angleRef.current + speed * delta) % (Math.PI * 4); // 720 degrees for 4-stroke
    
    const theta = angleRef.current;
    
    // Calculate piston height
    const xCrank = Math.sin(theta) * CRANK_RADIUS;
    const yCrank = Math.cos(theta) * CRANK_RADIUS;
    
    // Piston is constrained to x=0
    const yPiston = yCrank + Math.sqrt(ROD_LENGTH * ROD_LENGTH - xCrank * xCrank);
    
    // Update positions
    if (crankRef.current) crankRef.current.rotation.z = -theta;
    
    if (pistonRef.current) pistonRef.current.position.y = yPiston;
    
    if (rodRef.current) {
      // Rod connects (xCrank, yCrank) to (0, yPiston)
      const rodAngle = Math.atan2(xCrank, yPiston - yCrank);
      rodRef.current.position.set(xCrank, yCrank, 0);
      rodRef.current.rotation.z = rodAngle;
    }

    // Determine Stroke & Colors
    let phase = "";
    let chamberColor = new THREE.Color();
    let sparkIntensity = 0;
    let intakeOpen = 0;
    let exhaustOpen = 0;

    if (theta < Math.PI) {
      phase = "Intake (গ্রহণ)";
      chamberColor.setHex(0x3b82f6); // Blue
      intakeOpen = Math.sin(theta) * 0.5; // Valve opens
    } else if (theta < Math.PI * 2) {
      phase = "Compression (সংকোচন)";
      chamberColor.setHex(0xeab308); // Yellow
    } else if (theta < Math.PI * 3) {
      phase = "Power (ক্ষমতা)";
      chamberColor.setHex(0xef4444); // Red
      if (theta < Math.PI * 2 + 0.5) sparkIntensity = 5; // Spark flash
    } else {
      phase = "Exhaust (নির্গমন)";
      chamberColor.setHex(0x64748b); // Gray
      exhaustOpen = Math.sin(theta - Math.PI) * 0.5; // Valve opens
    }

    if (chamberRef.current) {
       (chamberRef.current.material as THREE.MeshStandardMaterial).color.lerp(chamberColor, 0.1);
       (chamberRef.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + ((4 - yPiston)/4) * 0.4;
    }
    if (sparkRef.current) sparkRef.current.intensity = sparkIntensity;
    
    // Electricity Generation Light Logic
    const isPowerPhase = theta >= Math.PI * 2 && theta < Math.PI * 3;
    if (bulbRef.current) {
      const material = bulbRef.current.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(isPowerPhase ? 0xfacc15 : 0x000000);
      material.emissiveIntensity = isPowerPhase ? 2 : 0;
      material.color.setHex(isPowerPhase ? 0xfacc15 : 0xffffff);
    }
    if (bulbLightRef.current) {
      bulbLightRef.current.intensity = isPowerPhase ? 3 : 0;
    }
    
    if (intakeValveRef.current) intakeValveRef.current.position.y = 4.5 - intakeOpen;
    if (exhaustValveRef.current) exhaustValveRef.current.position.y = 4.5 - exhaustOpen;

    onPhaseChange(phase);
    onTelemetryUpdate({ angle: (theta * 180 / Math.PI).toFixed(0), height: yPiston.toFixed(2) });
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Crankcase (Housing for the crankshaft) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 2.4, 2]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 2.4, 2]} />
        <meshStandardMaterial color="#334155" wireframe opacity={0.1} transparent />
      </mesh>

      {/* Crankshaft Center */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Crank */}
      <group ref={crankRef}>
        <mesh position={[0, CRANK_RADIUS/2, 0]}>
          <boxGeometry args={[0.4, CRANK_RADIUS, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, CRANK_RADIUS, 0.2]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 32]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Connecting Rod */}
      <group ref={rodRef}>
        <mesh position={[0, ROD_LENGTH/2, 0]}>
          <boxGeometry args={[0.2, ROD_LENGTH, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Piston */}
      <group ref={pistonRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 1.2, 32]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Piston Pin */}
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.9, 32]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* Cylinder Block (Transparent) */}
      <mesh position={[0, 3.2, 0]} ref={chamberRef}>
        <cylinderGeometry args={[1, 1, 4, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Cylinder Head */}
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[2.5, 0.4, 2.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Spark Plug */}
      <mesh position={[0, 5.0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <pointLight ref={sparkRef} position={[0, 4.8, 0]} color="#ffffff" distance={5} intensity={0} />

      {/* Valves */}
      <group ref={intakeValveRef} position={[-0.5, 4.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      <group ref={exhaustValveRef} position={[0.5, 4.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* External Light Bulb (Electricity Generation Indicator) */}
      <group position={[2.5, 4, 0]}>
        {/* Wires connecting to the engine block */}
        <mesh position={[-0.75, -0.1, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[-0.75, 0.1, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Bulb Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bulb Glass */}
        <mesh position={[0, 0.5, 0]} ref={bulbRef}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} emissive="#000000" emissiveIntensity={0} />
        </mesh>
        <pointLight ref={bulbLightRef} position={[0, 0.5, 0]} color="#facc15" distance={5} intensity={0} />
      </group>

    </group>
  );
};

const InteractiveEngine = () => {
  const [rpm, setRpm] = useState(60);
  const [phase, setPhase] = useState("Intake");
  const [telemetry, setTelemetry] = useState({ angle: "0", height: "0" });

  // Generate static graph data for 720 degrees
  const graphData = useMemo(() => {
    const data = [];
    for (let a = 0; a <= 720; a += 10) {
      const theta = (a * Math.PI) / 180;
      const xCrank = Math.sin(theta) * CRANK_RADIUS;
      const yCrank = Math.cos(theta) * CRANK_RADIUS;
      const yPiston = yCrank + Math.sqrt(ROD_LENGTH * ROD_LENGTH - xCrank * xCrank);
      data.push({ angle: a, height: Number(yPiston.toFixed(2)) });
    }
    return data;
  }, []);

  const currentAngle = Number(telemetry.angle);

  let phaseColor = "text-blue-500";
  if (phase.includes("Compression")) phaseColor = "text-yellow-500";
  if (phase.includes("Power")) phaseColor = "text-red-500";
  if (phase.includes("Exhaust")) phaseColor = "text-slate-500";

  return (
    <div className="w-full bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl border border-white/10 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D View */}
        <div className="h-[300px] md:h-[450px] bg-slate-950/50 rounded-2xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-white/5">
          <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 10]} intensity={1.5} />
              <EngineScene rpm={rpm} onPhaseChange={setPhase} onTelemetryUpdate={setTelemetry} />
              <OrbitControls enableZoom={true} target={[0, 1, 0]} />
              <Environment preset="city" />
              <ContactShadows position={[0, -2.5, 0]} opacity={0.7} scale={10} blur={2} far={4} color="#000000" />
            </Suspense>
          </Canvas>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <div>
              <label className="text-white text-xs font-bold mb-1 block">Engine Speed (RPM): {rpm}</label>
              <input 
                type="range" min="10" max="300" step="10"
                value={rpm} onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col p-2">
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-white tracking-tight">4-Stroke Engine (৪-স্ট্রোক ইঞ্জিন)</h3>
          <p className="text-slate-300 text-xs md:text-sm mb-4 leading-relaxed">
            Observe the 4 phases of an internal combustion engine: Intake, Compression, Power, and Exhaust.
          </p>
          
          {/* Active State Indicator */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Phase</div>
              <div className={`text-lg md:text-xl font-bold ${phaseColor}`}>
                {phase}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Piston Height</div>
              <div className="text-lg md:text-xl font-bold text-white">
                {telemetry.height}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] md:min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 5, right: 20, left: -20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.2} />
                <XAxis 
                  dataKey="angle" 
                  type="number" 
                  domain={[0, 720]} 
                  ticks={[0, 180, 360, 540, 720]}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Crank Angle (°)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  domain={[1.5, 4.5]} 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Height', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value: number) => [value.toFixed(2), 'Height']}
                  labelFormatter={(label) => `Angle: ${label}°`}
                />
                <Line 
                  type="monotone" 
                  dataKey="height" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={false} 
                  isAnimationActive={false} 
                />
                <ReferenceDot 
                  x={currentAngle} 
                  y={Number(telemetry.height)} 
                  r={6} 
                  fill="#ef4444" 
                  stroke="#fff" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveEngine;
