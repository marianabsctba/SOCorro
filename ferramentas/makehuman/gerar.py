# Gera o elenco do SOCorro com MakeHuman (MPFB, assets CC0) no Blender.
# Uso: blender -b --factory-startup -P gerar.py -- <saida> [ids...]
# Uniforme da escola: roupa base do MPFB + capa e cachecol gerados aqui.
# A barra da capa ("capa_borda") e o cachecol ("cachecol") são pintados no jogo com a cor da casa.
import bpy, bmesh, sys, os, glob
from mathutils import Vector
import addon_utils

addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.locationservice import LocationService

args = sys.argv[sys.argv.index("--") + 1:]
SAIDA = args[0]
SO = set(args[1:])
os.makedirs(SAIDA, exist_ok=True)
DADOS = LocationService.get_user_data()


def achar(tipo, nome, ext="mhclo"):
    r = glob.glob(os.path.join(DADOS, tipo, nome, "*." + ext)) or glob.glob(os.path.join(DADOS, tipo, nome + "*", "*." + ext))
    if not r:
        raise RuntimeError(f"não achei {tipo}/{nome}")
    return r[0]


def idade(anos):
    return 0.1875 + (anos - 11) / 14 * 0.3125 if anos <= 25 else 0.5 + (anos - 25) / 65 * 0.5


# raca: 'african' | 'caucasian' | 'asian' ou dict com pesos (Brasil é mistura)
PARDO = {"african": 0.45, "caucasian": 0.45, "asian": 0.1}
# roupas de escritório de quem trabalha em turno
POLO = ["namuhekam_male_polo_shirt", "toigo_wool_pants", "shoes02"]
# nada de "crude t-shirt" (barra esfarrapada de propósito) nem camiseta para dentro (abre buraco na cintura)
CASUAL_M2 = ["male_casualsuit02", "shoes03"]
CASUAL_M3 = ["male_casualsuit03", "shoes02"]
CASUAL_F1 = ["female_casualsuit01", "toigo_flats"]
CASUAL_F2 = ["female_casualsuit02", "toigo_flats"]
SUETER_F = ["toigo_fisherman_sweater", "toigo_wool_pants", "toigo_ballet_flats"]

# elenco do SOC Olho Vivo (adultos, roupa de escritório de quem trabalha em turno)
SPECS = [
    dict(id="gilmar", f=0, anos=52, raca=PARDO, peso=0.85, musc=0.45, alt=0.55, cabelo=None, roupas=POLO, capa=0, pele="middleage_caucasian_male"),
    dict(id="ro", f=1, anos=44, raca="african", peso=0.6, musc=0.45, alt=0.5, cabelo="afro01", roupas=SUETER_F, capa=0, pele="middleage_african_female"),
    dict(id="vandeco", f=0, anos=58, raca="caucasian", peso=0.62, musc=0.4, alt=0.6, cabelo="short01", roupas=["namuhekam_male_polo_shirt", "toigo_wool_pants", "shoes01"], capa=0, pele="middleage_caucasian_male"),
    dict(id="thiaguinho", f=0, anos=24, raca=PARDO, peso=0.42, musc=0.45, alt=0.55, cabelo="short03", roupas=CASUAL_M2, capa=0, pele="young_caucasian_male"),
    dict(id="keyla", f=1, anos=31, raca="asian", peso=0.42, musc=0.45, alt=0.45, cabelo="ponytail01", roupas=CASUAL_F1, capa=0, pele="young_asian_female"),
    dict(id="neide", f=1, anos=60, raca="african", peso=0.75, musc=0.4, alt=0.3, cabelo="braid01", roupas=["toigo_fisherman_sweater", "toigo_long_full_skirt", "toigo_ballet_flats"], capa=0, pele="middleage_african_female"),
    dict(id="leoncio", f=0, anos=61, raca="caucasian", peso=0.8, musc=0.4, alt=0.5, cabelo="short01", roupas=["male_elegantsuit01", "shoes02"], capa=0, pele="middleage_caucasian_male"),
    dict(id="socorro", f=1, anos=49, raca=PARDO, peso=0.58, musc=0.45, alt=0.45, cabelo="long01", roupas=["toigo_female_suit_2", "toigo_ballet_flats"], capa=0, pele="middleage_caucasian_female"),
    dict(id="nildo", f=0, anos=35, raca={"african": 0.6, "caucasian": 0.3, "asian": 0.1}, peso=0.5, musc=0.5, alt=0.45, cabelo="short04", roupas=POLO, capa=0, pele="young_african_male"),
    dict(id="kevin", f=0, anos=23, raca="caucasian", peso=0.45, musc=0.45, alt=0.6, cabelo="short02", roupas=POLO, capa=0, pele="young_caucasian_male"),
    dict(id="brenda", f=1, anos=22, raca=PARDO, peso=0.45, musc=0.45, alt=0.45, cabelo="long01", roupas=SUETER_F, capa=0, pele="young_caucasian_female"),
    dict(id="jefferson", f=0, anos=26, raca="african", peso=0.5, musc=0.5, alt=0.5, cabelo="afro01", roupas=CASUAL_M3, capa=0, pele="young_african_male"),
    dict(id="pamela", f=1, anos=28, raca="caucasian", peso=0.5, musc=0.45, alt=0.5, cabelo="ponytail01", roupas=SUETER_F, capa=0, pele="young_caucasian_female"),
]


def limpar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)


def papel(nome):
    for k, v in {"shirt": "camisa", "sweater": "camisa", "top": "camisa", "pants": "calca", "skirt": "calca", "shoes": "sapato", "flats": "sapato", "boots": "sapato", "booties": "sapato", "suit": "terno"}.items():
        if k in nome:
            return v
    return "roupa"


def criar(s):
    if isinstance(s["raca"], dict):
        raca = dict(s["raca"])
    else:
        raca = {"asian": 0.05, "caucasian": 0.05, "african": 0.05}
        raca[s["raca"]] = 0.9
    macro = {"gender": 0.0 if s["f"] else 1.0, "age": idade(s["anos"]), "muscle": s["musc"], "weight": s["peso"], "proportions": 0.55,
             "height": s["alt"], "cupsize": 0.5 if s["anos"] > 16 else 0.2, "firmness": 0.5, "race": raca}
    base = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
    HumanService.set_character_skin(achar("skins", s["pele"], "mhmat"), base, skin_type="GAMEENGINE")
    rig = HumanService.add_builtin_rig(base, "game_engine", import_weights=True)
    rig = rig or next(o for o in bpy.data.objects if o.type == "ARMATURE")
    HumanService.add_mhclo_asset(achar("eyes", "low-poly"), base, asset_type="Eyes", subdiv_levels=0)
    HumanService.add_mhclo_asset(achar("eyebrows", "eyebrow001" if s["f"] else "eyebrow006"), base, asset_type="Eyebrows", subdiv_levels=0)
    HumanService.add_mhclo_asset(achar("eyelashes", "eyelashes01"), base, asset_type="Eyelashes", subdiv_levels=0)
    if s["cabelo"]:
        h = HumanService.add_mhclo_asset(achar("hair", s["cabelo"]), base, asset_type="Hair", subdiv_levels=0)
        if h:
            h.name = "cabelo"
    for r in s["roupas"]:
        c = HumanService.add_mhclo_asset(achar("clothes", r), base, asset_type="Clothes", subdiv_levels=0)
        if c:
            c.name = "roupa_" + papel(r)
            c.data.name = c.name
            c["asset"] = r
    base.name = "corpo"
    for o in list(bpy.data.objects):
        # só o blazer do uniforme tem gravata a separar; em outras roupas o laranja é estampa
        if o.type == "MESH" and o.get("asset", "") == "toigo_male_suit_tie_and_jacket":
            separar_gravata(o)
    tirar_sobreposicao()
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name.startswith("roupa_"):
            for p in o.data.polygons:
                p.use_smooth = True
    erodir_mascara(base, aneis=3)
    if s["capa"]:
        capa(base, rig, longa=s["capa"] == 2, cachecol=s["capa"] == 1)
    expressoes(base, s)
    return base, rig


def tirar_sobreposicao():
    """Peça de baixo (calça, saia) perde o que fica escondido sob a de cima (blusa, suéter).
    Sem isso as duas disputam o mesmo lugar na cintura e aparece um recorte serrilhado."""
    dg = bpy.context.evaluated_depsgraph_get()
    def zs(o):
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        r = [(o.matrix_world @ v.co).z for v in me.vertices]
        ev.to_mesh_clear()
        return r
    cima = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("roupa_camisa")]
    baixo = [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("roupa_calca")]
    if not cima or not baixo:
        return
    barra = min(min(zs(o)) for o in cima)
    corpo = bpy.data.objects.get("corpo")
    altura = max(zs(corpo)) if corpo else 1.7
    folga = 0.025 * altura
    for o in baixo:
        me = o.data
        mw = o.matrix_world
        bm = bmesh.new()
        bm.from_mesh(me)
        apagar = [fc for fc in bm.faces if all((mw @ v.co).z > barra + folga for v in fc.verts)]
        bmesh.ops.delete(bm, geom=apagar, context="FACES")
        bm.to_mesh(me)
        bm.free()
        print("sobreposicao", o.name, len(apagar), "faces escondidas apagadas")


def separar_gravata(ob):
    """Faces da gravata (laranja na textura original) ganham material próprio, "gravata", pintado no jogo."""
    if not ob.data.materials or not ob.data.uv_layers:
        return
    mat = ob.data.materials[0]
    img = None
    if mat and mat.use_nodes:
        for n in mat.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image and "diff" in n.image.name.lower():
                img = n.image
                break
    if img is None:
        return
    w, h = img.size
    px = img.pixels[:]
    uv = ob.data.uv_layers.active.data
    marcadas = []
    for p in ob.data.polygons:
        u = sum(uv[i].uv[0] for i in p.loop_indices) / len(p.loop_indices)
        v = sum(uv[i].uv[1] for i in p.loop_indices) / len(p.loop_indices)
        x = min(w - 1, max(0, int((u % 1.0) * w)))
        y = min(h - 1, max(0, int((v % 1.0) * h)))
        k = (y * w + x) * 4
        r, g, b = px[k], px[k + 1], px[k + 2]
        mx, mn = max(r, g, b), min(r, g, b)
        sat = (mx - mn) / mx if mx > 0 else 0
        if sat > 0.5 and r == mx and mx > 0.4:
            marcadas.append(p.index)
    # cresce a seleção para vizinhas de tom parecido e tapa buracos cercados de gravata
    viz = {}
    for e in ob.data.edges:
        pass
    arestas = {}
    for p in ob.data.polygons:
        for k in p.edge_keys:
            arestas.setdefault(k, []).append(p.index)
    for lista in arestas.values():
        for i in lista:
            viz.setdefault(i, set()).update(j for j in lista if j != i)
    def cor(p):
        u = sum(uv[i].uv[0] for i in p.loop_indices) / len(p.loop_indices)
        v = sum(uv[i].uv[1] for i in p.loop_indices) / len(p.loop_indices)
        x = min(w - 1, max(0, int((u % 1.0) * w)))
        y = min(h - 1, max(0, int((v % 1.0) * h)))
        k = (y * w + x) * 4
        return px[k], px[k + 1], px[k + 2]
    sel = set(marcadas)
    for _ in range(4):
        novas = set()
        for i in sel:
            for j in viz.get(i, ()):
                if j in sel:
                    continue
                r, g, b = cor(ob.data.polygons[j])
                mx, mn = max(r, g, b), min(r, g, b)
                if mx > 0.15 and r == mx and (mx - mn) / mx > 0.2:
                    novas.add(j)
        sel |= novas
    for _ in range(3):
        sel |= {j for i in sel for j in viz.get(i, ()) if j not in sel and sum(1 for q in viz.get(j, ()) if q in sel) >= max(2, len(viz.get(j, ())) - 1)}
    # faces soltas (ilhas da malha) perto da gravata também viram gravata: busca por proximidade no espaço
    from mathutils import kdtree
    cent = [p.center.copy() for p in ob.data.polygons]
    alt = max(v.co.z for v in ob.data.vertices) - min(v.co.z for v in ob.data.vertices)
    for _ in range(2):
        arv = kdtree.KDTree(len(sel))
        for k, i in enumerate(sel):
            arv.insert(cent[i], i)
        arv.balance()
        perto = set()
        for j, c in enumerate(cent):
            if j in sel:
                continue
            _co, _i, d = arv.find(c)
            if d is not None and d < 0.012 * alt:
                r, g, b = cor(ob.data.polygons[j])
                mx, mn = max(r, g, b), min(r, g, b)
                if r == mx and mx > 0.06 and (mx - mn) / mx > 0.18:
                    perto.add(j)
        sel |= perto
    marcadas = sorted(sel)
    if not marcadas:
        return
    ob.data.materials.append(mat_simples("gravata", (0.6, 0.45, 0.1), 0.0, 0.55))
    idx = len(ob.data.materials) - 1
    for i in marcadas:
        ob.data.polygons[i].material_index = idx
    print("gravata", ob.name, len(marcadas), "faces")


def suave(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def mat_simples(nome, cor, metal=0.0, rug=0.8):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*cor, 1); p.inputs["Metallic"].default_value = metal; p.inputs["Roughness"].default_value = rug
    return m


def tira(nome, pontos, raio):
    cu = bpy.data.curves.new(nome, "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = raio; cu.bevel_resolution = 2; cu.resolution_u = 12
    sp = cu.splines.new("NURBS"); sp.points.add(len(pontos) - 1)
    for p, c in zip(sp.points, pontos):
        p.co = (c.x, c.y, c.z, 1)
    sp.use_endpoint_u = True; sp.order_u = 3
    ob = bpy.data.objects.new(nome, cu); bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.convert(target="MESH")
    return bpy.context.view_layer.objects.active


def erodir_mascara(base, aneis=3):
    """Mantém uma faixa de pele sob as bordas da roupa: sem buraco quando o corpo se mexe."""
    for g in base.vertex_groups:
        if not any(m.type == "MASK" and m.vertex_group == g.name for m in base.modifiers):
            continue
        idx = g.index
        apagar = {v.index for v in base.data.vertices if any(x.group == idx and x.weight > 0.5 for x in v.groups)}
        viz = {}
        for e in base.data.edges:
            a, b = e.vertices
            viz.setdefault(a, []).append(b); viz.setdefault(b, []).append(a)
        for _ in range(aneis):
            borda = {v for v in apagar if any(n not in apagar for n in viz.get(v, []))}
            apagar -= borda
        g.remove([v.index for v in base.data.vertices])
        g.add(list(apagar), 1.0, "REPLACE")


def superficie_alvo():
    dg = bpy.context.evaluated_depsgraph_get()
    junto = bmesh.new()
    for o in [o for o in bpy.data.objects if o.type == "MESH" and (o.name.startswith("roupa_") or o.name == "corpo")]:
        me_ev = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me_ev.transform(o.matrix_world)
        junto.from_mesh(me_ev)
        bpy.data.meshes.remove(me_ev)
    me_alvo = bpy.data.meshes.new("alvo_tmp"); junto.to_mesh(me_alvo); junto.free()
    alvo = bpy.data.objects.new("alvo_tmp", me_alvo); bpy.context.scene.collection.objects.link(alvo)
    return alvo, [v.co.copy() for v in me_alvo.vertices]


def pesos_do_corpo(ob, base, rig, manter):
    dt = ob.modifiers.new("pesos", "DATA_TRANSFER")
    dt.object = base; dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
    dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.datalayout_transfer(modifier="pesos")
    bpy.ops.object.modifier_apply(modifier="pesos")
    for g in list(ob.vertex_groups):
        if g.name not in manter:
            ob.vertex_groups.remove(g)
    for nome in manter:
        if nome not in ob.vertex_groups:
            ob.vertex_groups.new(name=nome)
    gp = ob.vertex_groups["spine_01" if "spine_01" in manter else "spine_03"]
    for v in ob.data.vertices:
        if sum(g.weight for g in v.groups) < 0.05:
            gp.add([v.index], 1.0, "REPLACE")
    ob.parent = rig
    am = ob.modifiers.new("Armature", "ARMATURE"); am.object = rig


def capa(base, rig, longa=False, cachecol=True):
    """Capa nas costas (presa nos ombros, solta embaixo) e cachecol no pescoço."""
    alvo, pts = superficie_alvo()
    zmin = min(p.z for p in pts); zmax = max(p.z for p in pts); H = zmax - zmin
    zo = zmin + 0.815 * H                       # linha dos ombros
    zb = zmin + (0.07 if longa else 0.14) * H   # barra
    costas = max(p.y for p in pts if zo - 0.30 * H < p.z < zo and abs(p.x) < 0.10 * H)
    largo_ombro = max(abs(p.x) for p in pts if zo - 0.06 * H < p.z < zo - 0.02 * H) * 1.02
    nx, nz = 22, 70
    bm = bmesh.new()
    linhas = []
    for k in range(nz + 1):
        t = k / nz                               # 0 barra, 1 ombro
        z = zb + (zo - zb) * t
        w = largo_ombro * t + 0.215 * H * (1 - t) + largo_ombro * 0.15 * (1 - t)
        recuo = (1 - suave(t * 1.4)) * 0.075 * H  # a barra se afasta das pernas
        linha = []
        for i in range(nx + 1):
            u = -1 + 2 * i / nx
            x = w * u
            y = costas + 0.03 + recuo - 0.06 * H * u * u * (0.4 + 0.6 * t)
            linha.append(bm.verts.new((x, y, z)))
        linhas.append(linha)
    for k in range(nz):
        for i in range(nx):
            f = bm.faces.new((linhas[k][i], linhas[k + 1][i], linhas[k + 1][i + 1], linhas[k][i + 1]))
            f.material_index = 1 if k < 3 else 0
            f.smooth = True
    me = bpy.data.meshes.new("capa"); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("capa", me); bpy.context.scene.collection.objects.link(ob)
    me.materials.append(mat_simples("capa_la", (0.018, 0.016, 0.03), 0.0, 0.92))
    me.materials.append(mat_simples("capa_borda", (0.75, 0.55, 0.12), 0.3, 0.5))
    # dupla face: a capa é vista dos dois lados
    so = ob.modifiers.new("esp", "SOLIDIFY"); so.thickness = 0.004; so.offset = 1
    vg = ob.vertex_groups.new(name="envolver")
    for v in me.vertices:
        vg.add([v.index], suave((v.co.z - (zo - 0.16 * H)) / (0.09 * H)), "REPLACE")
    sw = ob.modifiers.new("sw", "SHRINKWRAP")
    sw.target = alvo; sw.wrap_method = "PROJECT"; sw.use_project_y = True
    sw.use_negative_direction = True; sw.use_positive_direction = False
    sw.offset = 0.012; sw.project_limit = 0.35; sw.wrap_mode = "OUTSIDE_SURFACE"; sw.vertex_group = "envolver"
    sm = ob.modifiers.new("suave", "CORRECTIVE_SMOOTH"); sm.iterations = 5; sm.use_only_smooth = True
    bpy.context.view_layer.objects.active = ob
    for m in ["sw", "suave", "esp"]:
        bpy.ops.object.modifier_apply(modifier=m)
    ob.vertex_groups.remove(ob.vertex_groups["envolver"])
    partes = [ob]
    pescoco = rig.matrix_world @ rig.data.bones["neck_01"].head_local
    if cachecol:
        # volta no pescoço e duas pontas caindo na frente
        r = 0.052 * H / 1.0
        cz = pescoco.z - 0.012 * H
        volta = [Vector((r * __import__("math").sin(a), pescoco.y + r * __import__("math").cos(a) * 0.95, cz)) for a in [i * 0.5236 for i in range(13)]]
        cc = tira("cachecol", volta, 0.011 * H / 1.0)
        ponta1 = tira("ponta1", [Vector((0.02 * H, pescoco.y - r, cz)), Vector((0.03 * H, pescoco.y - r - 0.02 * H, cz - 0.08 * H)), Vector((0.035 * H, pescoco.y - r - 0.025 * H, cz - 0.17 * H))], 0.010 * H)
        ponta2 = tira("ponta2", [Vector((-0.01 * H, pescoco.y - r, cz)), Vector((-0.02 * H, pescoco.y - r - 0.02 * H, cz - 0.07 * H)), Vector((-0.018 * H, pescoco.y - r - 0.026 * H, cz - 0.14 * H))], 0.010 * H)
        mc = mat_simples("cachecol", (0.75, 0.55, 0.12), 0.0, 0.95)
        for t in (cc, ponta1, ponta2):
            s2 = t.modifiers.new("sw", "SHRINKWRAP"); s2.target = alvo; s2.wrap_method = "NEAREST_SURFACEPOINT"
            s2.offset = 0.012 * H; s2.wrap_mode = "OUTSIDE_SURFACE"
            bpy.context.view_layer.objects.active = t
            bpy.ops.object.modifier_apply(modifier="sw")
            t.data.materials.clear(); t.data.materials.append(mc)
            for f in t.data.polygons:
                f.use_smooth = True
            pesos_do_corpo(t, base, rig, {"spine_03", "neck_01", "clavicle_l", "clavicle_r", "spine_02"})
    bpy.data.objects.remove(alvo)
    pesos_do_corpo(ob, base, rig, {"pelvis", "spine_01", "spine_02", "spine_03", "neck_01", "clavicle_l", "clavicle_r"})


def encolher_texturas():
    for img in bpy.data.images:
        n = img.name.lower()
        lado = 1024 if ("skin" in n or "body" in n or "litsphere" in n) else 256 if ("eye" in n or "brow" in n or "lash" in n) else 512
        if img.size[0] > lado or img.size[1] > lado:
            try:
                img.scale(min(lado, img.size[0]), min(lado, img.size[1]))
            except Exception as e:
                print("textura", img.name, e)


# ---------------------------------------------------------------- expressões do rosto (formas de deformação)

# cada expressão do jogo mistura unidades de expressão do MakeHuman (arquivo, peso)
EXPRESSOES = {
    "piscar": [("eye-left-closure", 1.0), ("eye-right-closure", 1.0)],
    "boca": [("mouth-open", 0.55), ("mouth-parling", 0.3)],
    "sorriso": [("mouth-corner-puller", 0.85), ("eye-left-slit", 0.25), ("eye-right-slit", 0.25)],
    "surpresa": [("eyebrows-left-up", 0.9), ("eyebrows-right-up", 0.9), ("eye-left-opened-up", 0.6), ("eye-right-opened-up", 0.6), ("mouth-open", 0.25)],
    "bravo": [("eyebrows-left-down", 0.9), ("eyebrows-right-down", 0.9), ("mouth-compression", 0.5)],
    "triste": [("eyebrows-left-inner-up", 0.9), ("eyebrows-right-inner-up", 0.9), ("mouth-depression", 0.7)],
}


def pasta_unidades(s):
    raca = s["raca"]
    if isinstance(raca, dict):
        raca = max(raca, key=raca.get)
    return os.path.join(LocationService.get_mpfb_data("targets"), "expression", "units", raca)


def expressoes(base, s):
    """Grava no corpo as expressões do jogo como formas (morph targets) e faz sobrancelha e cílio acompanharem."""
    from bl_ext.user_default.mpfb.services.targetservice import TargetService
    pasta = pasta_unidades(s)
    # o corpo fica com a forma final como base; os alvos de idade, peso etc. viram geometria fixa
    if base.data.shape_keys:
        TargetService.bake_targets(base)
    base.shape_key_add(name="Basis", from_mix=False)
    for nome, partes in EXPRESSOES.items():
        tmp = []
        for arq, peso in partes:
            k = TargetService.load_target(base, os.path.join(pasta, arq + ".target.gz"), weight=peso, name="tmp_" + arq)
            tmp.append(k.name if k else "tmp_" + arq)
        base.shape_key_add(name=nome, from_mix=True)
        for t in tmp:
            kb = base.data.shape_keys.key_blocks.get(t)
            if kb:
                base.shape_key_remove(kb)
        base.data.shape_keys.key_blocks[nome].value = 0.0
    # sobrancelha e cílio são malhas separadas: grudam no rosto e copiam cada expressão
    bpy.context.view_layer.update()
    for o in [o for o in bpy.data.objects if o.type == "MESH" and any(p in o.name.lower() for p in ("eyebrow", "eyelash"))]:
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        md = o.modifiers.new("gruda", "SURFACE_DEFORM")
        md.target = base
        while o.modifiers[0].name != "gruda":
            bpy.ops.object.modifier_move_up(modifier="gruda")
        bpy.ops.object.surfacedeform_bind(modifier="gruda")
        if not o.data.shape_keys:
            o.shape_key_add(name="Basis", from_mix=False)
        for nome in EXPRESSOES:
            base.data.shape_keys.key_blocks[nome].value = 1.0
            bpy.context.view_layer.update()
            bpy.ops.object.modifier_apply_as_shapekey(keep_modifier=True, modifier="gruda")
            novo = o.data.shape_keys.key_blocks[-1]
            novo.name = nome
            novo.value = 0.0
            base.data.shape_keys.key_blocks[nome].value = 0.0
        o.modifiers.remove(o.modifiers["gruda"])
    # o Blender não aplica máscara em malha com formas: as partes escondidas saem na mão, preservando as formas
    for m in [m for m in base.modifiers if m.type == "MASK"]:
        g = base.vertex_groups.get(m.vertex_group)
        if g is None:
            base.modifiers.remove(m)
            continue
        idx = g.index
        dentro = {v.index for v in base.data.vertices if any(x.group == idx and x.weight > m.threshold for x in v.groups)}
        bm = bmesh.new()
        bm.from_mesh(base.data)
        bm.verts.ensure_lookup_table()
        apagar = [v for v in bm.verts if (v.index in dentro) == m.invert_vertex_group]
        bmesh.ops.delete(bm, geom=apagar, context="VERTS")
        bm.to_mesh(base.data)
        bm.free()
        base.modifiers.remove(m)


def exportar(caminho, objetos):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objetos:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objetos[0]
    bpy.ops.export_scene.gltf(filepath=caminho, export_format="GLB", use_selection=True, export_apply=True,
                              export_animations=False, export_image_format="WEBP", export_image_quality=78, export_yup=True,
                              export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
                              export_morph=True, export_morph_normal=False, export_skins=True, export_def_bones=True)


for s in SPECS:
    if SO and s["id"] not in SO:
        continue
    try:
        limpar()
        base, rig = criar(s)
        encolher_texturas()
        objs = [rig] + [o for o in bpy.data.objects if o.type == "MESH"]
        exportar(os.path.join(SAIDA, s["id"] + ".glb"), objs)
        print("ok", s["id"])
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("FALHOU", s["id"], e)
