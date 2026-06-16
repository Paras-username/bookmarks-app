import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const [handle, setHandle] = useState('')
  const [handleSaving, setHandleSaving] = useState(false)
  const [handleMessage, setHandleMessage] = useState('')

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [addingBookmark, setAddingBookmark] = useState(false)
  const [bookmarkError, setBookmarkError] = useState('')

  const [bookmarks, setBookmarks] = useState([])
  const [bookmarksLoading, setBookmarksLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  const fetchProfile = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('handle')
      .eq('id', user.id)
      .single()

    if (!error && data?.handle) {
      setHandle(data.handle)
    }
  }, [user])

  const fetchBookmarks = useCallback(async () => {
    if (!user) return

    setBookmarksLoading(true)

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setBookmarks(data ?? [])
    }

    setBookmarksLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchBookmarks()
    }
  }, [user, fetchProfile, fetchBookmarks])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleUpdateHandle = async (e) => {
    e.preventDefault()
    setHandleMessage('')
    setHandleSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ handle: handle.trim() })
      .eq('id', user.id)

    if (error) {
      setHandleMessage(error.message)
    } else {
      setHandleMessage('Handle updated successfully.')
    }

    setHandleSaving(false)
  }

  const handleAddBookmark = async (e) => {
    e.preventDefault()
    setBookmarkError('')
    setAddingBookmark(true)

    const { error } = await supabase.from('bookmarks').insert({
      user_id: user.id,
      title: title.trim(),
      url: url.trim(),
      is_public: isPublic,
    })

    if (error) {
      setBookmarkError(error.message)
      setAddingBookmark(false)
      return
    }

    setTitle('')
    setUrl('')
    setIsPublic(false)
    setAddingBookmark(false)
    fetchBookmarks()
  }

  const handleTogglePublic = async (bookmark) => {
    const { error } = await supabase
      .from('bookmarks')
      .update({ is_public: !bookmark.is_public })
      .eq('id', bookmark.id)

    if (!error) {
      fetchBookmarks()
    }
  }

  const handleDeleteBookmark = async (bookmarkId) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)

    if (!error) {
      fetchBookmarks()
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-loading">Loading…</p>
        <style>{dashboardStyles}</style>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">{user.email}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card">
          <h2>Your @handle</h2>
          <p className="section-desc">Claim or update your public handle.</p>

          <form className="inline-form" onSubmit={handleUpdateHandle}>
            <div className="handle-input-wrap">
              <span className="handle-prefix">@</span>
              <input
                className="dashboard-input handle-input"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="yourhandle"
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={handleSaving}>
              {handleSaving ? 'Saving…' : 'Save handle'}
            </button>
          </form>

          {handleMessage && (
            <p
              className={
                handleMessage.includes('success')
                  ? 'message-success'
                  : 'message-error'
              }
            >
              {handleMessage}
            </p>
          )}
        </section>

        {/* ✅ NEW: Your Public Profile Section */}
        {handle && (
          <section className="dashboard-card">
            <h2>Your Public Profile</h2>
            <p className="section-desc">
              Share your public bookmarks with anyone:
            </p>
            <div className="profile-link-container">
              <a 
                href={`/${handle}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="profile-link"
              >
                {window.location.origin}/{handle}
              </a>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${handle}`)
                  alert('Profile link copied to clipboard!')
                }}
              >
                Copy Link
              </button>
            </div>
          </section>
        )}

        <section className="dashboard-card">
          <h2>Add bookmark</h2>

          <form className="bookmark-form" onSubmit={handleAddBookmark}>
            {bookmarkError && <p className="message-error">{bookmarkError}</p>}

            <label className="form-label">
              Title
              <input
                className="dashboard-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="form-label">
              URL
              <input
                className="dashboard-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={addingBookmark}
            >
              {addingBookmark ? 'Adding…' : 'Add bookmark'}
            </button>
          </form>
        </section>

        <section className="dashboard-card">
          <h2>Your bookmarks</h2>

          {bookmarksLoading ? (
            <p className="section-desc">Loading bookmarks…</p>
          ) : bookmarks.length === 0 ? (
            <p className="section-desc">No bookmarks yet. Add one above.</p>
          ) : (
            <ul className="bookmark-list">
              {bookmarks.map((bookmark) => (
                <li key={bookmark.id} className="bookmark-item">
                  <div className="bookmark-info">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-title"
                    >
                      {bookmark.title}
                    </a>
                    <span
                      className={
                        bookmark.is_public ? 'badge badge-public' : 'badge badge-private'
                      }
                    >
                      {bookmark.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="bookmark-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => handleTogglePublic(bookmark)}
                    >
                      Make {bookmark.is_public ? 'private' : 'public'}
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <style>{dashboardStyles}</style>
    </div>
  )
}

const dashboardStyles = `
  .dashboard-page {
    min-height: 100vh;
    background: #f4f4f5;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .dashboard-loading {
    text-align: center;
    color: #71717a;
    margin-top: 4rem;
  }

  .dashboard-header {
    max-width: 720px;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 1.75rem;
  }

  .dashboard-subtitle {
    margin: 0.25rem 0 0;
    color: #71717a;
    font-size: 0.875rem;
  }

  .dashboard-main {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .dashboard-card {
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .dashboard-card h2 {
    margin: 0 0 0.25rem;
    font-size: 1.125rem;
  }

  .section-desc {
    margin: 0 0 1rem;
    color: #71717a;
    font-size: 0.875rem;
  }

  .inline-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .handle-input-wrap {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 200px;
  }

  .handle-prefix {
    padding: 0.625rem 0.75rem;
    background: #f4f4f5;
    border: 1px solid #d4d4d8;
    border-right: none;
    border-radius: 6px 0 0 6px;
    color: #71717a;
    font-weight: 500;
  }

  .handle-input {
    border-radius: 0 6px 6px 0 !important;
  }

  .bookmark-form {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .form-label {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .dashboard-input {
    padding: 0.625rem 0.75rem;
    border: 1px solid #d4d4d8;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .dashboard-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }

  .btn-primary {
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 6px;
    background: #6366f1;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary:hover:not(:disabled) {
    background: #4f46e5;
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 0.625rem 1rem;
    border: 1px solid #d4d4d8;
    border-radius: 6px;
    background: #fff;
    color: #3f3f46;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #f4f4f5;
  }

  .btn-danger {
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 6px;
    background: #ef4444;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .message-success {
    margin: 0.75rem 0 0;
    padding: 0.625rem 0.75rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    color: #15803d;
    font-size: 0.875rem;
  }

  .message-error {
    margin: 0;
    padding: 0.625rem 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #b91c1c;
    font-size: 0.875rem;
  }

  .bookmark-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .bookmark-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    background: #fafafa;
  }

  .bookmark-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
  }

  .bookmark-title {
    color: #6366f1;
    font-weight: 500;
    text-decoration: none;
  }

  .bookmark-title:hover {
    text-decoration: underline;
  }

  .badge {
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .badge-public {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .badge-private {
    background: #f4f4f5;
    color: #52525b;
  }

  .bookmark-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .profile-link-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f4f4f5;
    border-radius: 6px;
  }

  .profile-link {
    color: #6366f1;
    font-weight: 500;
    text-decoration: none;
    font-size: 0.9375rem;
    word-break: break-all;
  }

  .profile-link:hover {
    text-decoration: underline;
  }
`