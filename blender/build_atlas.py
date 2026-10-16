"""Original, reproducible functional model of the 128 GB RTX Spark N1X.

Block rectangles follow NVIDIA's published diagram, in diagram coordinates.
Depth, material, display mounts and animation distances have no physical meaning.
No proprietary die floorplan, dimensions, cache capacity or SM count is asserted.
Detailed markers represent logical counts; microstructures and traces are illustrative.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
BUILD = ROOT / 'blender/build'
BUILD.mkdir(parents=True, exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for data in list(bpy.data.materials):
    bpy.data.materials.remove(data)

def mat(name, rgb, metallic=0.0, roughness=0.4, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*rgb, 1)
    bs.inputs['Metallic'].default_value = metallic
    bs.inputs['Roughness'].default_value = roughness
    if emission:
        bs.inputs['Emission Color'].default_value = (*rgb, 1)
        bs.inputs['Emission Strength'].default_value = emission
    return m

M = {
    'metal': mat('Satin warm alloy / display mount', (.39,.37,.29), .82,.29),
    'dark': mat('Graphite backing', (.028,.043,.038), .65,.35),
    'cpu': mat('Arm teal', (.045,.23,.27), .5,.28),
    'p': mat('Performance core / copper', (.64,.37,.15), .65,.24),
    'e': mat('Efficiency core / teal', (.08,.46,.52), .4,.29),
    'gpu': mat('Blackwell green', (.22,.38,.07), .5,.29),
    'tensor': mat('Tensor gold', (.73,.5,.19), .5,.3),
    'rt': mat('Ray tracing mint', (.19,.62,.45), .4,.3),
    'grid': mat('Logical compute texture', (.3,.47,.12), .58,.38),
    'cache': mat('Cache slate', (.13,.2,.19), .5,.34),
    'io': mat('I/O slate', (.11,.16,.16), .55,.32),
    'c2c': mat('C2C cyan', (.08,.62,.7), .5,.25,.22),
    'memory': mat('Memory violet', (.22,.18,.29), .5,.28),
    'text': mat('Engraved white legends', (.84,.91,.86), .05,.5,.15),
    'muted': mat('Secondary legends', (.38,.53,.46), .2,.5),
}

def box(name, loc, size, material, parent=None, bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new('Precision edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if parent:
        o.parent = parent
    return o

def label(text, x,y,z,size=.13, parent=None, material=None, angle=0):
    cu = bpy.data.curves.new('Legend '+text, 'FONT')
    cu.body = text
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    cu.size = size
    cu.extrude = .001
    cu.resolution_u = 5
    o = bpy.data.objects.new('Label '+text,cu)
    bpy.context.collection.objects.link(o)
    o.location=(x,y,z)
    o.rotation_euler.z=angle
    cu.materials.append(material or M['text'])
    bpy.context.view_layer.objects.active=o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o['isLegend'] = True
    o.select_set(False)
    if parent:
        o.parent=parent
    return o

def group(name, part, category, layer):
    o=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(o)
    o['partId']=part
    o['category']=category
    o['layer']=layer
    return o

def rectpos(rect):
    x,y,w,h=rect
    return (x+w/2-505)/100, (205-y-h/2)/100, w/100,h/100

def batch_boxes(name, cubes, material, parent):
    verts=[]; faces=[]
    for (x,y,z),(w,h,d) in cubes:
        n=len(verts)
        verts.extend([(x+sx*w/2,y+sy*h/2,z+sz*d/2) for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]])
        faces.extend([tuple(n+i for i in f) for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]])
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces); me.update()
    ob=bpy.data.objects.new(name,me); bpy.context.collection.objects.link(ob); me.materials.append(material); ob.parent=parent
    return ob

parts=[]
def block(part, name, rect, category, color, layer=1.0, textsize=.13, title=True):
    x,y,w,h=rectpos(rect)
    g=group('PART_'+part,part,category,layer)
    box(part+'_edge',(x,y,.32),(w,h,.17),M['metal'],g,.025)
    box(part+'_silicon',(x,y,.425),(w-.04,h-.04,.075),M[color],g,.018)
    if title:
        label(name,x,y,.468,min(textsize,w/max(len(name),1)*1.5),g)
    # Fine metal trace marks are decorative, not physical netlists.
    if w > .6:
        cubes=[((x-w/2+.09+i*.11,y-h/2+.035,.47),(.05,.008,.008)) for i in range(max(1,int((w-.16)/.11)))]
        batch_boxes('Schematic edge traces '+part,cubes,M['muted'],g)
    parts.append({'id':part,'label':name,'category':category,'source':'diagram',
                  'rect':rect,'anchor':[x,.48,-y],'layer':layer})
    return g,(x,y,w,h)

for name,rect in [('S-die',[15,16,540,374]),('G-die',[575,16,420,374])]:
    x,y,w,h=rectpos(rect)
    g=group('Mount '+name,'overview','overview',0)
    box(name+'_mount',(x,y,0),(w+.14,h+.14,.24),M['metal'],g,.065)
    box(name+'_backing',(x,y,.16),(w-.05,h-.05,.13),M['dark'],g,.025)
    label(name,x-w/2+.43,y+h/2+.18,.235,.20,g)
    # Layered substrate and display contacts. Units and contact pitch are illustrative.
    box(name+'_substrate',(x,y,-.17),(w-.13,h-.13,.09),M['dark'],g,.03)
    cubes=[]
    for side in [-1,1]:
        for i in range(int(w/.16)):
            cubes.append(((x-w/2+.1+i*.16,y+side*(h/2-.10),-.23),(.055,.055,.03)))
    batch_boxes(name+' illustrative contacts',cubes,M['metal'],g)

for idx,x0 in enumerate([35,186]):
    g,(x,y,w,h)=block('cpu'+str(idx),'CPU '+str(idx),[x0,50,130,78],'cpu','cpu',1.3,title=False)
    label('CPU '+str(idx)+' · 5E + 5P',x,y+.23,.47,.105,g)
    for row in range(2):
        for col in range(5):
            xx=x-.48+col*.24; yy=y+.01-row*.235
            kind='e' if row==0 else 'p'; part='cpu%d_%s%d'%(idx,kind,col)
            core=group('PART_'+part,part,'cpu',1.65)
            core['logicalCore']=idx*10+row*5+col; core['coreClass']=kind
            box(part+'_body',(xx,yy,.51),(.18,.18,.09),M[kind],core,.009)
            # Illustrative repeated cache/logic texture, not an Arm floorplan.
            cells=[((xx-.055+c*.037,yy-.05+r*.037,.56),(.027,.027,.009)) for c in range(4) for r in range(3)]
            batch_boxes(part+'_logic_texture',cells,M['metal'] if kind=='p' else M['muted'],core)
            parts.append({'id':part,'label':('Cortex-A725' if kind=='e' else 'Cortex-X925')+' '+str(idx*5+col+1),'category':'cpu','source':'documented-count-illustrative-placement','anchor':[xx,.59,-yy],'layer':1.65,'logicalCore':idx*10+row*5+col})
    block('dsu'+str(idx),'DSU',[x0,136,130,39],'cache','cache',.7)

block('fabric','Fabric',[35,190,280,58],'cache','cache',.7,.18)
for part,name,rect in [
    ('display','Display',[360,23,130,40]),
    ('dla','DLA / NPU',[360,72,130,39]),
    ('isp','Camera / ISP',[360,119,130,50]),
    ('vic','VIC',[360,178,130,49]),
    ('audio','Audio',[360,235,130,46]),
]: block(part,name,rect,'io','io',1.0,.13)

block('slc','SLC · System Level Cache',[34,288,470,37],'cache','cache',.5,.145)
block('dram','DRAM Controller',[34,332,470,49],'memory','cpu',.6,.17)
for part,rect in [('c2c_s',[515,22,36,360]),('c2c_g',[580,23,38,359])]:
    g,(x,y,w,h)=block(part,'C2C',rect,'link','c2c',.8,title=False)
    label('NVLink-C2C',x,y,.47,.155,g,angle=math.pi/2)

g,(x,y,w,h)=block('support','Support Logic',[630,24,82,356],'gpu','cache',.7,title=False)
label('Support',x,y+.09,.47,.14,g)
label('Logic',x,y-.12,.47,.14,g)
block('rc','RC',[732,23,68,38],'io','io',1.1)
g,(x,y,w,h)=block('gpu','Blackwell iGPU',[727,71,250,310],'gpu','gpu',1.2,title=False)

# 6,144 count markers, deliberately not an SM/floorplan arrangement.
cuda=group('PART_cuda','cuda','gpu',1.35)
markers=[]
for col in range(96):
    for row in range(64):
        xx=x-w/2+.14+col*.023; yy=y-.48+row*.017
        markers.append(((xx,yy,.478),(.018,.012,.018)))
batch_boxes('6144 logical CUDA count markers',markers,M['grid'],cuda)
parts.append({'id':'cuda','label':'6,144 CUDA','category':'gpu','source':'documented-count-illustrative-placement','anchor':[x,.52,-(y+.12)],'layer':1.35,'logicalCount':6144})
label('BLACKWELL',x-.30,y+.90,.49,.16,g)
label('6,144 CUDA',x,y-.66,.49,.115,g)
for part,title,xx,color in [('tensor','TENSOR 5',x-.56,'tensor'),('rt','RT 4',x+.56,'rt')]:
    subgroup=group('PART_'+part,part,'gpu',1.65)
    box(part+'_teaching_region',(xx,y-.89,.52),(1.03,.18,.09),M[color],subgroup,.018)
    label(title,xx,y-.89,.575,.105,subgroup)
    parts.append({'id':part,'label':title,'category':'gpu','source':'schematic-function-region-not-unit-count','anchor':[xx,.59,-(y-.89)],'layer':1.65})

for part,name,rect in [
    ('ep','EP',[733,78,66,38]),
    ('ofa','OFA',[820,78,69,38]),
    ('encode','encode',[900,78,70,38]),
    ('decode','decode',[900,122,70,38]),
    ('l2','Graphics L2',[745,327,217,45]),
]:
    raised,_=block(part,name,rect,'cache' if part=='l2' else 'io','gpu' if part=='l2' else 'io',1.6,.14)
    raised.location.z=.075
    parts[-1]['anchor'][1]+=.075

g,(x,y,w,h)=block('memory','128 GB · LPDDR5X',[185,453,600,66],'memory','memory',.3,.23)
box('Memory display mount',(x,y,.04),(w+.17,h+.17,.24),M['metal'],g,.055)
label('ONE SHARED PHYSICAL MEMORY POOL',x,y-.14,.469,.075,g,M['muted'])

# Thin guide rails express logical relationships; no physical lanes are asserted.
links=group('Logical connection guides','c2c_s','link',0)
for i in range(5):
    box('C2C schematic lane '+str(i),(.6,.2+i*.1,.30),(.30,.026,.024),M['c2c'],links,.003)
for i in range(5):
    box('DRAM schematic lane '+str(i),(-2.4+i*.11,-2.16,.28),(.022,.72,.017),M['c2c'],links,.003)

# Save source with a usable camera and lights. They are excluded from the web GLB.
scene=bpy.context.scene
scene.world.color=(.12,.12,.12)
world=scene.world
world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.10,.14,.12,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.35
def area(name, loc, energy, color, size):
    bpy.ops.object.light_add(type='AREA',location=loc)
    o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.color=color;o.data.shape='DISK';o.data.size=size
    o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Key softbox',(-3,-2,9),950,(.83,.91,1),7)
area('Warm rim',(5,5,5),650,(1,.83,.56),6)
area('Fill',(-6,2,3),400,(.4,.85,.9),5)
bpy.ops.object.camera_add(location=(2.5,-7.5,12.8))
cam=bpy.context.object;cam.name='Atlas presentation camera'
cam.rotation_euler=(Vector((0,-.45,.2))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=12.4;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=1500;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.view_settings.exposure=-.35

manifest={'product':'NVIDIA RTX Spark N1X','memoryGB':128,'cpuCores':20,'performanceCores':10,'efficiencyCores':10,'cudaCores':6144,'memoryBandwidthGBs':300,'c2cBandwidthGBs':600,'physicalScale':False,'cudaMarkerLayout':'96 by 64 count grid; not SM topology','memoryBusBits':256,'diagramURL':'https://docs.nvidia.com/rtx-spark/rtx-spark-porting-guide/latest/_images/N1xBlockDiagramPlaceHolder2.png','reviewedOn':'2026-10-16','representation':'detailed-representative-architecture-not-physical-floorplan','parts':parts}
(OUT/'architecture.json').write_text(json.dumps(manifest,indent=2))
# Merge within each selectable group/material to keep runtime draw calls bounded.
mesh_groups={}
for obj in list(bpy.data.objects):
    if obj.type=='MESH' and obj.parent and len(obj.data.materials)==1:
        key=(obj.parent.name,obj.data.materials[0].name,bool(obj.get('isLegend')))
        mesh_groups.setdefault(key,[]).append(obj)
for key,objects in mesh_groups.items():
    if len(objects)<2: continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    objects[0].name=key[0]+' / '+key[1]
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'rtx-spark-n1x-128gb.blend'))
bpy.ops.export_scene.gltf(filepath=str(BUILD/'rtx-spark-n1x-128gb.raw.glb'),export_format='GLB',export_extras=True,export_cameras=False,export_lights=False,export_apply=True)
scene.render.filepath=str(OUT/'architecture-poster.png')
bpy.ops.render.render(write_still=True)
print('ATLAS_MODEL_COMPLETE '+str(len(parts))+' selectable representative parts')
