import { Image } from "@unpic/react"

import Star2 from "/assets/images/pattern-star-2.svg"
import { CompletedIcon, NewRecordIcon } from "../icons/header.icons"

type Props = {
  isNewRecord?: boolean
  isInvalid?: boolean
  subTitle: string
  title: string
}

export const ResultHeader = ({
  isNewRecord = false,
  isInvalid = false,
  subTitle,
  title,
}: Props) => {
  return (
    <header className="relative flex flex-col items-center justify-center gap-6 md:gap-8">
      {isNewRecord ?
        <NewRecordIcon />
      : <>
            {!isInvalid && !isNewRecord && (
              <Image
                src={Star2}
                alt="Star Pattern"
                width={40}
                height={40}
                className="absolute top-1/4 left-4 size-6 md:size-8"
              />
            )}
            <CompletedIcon isInvalid={isInvalid} />
          </>
      }
      <div className="mt-4 flex flex-col gap-2.5 text-center md:mt-6">
        <h1 className="text-1-mobile md:text-1 text-foreground">{title}</h1>
        <p className="text-muted-foreground text-5 md:text-3">{subTitle}</p>
      </div>
    </header>
  )
}
