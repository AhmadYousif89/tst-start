import { ObjectId } from "mongodb"

import connectToDB from "@/lib/db"
import { TextDoc } from "@/lib/types"
import { createServerFn } from "@tanstack/react-start"
import { TextCategory, TextLanguage } from "@/home/context/engine.types"

type ParsedLang = {
  lang: TextLanguage
  cat: TextCategory
}
const parseLanguage = (langStr: TextLanguage): ParsedLang => {
  const [lang, cat = "general"] = langStr.split(":")
  return { lang, cat } as ParsedLang
}

export const getInitialText = createServerFn().handler(async () => {
  try {
    const { db } = await connectToDB()
    const textDocs = await db.collection<TextDoc>("texts").findOne({
      language: "en",
      category: "general",
    })

    const data = textDocs ? { ...textDocs, _id: textDocs._id.toString() } : null
    return data
  } catch (error) {
    console.error("Error fetching text data:", error)
    return null
  }
})

export const getRandomText = createServerFn()
  .inputValidator(({ id, language }: { id: string; language: TextLanguage }) => ({
    id,
    language,
  }))
  .handler(async ({ data }) => {
    console.log("SERVER: FETCHING RANDOM TEXT")
    const { id, language } = data
    const { lang, cat } = parseLanguage(language)
    try {
      const { db } = await connectToDB()
      const textDocs = await db
        .collection<TextDoc>("texts")
        .find({
          _id: { $ne: new ObjectId(id) },
          language: lang,
          category: cat,
        })
        .project({ _id: 1 })
        .toArray()

      if (textDocs.length === 0) return null

      const randomIndex = Math.floor(Math.random() * textDocs.length)
      const randomId = textDocs[randomIndex]._id

      const randomText = await db.collection<TextDoc>("texts").findOne({ _id: randomId })

      const data = randomText ? { ...randomText, _id: randomText._id.toString() } : null
      return data
    } catch (error) {
      console.error("Error fetching random text data:", error)
      return null
    }
  })

export const getNextText = createServerFn()
  .inputValidator(({ id, lang }: { id: string; lang: TextDoc["language"] }) => ({
    id,
    lang,
  }))
  .handler(async ({ data }) => {
    const { id, lang } = data
    try {
      const { db } = await connectToDB()
      const texts = await db
        .collection<TextDoc>("texts")
        .find({ language: lang }, { projection: { _id: 1 } })
        .toArray()

      if (texts.length <= 1) return null

      const currentIndex = texts.findIndex((t) => t._id.toString() === id)
      const nextIndex = (currentIndex + 1) % texts.length
      const nextId = texts[nextIndex]._id

      const nextText = await db.collection<TextDoc>("texts").findOne({ _id: nextId })

      const data = nextText ? { ...nextText, _id: nextText._id.toString() } : null
      return data
    } catch (error) {
      console.error("Error fetching next text data:", error)
      return null
    }
  })
