import type { Vec2 } from './vec2';

export function quadBezier(p0: Vec2, p1: Vec2, p2: Vec2, t: number): Vec2 {
  const mt = 1 - t;
  return {
    x: mt*mt*p0.x + 2*mt*t*p1.x + t*t*p2.x,
    y: mt*mt*p0.y + 2*mt*t*p1.y + t*t*p2.y,
  };
}