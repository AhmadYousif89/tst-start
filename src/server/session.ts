import { ObjectId } from "mongodb"

import connectToDB from "@/lib/db"
import { KeystrokeDoc, TypingSessionDoc } from "@/lib/types"
import { createServerFn } from "@tanstack/react-start"

async function getBaselineRound(session: TypingSessionDoc) {
  if (!session) return null
  try {
    const { db } = await connectToDB()
    return await db.collection("typing_sessions").countDocuments({
      anonUserId: session.anonUserId,
      finishedAt: { $lt: session.finishedAt },
      isInvalid: { $ne: true },
    })
  } catch (error) {
    console.error("Error fetching baseline session:", error)
    return null
  }
}

async function getBestRound(session: TypingSessionDoc) {
  if (!session) return null
  try {
    const { db } = await connectToDB()
    return await db.collection("typing_sessions").countDocuments({
      anonUserId: session.anonUserId,
      isInvalid: { $ne: true },
      $or: [
        { wpm: { $gt: session.wpm } },
        {
          wpm: session.wpm,
          accuracy: { $gt: session.accuracy },
        },
        {
          wpm: session.wpm,
          accuracy: session.accuracy,
          rawWpm: { $gt: session.rawWpm || 0 },
        },
        {
          wpm: session.wpm,
          accuracy: session.accuracy,
          rawWpm: session.rawWpm || 0,
          consistency: { $gt: session.consistency || 0 },
        },
        {
          wpm: session.wpm,
          accuracy: session.accuracy,
          rawWpm: session.rawWpm || 0,
          consistency: session.consistency || 0,
          finishedAt: { $gt: session.finishedAt },
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching best record:", error)
    return null
  }
}

export const getSession = createServerFn()
  .inputValidator((data: { sid: string | undefined }) => data)
  .handler(async ({ data }) => {
    const sessionId = data.sid
    try {
      const { db } = await connectToDB()
      const session = await db
        .collection<TypingSessionDoc>("typing_sessions")
        .findOne({ _id: new ObjectId(sessionId) })

      if (!session) return null

      const keystrokes = await db
        .collection<KeystrokeDoc>("keystrokes")
        .find({ sessionId: new ObjectId(sessionId) })
        .sort({ timestampMs: 1 })
        .toArray()

      const ks =
        keystrokes.length === 0 ?
          []
        : keystrokes.map((k) => ({
            ...k,
            _id: k._id.toString(),
            textId: k.textId.toString(),
            sessionId: k.sessionId.toString(),
          }))

      const isFirst = (await getBaselineRound(session)) === 0

      const isBest = !session.isInvalid && (await getBestRound(session)) === 0

      const validSessionsCount = await db.collection("typing_sessions").countDocuments({
        anonUserId: session.anonUserId,
        isInvalid: { $ne: true },
      })

      return {
        ...session,
        _id: session._id.toString(),
        textId: session.textId.toString(),
        keystrokes: ks,
        isFirst,
        isBest,
        validSessionsCount,
      }
    } catch (error) {
      console.error("Error fetching session:", error)
      return null
    }
  })
