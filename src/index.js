import {fromEvent} from 'rxjs'
import {map, pairwise, startWith, switchMap, takeUntil, withLatestFrom} from "rxjs/operators";

const cnv = document.getElementById('canvas')
const ctx = cnv.getContext('2d')

const rect = cnv.getBoundingClientRect()
const scale = window.devicePixelRatio || 1

cnv.width = rect.width * scale
cnv.height = rect.height * scale
ctx.scale(scale, scale)

const rangePicker = document.getElementById('rangePicker')
const colorPicker = document.getElementById('colorPicker')

const mouseDown$ = fromEvent(cnv, 'mousedown')
const mouseUp$ = fromEvent(cnv, 'mouseup')
const mouseMove$ = fromEvent(cnv, 'mousemove')
const mouseOut$ = fromEvent(cnv, 'mouseout')

function createInputStream(node) {
  return fromEvent(node, 'input').pipe(map(e => e.target.value), startWith(node.value))
}

const lineWidth$ = createInputStream(rangePicker)
const strokeStyle$ = createInputStream(colorPicker)

const stream$ = mouseDown$.pipe(
  withLatestFrom(lineWidth$, strokeStyle$, (_, lineWidth, strokeStyle) => ({lineWidth, strokeStyle})),
  switchMap(options => mouseMove$.pipe(
    map(e => ({ x: e.offsetX, y: e.offsetY, options })),
    pairwise(),
    takeUntil(mouseUp$),
    takeUntil(mouseOut$)
  )),
)

stream$.subscribe(([from,to]) => {
  const {lineWidth, strokeStyle} = from.options

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = strokeStyle
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
})