import { createServerFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

import connectToDB from "@/lib/db"
import { AnonUserDoc } from "@/lib/types"

export const getAnonUser = createServerFn().handler(async () => {
  const anonUserId = getCookie("anonUserId")

  if (!anonUserId) return null

  try {
    const { db } = await connectToDB()
    const user = await db
      .collection<AnonUserDoc>("anonymous_users")
      .findOne({ anonUserId })

    if (!user) return null

    return {
      ...user,
      _id: user._id.toString(),
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
})

export const updateAnonUser = createServerFn()
  .inputValidator((data: AnonUserDoc["settings"]) => data)
  .handler(async ({ data }) => {
    const anonUserId = getCookie("anonUserId")

    if (!anonUserId) return null

    try {
      console.log("UPDATING USER SETTINGS")
      const { db } = await connectToDB()
      const col = db.collection<AnonUserDoc>("anonymous_users")

      const user = await col.findOneAndUpdate(
        { anonUserId },
        { $set: { settings: data, updatedAt: new Date() } },
        { returnDocument: "after" },
      )

      if (!user) return null

      return {
        ...user,
        _id: user._id.toString(),
      }
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  })

type SubmitSessionInput = {
  wpm: number
  accuracy: number
  isInvalid: boolean
}

export const submitSession = createServerFn()
  .inputValidator((data: SubmitSessionInput) => data)
  .handler(async ({ data }) => {
    const anonUserId = getCookie("anonUserId")

    if (!anonUserId || data.isInvalid) {
      return { isFirst: false, isBest: false }
    }

    try {
      const { db } = await connectToDB()
      const col = db.collection<AnonUserDoc>("anonymous_users")

      const existingUser = await col.findOne({ anonUserId })

      const isFirst = !existingUser || existingUser.totalSessions === 0
      const isBest = isFirst || data.wpm > (existingUser?.bestWpm ?? 0)

      await col.updateOne(
        { anonUserId },
        {
          $inc: { totalSessions: 1 },
          $max: { bestWpm: data.wpm, bestAccuracy: data.accuracy },
          $set: { updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date(), anonUserId },
        },
        { upsert: true },
      )

      const meta = { isFirst, isBest }
      return meta
    } catch (error) {
      console.error("Error submitting session:", error)
      return { isFirst: false, isBest: false }
    }
  })
