import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memoryRegions, transferSeconds, weightGigabytes } from '../src/data/calculations.ts';
import { sections, sources, partDetails, flows } from '../src/data/content.ts';
const model = JSON.parse(readFileSync(new URL('../public/models/architecture.json', import.meta.url)));
const glb = readFileSync(new URL('../public/models/rtx-spark-n1x-128gb.glb', import.meta.url));
const gltf = JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());
test('selected SKU and Blender logical counts agree with documented target', () => {
 assert.equal(model.memoryGB,128); assert.equal(model.cpuCores,20); assert.equal(model.cudaCores,6144);
 assert.equal(model.memoryBandwidthGBs,300); assert.equal(model.c2cBandwidthGBs,600); assert.equal(model.physicalScale,false);
 assert.deepEqual(model.parts.filter(p=>p.logicalCore!==undefined).map(p=>p.logicalCore).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 const cudaMesh=gltf.meshes.find(m=>m.name==='6144 logical CUDA count markers'); assert.ok(cudaMesh);
 assert.equal(gltf.accessors[cudaMesh.primitives[0].indices].count/36,6144,'each marker has twelve triangles');
});
test('every selectable model part has bilingual teaching content and survives GLB export', () => {
 const ids = new Set(gltf.nodes.map(n=>n.extras?.partId).filter(Boolean));
 assert.equal(model.parts.length,46);
 for(const part of model.parts){ assert.ok(ids.has(part.id),part.id); assert.ok(partDetails[part.id]?.description.tr,part.id); assert.ok(partDetails[part.id]?.description.en,part.id); }
 const sourceIds=new Set(sources.map(s=>s.id));
 for(const section of sections){ for(const id of section.sourceIds)assert.ok(sourceIds.has(id),id); assert.ok(section.paragraphs.every(p=>p.en&&p.tr)); }
 for(const flow of flows)for(const step of flow.steps)assert.ok(model.parts.find(p=>p.id===step.part),step.part);
});
test('memory partition follows capped and floored published cases and conserves capacity', () => {
 assert.deepEqual(memoryRegions(96),{dedicated:96,shared:16,cpuOnly:16,gpuVisible:112});
 assert.ok(Math.abs(memoryRegions(0).shared-102.4)<1e-9);
 assert.ok(Math.abs(memoryRegions(32).gpuVisible-108.8)<1e-9);
 for(let carveout=0;carveout<=128;carveout+=8){const r=memoryRegions(carveout);assert.ok(Math.abs(r.dedicated+r.shared+r.cpuOnly-128)<1e-9);assert.ok(r.gpuVisible<=128);assert.ok(r.cpuOnly>=0);}
});
test('educational arithmetic uses decimal GB and explicit utilization', () => {
 assert.equal(weightGigabytes(70,4),35);assert.equal(weightGigabytes(70,16),140);
 assert.ok(Math.abs(transferSeconds(128,100)-128/300)<1e-12);
 assert.equal(transferSeconds(64,50),transferSeconds(128,100));
});
