import { useState, useRef, Fragment } from "react"
import { Volume2Icon, VolumeOffIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { useSound } from "@/home/context/sound.context"
import { SoundNames } from "@/home/context/sound.types"
import { useClickOutside } from "@/hooks/use-click-outside"

const soundOptions: { value: SoundNames; label: string }[] = [
  { value: "click", label: "Click" },
  { value: "beep", label: "Beep" },
  { value: "creamy", label: "Creamy" },
  { value: "hitmarker", label: "Hitmarker" },
  { value: "osu", label: "Osu" },
  { value: "pop", label: "Pop" },
  { value: "punch", label: "Punch" },
  { value: "rubber", label: "Rubber" },
  { value: "typewriter", label: "Typewriter" },
]

export const AudioControls = () => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const { soundName, volume, isMuted, playSound, setSoundName, setVolume, setIsMuted } =
    useSound()

  useClickOutside(sliderRef, () => setShowVolumeSlider(false), showVolumeSlider)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted && newVolume > 0) {
      setIsMuted(false)
    }
  }

  return (
    <div className="text-6 flex items-center gap-4">
      <span className="text-muted-foreground">Sound</span>
      <div className="flex items-center gap-2">
        <Select
          value={soundName}
          onValueChange={(val) => setSoundName(val as SoundNames)}>
          <SelectTrigger className="min-w-30.5 bg-blue-400 text-[white] *:text-[white] dark:bg-blue-600">
            <SelectValue placeholder="Sound" />
          </SelectTrigger>
          <SelectContent
            side="top"
            position="popper"
            className="duration-300 ease-out">
            <SelectGroup>
              {soundOptions.map(({ value, label }) => (
                <Fragment key={value}>
                  <SelectItem
                    value={value}
                    className="data-[state=on]:bg-blue-400 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600 dark:data-[state=on]:text-white">
                    {label}
                  </SelectItem>
                  <SelectSeparator className="bg-border my-1 h-px w-full last:hidden" />
                </Fragment>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div
          className="relative"
          ref={sliderRef}>
          <Toggle
            variant="outline"
            aria-label="Volume settings"
            pressed={showVolumeSlider || isMuted}
            onPressedChange={() => setShowVolumeSlider(!showVolumeSlider)}
            className="bg-accent dark:bg-input size-8 border-0 text-[white]! hover:bg-blue-400 dark:hover:bg-blue-600 dark:hover:text-[white]">
            {isMuted || volume === 0 ?
              <VolumeOffIcon />
            : <Volume2Icon />}
          </Toggle>

          {showVolumeSlider && (
            <div
              className="bg-background border-border animate-in fade-in slide-in-from-bottom-2 absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md border px-0 py-4 shadow-xl lg:mb-4"
              onPointerDown={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-center gap-3">
                <input
                  min="0"
                  max="1"
                  step="0.01"
                  type="range"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="bg-secondary h-28 w-1 cursor-pointer appearance-none rounded-full [direction:rtl] [writing-mode:vertical-lr]"
                />
                <div className="text-foreground text-6 w-10 text-center">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-8 border-transparent border-t-inherit" />
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          disabled={isMuted}
          onClick={() => playSound()}
          className="bg-accent dark:bg-input focus-visible:ring-ring! border-0 text-[white] hover:bg-blue-400 hover:text-[white] focus-visible:ring-offset-2 dark:hover:bg-blue-600 dark:hover:text-[white]">
          <span className="text-6">Play</span>
        </Button>
      </div>
    </div>
  )
}
