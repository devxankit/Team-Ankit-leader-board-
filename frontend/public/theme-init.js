// Applies the saved (or system) theme before first paint so pages never flash.
try {
  var saved = localStorage.getItem('ta-theme')
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
} catch (error) {
  document.documentElement.classList.add('dark')
}
