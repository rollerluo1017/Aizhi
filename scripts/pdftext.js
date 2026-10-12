// 爱智：从 PDF 中提取指定页的文字，供 /aizhi:read 使用。
// 只用 macOS 自带的 PDFKit 和 Vision，不需要安装任何依赖。
// 有文字层的页直接取文字；扫描页先渲染成图片，再做文字识别（OCR）。
//
// 用法：
//   osascript -l JavaScript pdftext.js info <pdf>
//   osascript -l JavaScript pdftext.js text <pdf> <起始PDF页> <结束PDF页> <缓存目录>
//   osascript -l JavaScript pdftext.js image <pdf> <PDF页> <输出.png>
//
// info 输出总页数、是否有文字层，以及书页标签与 PDF 页码的对照样本。
// text 把每页写入 <缓存目录>/p0001.txt 这样的文件，已有的页不重复处理，
// 最后打印这些文件的路径。页边的标准页码（如〔192〕、A42、B59）会接在
// 与它对齐的正文行前面，写成【边码 〔192〕】。

ObjC.import('PDFKit');
ObjC.import('AppKit');
ObjC.import('Vision');

const RENDER_HEIGHT = 2400;
const MARGIN_X = 0.13; // 左右两侧这一比例以内的短行视为页边

function openDoc(path) {
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(path));
  if (!doc || doc.isNil()) throw new Error('无法打开 PDF：' + path);
  return doc;
}

function pageLabel(page) {
  const l = ObjC.unwrap(page.label);
  return l === undefined || l === null ? '' : String(l);
}

function textLayer(page) {
  const s = ObjC.unwrap(page.string);
  return s && s.replace(/\s/g, '').length > 20 ? s : null;
}

function renderPNG(page, outPath) {
  const b = page.boundsForBox(0);
  const scale = RENDER_HEIGHT / b.size.height;
  const img = page.thumbnailOfSizeForBox($.NSMakeSize(b.size.width * scale, RENDER_HEIGHT), 0);
  const rep = $.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation);
  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  png.writeToFileAtomically(outPath, true);
}

function ocr(pngPath) {
  const req = $.VNRecognizeTextRequest.alloc.init;
  req.recognitionLevel = 0; // accurate
  req.recognitionLanguages = $(['zh-Hans', 'zh-Hant', 'en-US', 'de-DE']);
  req.usesLanguageCorrection = true;
  const handler = $.VNImageRequestHandler.alloc.initWithURLOptions($.NSURL.fileURLWithPath(pngPath), $());
  if (!handler.performRequestsError($([req]), Ref())) throw new Error('OCR 失败：' + pngPath);
  const out = [];
  const rs = req.results;
  for (let i = 0; i < rs.count; i++) {
    const o = rs.objectAtIndex(i);
    const bb = o.boundingBox;
    out.push({
      x: bb.origin.x,
      right: bb.origin.x + bb.size.width,
      y: 1 - bb.origin.y - bb.size.height / 2, // 行中心，从页顶算起
      text: ObjC.unwrap(o.topCandidates(1).objectAtIndex(0).string),
    });
  }
  return out;
}

// 把页边的短行（边码）挂到与它高度最接近的正文行前面。
function layout(lines) {
  const bracketed = /^[〔（(\[［【]\s*[A-Za-z]?\s*\d+\s*[〕）)\]］】]$/;
  const isMargin = (l) =>
    ((l.right < MARGIN_X || l.x > 1 - MARGIN_X) && l.text.length <= 12) ||
    bracketed.test(l.text.trim());
  const body = lines.filter((l) => !isMargin(l)).sort((a, b) => a.y - b.y);
  const margin = lines.filter(isMargin);
  for (const m of margin) {
    let best = null;
    for (const l of body) if (!best || Math.abs(l.y - m.y) < Math.abs(best.y - m.y)) best = l;
    if (best) best.text = `【边码 ${m.text}】` + best.text;
    else body.push(m);
  }
  return body.map((l) => l.text).join('\n');
}

function write(path, s) {
  $.NSString.alloc.initWithUTF8String(s).writeToFileAtomicallyEncodingError(path, true, $.NSUTF8StringEncoding, null);
}

function exists(path) {
  return $.NSFileManager.defaultManager.fileExistsAtPath(path);
}

function info(pdf) {
  const doc = openDoc(pdf);
  const n = doc.pageCount;
  const samples = [];
  for (const i of [1, 5, 10, 20, Math.floor(n / 2), n]) {
    if (i >= 1 && i <= n) samples.push(`  PDF 第 ${i} 页 → 标签 "${pageLabel(doc.pageAtIndex(i - 1))}"`);
  }
  let withText = 0;
  const probe = [Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4)].filter((i) => i >= 1);
  for (const i of probe) if (textLayer(doc.pageAtIndex(i - 1))) withText++;
  return [
    `总页数：${n}`,
    `文字层：${withText === probe.length ? '有' : withText === 0 ? '无（扫描版，需要 OCR）' : '部分页有'}`,
    '页码标签样本：',
    ...samples,
  ].join('\n');
}

function text(pdf, from, to, dir) {
  const doc = openDoc(pdf);
  const n = doc.pageCount;
  from = Math.max(1, from);
  to = Math.min(n, to);
  if (to - from > 30) throw new Error('一次最多处理 31 页');
  $.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(dir, true, $(), null);
  const paths = [];
  for (let i = from; i <= to; i++) {
    const out = `${dir}/p${String(i).padStart(4, '0')}.txt`;
    paths.push(out);
    if (exists(out)) continue;
    const page = doc.pageAtIndex(i - 1);
    let body = textLayer(page);
    let source = '文字层';
    if (!body) {
      const png = `${dir}/.render.png`;
      renderPNG(page, png);
      body = layout(ocr(png));
      $.NSFileManager.defaultManager.removeItemAtPathError(png, null);
      source = 'OCR，可能有错字，尤其是脚注';
    }
    write(out, `# PDF 第 ${i} 页｜页码标签 ${pageLabel(page) || '无'}｜来源：${source}\n\n${body}\n`);
  }
  return paths.join('\n');
}

function image(pdf, pageNo, outPath) {
  const doc = openDoc(pdf);
  if (pageNo < 1 || pageNo > doc.pageCount) throw new Error('页码超出范围');
  renderPNG(doc.pageAtIndex(pageNo - 1), outPath);
  return outPath;
}

function run(argv) {
  const [cmd, pdf, ...rest] = argv;
  if (cmd === 'info' && pdf) return info(pdf);
  if (cmd === 'text' && pdf && rest.length === 3) return text(pdf, parseInt(rest[0]), parseInt(rest[1]), rest[2]);
  if (cmd === 'image' && pdf && rest.length === 2) return image(pdf, parseInt(rest[0]), rest[1]);
  return '用法：\n  pdftext.js info <pdf>\n  pdftext.js text <pdf> <起始页> <结束页> <缓存目录>\n  pdftext.js image <pdf> <页> <输出.png>';
}
