import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the game title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Emily At Last' }),
    ).toBeInTheDocument()
  })

  it('renders 5 tabs and switches panels', async () => {
    render(<App />)

    // Use getAllByRole and filter by nav-button class to get navigation buttons specifically
    const homeButtons = screen.getAllByRole('button', { name: 'Home' })
    const home = homeButtons.find(btn => btn.classList.contains('nav-button'))!
    const mailButtons = screen.getAllByRole('button', { name: /Mail/ })
    const mail = mailButtons.find(btn => btn.classList.contains('nav-button'))!
    const collectionButtons = screen.getAllByRole('button', { name: 'Collection' })
    const collection = collectionButtons.find(btn => btn.classList.contains('nav-button'))!
    const careerButtons = screen.getAllByRole('button', { name: 'Career' })
    const career = careerButtons.find(btn => btn.classList.contains('nav-button'))!
    const marketButtons = screen.getAllByRole('button', { name: 'Market' })
    const market = marketButtons.find(btn => btn.classList.contains('nav-button'))!

    expect(home).toHaveAttribute('aria-current', 'page')
    // Mail tab should show unread count
    expect(mail).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Collect passive income' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Import save text'), {
      target: { value: 'not a save' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Save' }))
    expect(screen.getByText(/Invalid save string/i)).toBeInTheDocument()

    // Player starts with no watches - collection should be empty
    fireEvent.click(collection)
    expect(collection).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Collection' })).toBeInTheDocument()
    // No watches owned yet - show empty state message
    expect(screen.getByText(/no watches in your collection/i)).toBeInTheDocument()

    // Check Mail tab - should have acceptance letter
    fireEvent.click(mail)
    expect(mail).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Mail' })).toBeInTheDocument()
    // Should have the acceptance letter in the inbox - look for the button with the subject
    const mailButton = screen.getByRole('button', { name: /Your Admission Decision/ })
    expect(mailButton).toBeInTheDocument()

    // Start career - player must first complete onboarding
    fireEvent.click(career)
    expect(career).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Career' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Session' })).toBeDisabled()

    // Market should show tier sections (locked tiers show as silhouettes in pre-phd)
    fireEvent.click(market)
    expect(market).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Market' })).toBeInTheDocument()
    // Market should show tier sections - locked tiers show unlock requirements
    expect(screen.getByText(/quartz watches/i)).toBeInTheDocument()
    expect(screen.getByText(/manual watches/i)).toBeInTheDocument()
    expect(screen.getByText(/automatic watches/i)).toBeInTheDocument()
    expect(screen.getByText(/tourbillon watches/i)).toBeInTheDocument()
  })
})
