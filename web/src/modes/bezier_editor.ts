import type { Vec2 } from '../math/vec2';
import { quadBezier } from '../math/bezier';
import { makeCtx } from '../render/canvas';

export class BezierEditor {
    private pts: Vec2[] = [ {x:300,y:500},{x:600,y:120},{x:900,y:500},];
    private samples : Vec2[] = []; // 顯示在曲線上的取樣點
    private dragging = -1; // 目前拖曳中的控制點索引
    private last : Vec2 = {x:0, y:0}; // 上一次滑鼠位置
    private shift = false; // 是否按著 Shift（限制水平/垂直移動）

    constructor(private canvas: HTMLCanvasElement){
        this.bindInput(); // 綁定鍵盤/滑鼠(指標)事件
        this.draw();
    }

    private bindInput(){
        // 追蹤 Shift 是否按住（用來水平/垂直鎖定）
        window.addEventListener('keydown', e=>{ if(e.key === 'Shift') this.shift = true; });
        window.addEventListener('keyup', e=>{ if(e.key === 'Shift' )this.shift = false; });
        this.canvas.addEventListener('contextmenu', e=>e.preventDefault());

        // ↓ 按下去
        this.canvas.addEventListener('pointerdown', (e)=>{
            if (e.button === 2) { this.clear(); return; }
            const p = this.pos(e);
            this.dragging = this.pick(p);
            if (this.dragging<0 && e.detail===2) { 
                this.pts[1] = p; this.draw(); return; 
            }
            this.last = p; this.canvas.setPointerCapture(e.pointerId);
        });
        
        this.canvas.addEventListener('pointermove', (e)=>{
        if (this.dragging<0) return;
        const p = this.pos(e);
        let dx = p.x - this.last.x, dy = p.y - this.last.y;
        if (this.shift) { Math.abs(dx)>Math.abs(dy)? dy=0 : dx=0; }
        const cur = this.pts[this.dragging];
        this.pts[this.dragging] = { x: cur.x + dx, y: cur.y + dy };
        this.last = p; this.draw();
        });
        this.canvas.addEventListener('pointerup', (e)=>{
        this.dragging=-1; this.canvas.releasePointerCapture(e.pointerId);
        });

    }
    clear() { this.samples = []; this.draw(); }
    reset() { 
        this.pts = [{x:300,y:500},{x:600,y:120},{x:900,y:500}]; 
        this.draw(); }

    private draw(){
        const g = makeCtx(this.canvas);
        g.clear(); g.grid();
        // curve
        // g.polyline(this.pts, 2, '#fca5a5');   // 控制多邊形（紅）
        
        const steps = 200, curve: Vec2[] = [];
        for (let i=0;i<steps;i++) {
        const t = i/(steps-1);
        curve.push(quadBezier(this.pts[0], this.pts[1], this.pts[2], t));
        }
        g.polyline(curve, 3, '#7aa2ff');

        // samples
        g.points(this.samples, 2.2, '#7aa2ff');
    }

    run200() {
    this.samples = [];
        for (let i=0;i<200;i++) {
        const t = i/199;
        this.samples.push(quadBezier(this.pts[0], this.pts[1], this.pts[2], t));
        }
        this.draw();
    }
    private pick(p: Vec2): number {
        for (let i=0;i<this.pts.length;i++) {
        const q = this.pts[i];
        const dx = q.x - p.x, dy = q.y - p.y;
        if (dx*dx + dy*dy < 12*12) return i;
        }
        return -1;
    }

    private pos(e: PointerEvent): Vec2 {
        const r = this.canvas.getBoundingClientRect();
        return { x: (e.clientX-r.left) * (this.canvas.width/r.width),
                y: (e.clientY-r.top)  * (this.canvas.height/r.height) };
    }

}

