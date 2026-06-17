// visio-export2.js — all static XML inlined, no fetch needed

// ── Static td2 master/theme XML (inlined) ────────────────────────────────────
const _MASTERS_XML = `<?xml version='1.0' encoding='utf-8' ?><Masters xmlns='http://schemas.microsoft.com/office/visio/2012/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xml:space='preserve'><Master ID='2' NameU='Task' IsCustomNameU='1' Name='Task' IsCustomName='1' Prompt='A Task is an activity that is included within a process.' IconSize='1' AlignName='2' MatchByName='0' IconUpdate='1' UniqueID='{10256402-0002-0000-8E40-00608CF305B2}' BaseID='{AD52C90D-8C6B-4607-80AF-08B93602D58F}' PatternFlags='0' Hidden='0' MasterType='2'><PageSheet LineStyle='0' FillStyle='0' TextStyle='0'><Cell N='PageWidth' V='4' U='IN'/><Cell N='PageHeight' V='4' U='IN'/><Cell N='ShdwOffsetX' V='0.125'/><Cell N='ShdwOffsetY' V='-0.125'/><Cell N='PageScale' V='1' U='IN'/><Cell N='DrawingScale' V='1' U='IN'/><Cell N='DrawingSizeType' V='0'/><Cell N='DrawingScaleType' V='0'/><Cell N='InhibitSnap' V='0'/><Cell N='PageLockReplace' V='0' U='BOOL'/><Cell N='PageLockDuplicate' V='0' U='BOOL'/><Cell N='UIVisibility' V='0'/><Cell N='ShdwType' V='0'/><Cell N='ShdwObliqueAngle' V='0'/><Cell N='ShdwScaleFactor' V='1'/><Cell N='DrawingResizeType' V='1'/><Cell N='LangID' V='en-US' F='Inh'/><Section N='Layer'><Row IX='0'><Cell N='Name' V='Flowchart'/><Cell N='Color' V='255'/><Cell N='Status' V='0'/><Cell N='Visible' V='1'/><Cell N='Print' V='1'/><Cell N='Active' V='0'/><Cell N='Lock' V='0'/><Cell N='Snap' V='1'/><Cell N='Glue' V='1'/><Cell N='NameUniv' V='Flowchart'/><Cell N='ColorTrans' V='0'/></Row></Section></PageSheet><Rel r:id='rId1'/></Master><Master ID='4' NameU='Dynamic connector' IsCustomNameU='1' Name='Dynamic connector' IsCustomName='1' Prompt='This connector automatically routes between the shapes it connects.' IconSize='1' AlignName='2' MatchByName='1' IconUpdate='0' UniqueID='{002A9114-0000-0000-8E40-00608CF305B2}' BaseID='{F7290A45-E3AD-11D2-AE4F-006008C9F5A9}' PatternFlags='0' Hidden='0' MasterType='0'><PageSheet LineStyle='0' FillStyle='0' TextStyle='0'><Cell N='PageWidth' V='3.937007874015748'/><Cell N='PageHeight' V='3.937007874015748'/><Cell N='ShdwOffsetX' V='0.1181102362204724'/><Cell N='ShdwOffsetY' V='-0.1181102362204724'/><Cell N='PageScale' V='0.03937007874015748' U='MM'/><Cell N='DrawingScale' V='0.03937007874015748' U='MM'/><Cell N='DrawingSizeType' V='4'/><Cell N='DrawingScaleType' V='0'/><Cell N='InhibitSnap' V='0'/><Cell N='PageLockReplace' V='0' U='BOOL'/><Cell N='PageLockDuplicate' V='0' U='BOOL'/><Cell N='UIVisibility' V='0'/><Cell N='ShdwType' V='0'/><Cell N='ShdwObliqueAngle' V='0'/><Cell N='ShdwScaleFactor' V='1'/><Cell N='DrawingResizeType' V='0'/><Section N='Layer'><Row IX='0'><Cell N='Name' V='Connector'/><Cell N='Color' V='255'/><Cell N='Status' V='0'/><Cell N='Visible' V='1'/><Cell N='Print' V='1'/><Cell N='Active' V='0'/><Cell N='Lock' V='0'/><Cell N='Snap' V='1'/><Cell N='Glue' V='1'/><Cell N='NameUniv' V='Connector'/><Cell N='ColorTrans' V='0'/></Row></Section></PageSheet><Rel r:id='rId2'/></Master><Master ID='5' NameU='Dynamic connector.5' Name='Dynamic connector.5' Prompt='This connector automatically routes between the shapes it connects.' IconSize='1' AlignName='2' MatchByName='1' IconUpdate='0' UniqueID='{002A9108-0000-0000-8E40-00608CF305B2}' BaseID='{F7290A45-E3AD-11D2-AE4F-006008C9F5A9}' PatternFlags='0' Hidden='0' MasterType='541'><PageSheet LineStyle='0' FillStyle='0' TextStyle='0'><Cell N='PageWidth' V='3.937007874015748'/><Cell N='PageHeight' V='3.937007874015748'/><Cell N='ShdwOffsetX' V='0.1181102362204724'/><Cell N='ShdwOffsetY' V='-0.1181102362204724'/><Cell N='PageScale' V='0.03937007874015748' U='MM'/><Cell N='DrawingScale' V='0.03937007874015748' U='MM'/><Cell N='DrawingSizeType' V='4'/><Cell N='DrawingScaleType' V='0'/><Cell N='InhibitSnap' V='0'/><Cell N='PageLockReplace' V='0' U='BOOL'/><Cell N='PageLockDuplicate' V='0' U='BOOL'/><Cell N='UIVisibility' V='0'/><Cell N='ShdwType' V='0'/><Cell N='ShdwObliqueAngle' V='0'/><Cell N='ShdwScaleFactor' V='1'/><Cell N='DrawingResizeType' V='0'/><Section N='Layer'><Row IX='0'><Cell N='Name' V='Connector'/><Cell N='Color' V='255'/><Cell N='Status' V='0'/><Cell N='Visible' V='1'/><Cell N='Print' V='1'/><Cell N='Active' V='0'/><Cell N='Lock' V='0'/><Cell N='Snap' V='1'/><Cell N='Glue' V='1'/><Cell N='NameUniv' V='Connector'/><Cell N='ColorTrans' V='0'/></Row></Section></PageSheet><Rel r:id='rId3'/></Master></Masters>`;

const _MASTER1_XML = `<?xml version='1.0' encoding='utf-8' ?><MasterContents xmlns='http://schemas.microsoft.com/office/visio/2012/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xml:space='preserve'><Shapes><Shape ID='5' Type='Group' LineStyle='3' FillStyle='3' TextStyle='3'><Cell N='PinX' V='1.999999992549419'/><Cell N='PinY' V='1.999999992549419'/><Cell N='Width' V='1' U='IN' F='User.DefaultWidth'/><Cell N='Height' V='0.75' U='IN' F='User.ResizeTxtHeight'/><Cell N='LocPinX' V='0.5' U='IN' F='Width*0.5'/><Cell N='LocPinY' V='0.375' U='IN' F='Height*0.5'/><Cell N='Angle' V='0'/><Cell N='FlipX' V='0'/><Cell N='FlipY' V='0'/><Cell N='ResizeMode' V='0'/><Cell N='LockGroup' V='1'/><Cell N='LockCalcWH' V='1'/><Cell N='ObjType' V='1'/><Cell N='LayerMember' V='0'/><Section N='Connection'><Row T='Connection' IX='0'><Cell N='X' V='0' U='IN' F='Width*0'/><Cell N='Y' V='0.375' U='IN' F='Height*0.5'/></Row><Row T='Connection' IX='1'><Cell N='X' V='0.5' U='IN' F='Width*0.5'/><Cell N='Y' V='0.75' U='IN' F='Height*1'/></Row><Row T='Connection' IX='2'><Cell N='X' V='1' U='IN' F='Width*1'/><Cell N='Y' V='0.375' U='IN' F='Height*0.5'/></Row><Row T='Connection' IX='3'><Cell N='X' V='0.5' U='IN' F='Width*0.5'/><Cell N='Y' V='0' U='IN' F='Height*0'/></Row></Section><Shapes><Shape ID='6' Type='Shape' LineStyle='7' FillStyle='7' TextStyle='7'><Cell N='PinX' V='0.5' U='IN' F='Sheet.5!Width*0.5'/><Cell N='PinY' V='0.375' U='IN' F='Sheet.5!Height*0.5'/><Cell N='Width' V='1' U='IN' F='Sheet.5!Width*1'/><Cell N='Height' V='0.75' U='IN' F='Sheet.5!Height*1'/><Cell N='LocPinX' V='0.5' U='IN' F='Width*0.5'/><Cell N='LocPinY' V='0.375' U='IN' F='Height*0.5'/><Cell N='Angle' V='0'/><Cell N='FlipX' V='0'/><Cell N='FlipY' V='0'/><Cell N='ResizeMode' V='0'/><Cell N='LayerMember' V='0'/><Cell N='Rounding' V='0.08' U='IN' F='GUARD(0.08IN)'/><Section N='Geometry' IX='0'><Cell N='NoFill' V='0'/><Cell N='NoLine' V='0'/><Row T='MoveTo' IX='1'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row><Row T='LineTo' IX='2'><Cell N='X' V='1' U='IN' F='Width'/></Row><Row T='LineTo' IX='3'><Cell N='X' V='1' U='IN' F='Width'/><Cell N='Y' V='0.75' U='IN' F='Height'/></Row><Row T='LineTo' IX='4'><Cell N='X' V='0'/><Cell N='Y' V='0.75' U='IN' F='Height'/></Row><Row T='LineTo' IX='5'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row></Section></Shape></Shapes></Shape></Shapes></MasterContents>`;

const _MASTER2_XML = `<?xml version='1.0' encoding='utf-8' ?><MasterContents xmlns='http://schemas.microsoft.com/office/visio/2012/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xml:space='preserve'><Shapes><Shape ID='5' OriginalID='0' Type='Shape' LineStyle='8' FillStyle='8' TextStyle='8'><Cell N='PinX' V='1.771653543307087' F='GUARD((BeginX+EndX)/2)'/><Cell N='PinY' V='1.771653543307087' F='GUARD((BeginY+EndY)/2)'/><Cell N='Width' V='1.181102362204724' F='GUARD(EndX-BeginX)'/><Cell N='Height' V='-1.181102362204724' F='GUARD(EndY-BeginY)'/><Cell N='LocPinX' V='0.5905511811023622' F='GUARD(Width*0.5)'/><Cell N='LocPinY' V='-0.5905511811023622' F='GUARD(Height*0.5)'/><Cell N='Angle' V='0' F='GUARD(0DA)'/><Cell N='FlipX' V='0' F='GUARD(FALSE)'/><Cell N='FlipY' V='0' F='GUARD(FALSE)'/><Cell N='ResizeMode' V='0'/><Cell N='BeginX' V='1.181102362204724'/><Cell N='BeginY' V='2.362204724409449'/><Cell N='EndX' V='2.362204724409449'/><Cell N='EndY' V='1.181102362204724'/><Cell N='TxtPinX' V='0' F='SETATREF(Controls.TextPosition)'/><Cell N='TxtPinY' V='-1.181102362204724' F='SETATREF(Controls.TextPosition.Y)'/><Cell N='TxtWidth' V='0.5555555555555556' F='MAX(TEXTWIDTH(TheText),5*Char.Size)'/><Cell N='TxtHeight' V='0.2444444444444444' F='TEXTHEIGHT(TheText,TxtWidth)'/><Cell N='TxtLocPinX' V='0.2777777777777778' F='TxtWidth*0.5'/><Cell N='TxtLocPinY' V='0.1222222222222222' F='TxtHeight*0.5'/><Cell N='TxtAngle' V='0'/><Cell N='LockHeight' V='1'/><Cell N='LockCalcWH' V='1'/><Cell N='HelpTopic' V='Vis_SE.chm!#20000'/><Cell N='Copyright' V='Copyright 2001 Microsoft Corporation.  All rights reserved.'/><Cell N='NoAlignBox' V='1'/><Cell N='DynFeedback' V='2'/><Cell N='GlueType' V='2'/><Cell N='ObjType' V='2'/><Cell N='NoLiveDynamics' V='1'/><Cell N='ShapeSplittable' V='1'/><Cell N='LayerMember' V='0'/><Section N='Control'><Row N='TextPosition'><Cell N='X' V='0'/><Cell N='Y' V='-1.181102362204724'/><Cell N='XDyn' V='0' F='Controls.TextPosition'/><Cell N='YDyn' V='-1.181102362204724' F='Controls.TextPosition.Y'/><Cell N='XCon' V='5' F='IF(OR(STRSAME(SHAPETEXT(TheText),""),HideText),5,0)'/><Cell N='YCon' V='0'/><Cell N='CanGlue' V='0'/><Cell N='Prompt' V='Reposition Text'/></Row></Section><Section N='Geometry' IX='0'><Cell N='NoFill' V='1'/><Cell N='NoLine' V='0'/><Cell N='NoShow' V='0'/><Cell N='NoSnap' V='0'/><Cell N='NoQuickDrag' V='0'/><Row T='MoveTo' IX='1'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row><Row T='LineTo' IX='2'><Cell N='X' V='0'/><Cell N='Y' V='-1.181102362204724'/></Row><Row T='LineTo' IX='3'><Cell N='X' V='1.181102362204724'/><Cell N='Y' V='-1.181102362204724'/></Row></Section></Shape></Shapes></MasterContents>`;

const _MASTER3_XML = `<?xml version='1.0' encoding='utf-8' ?><MasterContents xmlns='http://schemas.microsoft.com/office/visio/2012/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships' xml:space='preserve'><Shapes><Shape ID='5' OriginalID='0' Type='Shape' LineStyle='8' FillStyle='8' TextStyle='8'><Cell N='PinX' V='1.771653543307087' F='GUARD((BeginX+EndX)/2)'/><Cell N='PinY' V='1.771653543307087' F='GUARD((BeginY+EndY)/2)'/><Cell N='Width' V='1.181102362204724' F='GUARD(EndX-BeginX)'/><Cell N='Height' V='-1.181102362204724' F='GUARD(EndY-BeginY)'/><Cell N='LocPinX' V='0.5905511811023622' F='GUARD(Width*0.5)'/><Cell N='LocPinY' V='-0.5905511811023622' F='GUARD(Height*0.5)'/><Cell N='Angle' V='0' F='GUARD(0DA)'/><Cell N='FlipX' V='0' F='GUARD(FALSE)'/><Cell N='FlipY' V='0' F='GUARD(FALSE)'/><Cell N='ResizeMode' V='0'/><Cell N='BeginX' V='1.181102362204724'/><Cell N='BeginY' V='2.362204724409449'/><Cell N='EndX' V='2.362204724409449'/><Cell N='EndY' V='1.181102362204724'/><Cell N='TxtPinX' V='0' F='SETATREF(Controls.TextPosition)'/><Cell N='TxtPinY' V='-1.181102362204724' F='SETATREF(Controls.TextPosition.Y)'/><Cell N='TxtWidth' V='0.5555555555555556' F='MAX(TEXTWIDTH(TheText),5*Char.Size)'/><Cell N='TxtHeight' V='0.2444444444444444' F='TEXTHEIGHT(TheText,TxtWidth)'/><Cell N='TxtLocPinX' V='0.2777777777777778' F='TxtWidth*0.5'/><Cell N='TxtLocPinY' V='0.1222222222222222' F='TxtHeight*0.5'/><Cell N='TxtAngle' V='0'/><Cell N='LockHeight' V='1'/><Cell N='LockCalcWH' V='1'/><Cell N='HelpTopic' V='Vis_SE.chm!#20000'/><Cell N='Copyright' V='Copyright 2001 Microsoft Corporation.  All rights reserved.'/><Cell N='NoAlignBox' V='1'/><Cell N='DynFeedback' V='2'/><Cell N='GlueType' V='2'/><Cell N='ObjType' V='2'/><Cell N='NoLiveDynamics' V='1'/><Cell N='LangID' V='en-US' F='Inh'/><Cell N='ShapeSplittable' V='1'/><Cell N='LayerMember' V='0'/><Section N='Control'><Row N='TextPosition'><Cell N='X' V='0'/><Cell N='Y' V='-1.181102362204724'/><Cell N='XDyn' V='0' F='Controls.TextPosition'/><Cell N='YDyn' V='-1.181102362204724' F='Controls.TextPosition.Y'/><Cell N='XCon' V='5' F='IF(OR(STRSAME(SHAPETEXT(TheText),""),HideText),5,0)'/><Cell N='YCon' V='0'/><Cell N='CanGlue' V='0'/><Cell N='Prompt' V='Reposition Text'/></Row></Section><Section N='Geometry' IX='0'><Cell N='NoFill' V='1'/><Cell N='NoLine' V='0'/><Cell N='NoShow' V='0'/><Cell N='NoSnap' V='0'/><Cell N='NoQuickDrag' V='0'/><Row T='MoveTo' IX='1'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row><Row T='LineTo' IX='2'><Cell N='X' V='0'/><Cell N='Y' V='-1.181102362204724'/></Row><Row T='LineTo' IX='3'><Cell N='X' V='1.181102362204724'/><Cell N='Y' V='-1.181102362204724'/></Row></Section></Shape></Shapes></MasterContents>`;

const _THEME_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FEFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="156082"/></a:accent1><a:accent2><a:srgbClr val="61CBF4"/></a:accent2><a:accent3><a:srgbClr val="0B76A0"/></a:accent3><a:accent4><a:srgbClr val="96DCF8"/></a:accent4><a:accent5><a:srgbClr val="E97132"/></a:accent5><a:accent6><a:srgbClr val="4EA72E"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="sq" cmpd="sng"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="9525" cap="sq" cmpd="sng"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="9525" cap="sq" cmpd="sng"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;

async function exportToDrawio() {
  const els  = editor.elements.filter(e => !e._subprocess);
  const arrs = editor.arrows.filter(a => !a._subprocess);

  function esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  const _r = v => Math.round(v * 10000) / 10000;

  const PAGE_H_PX = 2000, DPI = 96;
  const PAGE_H_IN = PAGE_H_PX / DPI;
  const px = v => v / DPI;
  const flipY = y => PAGE_H_IN - px(y);

  const portTotalsMap = {};
  arrs.forEach(a => {
    const sk = `${a.start}:${a.startDir}`, ek = `${a.end}:${a.endDir}`;
    portTotalsMap[sk] = (portTotalsMap[sk] || 0) + 1;
    portTotalsMap[ek] = (portTotalsMap[ek] || 0) + 1;
  });

  function portPos(el, dir, portIndex, portTotal) {
    const hw = el.type === 'process' ? 90 : (el.type === 'decision-x' || el.type === 'decision-plus') ? 50 : el.type === 'system_action' ? 65 : 20;
    const hh = el.type === 'process' ? 30 : (el.type === 'decision-x' || el.type === 'decision-plus') ? 50 : el.type === 'system_action' ? 25 : 20;
    const n = portTotal || 1, i = portIndex || 0;
    const off = n <= 1 ? 0 : (i - (n - 1) / 2) * 14;
    if (dir === 'right')  return { x: px(el.x + hw), y: flipY(el.y + off) };
    if (dir === 'left')   return { x: px(el.x - hw), y: flipY(el.y + off) };
    if (dir === 'top')    return { x: px(el.x + off), y: flipY(el.y - hh) };
    if (dir === 'bottom') return { x: px(el.x + off), y: flipY(el.y + hh) };
    return { x: px(el.x), y: flipY(el.y) };
  }

  function elGeo(el) {
    const hw = el.type === 'process' ? 90 : (el.type === 'decision-x' || el.type === 'decision-plus') ? 50 : el.type === 'system_action' ? 65 : 20;
    const hh = el.type === 'process' ? 30 : (el.type === 'decision-x' || el.type === 'decision-plus') ? 50 : el.type === 'system_action' ? 25 : 20;
    return { x: px(el.x - hw), y: flipY(el.y + hh), w: px(hw * 2), h: px(hh * 2) };
  }

  function shapeXml(el, idx) {
    const g = elGeo(el);
    let geom = '';
    if (el.type === 'decision-x' || el.type === 'decision-plus') {
      geom = `<Section N="Geometry" IX="0"><Cell N="NoFill" V="0"/><Cell N="NoLine" V="0"/><Row T="MoveTo" IX="1"><Cell N="X" V="${_r(g.w/2)}"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="2"><Cell N="X" V="${_r(g.w)}"/><Cell N="Y" V="${_r(g.h/2)}"/></Row><Row T="LineTo" IX="3"><Cell N="X" V="${_r(g.w/2)}"/><Cell N="Y" V="${_r(g.h)}"/></Row><Row T="LineTo" IX="4"><Cell N="X" V="0"/><Cell N="Y" V="${_r(g.h/2)}"/></Row><Row T="LineTo" IX="5"><Cell N="X" V="${_r(g.w/2)}"/><Cell N="Y" V="0"/></Row></Section>`;
    } else if (el.type === 'system_action') {
      const sk = _r(g.w * 0.15);
      geom = `<Section N="Geometry" IX="0"><Cell N="NoFill" V="0"/><Cell N="NoLine" V="0"/><Row T="MoveTo" IX="1"><Cell N="X" V="${sk}"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="2"><Cell N="X" V="${_r(g.w)}"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="3"><Cell N="X" V="${_r(g.w-sk)}"/><Cell N="Y" V="${_r(g.h)}"/></Row><Row T="LineTo" IX="4"><Cell N="X" V="0"/><Cell N="Y" V="${_r(g.h)}"/></Row><Row T="LineTo" IX="5"><Cell N="X" V="${sk}"/><Cell N="Y" V="0"/></Row></Section>`;
    } else if (el.type === 'start' || el.type === 'end') {
      geom = `<Section N="Geometry" IX="0"><Cell N="NoFill" V="0"/><Cell N="NoLine" V="0"/><Row T="Ellipse" IX="1"><Cell N="X" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="Y" V="${_r(g.h/2)}" F="Height*0.5"/><Cell N="A" V="${_r(g.w)}" F="Width*1"/><Cell N="B" V="${_r(g.h/2)}" F="Height*0.5"/><Cell N="C" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="D" V="${_r(g.h)}" F="Height*1"/></Row></Section>`;
    } else {
      geom = `<Section N="Geometry" IX="0"><Cell N="NoFill" V="0"/><Cell N="NoLine" V="0"/><Row T="MoveTo" IX="1"><Cell N="X" V="0"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="2"><Cell N="X" V="${_r(g.w)}"/><Cell N="Y" V="0"/></Row><Row T="LineTo" IX="3"><Cell N="X" V="${_r(g.w)}"/><Cell N="Y" V="${_r(g.h)}"/></Row><Row T="LineTo" IX="4"><Cell N="X" V="0"/><Cell N="Y" V="${_r(g.h)}"/></Row><Row T="LineTo" IX="5"><Cell N="X" V="0"/><Cell N="Y" V="0"/></Row></Section>`;
    }
    const rounding = el.type === 'process' ? '<Cell N="Rounding" V="0.05"/>' : '';
    const lw = el.type === 'end' ? '0.04' : '0.02';
    return `<Shape ID="${idx+2}" NameU="Shape.${idx+2}" Type="Shape">
  <Cell N="PinX" V="${_r(g.x+g.w/2)}"/><Cell N="PinY" V="${_r(g.y+g.h/2)}"/>
  <Cell N="Width" V="${_r(g.w)}"/><Cell N="Height" V="${_r(g.h)}"/>
  <Cell N="LocPinX" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="LocPinY" V="${_r(g.h/2)}" F="Height*0.5"/>
  <Cell N="Angle" V="0"/><Cell N="FlipX" V="0"/><Cell N="FlipY" V="0"/><Cell N="ResizeMode" V="0"/>
  <Cell N="FillForegnd" V="#f5f5f5"/><Cell N="FillBkgnd" V="#f5f5f5"/>
  <Cell N="LineWeight" V="${lw}"/><Cell N="LineColor" V="#222222"/><Cell N="LinePattern" V="1"/>
  ${rounding}
  <Cell N="TxtPinX" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="TxtPinY" V="${_r(g.h/2)}" F="Height*0.5"/>
  <Cell N="TxtWidth" V="${_r(g.w)}" F="Width*1"/><Cell N="TxtHeight" V="${_r(g.h)}" F="Height*1"/>
  <Cell N="TxtLocPinX" V="${_r(g.w/2)}" F="TxtWidth*0.5"/><Cell N="TxtLocPinY" V="${_r(g.h/2)}" F="TxtHeight*0.5"/>
  <Section N="Character" IX="0"><Row IX="0"><Cell N="Font" V="0"/><Cell N="Size" V="0.1111"/><Cell N="Color" V="#111111"/></Row></Section>
  <Section N="Paragraph" IX="0"><Row IX="0"><Cell N="HorzAlign" V="1"/></Row></Section>
  <Text>${esc(el.title)}</Text>
  <Section N="Connection" IX="0">
    <Row T="Connection" IX="0"><Cell N="X" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="Y" V="0"/></Row>
    <Row T="Connection" IX="1"><Cell N="X" V="${_r(g.w)}"/><Cell N="Y" V="${_r(g.h/2)}" F="Height*0.5"/></Row>
    <Row T="Connection" IX="2"><Cell N="X" V="${_r(g.w/2)}" F="Width*0.5"/><Cell N="Y" V="${_r(g.h)}" F="Height*1"/></Row>
    <Row T="Connection" IX="3"><Cell N="X" V="0"/><Cell N="Y" V="${_r(g.h/2)}" F="Height*0.5"/></Row>
  </Section>
  ${geom}
</Shape>`;
  }

  // Connector master ID=4 = Dynamic connector (rId2 -> master2.xml) from td2
  const CONN_MASTER = 4;

  function connXml(arrow, idx) {
    const src = els.find(e => e.id === arrow.start);
    const tgt = els.find(e => e.id === arrow.end);
    if (!src || !tgt) return '';
    const sp = portPos(src, arrow.startDir, arrow.startPortIndex, portTotalsMap[`${arrow.start}:${arrow.startDir}`]);
    const ep = portPos(tgt, arrow.endDir,   arrow.endPortIndex,   portTotalsMap[`${arrow.end}:${arrow.endDir}`]);
    let pts;
    if (arrow.waypoints && arrow.waypoints.length) {
      pts = [sp, ...arrow.waypoints.map(wp => ({ x: px(wp.x), y: flipY(wp.y) })), ep];
    } else {
      const OFF = px(30), sd = arrow.startDir, ed = arrow.endDir;
      const isH = d => d === 'left' || d === 'right';
      const os = sd === 'right' ? {x:sp.x+OFF,y:sp.y} : sd === 'left' ? {x:sp.x-OFF,y:sp.y} : sd === 'top' ? {x:sp.x,y:sp.y+OFF} : {x:sp.x,y:sp.y-OFF};
      const oe = ed === 'right' ? {x:ep.x+OFF,y:ep.y} : ed === 'left' ? {x:ep.x-OFF,y:ep.y} : ed === 'top' ? {x:ep.x,y:ep.y+OFF} : {x:ep.x,y:ep.y-OFF};
      const mid = [];
      if (isH(sd) && isH(ed))       { const mx=(os.x+oe.x)/2; mid.push({x:mx,y:os.y},{x:mx,y:oe.y}); }
      else if (!isH(sd) && !isH(ed)){ const my=(os.y+oe.y)/2; mid.push({x:os.x,y:my},{x:oe.x,y:my}); }
      else if (isH(sd))              { mid.push({x:oe.x,y:os.y}); }
      else                           { mid.push({x:os.x,y:oe.y}); }
      pts = [sp, os, ...mid, oe, ep];
    }
    const allX = pts.map(p=>p.x), allY = pts.map(p=>p.y);
    const minX = Math.min(...allX), maxX = Math.max(...allX);
    const minY = Math.min(...allY), maxY = Math.max(...allY);
    const w = Math.max(maxX-minX, 0.02), h = Math.max(maxY-minY, 0.02);
    const rows = pts.map((p,i) => `    <Row T="${i===0?'MoveTo':'LineTo'}" IX="${i+1}"><Cell N="X" V="${_r(p.x-minX)}"/><Cell N="Y" V="${_r(p.y-minY)}"/></Row>`).join('\n');
    return `<Shape ID="${idx+2}" NameU="Connector.${idx+2}" Type="Shape" Master="${CONN_MASTER}">
  <Cell N="PinX" V="${_r((minX+maxX)/2)}"/><Cell N="PinY" V="${_r((minY+maxY)/2)}"/>
  <Cell N="Width" V="${_r(w)}"/><Cell N="Height" V="${_r(h)}"/>
  <Cell N="LocPinX" V="${_r(w/2)}"/><Cell N="LocPinY" V="${_r(h/2)}"/>
  <Cell N="BeginX" V="${_r(sp.x)}"/><Cell N="BeginY" V="${_r(sp.y)}"/>
  <Cell N="EndX" V="${_r(ep.x)}"/><Cell N="EndY" V="${_r(ep.y)}"/>
  <Cell N="ObjType" V="2"/><Cell N="ConFixedCode" V="3"/>
  <Cell N="LineWeight" V="0.02"/><Cell N="LineColor" V="#000000"/><Cell N="LinePattern" V="1"/>
  <Cell N="EndArrow" V="4"/><Cell N="EndArrowSize" V="2"/>
  <Section N="Character" IX="0"><Row IX="0"><Cell N="Font" V="0"/><Cell N="Size" V="${_r(7/72)}"/><Cell N="Color" V="#000000"/></Row></Section>
  <Text>${esc(arrow.label || '')}</Text>
  <Section N="Geometry" IX="0"><Cell N="NoFill" V="1"/><Cell N="NoLine" V="0"/>
${rows}
  </Section>
</Shape>`;
  }

  const shapeXmls = els.map((el,i) => shapeXml(el,i)).join('\n');
  const connXmls  = arrs.map((a,i) => connXml(a, els.length+i)).filter(Boolean).join('\n');

  const NS      = 'xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const RELS_NS = 'xmlns="http://schemas.openxmlformats.org/package/2006/relationships"';
  const pageW   = _r(PAGE_H_PX / DPI * 1.5);
  const pageH   = _r(PAGE_H_PX / DPI);
  const now     = new Date().toISOString();

  const zip = new JSZip();

  zip.file('[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/>` +
    `<Override PartName="/visio/masters/masters.xml" ContentType="application/vnd.ms-visio.masters+xml"/>` +
    `<Override PartName="/visio/masters/master1.xml" ContentType="application/vnd.ms-visio.master+xml"/>` +
    `<Override PartName="/visio/masters/master2.xml" ContentType="application/vnd.ms-visio.master+xml"/>` +
    `<Override PartName="/visio/masters/master3.xml" ContentType="application/vnd.ms-visio.master+xml"/>` +
    `<Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.ms-visio.pages+xml"/>` +
    `<Override PartName="/visio/pages/page1.xml" ContentType="application/vnd.ms-visio.page+xml"/>` +
    `<Override PartName="/visio/windows.xml" ContentType="application/vnd.ms-visio.windows+xml"/>` +
    `<Override PartName="/visio/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>` +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `<Override PartName="/docProps/custom.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/>` +
    `</Types>`);

  zip.file('_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships ${RELS_NS}>` +
    `<Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>` +
    `<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties" Target="docProps/custom.xml"/>` +
    `</Relationships>`);

  zip.file('visio/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<VisioDocument ${NS}><DocumentProperties><Creator>Diagram Generator</Creator></DocumentProperties>` +
    `<DocumentSettings/><Colors/>` +
    `<FaceNames><FaceName ID="0" Name="Calibri" UnicodeRanges="-1 -1 0 0" CharSets="536871423 0" Panos="2 15 5 2 2 2 4 3 2 4"/></FaceNames>` +
    `<StyleSheets><StyleSheet ID="0" NameU="Normal" Name="Normal">` +
    `<Cell N="LineWeight" V="0.01"/><Cell N="LineColor" V="#333333"/>` +
    `<Cell N="FillForegnd" V="#f5f5f5"/><Cell N="CharFont" V="0"/><Cell N="TxtHeight" V="0.1111"/>` +
    `</StyleSheet></StyleSheets></VisioDocument>`);

  zip.file('visio/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships ${RELS_NS}>` +
    `<Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/masters" Target="masters/masters.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.microsoft.com/visio/2010/relationships/pages" Target="pages/pages.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.microsoft.com/visio/2010/relationships/windows" Target="windows.xml"/>` +
    `<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>` +
    `</Relationships>`);

  zip.file('visio/masters/masters.xml', _MASTERS_XML);
  zip.file('visio/masters/_rels/masters.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships ${RELS_NS}>` +
    `<Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/master" Target="master1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.microsoft.com/visio/2010/relationships/master" Target="master2.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.microsoft.com/visio/2010/relationships/master" Target="master3.xml"/>` +
    `</Relationships>`);
  zip.file('visio/masters/master1.xml', _MASTER1_XML);
  zip.file('visio/masters/master2.xml', _MASTER2_XML);
  zip.file('visio/masters/master3.xml', _MASTER3_XML);

  zip.file('visio/theme/theme1.xml', _THEME_XML);

  zip.file('visio/pages/pages.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Pages ${NS}><Page ID="0" NameU="Page-1" Name="Page-1">` +
    `<PageSheet><Cell N="PageWidth" V="${pageW}"/><Cell N="PageHeight" V="${pageH}"/>` +
    `<Cell N="DrawingScale" V="1"/><Cell N="PageScale" V="1"/></PageSheet>` +
    `<Rel r:id="rId1"/></Page></Pages>`);

  zip.file('visio/pages/_rels/pages.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships ${RELS_NS}>` +
    `<Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page1.xml"/>` +
    `</Relationships>`);

  zip.file('visio/pages/page1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<PageContents ${NS} xml:space="preserve"><Shapes>${shapeXmls}${connXmls}</Shapes></PageContents>`);

  zip.file('visio/pages/_rels/page1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships ${RELS_NS}/>`);

  zip.file('visio/windows.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Windows xmlns="http://schemas.microsoft.com/office/visio/2012/main">` +
    `<Window ID="0" WindowType="Drawing" WindowState="1073741824" WindowLeft="0" WindowTop="0" WindowWidth="1024" WindowHeight="768">` +
    `<StencilGroup/><StencilGroupPos/>` +
    `<ShowRulers>1</ShowRulers><ShowGrid>1</ShowGrid><ShowPageBreaks>0</ShowPageBreaks>` +
    `<ShowGuides>1</ShowGuides><ShowConnectionPoints>1</ShowConnectionPoints>` +
    `<GlueSettings>9</GlueSettings><SnapSettings>65847</SnapSettings>` +
    `<SnapExtensions>34</SnapExtensions><DynamicGridEnabled>1</DynamicGridEnabled>` +
    `<TabSplitterPos>0.5</TabSplitterPos></Window></Windows>`);

  zip.file('docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">` +
    `<Application>Microsoft Visio</Application></Properties>`);

  zip.file('docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title></dc:title><dc:subject></dc:subject><dc:creator></dc:creator><cp:keywords></cp:keywords>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>` +
    `<dc:language>en-US</dc:language></cp:coreProperties>`);

  zip.file('docProps/custom.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">` +
    `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="_VPID_ALTERNATENAMES"><vt:lpwstr></vt:lpwstr></property>` +
    `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="3" name="BuildNumberCreated"><vt:i4>1075203341</vt:i4></property>` +
    `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="4" name="BuildNumberEdited"><vt:i4>1075203341</vt:i4></property>` +
    `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="5" name="IsMetric"><vt:bool>true</vt:bool></property>` +
    `</Properties>`);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.ms-visio.drawing' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'diagram.vsdx'; a.click();
  URL.revokeObjectURL(url);
}
