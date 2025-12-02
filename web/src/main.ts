import '../styles.css';
import { BezierEditor } from './modes/bezier_editor';
import { PenTool } from './modes/pen_tool';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const pen = new PenTool(canvas);
const countEl = document.getElementById('count')!;

//const bezier = new BezierEditor(canvas);

function updateCount(n: number) {
    countEl.textContent = `點數：${n}`;
}
// 工具列
document.getElementById('mode-add')!.addEventListener('click', ()=> pen.setMode('add'));
document.getElementById('mode-edit')!.addEventListener('click',()=> pen.setMode('edit'));
document.getElementById('undo')!.addEventListener('click',     ()=> pen.undo());
document.getElementById('clear')!.addEventListener('click',    ()=> pen.clear());

const toggleBtn = document.getElementById('toggle-controls')!;
toggleBtn.addEventListener('click', ()=> {
  pen.toggleControls();
  toggleBtn.textContent = (toggleBtn.textContent === 'HIDE HANDLES')
    ? 'SHOW HANDLES' : 'HIDE HANDLES';
}
);
function fitCanvasToCSS(canvas: HTMLCanvasElement, redraw: () => void) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width  * dpr);
  const h = Math.round(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    redraw(); // 重新畫一次
  }
}

// 初次與視窗改變時同步
fitCanvasToCSS(canvas,() => pen.redraw());
window.addEventListener('resize', () => fitCanvasToCSS(canvas,() => pen.redraw()));