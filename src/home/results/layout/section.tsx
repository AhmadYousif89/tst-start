import { SessionSummary } from "../summary"
import { SessionStatistics } from "../statistics"
import { SessionChart } from "@/components/chart"

export const ResultSection = () => {
  return (
    <section className="grid gap-6 py-4 md:gap-8 md:py-6">
      <SessionSummary />
      <div>
        <div className="h-50">
          <SessionChart />
        </div>
        <SessionStatistics />
      </div>
    </section>
  )
}
