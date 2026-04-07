import { getAnonUser } from "@/server/user"
import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

export const PersonalBest = () => {
  const getAnonUserFn = useServerFn(getAnonUser)
  const { data, isLoading } = useQuery({
    queryKey: ["anon-user"],
    queryFn: () => getAnonUserFn(),
  })

  const bestWpm = data?.bestWpm || 0

  return (
    <div className="flex items-center gap-2.5">
      <svg
        className="not-dark:fill-orange fill-yellow size-5"
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="18"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 21 18">
        <path d="M19.406 2.25c.457 0 .844.387.844.844v1.969c0 1.265-.809 2.566-2.18 3.55-1.125.809-2.46 1.301-3.867 1.477-1.125 1.828-2.39 2.566-2.39 2.566v2.531H13.5c1.23 0 2.25.739 2.25 1.97v.421c0 .246-.21.422-.422.422H4.922a.406.406 0 0 1-.422-.422v-.422c0-1.23.984-1.968 2.25-1.968h1.688v-2.532s-1.301-.738-2.426-2.566c-1.407-.176-2.742-.668-3.867-1.477C.773 7.63 0 6.328 0 5.063v-1.97c0-.456.352-.843.844-.843H4.5V.844C4.5.387 4.852 0 5.344 0h9.562c.457 0 .844.387.844.844V2.25zM3.48 6.785c.422.317.915.563 1.477.774A12.7 12.7 0 0 1 4.5 4.5H2.25v.563c0 .421.352 1.125 1.23 1.722M18 5.062V4.5h-2.285a12.7 12.7 0 0 1-.457 3.059c.562-.211 1.055-.457 1.476-.774C17.367 6.363 18 5.66 18 5.062" />
      </svg>
      <p className="text-3-mobile md:text-4">
        <span className="dark:text-muted-foreground text-muted-foreground md:hidden">
          Best:
        </span>
        <span className="dark:text-muted-foreground text-muted-foreground hidden md:inline-block">
          Personal best:
        </span>
        <span className="inline-block min-w-20.5 text-center font-mono font-medium">
          {" "}
          {isLoading ? "--" : Math.round(bestWpm)} WPM
        </span>
      </p>
    </div>
  )
}
