import { navigate } from '../router'

export function mount(el: HTMLElement, mode: 'login' | 'signup' = 'signup'): void {
  el.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <a href="#landing" class="auth-back" id="auth-back">← Back to home</a>
        <div class="auth-logo" aria-hidden="true">✈️🐾</div>
        <h1 class="auth-title">Planning a trip with family and pets</h1>

        <!-- Tab toggle -->
        <div class="auth-tabs" role="tablist">
          <button class="auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}" data-mode="signup" role="tab" aria-selected="${mode === 'signup'}">Sign up</button>
          <button class="auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}" data-mode="login" role="tab" aria-selected="${mode === 'login'}">Log in</button>
        </div>

        <!-- Sign-up form -->
        <form class="auth-form ${mode !== 'signup' ? 'hidden' : ''}" id="form-signup" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="signup-name">Your name</label>
            <input class="auth-input" type="text" id="signup-name" name="name" placeholder="Jane Smith" autocomplete="name" />
            <span class="auth-error" id="signup-name-error"></span>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="signup-email">Email</label>
            <input class="auth-input" type="email" id="signup-email" name="email" placeholder="jane@example.com" autocomplete="email" />
            <span class="auth-error" id="signup-email-error"></span>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="signup-password">Password</label>
            <input class="auth-input" type="password" id="signup-password" name="password" placeholder="At least 8 characters" autocomplete="new-password" />
            <span class="auth-error" id="signup-password-error"></span>
          </div>
          <button type="submit" class="btn btn--primary btn--full">Create account</button>
          <div class="auth-divider"><span>or</span></div>
          <button type="button" class="btn btn--google btn--full" id="google-signup">
            <svg class="google-icon" viewBox="0 0 18 18" aria-hidden="true"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </form>

        <!-- Login form -->
        <form class="auth-form ${mode !== 'login' ? 'hidden' : ''}" id="form-login" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="login-email">Email</label>
            <input class="auth-input" type="email" id="login-email" name="email" placeholder="jane@example.com" autocomplete="email" />
            <span class="auth-error" id="login-email-error"></span>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="login-password">Password</label>
            <input class="auth-input" type="password" id="login-password" name="password" placeholder="Your password" autocomplete="current-password" />
            <span class="auth-error" id="login-password-error"></span>
          </div>
          <a href="#" class="auth-forgot">Forgot password?</a>
          <button type="submit" class="btn btn--primary btn--full">Log in</button>
          <div class="auth-divider"><span>or</span></div>
          <button type="button" class="btn btn--google btn--full" id="google-login">
            <svg class="google-icon" viewBox="0 0 18 18" aria-hidden="true"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </form>

      </div>
    </div>
  `

  bindEvents(el)
}

function bindEvents(el: HTMLElement): void {
  // Tab switching
  el.querySelectorAll<HTMLButtonElement>('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode as 'login' | 'signup'
      navigate(`auth/${mode}`)
    })
  })

  // Back link
  el.querySelector('#auth-back')?.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('landing')
  })

  // Sign-up form validation (UI-only for now — Epic 7 wires up Supabase)
  const signupForm = el.querySelector<HTMLFormElement>('#form-signup')
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!validateSignup(el)) return
    // Stub: navigate to trips on success (Epic 7 replaces this)
    navigate('trips')
  })

  // Login form validation
  const loginForm = el.querySelector<HTMLFormElement>('#form-login')
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!validateLogin(el)) return
    navigate('trips')
  })

  // Clear errors on input
  el.querySelectorAll<HTMLInputElement>('.auth-input').forEach((input) => {
    input.addEventListener('input', () => {
      const errorEl = el.querySelector(`#${input.id}-error`)
      if (errorEl) errorEl.textContent = ''
      input.classList.remove('auth-input--error')
    })
  })
}

function setError(el: HTMLElement, fieldId: string, msg: string): void {
  const input = el.querySelector<HTMLInputElement>(`#${fieldId}`)
  const error = el.querySelector<HTMLElement>(`#${fieldId}-error`)
  if (input) input.classList.add('auth-input--error')
  if (error) error.textContent = msg
}

function validateSignup(el: HTMLElement): boolean {
  let valid = true
  const name = (el.querySelector<HTMLInputElement>('#signup-name')?.value ?? '').trim()
  const email = (el.querySelector<HTMLInputElement>('#signup-email')?.value ?? '').trim()
  const password = el.querySelector<HTMLInputElement>('#signup-password')?.value ?? ''

  if (!name) { setError(el, 'signup-name', 'Please enter your name.'); valid = false }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(el, 'signup-email', 'Please enter a valid email address.'); valid = false }
  if (password.length < 8) { setError(el, 'signup-password', 'Password must be at least 8 characters.'); valid = false }
  return valid
}

function validateLogin(el: HTMLElement): boolean {
  let valid = true
  const email = (el.querySelector<HTMLInputElement>('#login-email')?.value ?? '').trim()
  const password = el.querySelector<HTMLInputElement>('#login-password')?.value ?? ''

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(el, 'login-email', 'Please enter a valid email address.'); valid = false }
  if (!password) { setError(el, 'login-password', 'Please enter your password.'); valid = false }
  return valid
}
