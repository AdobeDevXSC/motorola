/**
 * Motorola Solutions DOM Cleanup Transformer
 * Removes site-specific elements that should not be imported
 */

export function beforeTransform(document) {
  // Remove header and navigation
  const header = document.querySelector('nav.header, .header-container, #header');
  if (header) header.remove();

  // Remove footer
  const footer = document.querySelector('footer, #footer2021, .footer-container');
  if (footer) footer.remove();

  // Remove cookie banners and popups
  const cookieBanners = document.querySelectorAll(
    '.cookie-banner, #onetrust-consent-sdk, .privacy-banner, #INDWrap, .chat-present'
  );
  cookieBanners.forEach((el) => el.remove());

  // Remove notification banners
  const notifications = document.querySelectorAll(
    '.dnaNotificationBannerPage, .dnaMarketingNotificationBanner, .get-support-i18n'
  );
  notifications.forEach((el) => el.remove());

  // Remove modal containers
  const modals = document.querySelectorAll(
    '#media_modal_session_content, .ms-modal-session-msg, #INDpopup'
  );
  modals.forEach((el) => el.remove());

  // Remove scripts and styles (should already be gone, but ensure)
  const scriptsAndStyles = document.querySelectorAll('script, style, link[rel="stylesheet"]');
  scriptsAndStyles.forEach((el) => el.remove());

  // Remove hidden elements
  const hiddenElements = document.querySelectorAll('.d-none, .no-display, [hidden]');
  hiddenElements.forEach((el) => el.remove());

  // Remove AEM authoring artifacts
  const aemArtifacts = document.querySelectorAll('[data-sly-test], [data-cmp-data-layer]');
  aemArtifacts.forEach((el) => el.removeAttribute('data-sly-test'));
}

export function afterTransform(document) {
  // Clean up empty containers
  const emptyDivs = document.querySelectorAll('div:empty');
  emptyDivs.forEach((el) => {
    if (!el.className && !el.id) {
      el.remove();
    }
  });

  // Normalize whitespace in text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent.trim() === '') {
      node.textContent = '';
    }
  }
}

export default { beforeTransform, afterTransform };
