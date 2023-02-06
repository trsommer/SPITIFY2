highlitedMenuItem = 0;

function settings_view() {
  stopMenuLogoColorChange(false);
  clearSettingsMenuItems();
  highlitedMenuItem = 0;
  document.getElementsByClassName("settings_menu_item")[0].style.backgroundColor = "var(--accentColor)"
  repositionPlayer(12, 60);
}

function scrollSettingsMenuItemIntoView(id) {
  const element = document.getElementById(id);
  const offsetTop = element.offsetTop;
  const scrollHeight = offsetTop - 150;

  window.scroll({
    top: scrollHeight,
    behavior: 'smooth'
  });
}

function clearSettingsMenuItems() {
  const settingsMenuItems = document.getElementsByClassName("settings_menu_item")
  for (let i = 0; i < settingsMenuItems.length; i++) {
    settingsMenuItems[i].style.backgroundColor = null
  }
}

function scrollSettings() {
  const offsetDownElement = document.getElementsByClassName("settings_content_page")[highlitedMenuItem + 1]
  const offsetUpElement = document.getElementsByClassName("settings_content_page")[highlitedMenuItem - 1]
  const settingsMenuItems = document.getElementsByClassName("settings_menu_item")
  const scrollY = window.scrollY

  if (offsetDownElement != undefined) {
    const offsetDown = window.pageYOffset + offsetDownElement.getBoundingClientRect().top
    const offset = offsetDown - scrollY
    if (offset < 250) {
      highlitedMenuItem += 1
      settingsMenuItems[highlitedMenuItem].style.backgroundColor = "var(--accentColor)"
      if (highlitedMenuItem - 1 >= 0) {
        settingsMenuItems[highlitedMenuItem - 1].style.backgroundColor = null
      }
    }

  }

  if (offsetUpElement != undefined) {
    const offsetTop = window.pageYOffset + offsetUpElement.getBoundingClientRect().top
    const offset = scrollY - offsetTop
    if (offset < 250) {
      highlitedMenuItem -= 1
      settingsMenuItems[highlitedMenuItem].style.backgroundColor = "var(--accentColor)"
      if (highlitedMenuItem + 1 < settingsMenuItems.length) {
        settingsMenuItems[highlitedMenuItem + 1].style.backgroundColor = null
      }
    }
  }


}