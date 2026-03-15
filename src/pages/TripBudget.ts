import { getState, setState } from '../store'
import type { TripRecord, BudgetEntry } from '../types'

const CATEGORIES: BudgetEntry['category'][] = ['Hotel', 'Food', 'Transport', 'Activities', 'Other']

export function mountBudget(el: HTMLElement, tripRecord: TripRecord): void {
  renderBudget(el, tripRecord)
}

function getTripRecord(tripRecord: TripRecord): TripRecord {
  return getState().trips.find((t) => t.id === tripRecord.id) ?? tripRecord
}

function saveTripRecord(updated: TripRecord): void {
  const state = getState()
  setState({ trips: state.trips.map((t) => (t.id === updated.id ? updated : t)) })
}

function renderBudget(el: HTMLElement, tripRecord: TripRecord): void {
  const fresh = getTripRecord(tripRecord)
  const entries = fresh.budget
  const budgetLimit = fresh.trip.budget
  const total = entries.reduce((sum, e) => sum + e.amount, 0)
  const overBudget = budgetLimit > 0 && total > budgetLimit

  el.innerHTML = `
    <div class="budget-page">

      <!-- Budget limit editor -->
      <div class="budget-limit-section">
        <form class="budget-limit-form" id="budget-limit-form" novalidate>
          <label class="budget-limit-label" for="budget-limit-input">Trip budget limit (€)</label>
          <div class="budget-limit-row">
            <div class="budget-amount-wrap">
              <span class="budget-currency">€</span>
              <input
                class="form-input budget-amount-input"
                type="number"
                id="budget-limit-input"
                placeholder="e.g. 2000"
                min="0"
                step="1"
                value="${budgetLimit > 0 ? budgetLimit : ''}"
              />
            </div>
            <button type="submit" class="btn btn--primary btn--sm">Save</button>
            ${budgetLimit > 0 ? `<button type="button" class="btn btn--ghost btn--sm" id="budget-limit-clear">Clear</button>` : ''}
          </div>
        </form>
      </div>

      <!-- Summary bar -->
      <div class="budget-summary ${overBudget ? 'budget-summary--over' : ''}">
        <div class="budget-summary-row">
          <span class="budget-summary-label">Total spent</span>
          <span class="budget-summary-amount ${overBudget ? 'budget-summary-amount--over' : ''}">
            €${total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        ${budgetLimit > 0 ? `
          <div class="budget-summary-row budget-summary-limit-row">
            <span class="budget-summary-label">Budget limit</span>
            <span class="budget-summary-amount">€${budgetLimit.toLocaleString()}</span>
          </div>
          ${overBudget ? `<p class="budget-over-warning">⚠️ Over budget by €${(total - budgetLimit).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>` : ''}
          <div class="budget-bar-bg">
            <div class="budget-bar-fill ${overBudget ? 'budget-bar-fill--over' : ''}" style="width:${Math.min((total / budgetLimit) * 100, 100)}%"></div>
          </div>
        ` : ''}
      </div>

      <!-- Expense list -->
      <section class="budget-section">
        ${entries.length === 0
          ? `<div class="empty-state"><div class="empty-state-icon">💶</div><p class="empty-state-title">No expenses yet.</p><p class="empty-state-sub">Add your first expense below.</p></div>`
          : `<table class="budget-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th class="budget-th-amount">Amount</th>
                  <th class="budget-th-action"></th>
                </tr>
              </thead>
              <tbody>
                ${entries.map((e) => `
                  <tr class="budget-row" data-id="${escHtml(e.id)}">
                    <td><span class="budget-category-badge">${escHtml(e.category)}</span></td>
                    <td class="budget-td-desc">${escHtml(e.description)}</td>
                    <td class="budget-td-amount">€${e.amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td><button class="budget-delete-btn btn btn--ghost btn--xs" data-id="${escHtml(e.id)}" aria-label="Delete expense">🗑</button></td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="budget-total-row">
                  <td colspan="2"><strong>Total</strong></td>
                  <td class="budget-td-amount ${overBudget ? 'budget-td-over' : ''}"><strong>€${total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>`
        }
      </section>

      <!-- Add expense form -->
      <section class="budget-add-section">
        <h3 class="budget-add-title">➕ Add expense</h3>
        <form class="budget-add-form" id="budget-add-form" novalidate>
          <div class="budget-add-row">
            <select class="form-input budget-cat-select" id="budget-cat" aria-label="Category">
              ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <input class="form-input budget-desc-input" type="text" id="budget-desc" placeholder="Description (e.g. Hotel Lutetia)" />
            <div class="budget-amount-wrap">
              <span class="budget-currency">€</span>
              <input class="form-input budget-amount-input" type="number" id="budget-amount" placeholder="0.00" min="0" step="0.01" required />
            </div>
            <button type="submit" class="btn btn--primary">Add</button>
          </div>
          <span class="auth-error" id="budget-amount-error"></span>
        </form>
      </section>

    </div>
  `

  bindBudgetEvents(el, fresh)
}

function bindBudgetEvents(el: HTMLElement, tripRecord: TripRecord): void {
  // Budget limit form
  el.querySelector<HTMLFormElement>('#budget-limit-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const val = el.querySelector<HTMLInputElement>('#budget-limit-input')?.value ?? ''
    const limit = val ? parseFloat(val) : 0
    const fresh = getTripRecord(tripRecord)
    saveTripRecord({ ...fresh, trip: { ...fresh.trip, budget: limit } })
    renderBudget(el, fresh)
  })

  el.querySelector('#budget-limit-clear')?.addEventListener('click', () => {
    const fresh = getTripRecord(tripRecord)
    saveTripRecord({ ...fresh, trip: { ...fresh.trip, budget: 0 } })
    renderBudget(el, fresh)
  })

  // Add expense
  el.querySelector<HTMLFormElement>('#budget-add-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const cat = el.querySelector<HTMLSelectElement>('#budget-cat')!.value as BudgetEntry['category']
    const desc = (el.querySelector<HTMLInputElement>('#budget-desc')?.value ?? '').trim()
    const amountStr = el.querySelector<HTMLInputElement>('#budget-amount')?.value ?? ''
    const amount = parseFloat(amountStr)

    const errorEl = el.querySelector<HTMLElement>('#budget-amount-error')
    if (!amount || amount <= 0) {
      if (errorEl) errorEl.textContent = 'Please enter a valid amount.'
      return
    }
    if (errorEl) errorEl.textContent = ''

    const fresh = getTripRecord(tripRecord)
    const newEntry: BudgetEntry = {
      id: crypto.randomUUID(),
      category: cat,
      description: desc || cat,
      amount,
    }
    saveTripRecord({ ...fresh, budget: [...fresh.budget, newEntry] })
    renderBudget(el, fresh)
  })

  // Delete expense
  el.querySelectorAll<HTMLButtonElement>('.budget-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id!
      const fresh = getTripRecord(tripRecord)
      saveTripRecord({ ...fresh, budget: fresh.budget.filter((e) => e.id !== id) })
      renderBudget(el, fresh)
    })
  })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
