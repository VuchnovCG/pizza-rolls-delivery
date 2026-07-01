const tg = window.Telegram?.WebApp

export function initTelegram() {
  if (!tg) return false
  tg.expand()
  tg.enableClosingConfirmation()
  return true
}

export function isTelegram() {
  return !!tg?.initData
}

export function getUser() {
  return tg?.initDataUnsafe?.user || null
}

export function getTheme() {
  return tg?.colorScheme || 'dark'
}

export function setBackButton(show, callback) {
  if (!tg) return
  if (show) {
    tg.BackButton.show()
    tg.BackButton.onClick(callback)
  } else {
    tg.BackButton.hide()
    tg.BackButton.offClick(callback)
  }
}

export function closeApp() {
  tg?.close()
}

export function showAlert(msg) {
  tg?.showAlert(msg)
}

export function showConfirm(msg) {
  return tg?.showConfirm(msg)
}
