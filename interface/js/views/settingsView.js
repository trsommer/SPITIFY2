function settings_view() {
  stopMenuLogoColorChange(false);
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