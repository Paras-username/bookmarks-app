import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const redirectTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)

    redirectTimeoutRef.current = setTimeout(() => {
      navigate('/login')
    }, 3000)
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Sign up</h1>

        {error && <p className="auth-error">{error}</p>}

        {success && (
          <p className="auth-success">
            Account created! Check your email for a confirmation link. Redirecting
            to login…
          </p>
        )}

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={success}
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
            disabled={success}
          />
        </label>

        <button
          className="auth-button"
          type="submit"
          disabled={submitting || success}
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #f4f4f5;
        }

        .auth-form {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .auth-form h1 {
          margin: 0 0 1.5rem;
          font-size: 1.5rem;
          text-align: center;
        }

        .auth-label {
          display: block;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .auth-input {
          display: block;
          width: 100%;
          margin-top: 0.375rem;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        .auth-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .auth-input:disabled {
          background: #f4f4f5;
          cursor: not-allowed;
        }

        .auth-button {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          background: #6366f1;
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
        }

        .auth-button:hover:not(:disabled) {
          background: #4f46e5;
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-error {
          margin: 0 0 1rem;
          padding: 0.625rem 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #b91c1c;
          font-size: 0.875rem;
        }

        .auth-success {
          margin: 0 0 1rem;
          padding: 0.625rem 0.75rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          color: #15803d;
          font-size: 0.875rem;
        }

        .auth-footer {
          margin: 1.25rem 0 0;
          text-align: center;
          font-size: 0.875rem;
          color: #71717a;
        }

        .auth-footer a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
