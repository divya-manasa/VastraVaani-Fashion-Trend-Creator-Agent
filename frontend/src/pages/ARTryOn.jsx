// src/pages/ARTryOnAI.jsx
// VastraVaani — AI-Powered 3D Try-On (keeps Three.js, auto-measure, AI analysis)

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const loadThreeJS = () =>
  new Promise((resolve, reject) => {
    if (window.THREE) return resolve(window.THREE);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error("THREE not available")));
    s.onerror = () => reject(new Error("Failed to load Three.js"));
    document.head.appendChild(s);
  });

export default function ARTryOnAI() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const bodyGroupRef = useRef(null);
  const animationRef = useRef(null);

  const [threeLoaded, setThreeLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");

  const [userIdentity, setUserIdentity] = useState({
    avatar_image_base64: null,
    name: "User",
  });

  const [measurements, setMeasurements] = useState({
    height: 170,
    weight: 65,
    shoulder_width: 42,
    chest: 98,
    waist: 75,
    hip: 100,
    arm_length: 65,
    inseam: 80,
  });

  const [analysisData, setAnalysisData] = useState(null);

  const [garment, setGarment] = useState({
    category: "dress",
    color: "#E91E63",
  });

  const [tryOnResult, setTryOnResult] = useState(null);

  // ----------------------
  // Three.js Initialization
  // ----------------------
  useEffect(() => {
    let mounted = true;

    const initThree = async () => {
      try {
        const THREE = await loadThreeJS();
        if (!mounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const width = canvas.clientWidth || 800;
        const height = canvas.clientHeight || 600;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f1720); // dark subtle
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 1.5, 3.5);
        camera.lookAt(0, 1, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        rendererRef.current = renderer;

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 1.05);
        dir.position.set(5, 12, 8);
        dir.castShadow = true;
        scene.add(dir);

        const point = new THREE.PointLight(0xffffff, 0.6);
        point.position.set(-5, 5, 5);
        scene.add(point);

        // Body group
        const bodyGroup = new THREE.Group();
        scene.add(bodyGroup);
        bodyGroupRef.current = bodyGroup;

        // initial body
        generateDetailedBody(THREE, bodyGroup, measurements, garment, userIdentity);

        // animate
        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);
          if (bodyGroupRef.current) bodyGroupRef.current.rotation.y += 0.004;
          renderer.render(scene, camera);
        };
        animate();

        // handle resize
        const onResize = () => {
          if (!canvasRef.current) return;
          const w = canvasRef.current.clientWidth;
          const h = canvasRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        setThreeLoaded(true);

        // cleanup
        return () => {
          mounted = false;
          cancelAnimationFrame(animationRef.current);
          window.removeEventListener("resize", onResize);
          try {
            renderer.dispose();
          } catch (e) {}
        };
      } catch (err) {
        console.error("Three init error:", err);
        setError(`Three.js init failed: ${err.message}`);
      }
    };

    initThree();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------
  // Build / update 3D body
  // ----------------------
  const generateDetailedBody = (THREE, bodyGroup, meas, garmentLocal, identity) => {
    // clear
    while (bodyGroup.children.length) bodyGroup.remove(bodyGroup.children[0]);

    const skinColor = new THREE.Color("#E5BCA8");
    // HEAD
    const headRadius = Math.max(0.08, meas.chest / 820 / 1.0);
    const headGeom = new THREE.SphereGeometry(headRadius, 32, 32);
    const headMat = new THREE.MeshPhongMaterial({ color: skinColor, shininess: 15 });

    if (identity?.avatar_image_base64) {
      const loader = new THREE.TextureLoader();
      loader.load(identity.avatar_image_base64, (tex) => {
        headMat.map = tex;
        headMat.needsUpdate = true;
      });
    }

    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = meas.height / 220;
    head.castShadow = true;
    bodyGroup.add(head);

    // SIMPLE TORSO (cylinders)
    const torsoGeom = new THREE.CylinderGeometry(meas.chest / 310, meas.waist / 280, meas.height / 3.2, 24);
    const torsoMat = new THREE.MeshPhongMaterial({ color: skinColor, shininess: 22 });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = meas.height / 550;
    torso.castShadow = true;
    bodyGroup.add(torso);

    // SHOULDERS
    const shoulderGeom = new THREE.SphereGeometry(meas.shoulder_width / 200, 12, 12);
    const leftShoulder = new THREE.Mesh(shoulderGeom, torsoMat);
    leftShoulder.position.set(-(meas.shoulder_width / 160), meas.height / 250, 0);
    leftShoulder.castShadow = true;
    bodyGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = meas.shoulder_width / 160;
    bodyGroup.add(rightShoulder);

    // ARMS (simplified)
    const armGeom = new THREE.CylinderGeometry(meas.chest / 1100, meas.chest / 1200, meas.arm_length / 2.2, 12);
    const leftArm = new THREE.Mesh(armGeom, torsoMat);
    leftArm.position.set(-(meas.chest / 180), meas.height / 300, 0);
    leftArm.rotation.z = Math.PI / 5;
    leftArm.castShadow = true;
    bodyGroup.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = meas.chest / 180;
    rightArm.rotation.z = -Math.PI / 5;
    bodyGroup.add(rightArm);

    // HIPS & LEGS (simplified)
    const hipGeom = new THREE.SphereGeometry(meas.hip / 220, 12, 12);
    const leftHip = new THREE.Mesh(hipGeom, torsoMat);
    leftHip.position.set(-(meas.hip / 180), meas.height / 450, 0);
    leftHip.castShadow = true;
    bodyGroup.add(leftHip);

    const rightHip = leftHip.clone();
    rightHip.position.x = meas.hip / 180;
    bodyGroup.add(rightHip);

    const thighGeom = new THREE.CylinderGeometry(meas.hip / 300, meas.hip / 320, meas.inseam / 1.8, 12);
    const leftThigh = new THREE.Mesh(thighGeom, torsoMat);
    leftThigh.position.set(-(meas.hip / 280), meas.inseam / 2.2, 0);
    leftThigh.castShadow = true;
    bodyGroup.add(leftThigh);

    const rightThigh = leftThigh.clone();
    rightThigh.position.x = meas.hip / 280;
    bodyGroup.add(rightThigh);

    // FEET / simple boxes
    const footGeom = new THREE.BoxGeometry(meas.hip / 500, meas.hip / 800, meas.hip / 400);
    const footMat = new THREE.MeshPhongMaterial({ color: new THREE.Color("#D4A574"), shininess: 12 });
    const leftFoot = new THREE.Mesh(footGeom, footMat);
    leftFoot.position.set(-(meas.hip / 280), -(meas.inseam / 1.3), 0);
    leftFoot.castShadow = true;
    bodyGroup.add(leftFoot);

    const rightFoot = leftFoot.clone();
    rightFoot.position.x = meas.hip / 280;
    bodyGroup.add(rightFoot);

    // GARMENT (cylinder drape)
    const garmentHeight = garmentLocal.category === "dress" ? meas.height / 2.1 : meas.height / 4;
    const garmentGeom = new THREE.CylinderGeometry((meas.chest / 300) * 1.15, (meas.waist / 280) * 1.15, garmentHeight, 32);
    const garmentMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(garmentLocal.color),
      shininess: 45,
      transparent: true,
      opacity: 0.93,
      side: THREE.DoubleSide,
    });
    const garmentMesh = new THREE.Mesh(garmentGeom, garmentMat);
    garmentMesh.position.y = meas.height / 550;
    garmentMesh.castShadow = true;
    bodyGroup.add(garmentMesh);
  };

  // ----------------------
  // Image analysis flow (uploads, AI calls, update 3D model)
  // ----------------------
  const analyzeAndGenerateModel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setProcessingStatus("🔍 Analyzing image...");
    setError(null);

    try {
      // show preview immediately
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setUserIdentity((s) => ({ ...s, avatar_image_base64: ev.target.result }));
        // send to backend
        const form = new FormData();
        form.append("file", file);

        setProcessingStatus("🤖 Running AI body analysis...");
        const res = await axios.post(`${API_URL}/analyze-image`, form, { headers: { "Content-Type": "multipart/form-data" } });

        const analysis = res.data;
        setAnalysisData(analysis);

        const updated = {
          height: analysis.height_estimate || measurements.height,
          weight: analysis.weight_estimate || measurements.weight,
          shoulder_width: analysis.shoulder_width || measurements.shoulder_width,
          chest: analysis.chest || measurements.chest,
          waist: analysis.waist || measurements.waist,
          hip: analysis.hip || measurements.hip,
          arm_length: analysis.arm_length || measurements.arm_length,
          inseam: analysis.inseam || measurements.inseam,
        };

        setMeasurements(updated);
        setProcessingStatus("✅ Analysis complete — updating 3D model...");

        if (threeLoaded && bodyGroupRef.current) {
          const THREE = await loadThreeJS();
          generateDetailedBody(THREE, bodyGroupRef.current, updated, garment, { ...userIdentity, avatar_image_base64: ev.target.result });
        }

        setTimeout(() => setProcessingStatus(""), 1400);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError(`❌ Analysis failed: ${err.message || err}`);
      setProcessingStatus("");
    } finally {
      setAnalyzing(false);
    }
  };

  // ----------------------
  // Generate try-on product on backend
  // ----------------------
  const generateTryOn = async () => {
    if (!userIdentity.avatar_image_base64) {
      setError("Please upload a photo to analyze first.");
      return;
    }

    setLoading(true);
    setProcessingStatus("🎬 Generating try-on...");
    setError(null);

    try {
      const payload = {
        user_avatar: {
          avatar_type: "uploaded",
          measurements,
          skin_tone: analysisData?.skin_tone || "#E5BCA8",
          body_shape: analysisData?.body_shape || "unknown",
        },
        garment_model: { model_type: "2d_image", model_format: "png" },
        fabric_properties: {
          fabric_type: "silk",
          texture: "smooth",
          drape: "flowing",
          elasticity: 0.4,
        },
        preferences: {
          garment_category: garment.category,
          color: garment.color,
          pose: "frontal",
          lighting: "studio",
        },
      };

      const res = await axios.post(`${API_URL}/ar-tryon/generate-tryon`, payload);
      setTryOnResult(res.data);
      setProcessingStatus("✅ Try-on generation complete.");
      setTimeout(() => setProcessingStatus(""), 1200);
    } catch (err) {
      console.error(err);
      setError(`❌ Try-on failed: ${err.message || err}`);
      setProcessingStatus("");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Download GLB (if provided)
  // ----------------------
  const downloadGLB = () => {
    if (!tryOnResult?.downloadable_glb) {
      setError("No downloadable model available.");
      return;
    }
    const link = document.createElement("a");
    link.href = `data:application/octet-stream;base64,${tryOnResult.downloadable_glb}`;
    link.download = `${userIdentity.name || "vastravaani_model"}.glb`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // ----------------------
  // UI Render (VastraVaani theme)
  // ----------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            🤖 VastraVaani — AI 3D Try-On
          </h1>
          <p className="text-gray-300">Upload a photo → AI auto-measures → Real-time 3D preview</p>
        </div>

        {/* status & errors */}
        {processingStatus && (
          <div className="bg-purple-800/30 border border-purple-600/30 rounded-xl p-3 mb-4 flex items-center gap-3 text-sm">
            <div className="animate-spin">⏳</div>
            <div>{processingStatus}</div>
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 border border-red-500 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - controls */}
          <div className="space-y-4">
            {/* Upload card */}
            <div className="bg-slate-800/60 border border-purple-600/30 rounded-2xl p-5 shadow-lg">
              <h3 className="font-semibold text-lg mb-3">📸 Upload Photo</h3>
              <p className="text-xs text-gray-400 mb-3">Front-facing photo recommended for accurate measurements.</p>

              <input
                type="file"
                accept="image/*"
                onChange={analyzeAndGenerateModel}
                disabled={analyzing}
                className="w-full text-sm mb-3"
              />

              {userIdentity.avatar_image_base64 && (
                <div className="mb-3">
                  <img src={userIdentity.avatar_image_base64} alt="avatar" className="w-full rounded-lg object-cover h-36 border border-purple-600/20" />
                </div>
              )}

              <div className="bg-slate-700/40 rounded-md p-3 text-xs">
                <p className="font-semibold">Detected</p>
                {analysisData ? (
                  <div className="mt-2 space-y-1 text-xs text-gray-300">
                    <div>Height: {analysisData.height_estimate?.toFixed(0) ?? measurements.height} cm</div>
                    <div>Chest: {analysisData.chest?.toFixed(0) ?? measurements.chest} cm</div>
                    <div>Waist: {analysisData.waist?.toFixed(0) ?? measurements.waist} cm</div>
                    <div>Shape: {analysisData.body_shape ?? "—"}</div>
                    <div>Confidence: {analysisData.confidence_score ?? "—"}%</div>
                  </div>
                ) : (
                  <div className="text-gray-400">No analysis yet</div>
                )}
              </div>

              <input
                type="text"
                value={userIdentity.name}
                onChange={(e) => setUserIdentity({ ...userIdentity, name: e.target.value })}
                placeholder="Your name"
                className="w-full mt-3 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
              />
            </div>

            {/* Garment card */}
            <div className="bg-slate-800/60 border border-pink-600/20 rounded-2xl p-4 shadow-lg">
              <h3 className="font-semibold text-lg mb-3">👗 Garment</h3>
              <select
                value={garment.category}
                onChange={(e) => setGarment({ ...garment, category: e.target.value })}
                className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
              >
                {["dress", "shirt", "pants", "jacket", "skirt"].map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>

              <label className="block text-xs text-gray-400 mb-2">Color</label>
              <input
                type="color"
                value={garment.color}
                onChange={(e) => setGarment({ ...garment, color: e.target.value })}
                className="w-full h-10 rounded"
                title="Pick garment color"
              />
            </div>

            <button
              onClick={generateTryOn}
              disabled={loading || !userIdentity.avatar_image_base64}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "⏳ Generating Try-On..." : "🎬 Generate Try-On"}
            </button>

            {tryOnResult && (
              <button onClick={downloadGLB} className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold">
                ⬇️ Download 3D Model
              </button>
            )}
          </div>

          {/* Middle + right: preview canvas + results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800/60 border border-purple-600/30 rounded-2xl overflow-hidden shadow-xl">
              <canvas ref={canvasRef} className="w-full h-[520px] bg-gradient-to-br from-slate-700 to-slate-800" />
            </div>

            {tryOnResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-600/20 text-center">
                  <p className="text-xs text-gray-400">Fit Score</p>
                  <p className="text-2xl font-bold text-pink-400">{tryOnResult.fit_recommendations?.fit_score ?? "N/A"}%</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-600/20 text-center">
                  <p className="text-xs text-gray-400">Size</p>
                  <p className="text-2xl font-bold text-purple-300">{tryOnResult.fit_recommendations?.size_recommendation ?? "M"}</p>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-lg border border-purple-600/20 text-center">
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-sm text-gray-200">{tryOnResult.fit_recommendations?.notes ?? "—"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
