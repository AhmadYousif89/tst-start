import { HEATMAP_COLORS } from "./constants"

export const HeatmapLegend = ({ buckets }: { buckets: number[] }) => {
  return (
    <div className="text-6 flex items-center overflow-hidden rounded-full font-mono">
      {HEATMAP_COLORS.map((color, i) => (
        <div
          key={i}
          className="text-background cursor-default px-1 py-0.5 font-mono sm:px-2"
          style={{ backgroundColor: color }}>
          {i === 0 ?
            `<${buckets[1]}`
          : i === 4 ?
            `${buckets[4]}+`
          : `${buckets[i]}-${buckets[i + 1]}`}
        </div>
      ))}
    </div>
  )
}
