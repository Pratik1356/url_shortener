import { useState, useEffect } from 'react'
import axios from "axios"

import './App.css'

const API_URL = "http://localhost:5173/api/url"
const SHORT_HOST = "localhost:3000"

const dummyUrls = [
  {
    _id: "1",
    originalUrl: "https://www.amazon.in/s?k=dancing+cactus&i=toys&s=exact-aware-popularity-rank",
    shortCode: "IUSJDF",
    clicks: 9
  },
  {
    _id: "2",
    originalUrl: "https://www.amazon.in/s?k=dancing+cactus&i=toys&s=exact-aware-popularity-rank",
    shortCode: "K2LMQ8",
    clicks: 5
  },
  {
    _id: "3",
    originalUrl: "https://www.amazon.in/s?k=dancing+cactus&i=toys&s=exact-aware-popularity-rank",
    shortCode: "P7XZ3A",
    clicks: 4
  },
]

/* ---------- small inline icons (no extra dependency) ---------- */

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

/* ---------- shared class strings ---------- */

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"

const iconButton =
  `inline-flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors cursor-pointer ${focusRing}`

function App() {

  const [ urls, setUrls ] = useState(dummyUrls)
  const [ inputValue, setInputValue ] = useState("")
  const [ currentUrl, setCurrentUrl ] = useState(null)
  const [ isCreating, setIsCreating ] = useState(false)
  const [ copiedCode, setCopiedCode ] = useState(null)
  const [ error, setError ] = useState("")

  async function fetchUrls() {
    try {
      const response = await axios.get(API_URL)
      const responseData = response.data

      setUrls(responseData.data.urls)
      console.log(responseData)
    } catch {
      setError("Couldn't load your links. Check that the server is running.")
    }
  }

  async function createShortUrl(e) {
    e.preventDefault()

    const trimmed = inputValue.trim()
    if (!trimmed) return

    setIsCreating(true)
    setError("")

    try {
      const response = await axios.post(API_URL, { url: trimmed })

      setCurrentUrl({
        originalUrl: response.data.data.originalUrl,
        shortCode: response.data.data.shortCode
      })
      setInputValue("")

      await fetchUrls()
    } catch {
      setError("Couldn't shorten that link. Check the URL and try again.")
    } finally {
      setIsCreating(false)
    }
  }

  async function deleteUrl(id) {
    await axios.delete(`${API_URL}/${id}`)

    fetchUrls()
  }

  async function copyShortUrl(shortCode) {
    try {
      await navigator.clipboard.writeText(`http://${SHORT_HOST}/${shortCode}`)
      setCopiedCode(shortCode)
      setTimeout(() => setCopiedCode(null), 1500)
    } catch {
      setError("Couldn't copy to the clipboard. Copy the link manually instead.")
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
  const maxClicks = Math.max(1, ...urls.map(url => url.clicks))

  return (
    <main className='min-h-screen bg-stone-50 text-stone-900 px-4 py-12 sm:py-20'>
      <div className='mx-auto w-full max-w-3xl flex flex-col gap-8'>

        {/* Header + form */}
        <section className='flex flex-col gap-5'>
          <div className='flex flex-col gap-1'>
            <h1 className='text-3xl sm:text-4xl font-bold tracking-tight'>Shorten a link</h1>
            <p className='text-stone-500'>Paste a long URL and get a short one you can share.</p>
          </div>

          <form
            onSubmit={createShortUrl}
            className='flex flex-col gap-2 sm:flex-row rounded-2xl border border-stone-200 bg-white p-2 shadow-sm focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 transition'
          >
            <input
              type="url"
              required
              placeholder='https://example.com/a-very-long-link'
              value={inputValue}
              aria-label='Long URL'
              className='min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-base placeholder:text-stone-400 focus:outline-none'
              onChange={(e) => { setInputValue(e.target.value) }}
            />
            <button
              type="submit"
              disabled={isCreating || !inputValue.trim()}
              className={`rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition-colors cursor-pointer hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-300 ${focusRing}`}
            >
              {isCreating ? "Shortening…" : "Shorten"}
            </button>
          </form>

          {error && (
            <p role="alert" className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
              {error}
            </p>
          )}

          {currentUrl && (
            <div className='flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-orange-900'>Your short link is ready</p>
                <a
                  href={`http://${SHORT_HOST}/${currentUrl.shortCode}`}
                  target='_blank'
                  rel='noreferrer'
                  className='block truncate font-mono text-lg font-semibold text-orange-700 hover:underline'
                >
                  {SHORT_HOST}/{currentUrl.shortCode}
                </a>
                <p className='truncate text-sm text-stone-500' title={currentUrl.originalUrl}>
                  {currentUrl.originalUrl}
                </p>
              </div>
              <button
                onClick={() => copyShortUrl(currentUrl.shortCode)}
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 transition-colors cursor-pointer hover:bg-orange-100 ${focusRing}`}
              >
                {copiedCode === currentUrl.shortCode ? <CheckIcon /> : <CopyIcon />}
                {copiedCode === currentUrl.shortCode ? "Copied" : "Copy link"}
              </button>
            </div>
          )}
        </section>

        {/* Links list */}
        <section className='flex flex-col gap-3'>
          <div className='flex items-baseline justify-between px-1'>
            <h2 className='text-lg font-semibold'>Your links</h2>
            {urls.length > 0 && (
              <p className='text-sm text-stone-500 tabular-nums'>
                {urls.length} {urls.length === 1 ? "link" : "links"}, {totalClicks} total clicks
              </p>
            )}
          </div>

          {urls.length === 0 ? (
            <div className='flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center text-stone-500'>
              <LinkIcon />
              <p className='font-medium text-stone-700'>No links yet</p>
              <p className='text-sm'>Shorten your first URL above and it will show up here.</p>
            </div>
          ) : (
            <ul className='flex flex-col gap-3'>
              {
                urls.map(url => {
                  const isCopied = copiedCode === url.shortCode

                  return (
                    <li
                      key={url._id}
                      className='flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-6'
                    >
                      <div className='min-w-0 flex-1'>
                        <a
                          href={`http://${SHORT_HOST}/${url.shortCode}`}
                          target='_blank'
                          rel='noreferrer'
                          className='font-mono font-semibold text-orange-700 hover:underline'
                        >
                          {SHORT_HOST}/{url.shortCode}
                        </a>
                        <p className='truncate text-sm text-stone-500' title={url.originalUrl}>
                          {url.originalUrl}
                        </p>
                      </div>

                      <div className='flex items-center justify-between gap-6 sm:justify-end'>
                        <div className='w-24'>
                          <p className='text-sm tabular-nums'>
                            <span className='font-semibold'>{url.clicks}</span>
                            <span className='text-stone-500'> {url.clicks === 1 ? "click" : "clicks"}</span>
                          </p>
                          <div className='mt-1.5 h-1 w-full rounded-full bg-stone-100' aria-hidden="true">
                            <div
                              className='h-full rounded-full bg-orange-500'
                              style={{ width: `${(url.clicks / maxClicks) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className='flex gap-1'>
                          <button
                            onClick={() => copyShortUrl(url.shortCode)}
                            aria-label={isCopied ? "Copied" : `Copy short link ${url.shortCode}`}
                            title={isCopied ? "Copied" : "Copy link"}
                            className={`${iconButton} hover:bg-stone-100 hover:text-stone-900 ${isCopied ? "text-green-600" : ""}`}
                          >
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                          </button>
                          <button
                            onClick={() => deleteUrl(url._id)}
                            aria-label={`Delete short link ${url.shortCode}`}
                            title="Delete link"
                            className={`${iconButton} hover:bg-red-50 hover:text-red-600`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })
              }
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}

export default App