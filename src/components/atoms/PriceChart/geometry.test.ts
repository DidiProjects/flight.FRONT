import { describe, it, expect } from 'vitest'
import { areaPath, buildGeometry, linePath } from './geometry'

const W = 300
const H = 150

describe('buildGeometry', () => {
  it('uma série contínua vira um único traço', () => {
    const g = buildGeometry([100, 120, 90, 110], W, H)

    expect(g).not.toBeNull()
    expect(g!.runs).toHaveLength(1)
    expect(g!.runs[0]).toHaveLength(4)
  })

  it('buraco no meio quebra a linha em dois traços', () => {
    const g = buildGeometry([100, 120, null, null, 90, 110], W, H)

    // Two runs, not one line crossing the hole: the gap is buckets nobody
    // measured, and joining them would draw a trend that never happened.
    expect(g!.runs).toHaveLength(2)
    expect(g!.runs[0].map((p) => p.v)).toEqual([100, 120])
    expect(g!.runs[1].map((p) => p.v)).toEqual([90, 110])
  })

  it('o buraco não desloca o eixo: os pontos guardam o índice original', () => {
    const g = buildGeometry([100, null, 90], W, H)

    // The last point belongs to index 2 of the input; if the gap collapsed the
    // axis it would land on 1 and the tooltip would name the wrong bucket.
    expect(g!.lastPoint.i).toBe(2)
    expect(g!.points[1]).toBeNull()
  })

  it('série achatada corre pelo meio, não pela borda de cima', () => {
    const g = buildGeometry([500, 500, 500], W, H)

    const ys = g!.runs[0].map((p) => p.y)
    expect(new Set(ys).size).toBe(1)
    // Zero span normalises to the bottom of the box, which reads as a crash.
    // Halfway down is the honest picture of a price that did not move.
    expect(ys[0]).toBeCloseTo(14 + (H - 14 - 18) / 2, 5)
  })

  it('o menor ponto é o mínimo medido, não o último', () => {
    const g = buildGeometry([300, 100, 250], W, H)

    expect(g!.minPoint.v).toBe(100)
    expect(g!.lastPoint.v).toBe(250)
    expect(g!.min).toBe(100)
    expect(g!.max).toBe(300)
  })

  it('menos de dois pontos medidos não vira gráfico', () => {
    expect(buildGeometry([100], W, H)).toBeNull()
    expect(buildGeometry([null, 100, null], W, H)).toBeNull()
    expect(buildGeometry([], W, H)).toBeNull()
  })

  it('sem largura medida não há geometria — o container ainda não montou', () => {
    expect(buildGeometry([100, 200], 0, H)).toBeNull()
  })

  it('a área fecha na base, e um ponto sozinho não tem área', () => {
    const g = buildGeometry([100, 200, null, 150], W, H)

    const closed = areaPath(g!.runs[0], g!.baseline)
    expect(closed.startsWith('M')).toBe(true)
    expect(closed.endsWith('Z')).toBe(true)
    expect(closed).toContain(`${g!.baseline} Z`)

    // The lone point after the gap draws a dot, not a sliver of fill.
    expect(g!.runs[1]).toHaveLength(1)
    expect(areaPath(g!.runs[1], g!.baseline)).toBe('')
  })

  it('a linha começa com M e segue com L', () => {
    const g = buildGeometry([100, 200, 150], W, H)

    const d = linePath(g!.runs[0])
    expect(d.match(/M/g)).toHaveLength(1)
    expect(d.match(/L/g)).toHaveLength(2)
  })
})

/**
 * Escala compartilhada entre curvas.
 *
 * Cada companhia é desenhada com geometria própria. Sem uma escala comum, duas
 * curvas normalizadas separadamente ficam sobrepostas mesmo com preços muito
 * diferentes — o gráfico mostraria empate onde há o dobro.
 */
describe('buildGeometry com escala compartilhada', () => {
  const W = 300
  const H = 150

  it('sem `scaleWith`, duas séries de preços diferentes desenham no mesmo lugar', () => {
    const barata = buildGeometry([100, 200], W, H)!
    const cara   = buildGeometry([1000, 2000], W, H)!
    expect(cara.points[0]!.y).toBeCloseTo(barata.points[0]!.y, 5)
  })

  it('com `scaleWith`, a curva cara fica acima da barata', () => {
    const todos = [100, 200, 1000, 2000]
    const barata = buildGeometry([100, 200], W, H, todos)!
    const cara   = buildGeometry([1000, 2000], W, H, todos)!
    // y menor = mais alto no SVG, e preço maior tem de ficar mais alto.
    expect(cara.points[0]!.y).toBeLessThan(barata.points[0]!.y)
    expect(cara.min).toBe(100)
    expect(cara.max).toBe(2000)
  })

  it('`scaleWith` vazio preserva o comportamento de série única', () => {
    const sem  = buildGeometry([100, 200, 150], W, H)!
    const com  = buildGeometry([100, 200, 150], W, H, [])!
    expect(com.points.map((p) => p?.y)).toEqual(sem.points.map((p) => p?.y))
  })
})
