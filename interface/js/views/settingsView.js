function settings_view() {
    console.log("settings_view");
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