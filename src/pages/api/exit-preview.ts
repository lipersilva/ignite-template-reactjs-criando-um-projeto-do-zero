
export default async function exit(_, res) {
  // Exit the current user from "Preview Mode". This function accepts no args.
  res.clearPreviewData()

  res.writeHead(307, { Location: "/"})
  res.end()
}