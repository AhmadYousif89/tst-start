//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  printWidth: 90,
  trailingComma: "all",
  bracketSameLine: true,
  experimentalTernaries: true,
  singleAttributePerLine: true,
  plugins: ["prettier-plugin-tailwindcss"],
}

export default config
