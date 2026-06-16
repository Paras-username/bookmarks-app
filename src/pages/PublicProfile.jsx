import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PublicProfile() {
  const { handle } = useParams()

  const [profile, setProfile] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true)
      setNotFound(false)
      setProfile(null)
      setBookmarks([])

      // Fetch profile by handle (only need id)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle)
        .single()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Fetch public bookmarks for this user
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('id, title, url, created_at')
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (bookmarkError) {
        console.error('Error fetching bookmarks:', bookmarkError)
      }

      setBookmarks(bookmarkData ?? [])
      setLoading(false)
    }

    if (handle) {
      fetchPublicProfile()
    }
  }, [handle])

  if (loading) {
    return (
      <div className="public-page">
        <p className="public-loading">Loading...</p>
        <style>{publicStyles}</style>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="public-page">
        <div className="public-card public-empty">
          <h1>User not found</h1>
          <p>No profile exists for @{handle}.</p>
        </div>
        <style>{publicStyles}</style>
      </div>
    )
  }

  return (
    <div className="public-page">
      <header className="public-header">
        <h1>@{handle}</h1>
        <p className="public-subtitle">Public bookmarks</p>
      </header>

      <main className="public-card">
        {bookmarks.length === 0 ? (
          <p className="public-empty-message">No public bookmarks yet.</p>
        ) : (
          <ul className="public-bookmark-list">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id} className="public-bookmark-item">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="public-bookmark-link"
                >
                  {bookmark.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>

      <style>{publicStyles}</style>
    </div>
  )
}

const publicStyles = `
  .public-page {
    min-height: 100vh;
    background: #f4f4f5;
    padding: 2rem 1.5rem;
    box-sizing: border-box;
  }

  .public-loading {
    text-align: center;
    color: #71717a;
    margin-top: 4rem;
  }

  .public-header {
    max-width: 640px;
    margin: 0 auto 1.5rem;
    text-align: center;
  }

  .public-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #18181b;
  }

  .public-subtitle {
    margin: 0.5rem 0 0;
    color: #71717a;
    font-size: 0.9375rem;
  }

  .public-card {
    max-width: 640px;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .public-empty {
    text-align: center;
    padding: 2.5rem 1.5rem;
  }

  .public-empty h1 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    color: #18181b;
  }

  .public-empty p {
    margin: 0;
    color: #71717a;
  }

  .public-empty-message {
    margin: 0;
    text-align: center;
    color: #71717a;
    font-size: 0.9375rem;
    padding: 1rem 0;
  }

  .public-bookmark-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .public-bookmark-item {
    padding: 0.875rem 1rem;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    background: #fafafa;
    transition: background 0.15s, border-color 0.15s;
  }

  .public-bookmark-item:hover {
    background: #f4f4f5;
    border-color: #d4d4d8;
  }

  .public-bookmark-link {
    color: #6366f1;
    font-weight: 500;
    text-decoration: none;
    font-size: 1rem;
  }

  .public-bookmark-link:hover {
    text-decoration: underline;
  }
`