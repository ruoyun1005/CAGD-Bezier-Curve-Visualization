import type { Vec2 } from '../math/vec2';

export function makeCtx(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!; //在畫布中取得畫筆
    function clear(){ 
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    };
    function grid(){
        ctx.save();
        ctx.globalAlpha = .35;
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#1d2448';
        for(let x = 0; x <= canvas.width; x += 50){
            ctx.beginPath(); 
            ctx.moveTo(x,0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for(let y = 0; y <= canvas.height; y += 50){
            ctx.beginPath(); 
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }
    function polyline(points: Vec2[], width = 3, color = '#7aa2ff'){
        if(!points.length) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
            ctx.lineWidth = width; 
            ctx.strokeStyle = color; 
            ctx.stroke();
    }
    function points(pts: Vec2[], r = 2.2, color = '#7aa2ff'){
        ctx.fillStyle = color;
        for (const p of pts){ 
            ctx.beginPath();
            ctx.arc(p.x,p.y,r,0,Math.PI*2); 
            ctx.fill();
        }
    }
    function circle(p: Vec2, r: number, color = '#6ee7b7') {
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle = color; ctx.fill();
  }

  return { ctx, clear, grid, polyline, points, circle};
}   