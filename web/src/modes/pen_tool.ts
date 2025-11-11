import { Vec2, add, sub, mul, dist, dist2, len2, norm, clamp } from '../math/vec2';

import { makeCtx } from '../render/canvas';


// 錨點的資料型別：點 + 把手(入/出) + 路徑資料
type Anchor = {
  p: Vec2;          // 錨點
  in: Vec2;         // 入把手
  out: Vec2;        // 出把手
  smooth: boolean;  // 平滑：兩把手共線  當兩個把手共線且對稱時
};
type Mode = 'add' | 'edit'; // 設定兩個模式：新增跟編輯
//命中測試的資料型別：
type Hit =
  | { kind: 'anchor'; index: number }
  | { kind: 'in';     index: number }
  | { kind: 'out';    index: number }
  | null;

// ──────────────────────────────────────────────────────────────
export class PenTool {
  private path: Anchor[] = [];
  private closed = false;
  private mode: Mode = 'add';//預設新增模式

  private dragging: Hit = null;
  private last: Vec2 = {x:0,y:0};
  private shift = false;

  constructor(private canvas: HTMLCanvasElement) {
    this.bindInput();
    this.draw();
  }

  // UI API（外部呼叫）
  setMode(m: Mode) { this.mode = m; this.draw(); }
  toggleClosed() { 
    // 至少 3 個錨點才封閉    
    if (this.path.length >= 3) { 
        this.closed = !this.closed;
        this.draw();
        } 
    }
  clear() { this.path = []; this.closed = false; this.draw(); }
  undo() { 
    if (this.path.length > 0) {
        this.path.pop();
        if (this.path.length < 3) this.closed = false;
        this.draw();
    }
  }

  // 事件
  private bindInput() {
    window.addEventListener('keydown', e=>{ if(e.key==='Shift') this.shift=true; });
    window.addEventListener('keyup',   e=>{ if(e.key==='Shift') this.shift=false; });

    this.canvas.addEventListener('contextmenu', e=> e.preventDefault());

    this.canvas.addEventListener('pointerdown', (e)=>{
      const p = this.pos(e);
      if (this.mode==='add') {
        // 新增模式：若點到既有點就當編輯；否則插入錨點
        const hit = this.hitTest(p);
        //先判斷有沒有可形成封閉
        if(hit && hit.kind == 'anchor' && hit.index === 0 && this.path.length >=3){
            this.closed = true;
            this.mode = 'edit';
            this.draw();
            return;
        }
        
        if (hit) {
            this.dragging = hit;
        } else {
            this.addAnchor(p);
        }
      } else {
        // 編輯模式：尋找命中（錨點/把手）
        this.dragging = this.hitTest(p);
      }
      this.last = p;
      this.canvas.setPointerCapture(e.pointerId);
      this.draw();
    });

    this.canvas.addEventListener('pointermove', (e)=>{
      if (!this.dragging) return;
      const p = this.pos(e as PointerEvent);
      const dx = p.x - this.last.x, dy = p.y - this.last.y;
      this.last = p;

      if (this.dragging.kind === 'anchor') {
        const a = this.path[this.dragging.index];
        a.p = { x: a.p.x+dx, y: a.p.y+dy };
        a.in = { x: a.in.x, y: a.in.y };
        a.out= { x: a.out.x, y: a.out.y };
      } else if (this.dragging.kind === 'in') {
        const a = this.path[this.dragging.index];
        a.in = { x: a.in.x+dx, y: a.in.y+dy };
        if (a.smooth) { // 平滑：另一側對稱
          a.out = { x: -a.in.x, y: -a.in.y };
        }
      } else if (this.dragging.kind === 'out') {
        const a = this.path[this.dragging.index];
        a.out = { x: a.out.x+dx, y: a.out.y+dy };
        if (a.smooth) {
          a.in = { x: -a.out.x, y: -a.out.y };
        }
      }
      this.draw();
    });

    this.canvas.addEventListener('pointerup', (e)=>{
      this.dragging = null;
      this.canvas.releasePointerCapture(e.pointerId);
    });

    // 雙擊：空白處→結束新增；錨點上→切換平滑/尖角
    this.canvas.addEventListener('dblclick', (e)=>{
      const p = this.pos(e as PointerEvent);
      const hit = this.hitTest(p);
      if (hit && hit.kind==='anchor') {
        const a = this.path[hit.index];
        a.smooth = !a.smooth;
        if (a.smooth) {
          // 轉平滑：把 in/out 調成共線、等長（取較長者）
          const len = Math.max(len2(a.in), len2(a.out)) ** 0.5 || 40;
          const dir = norm(add(a.out, mul(a.in,-1))); // 近似方向
          a.out = mul(dir, len);
          a.in  = mul(dir,-len);
        }
        this.draw();
      } else {
        // 空白雙擊：切換到編輯模式
        this.mode = 'edit';
      }
    }, { passive:true });
  }

  // ─ 新增錨點（自動產生把手）
  private addAnchor(p: Vec2) {
    if (this.path.length === 0) {
      this.path.push({ p, in:{x:-40,y:0}, out:{x:40,y:0}, smooth:true });
    } else {
      const prev = this.path[this.path.length-1];
      const dir = norm(sub(p, prev.p));
      const len = clamp(dist(prev.p, p)*0.3, 30, 120);
      const a: Anchor = {
        p,
        in: mul(dir, -len),
        out: mul(dir,  len),
        smooth: true,
      };
      // 若前一點是平滑，讓它的 out 與方向對齊
      if (prev.smooth) prev.out = mul(dir, len);
      this.path.push(a);
    }
  }

  // ─ 命中測試
  private hitTest(p: Vec2): Hit {
    const R2a = 9*9;   // 錨點半徑（像素^2）
    const R2h = 7*7;   // 把手半徑
    for (let i=this.path.length-1; i>=0; i--) { // 後面的優先
      const a = this.path[i];
      if (dist2(p, a.p) <= R2a) return { kind:'anchor', index:i };
      const inAbs  = add(a.p, a.in);
      const outAbs = add(a.p, a.out);
      if (dist2(p, inAbs)  <= R2h) return { kind:'in',  index:i };
      if (dist2(p, outAbs) <= R2h) return { kind:'out', index:i };
    }
    return null;
  }

  // ─ 繪圖（把手線、錨點、路徑）
  private draw() {
    const g = makeCtx(this.canvas);
    const ctx = g.ctx;

    g.clear(); g.grid();

    //控制線
    ctx.lineWidth = 1.5;
    for (const a of this.path) {
      const inAbs  = add(a.p, a.in);
      const outAbs = add(a.p, a.out);
      ctx.strokeStyle = '#fca5a5';
      ctx.beginPath(); ctx.moveTo(a.p.x, a.p.y); ctx.lineTo(inAbs.x, inAbs.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a.p.x, a.p.y); ctx.lineTo(outAbs.x,outAbs.y); ctx.stroke();

      //控制的點點
       g.circle(inAbs,  5, '#ffd6a5');
       g.circle(outAbs, 5, '#ffd6a5');
    }

    // path (cubic segments)
    if (this.path.length >= 2) {
      ctx.lineWidth = 3; ctx.strokeStyle = '#7aa2ff';
      ctx.beginPath();
      ctx.moveTo(this.path[0].p.x, this.path[0].p.y);
      for (let i=0; i<this.path.length-1; i++) {
        const a = this.path[i];
        const b = this.path[i+1];
        const c1 = add(a.p, a.out);
        const c2 = add(b.p, b.in);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.p.x, b.p.y);
      }
      // 封閉曲線
      if (this.closed && this.path.length>2) {
        const last = this.path[this.path.length-1];
        const first= this.path[0];
        const c1 = { x: last.p.x  + last.out.x,  y: last.p.y  + last.out.y  };
        const c2 = { x: first.p.x + first.in.x,  y: first.p.y + first.in.y  }; 
        ctx.bezierCurveTo(c1.x,c1.y, c2.x,c2.y, first.p.x, first.p.y);
      }
      ctx.stroke();
      if (this.closed) {
        ctx.fillStyle = '#9aa3c7';
        ctx.font = '12px ui-sans-serif,system-ui';
        ctx.fillText('（已封閉路徑）', 12, 32);
        }
    }
      

    // anchors
    for (const a of this.path) g.circle(a.p, 7, '#6ee7b7');

    // mode hint
    ctx.fillStyle = '#9aa3c7';
    ctx.font = '12px ui-sans-serif,system-ui';
    ctx.fillText(`模式：${this.mode==='add'?'新增錨點':'編輯'}` , 12, 18);
    if (this.closed) ctx.fillText('（已關閉路徑）', 100, 18);
  }
  public redraw(){
        this.draw();
    }
      

  // 工具：座標、向量
  private pos(e: PointerEvent): Vec2 {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (this.canvas.width  / r.width),
      y: (e.clientY - r.top)  * (this.canvas.height / r.height),
    };
  }

}

