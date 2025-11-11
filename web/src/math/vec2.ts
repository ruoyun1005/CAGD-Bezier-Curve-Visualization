export type Vec2 = { x: number; y:number };

export function add(a: Vec2, b:Vec2): Vec2 {
    return { x:a.x + b.x, y: a.y + b.y};
}
export function sub(a: Vec2, b:Vec2): Vec2 {
    return { x:a.x - b.x, y: a.y - b.y};
}
export function mul (a: Vec2, s: number): Vec2 {
    return { x: a.x * s, y: a.y * s };
}
export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function dist2 (a: Vec2, b: Vec2): number{
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx*dx + dy*dy;
};
export function len2 (a: Vec2): number {
    return a.x*a.x + a.y*a.y;
}
export function norm(a: Vec2): Vec2 {
  const L = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / L, y: a.y / L };
}
export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}